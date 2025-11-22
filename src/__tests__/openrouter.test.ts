import { generateWithOpenRouter, analyzePrompt, predictOutput } from '../lib/openrouter';
import * as geminiModule from '../lib/gemini';

const globalAny: typeof global = global;

// Mock Gemini module
jest.mock('../lib/gemini', () => ({
	generateWithGemini: jest.fn(),
}));

describe('OpenRouter utilities', () => {
	const OLD_ENV = process.env;
	let generateWithGeminiMock: jest.Mock;

	beforeEach(() => {
		jest.resetAllMocks();
		process.env = { ...OLD_ENV };
		globalAny.fetch = jest.fn();
		
		// Get the mocked function
		generateWithGeminiMock = (geminiModule.generateWithGemini as jest.Mock);
		generateWithGeminiMock.mockClear();
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

	describe('Fallback mechanism', () => {
		beforeEach(() => {
			process.env.OPENROUTER_API_KEY_FREE = 'sk-free-123';
			process.env.GEMINI_API_KEY_FREE = 'gemini-key-123';
		});

		it('should fallback to Gemini on 429 rate limit error', async () => {
			// Mock OpenRouter returning 429
			(globalAny.fetch as jest.Mock).mockResolvedValue({
				ok: false,
				status: 429,
				statusText: 'Too Many Requests',
				json: async () => ({
					error: { message: 'Rate limit exceeded' },
				}),
			});

			// Mock Gemini success
			generateWithGeminiMock.mockResolvedValue('Gemini fallback response');

			const result = await generateWithOpenRouter('Test prompt', 'free');

			expect(generateWithGeminiMock).toHaveBeenCalledWith(
				expect.stringContaining('Test prompt'),
				'free',
				undefined,
				60000
			);
			expect(result).toBe('Gemini fallback response');
		});

		it('should fallback to Gemini on 401 credit exhaustion error', async () => {
			// Mock OpenRouter returning 401 with credit exhaustion message
			(globalAny.fetch as jest.Mock).mockResolvedValue({
				ok: false,
				status: 401,
				statusText: 'Unauthorized',
				json: async () => ({
					error: { message: 'Insufficient credits' },
				}),
			});

			// Mock Gemini success
			generateWithGeminiMock.mockResolvedValue('Gemini fallback response');

			const result = await generateWithOpenRouter('Test prompt', 'free');

			expect(generateWithGeminiMock).toHaveBeenCalled();
			expect(result).toBe('Gemini fallback response');
		});

		it('should NOT fallback on 401 invalid key error', async () => {
			// Mock OpenRouter returning 401 with invalid key message
			(globalAny.fetch as jest.Mock).mockResolvedValue({
				ok: false,
				status: 401,
				statusText: 'Unauthorized',
				json: async () => ({
					error: { message: 'Invalid API key' },
				}),
			});

			await expect(generateWithOpenRouter('Test prompt', 'free')).rejects.toThrow('Invalid API key');
			expect(generateWithGeminiMock).not.toHaveBeenCalled();
		});

		it('should fallback to Gemini on 503 service unavailable', async () => {
			// Mock OpenRouter returning 503
			(globalAny.fetch as jest.Mock).mockResolvedValue({
				ok: false,
				status: 503,
				statusText: 'Service Unavailable',
				json: async () => ({
					error: { message: 'Model unavailable' },
				}),
			});

			// Mock Gemini success
			generateWithGeminiMock.mockResolvedValue('Gemini fallback response');

			const result = await generateWithOpenRouter('Test prompt', 'free');

			expect(generateWithGeminiMock).toHaveBeenCalled();
			expect(result).toBe('Gemini fallback response');
		});

		it('should throw original error if Gemini fallback also fails', async () => {
			// Mock OpenRouter returning 429
			(globalAny.fetch as jest.Mock).mockResolvedValue({
				ok: false,
				status: 429,
				statusText: 'Too Many Requests',
				json: async () => ({
					error: { message: 'Rate limit exceeded' },
				}),
			});

			// Mock Gemini also failing
			const geminiError = new Error('Gemini API error');
			generateWithGeminiMock.mockRejectedValue(geminiError);

			await expect(generateWithOpenRouter('Test prompt', 'free')).rejects.toThrow('Rate limit exceeded');
			expect(generateWithGeminiMock).toHaveBeenCalled();
		});

		it('should pass user tier to Gemini fallback', async () => {
			process.env.OPENROUTER_API_KEY_PRO = 'sk-pro-123';
			process.env.GEMINI_API_KEY_PRO = 'gemini-pro-key';

			// Mock OpenRouter returning 429
			(globalAny.fetch as jest.Mock).mockResolvedValue({
				ok: false,
				status: 429,
				statusText: 'Too Many Requests',
				json: async () => ({
					error: { message: 'Rate limit exceeded' },
				}),
			});

			generateWithGeminiMock.mockResolvedValue('Gemini response');

			await generateWithOpenRouter('Test prompt', 'pro');

			expect(generateWithGeminiMock).toHaveBeenCalledWith(
				expect.any(String),
				'pro',
				undefined,
				60000
			);
		});
	});
});


