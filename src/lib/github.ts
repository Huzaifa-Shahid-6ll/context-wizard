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
  techStack: string[]; // legacy, names only
  techStackInfo?: TechStackInfo[]; // structured with versions and categories
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

  const techInfo = detectTechStackInfo(tree, packageJson);
  const techStack = techInfo.map(t => t.version ? `${t.name}@${t.version}` : t.name);

  return {
    language: repoJson.language ?? null,
    techStack,
    techStackInfo: techInfo,
    packageJson,
    readme,
  };
}

export type TechStackInfo = {
  name: string;
  version?: string;
  category: 'frontend' | 'backend' | 'database' | 'testing' | 'deployment' | 'build-tool' | 'state-management' | 'language' | 'api' | 'ci-cd' | 'hosting' | 'cms' | 'analytics' | 'infrastructure' | 'other';
  confidence: 'high' | 'medium' | 'low';
};

function getPkg(packageJson: unknown): Record<string, unknown> | undefined {
  return packageJson && typeof packageJson === 'object' ? packageJson as Record<string, unknown> : undefined;
}

function versionFromDeps(pkg: Record<string, unknown> | undefined, dep: string): string | undefined {
  const get = (key: string) => (pkg?.[key] as Record<string, string> | undefined)?.[dep];
  const raw = get('dependencies') || get('devDependencies') || get('peerDependencies');
  if (!raw) return undefined;
  // Normalize common semver specifiers, keep digit prefix
  const m = String(raw).match(/\d+\.\d+(?:\.\d+)?/);
  return m ? m[0] : undefined;
}

function hasExt(files: RepoStructure['tree'] | undefined, ext: string): boolean {
  const list = files || [];
  return list.some(f => f.path.toLowerCase().endsWith(ext));
}

function hasFile(files: RepoStructure['tree'] | undefined, file: string): boolean {
  const list = files || [];
  return list.some(f => f.path.toLowerCase() === file.toLowerCase());
}

function hasPathPrefix(files: RepoStructure['tree'] | undefined, prefix: string): boolean {
  const list = files || [];
  const p = prefix.toLowerCase();
  return list.some(f => f.path.toLowerCase().startsWith(p));
}

function push(info: TechStackInfo[], name: string, category: TechStackInfo['category'], confidence: TechStackInfo['confidence'], version?: string) {
  info.push({ name, category, confidence, version });
}

function detectFromPackageJson(packageJson: unknown): TechStackInfo[] {
  const info: TechStackInfo[] = [];
  const pkg = getPkg(packageJson);
  const depKeys = new Set<string>([
    ...Object.keys((pkg?.dependencies as Record<string, string>) || {}),
    ...Object.keys((pkg?.devDependencies as Record<string, string>) || {}),
    ...Object.keys((pkg?.peerDependencies as Record<string, string>) || {}),
  ]);
  const add = (dep: string, name: string, category: TechStackInfo['category']) => {
    if (depKeys.has(dep)) push(info, name, category, 'high', versionFromDeps(pkg, dep));
  };

  // Frontend
  add('react', 'React', 'frontend');
  add('next', 'Next.js', 'frontend');
  add('vue', 'Vue', 'frontend');
  add('nuxt', 'Nuxt', 'frontend');
  add('svelte', 'Svelte', 'frontend');
  add('@sveltejs/kit', 'SvelteKit', 'frontend');
  add('angular', 'Angular', 'frontend');
  add('solid-js', 'Solid', 'frontend');
  add('preact', 'Preact', 'frontend');
  add('@remix-run/react', 'Remix', 'frontend');
  add('astro', 'Astro', 'frontend');
  add('gatsby', 'Gatsby', 'frontend');

  // State management
  add('redux', 'Redux', 'state-management');
  add('@reduxjs/toolkit', 'Redux Toolkit', 'state-management');
  add('zustand', 'Zustand', 'state-management');
  add('jotai', 'Jotai', 'state-management');
  add('recoil', 'Recoil', 'state-management');
  add('mobx', 'MobX', 'state-management');
  add('xstate', 'XState', 'state-management');
  add('pinia', 'Pinia', 'state-management');
  add('vuex', 'Vuex', 'state-management');

  // Build tools
  add('webpack', 'Webpack', 'build-tool');
  add('vite', 'Vite', 'build-tool');
  add('rollup', 'Rollup', 'build-tool');
  add('parcel', 'Parcel', 'build-tool');
  add('esbuild', 'esbuild', 'build-tool');
  add('@swc/core', 'swc', 'build-tool');
  add('@vercel/turbopack', 'Turbopack', 'build-tool');

  // Styling
  add('tailwindcss', 'Tailwind CSS', 'frontend');
  add('sass', 'Sass', 'frontend');
  add('less', 'Less', 'frontend');

  // Backend
  add('express', 'Express', 'backend');
  add('fastify', 'Fastify', 'backend');
  add('koa', 'Koa', 'backend');
  add('hapi', 'Hapi', 'backend');
  add('nest', 'NestJS', 'backend');
  add('convex', 'Convex', 'backend');
  add('django', 'Django', 'backend');
  add('flask', 'Flask', 'backend');
  add('fastapi', 'FastAPI', 'backend');
  add('rails', 'Ruby on Rails', 'backend');
  add('laravel', 'Laravel', 'backend');
  add('spring-boot', 'Spring Boot', 'backend');
  add('quarkus', 'Quarkus', 'backend');
  add('@trpc/server', 'tRPC', 'api');
  add('graphql', 'GraphQL', 'api');
  add('@apollo/server', 'Apollo Server', 'api');

  // Databases
  add('pg', 'PostgreSQL', 'database');
  add('mysql', 'MySQL', 'database');
  add('mysql2', 'MySQL', 'database');
  add('mongodb', 'MongoDB', 'database');
  add('@aws-sdk/client-dynamodb', 'DynamoDB', 'database');
  add('redis', 'Redis', 'database');
  add('@prisma/client', 'Prisma', 'database');
  add('typeorm', 'TypeORM', 'database');
  add('sequelize', 'Sequelize', 'database');

  // Testing
  add('jest', 'Jest', 'testing');
  add('vitest', 'Vitest', 'testing');
  add('mocha', 'Mocha', 'testing');
  add('jasmine', 'Jasmine', 'testing');
  add('cypress', 'Cypress', 'testing');
  add('@playwright/test', 'Playwright', 'testing');
  add('@testing-library/react', 'Testing Library', 'testing');

  // CI/CD
  add('husky', 'Husky', 'ci-cd');
  add('lint-staged', 'lint-staged', 'ci-cd');

  // Languages (deps hint)
  add('typescript', 'TypeScript', 'language');

  return info;
}

function detectFromFiles(files: RepoStructure['tree'] | undefined): TechStackInfo[] {
  const info: TechStackInfo[] = [];
  // Languages
  if (hasExt(files, '.ts') || hasExt(files, '.tsx')) push(info, 'TypeScript', 'language', 'medium');
  if (hasExt(files, '.js') || hasExt(files, '.jsx')) push(info, 'JavaScript', 'language', 'low');
  if (hasExt(files, '.py')) push(info, 'Python', 'language', 'low');
  if (hasExt(files, '.rb')) push(info, 'Ruby', 'language', 'low');
  if (hasExt(files, '.go')) push(info, 'Go', 'language', 'low');
  if (hasExt(files, '.rs')) push(info, 'Rust', 'language', 'low');
  if (hasExt(files, '.php')) push(info, 'PHP', 'language', 'low');
  if (hasExt(files, '.java')) push(info, 'Java', 'language', 'low');

  // Config files
  if (hasFile(files, 'next.config.js') || hasFile(files, 'next.config.ts')) push(info, 'Next.js', 'frontend', 'high');
  if (hasFile(files, 'tailwind.config.js') || hasFile(files, 'tailwind.config.ts')) push(info, 'Tailwind CSS', 'frontend', 'high');
  if (hasFile(files, 'Dockerfile')) push(info, 'Docker', 'deployment', 'high');
  if (hasFile(files, 'vercel.json')) push(info, 'Vercel', 'hosting', 'medium');
  if (hasFile(files, 'netlify.toml')) push(info, 'Netlify', 'hosting', 'medium');
  if (hasPathPrefix(files, '.github/workflows/')) push(info, 'GitHub Actions', 'ci-cd', 'medium');
  if (hasFile(files, '.gitlab-ci.yml')) push(info, 'GitLab CI', 'ci-cd', 'medium');
  if (hasPathPrefix(files, '.circleci/')) push(info, 'CircleCI', 'ci-cd', 'medium');
  if (hasFile(files, 'Jenkinsfile')) push(info, 'Jenkins', 'ci-cd', 'medium');
  if (hasPathPrefix(files, 'k8s/') || hasFile(files, 'kubernetes.yaml') || hasFile(files, 'k8s.yaml')) push(info, 'Kubernetes', 'infrastructure', 'low');
  if (hasFile(files, 'docker-compose.yml') || hasFile(files, 'docker-compose.yaml')) push(info, 'Docker Compose', 'deployment', 'medium');

  // Folder structure hints
  if (hasPathPrefix(files, 'pages/') || hasPathPrefix(files, 'app/')) push(info, 'Node.js', 'backend', 'low');
  if (hasPathPrefix(files, 'convex/')) push(info, 'Convex', 'backend', 'high');

  // API styles
  if (hasPathPrefix(files, 'proto/') || hasExt(files, '.proto')) push(info, 'gRPC', 'api', 'low');

  return info;
}

export function detectTechStackInfo(files: RepoStructure['tree'] | undefined, packageJson: unknown): TechStackInfo[] {
  // Combine multiple detectors and merge de-duplicated entries by name, prefer higher confidence and keep version if available
  const collected = [
    ...detectFromPackageJson(packageJson),
    ...detectFromFiles(files),
  ];
  const byName = new Map<string, TechStackInfo>();
  for (const item of collected) {
    const existing = byName.get(item.name);
    if (!existing) {
      byName.set(item.name, item);
    } else {
      // Prefer existing with higher confidence; but attach version if missing
      const rank = { high: 3, medium: 2, low: 1 } as const;
      const keep = rank[existing.confidence] >= rank[item.confidence] ? existing : item;
      const merged: TechStackInfo = { ...keep };
      if (!merged.version && (existing.version || item.version)) merged.version = existing?.version || item.version;
      byName.set(item.name, merged);
    }
  }
  return Array.from(byName.values());
}

// Back-compat function: returns names (with @version if available)
export function detectTechStack(files: RepoStructure['tree'] | undefined, packageJson: unknown): string[] {
  const info = detectTechStackInfo(files, packageJson);
  return info.map(t => t.version ? `${t.name}@${t.version}` : t.name);
}


