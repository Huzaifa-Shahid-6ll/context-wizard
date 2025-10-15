export type ParsedRepo = {
  owner: string;
  repo: string;
};

export type GithubTreeItem = {
  path: string;
  mode: string; // e.g., '100644'
  type: 'blob' | 'tree' | 'commit';
  sha: string;
  size?: number;
  url: string;
};

export type RepoStructure = {
  tree: GithubTreeItem[];
  truncated: boolean;
};

export type RepoMetadata = {
  language: string | null;
  techStack: string[];
  packageJson?: unknown;
  readme?: string;
};

class GithubError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = 'GithubError';
    this.status = status;
  }
}

// Optional: support a token via env to avoid rate limits
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || process.env.NEXT_PUBLIC_GITHUB_TOKEN;

function buildHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  if (GITHUB_TOKEN) {
    headers['Authorization'] = `Bearer ${GITHUB_TOKEN}`;
  }
  return headers;
}

export function parseGitHubUrl(url: string): ParsedRepo {
  try {
    const u = new URL(url);
    if (u.hostname !== 'github.com') {
      throw new GithubError('Only github.com URLs are supported');
    }
    // Expect /owner/repo or /owner/repo[.git][/...]
    const segments = u.pathname.replace(/^\/+/, '').split('/');
    const owner = segments[0];
    let repo = segments[1];
    if (!owner || !repo) {
      throw new GithubError('Invalid GitHub URL. Expected format: github.com/owner/repo');
    }
    // Strip .git
    repo = repo.replace(/\.git$/i, '');
    return { owner, repo };
  } catch (e) {
    if (e instanceof GithubError) throw e;
    throw new GithubError('Invalid URL');
  }
}

async function handleGithubResponse(res: Response, notFoundMessage: string) {
  if (res.ok) return res;
  if (res.status === 404) {
    throw new GithubError(notFoundMessage, 404);
  }
  if (res.status === 403) {
    // Could be rate limiting or private repo without token
    const rateLimitRemaining = res.headers.get('x-ratelimit-remaining');
    if (rateLimitRemaining === '0') {
      throw new GithubError('GitHub API rate limit exceeded', 403);
    }
    throw new GithubError('Access forbidden. The repository may be private or token lacks scope.', 403);
  }
  throw new GithubError(`GitHub API error: ${res.statusText}`, res.status);
}

export async function fetchRepoStructure(owner: string, repo: string): Promise<RepoStructure> {
  // Get default branch to fetch the tree
  const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
    headers: buildHeaders(),
    cache: 'no-store',
  });
  await handleGithubResponse(repoRes, 'Repository not found');
  const repoJson: { default_branch?: string } = await repoRes.json();
  const defaultBranch = repoJson.default_branch || 'main';

  // Get the tree recursively
  const treeRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/trees/${encodeURIComponent(defaultBranch)}?recursive=1`,
    { headers: buildHeaders(), cache: 'no-store' }
  );
  await handleGithubResponse(treeRes, 'Repository tree not found');
  const treeJson: RepoStructure = await treeRes.json();
  return treeJson;
}

export async function fetchRepoMetadata(owner: string, repo: string): Promise<RepoMetadata> {
  // Base repo
  const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
    headers: buildHeaders(),
    cache: 'no-store',
  });
  await handleGithubResponse(repoRes, 'Repository not found');
  const repoJson: { language: string | null } = await repoRes.json();

  // package.json (root)
  const packageRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/package.json`,
    { headers: buildHeaders(), cache: 'no-store' }
  );
  let packageJson: unknown | undefined;
  if (packageRes.ok) {
    const pkgContent: { content?: string; encoding?: string } = await packageRes.json();
    if (pkgContent.content && pkgContent.encoding === 'base64') {
      try {
        const decoded = Buffer.from(pkgContent.content, 'base64').toString('utf-8');
        packageJson = JSON.parse(decoded);
      } catch {
        // ignore malformed package.json
      }
    }
  } else if (packageRes.status !== 404) {
    await handleGithubResponse(packageRes, 'Error fetching package.json');
  }

  // README (use the dedicated endpoint for best-guess readme)
  const readmeRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/readme`,
    { headers: buildHeaders(), cache: 'no-store' }
  );
  let readme: string | undefined;
  if (readmeRes.ok) {
    const readmeContent: { content?: string; encoding?: string } = await readmeRes.json();
    if (readmeContent.content && readmeContent.encoding === 'base64') {
      try {
        readme = Buffer.from(readmeContent.content, 'base64').toString('utf-8');
      } catch {
        // ignore
      }
    }
  } else if (readmeRes.status !== 404) {
    await handleGithubResponse(readmeRes, 'Error fetching README');
  }

  // Tree for tech stack detection
  let tree: RepoStructure['tree'] = [];
  try {
    const structure = await fetchRepoStructure(owner, repo);
    tree = structure.tree;
  } catch {
    // If tree fails, continue with partial metadata
  }

  const techStack = detectTechStack(tree, packageJson);

  return {
    language: repoJson.language ?? null,
    techStack,
    packageJson,
    readme,
  };
}

export function detectTechStack(files: RepoStructure['tree'] | undefined, packageJson: unknown): string[] {
  const technologies = new Set<string>();

  // From package.json
  const pkg = packageJson && typeof packageJson === 'object' ? packageJson as Record<string, unknown> : undefined;
  const deps = new Set<string>([
    ...Object.keys((pkg?.dependencies as Record<string, string>) || {}),
    ...Object.keys((pkg?.devDependencies as Record<string, string>) || {}),
  ]);

  // Common JS frameworks/libraries
  if (deps.has('next')) technologies.add('Next.js');
  if (deps.has('react')) technologies.add('React');
  if (deps.has('vue')) technologies.add('Vue');
  if (deps.has('svelte')) technologies.add('Svelte');
  if (deps.has('typescript')) technologies.add('TypeScript');
  if (deps.has('tailwindcss')) technologies.add('Tailwind CSS');
  if (deps.has('express')) technologies.add('Express');
  if (deps.has('convex')) technologies.add('Convex');

  // Other ecosystems
  if (deps.has('django')) technologies.add('Django');
  if (deps.has('flask')) technologies.add('Flask');
  if (deps.has('fastapi')) technologies.add('FastAPI');
  if (deps.has('rails')) technologies.add('Ruby on Rails');
  if (deps.has('laravel')) technologies.add('Laravel');

  // From files
  const fileList = files || [];
  const byExt = (ext: string) => fileList.some(f => f.path.toLowerCase().endsWith(ext));
  const hasPath = (p: string) => fileList.some(f => f.path.toLowerCase() === p.toLowerCase());

  if (byExt('.ts') || byExt('.tsx')) technologies.add('TypeScript');
  if (byExt('.js') || byExt('.jsx')) technologies.add('JavaScript');
  if (hasPath('next.config.js') || hasPath('next.config.ts')) technologies.add('Next.js');
  if (hasPath('tailwind.config.js') || hasPath('tailwind.config.ts')) technologies.add('Tailwind CSS');
  if (hasPath('Dockerfile')) technologies.add('Docker');
  if (fileList.some(f => f.path.toLowerCase().startsWith('pages/') || f.path.toLowerCase().startsWith('app/'))) technologies.add('Node.js');
  if (fileList.some(f => f.path.toLowerCase().includes('convex/'))) technologies.add('Convex');

  // Languages
  if (byExt('.py')) technologies.add('Python');
  if (byExt('.rb')) technologies.add('Ruby');
  if (byExt('.go')) technologies.add('Go');
  if (byExt('.rs')) technologies.add('Rust');
  if (byExt('.php')) technologies.add('PHP');
  if (byExt('.java')) technologies.add('Java');

  return Array.from(technologies);
}


