import { parseGitHubUrl, fetchRepoStructure, detectTechStack, type RepoStructure } from '../lib/github';

// Mock global fetch
const globalAny: any = global;

describe('GitHub utilities', () => {
	beforeEach(() => {
		jest.resetAllMocks();
		globalAny.fetch = jest.fn();
	});

	it('parseGitHubUrl: parses valid URLs', () => {
		const { owner, repo } = parseGitHubUrl('https://github.com/vercel/next.js');
		expect(owner).toBe('vercel');
		expect(repo).toBe('next.js');
	});

	it('parseGitHubUrl: strips .git and rejects non-github hosts', () => {
		const { owner, repo } = parseGitHubUrl('https://github.com/user/repo.git');
		expect(owner).toBe('user');
		expect(repo).toBe('repo');
		expect(() => parseGitHubUrl('https://gitlab.com/user/repo')).toThrow();
		expect(() => parseGitHubUrl('not-a-url')).toThrow();
	});

	it('fetchRepoStructure: returns tree for a public repo (mocked)', async () => {
		// 1) repo metadata call to get default_branch
		(globalAny.fetch as jest.Mock).mockResolvedValueOnce({
			ok: true,
			json: async () => ({ default_branch: 'main' }),
			headers: new Headers(),
		});
		// 2) tree call
		const treeJson: RepoStructure = { tree: [{ path: 'README.md', mode: '100644', type: 'blob', sha: 'x', size: 1, url: 'u' }], truncated: false };
		(globalAny.fetch as jest.Mock).mockResolvedValueOnce({
			ok: true,
			json: async () => treeJson,
			headers: new Headers(),
		});

		const res = await fetchRepoStructure('user', 'repo');
		expect(res.tree.length).toBe(1);
		expect(res.truncated).toBe(false);
	});

	it('detectTechStack: detects technologies from files and package.json', () => {
		const files: RepoStructure['tree'] = [
			{ path: 'app/page.tsx', mode: '100644', type: 'blob', sha: 'x', url: 'u' },
			{ path: 'next.config.ts', mode: '100644', type: 'blob', sha: 'y', url: 'u' },
			{ path: 'convex/schema.ts', mode: '100644', type: 'blob', sha: 'z', url: 'u' },
		];
		const pkg = {
			dependencies: { next: '15.x', react: '19.x', convex: '1.x' },
			devDependencies: { typescript: '5.x', tailwindcss: '4.x' },
		};
		const tech = detectTechStack(files, pkg);
		// Detector currently infers Node.js from app/ or pages/ structures
		expect(tech).toEqual(expect.arrayContaining(['Next.js', 'React', 'Convex', 'TypeScript', 'Tailwind CSS', 'Node.js']));
	});
});


