import { parseGitHubUrl, fetchRepoStructure, detectTechStack } from '../../lib/github';
import { buildOutputsFromBase } from '@/../convex/generate';

const globalAny: any = global;

describe('E2E: GitHub repository analysis flow (mocked)', () => {
	beforeEach(() => {
		jest.resetAllMocks();
		globalAny.fetch = jest.fn();
	});

	it('analyzes a public repo URL, detects stack, and generates files', async () => {
		const { owner, repo } = parseGitHubUrl('https://github.com/user/repo');
		// Mock GitHub repo + tree calls
		(globalAny.fetch as jest.Mock)
			.mockResolvedValueOnce({ ok: true, json: async () => ({ default_branch: 'main' }), headers: new Headers() })
			.mockResolvedValueOnce({ ok: true, json: async () => ({ tree: [{ path: 'app/page.tsx', mode: '100644', type: 'blob', sha: 'x', url: 'u' }], truncated: false }), headers: new Headers() });

		const structure = await fetchRepoStructure(owner, repo);
		expect(Array.isArray(structure.tree)).toBe(true);
		expect(structure.truncated).toBe(false);

		const pkg = { dependencies: { next: '15.x', react: '19.x' }, devDependencies: { typescript: '5.x' } };
		const tech = detectTechStack(structure.tree, pkg);
		expect(tech).toEqual(expect.arrayContaining(['Next.js', 'React', 'TypeScript']));

		// Simulate base rules and generate output files
		const baseRules = '# .cursorrules\n- rules...';
		const files = buildOutputsFromBase(baseRules, {
			repoStructure: structure.tree.map((i: any) => ({ path: i.path, type: i.type })),
			techStack: tech,
			packageJson: pkg,
			readmeContent: '# README',
		});
		expect(files.length).toBeGreaterThan(0);
		expect(files.map(f => f.name)).toEqual(expect.arrayContaining(['PROJECT_OVERVIEW.md','ARCHITECTURE.md','STACK.md','CONVENTIONS.md','.cursorrules']));
	});
});


