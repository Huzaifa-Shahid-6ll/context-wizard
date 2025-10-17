import { generateWithOpenRouter, analyzePrompt, predictOutput } from '../lib/openrouter';

const globalAny: any = global;

describe('OpenRouter utilities', () => {
	const OLD_ENV = process.env;

	beforeEach(() => {
		jest.resetAllMocks();
		process.env = { ...OLD_ENV };
		globalAny.fetch = jest.fn();
	});

	afterAll(() => {
		process.env = OLD_ENV;
	});

	it('generateWithOpenRouter: uses API key and returns text', async () => {
		process.env.OPENROUTER_API_KEY_FREE = 'sk-free-123';
		(globalAny.fetch as jest.Mock).mockResolvedValue({
			ok: true,
			json: async () => ({
				choices: [{ message: { role: 'assistant', content: 'Hello world' } }],
			}),
		});
		const text = await generateWithOpenRouter('Hi', 'free');
		expect(typeof text).toBe('string');
		expect(text).toContain('Hello');
		// Ensure Authorization header was built
		const call = (globalAny.fetch as jest.Mock).mock.calls[0];
		expect(call[1].headers.Authorization).toMatch(/Bearer sk-free-123/);
	});

	it('analyzePrompt: returns structured analysis JSON (mocked)', async () => {
		process.env.OPENROUTER_API_KEY_FREE = 'sk-free-123';
		(globalAny.fetch as jest.Mock).mockResolvedValue({
			ok: true,
			json: async () => ({
				choices: [{ message: { role: 'assistant', content: JSON.stringify({ score: 80, issues: ['x'], suggestions: ['y'] }) } }],
			}),
		});
		const res = await analyzePrompt('Check me');
		expect(res.score).toBe(80);
		expect(res.issues).toEqual(['x']);
		expect(res.suggestions).toEqual(['y']);
	});

	it('predictOutput: returns a short prediction', async () => {
		process.env.OPENROUTER_API_KEY_FREE = 'sk-free-123';
		(globalAny.fetch as jest.Mock).mockResolvedValue({
			ok: true,
			json: async () => ({
				choices: [{ message: { role: 'assistant', content: 'Short prediction' } }],
			}),
		});
		const out = await predictOutput('Prompt');
		expect(out.predictedResponse).toContain('Short');
	});
});


