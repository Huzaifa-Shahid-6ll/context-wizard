import { buildOutputsFromBase } from '@/../convex/generate';

describe('E2E: Prompt generation flow (mocked)', () => {
	it('generates all sections for various tech stacks and simulates save', async () => {
		const baseRules = '# base rules';
		const stacks = [
			['Next.js','TypeScript','Tailwind CSS'],
			['React','Convex'],
			['Node.js'],
		];
		for (const techStack of stacks) {
			const files = buildOutputsFromBase(baseRules, {
				repoStructure: [{ path: 'app/page.tsx', type: 'blob' }],
				techStack,
				packageJson: { dependencies: { next: '15.x' } },
				readmeContent: '# README',
			});
			expect(files.map(f => f.name)).toEqual(expect.arrayContaining(['PROJECT_OVERVIEW.md','ARCHITECTURE.md','STACK.md','CONVENTIONS.md','.cursorrules']));
			// Simulate saving to DB: we just assert the structure is serializable
			expect(() => JSON.stringify(files)).not.toThrow();
		}
	});
});


