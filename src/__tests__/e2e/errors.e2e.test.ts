import { parseGitHubUrl } from '../../lib/github';
import { generateWithOpenRouter } from '../../lib/openrouter';

const globalAny: typeof global = global;

describe('E2E: Error scenarios (mocked)', () => {
	beforeEach(() => {
		jest.resetAllMocks();
		globalAny.fetch = jest.fn();
		process.env.OPENROUTER_API_KEY_FREE = 'sk-free-123';
	});

	it('invalid GitHub URL throws', () => {
		expect(() => parseGitHubUrl('https://notgithub.com/user/repo')).toThrow();
	});

	it('OpenRouter: 401 missing/invalid API key', async () => {
		process.env.OPENROUTER_API_KEY_FREE = '';
		await expect(generateWithOpenRouter('Hi', 'free')).rejects.toBeInstanceOf(Error);
	});

	it('OpenRouter: 429 rate limit', async () => {
		(globalAny.fetch as jest.Mock).mockResolvedValue({ ok: false, status: 429, statusText: 'Too Many Requests', headers: new Headers(), json: async () => ({ error: { message: 'Rate limit exceeded' } }) });
		await expect(generateWithOpenRouter('Hi', 'free')).rejects.toBeInstanceOf(Error);
	});

	it('Network timeout/error for external call', async () => {
		(globalAny.fetch as jest.Mock).mockRejectedValue(new Error('network timeout'));
		await expect(generateWithOpenRouter('Hi', 'free')).rejects.toBeInstanceOf(Error);
	});
});


