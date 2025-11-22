import { generateWithOpenRouter } from '../lib/openrouter';
import { generateWithGemini } from '../lib/gemini';

// Mock dependencies
jest.mock('../lib/gemini', () => ({
    generateWithGemini: jest.fn(),
}));

// Mock global fetch
global.fetch = jest.fn();

describe('API Fallback Logic', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        process.env.OPENROUTER_API_KEY_FREE = 'test-key';
        process.env.OPENROUTER_API_KEY_PRO = 'test-key-pro';
    });

    it('should use OpenRouter when successful', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                choices: [{ message: { content: 'Success' } }]
            })
        });

        const result = await generateWithOpenRouter('test prompt', 'free');
        expect(result).toBe('Success');
        expect(generateWithGemini).not.toHaveBeenCalled();
    });

    it('should fallback to Gemini on 429 Rate Limit', async () => {
        // Mock OpenRouter failure (needs to persist through retries)
        const rateLimitResponse = {
            ok: false,
            status: 429,
            statusText: 'Too Many Requests',
            json: async () => ({ error: { message: 'Rate limit exceeded' } }),
            headers: { get: () => '1' } // Retry after 1 second
        };

        // Mock fetch to return 429 for all attempts (initial + 3 retries = 4 calls)
        (global.fetch as jest.Mock)
            .mockResolvedValueOnce(rateLimitResponse)
            .mockResolvedValueOnce(rateLimitResponse)
            .mockResolvedValueOnce(rateLimitResponse)
            .mockResolvedValueOnce(rateLimitResponse);

        // Mock Gemini success
        (generateWithGemini as jest.Mock).mockResolvedValueOnce('Gemini Success');

        const result = await generateWithOpenRouter('test prompt', 'free', undefined, 5000); // Short timeout for test
        expect(result).toBe('Gemini Success');
        expect(generateWithGemini).toHaveBeenCalled();
    });

    it('should fallback to Gemini on 503 Service Unavailable', async () => {
        const serviceUnavailableResponse = {
            ok: false,
            status: 503,
            statusText: 'Service Unavailable',
            json: async () => ({ error: { message: 'Service overloaded' } }),
            headers: { get: () => '1' }
        };

        (global.fetch as jest.Mock)
            .mockResolvedValueOnce(serviceUnavailableResponse)
            .mockResolvedValueOnce(serviceUnavailableResponse)
            .mockResolvedValueOnce(serviceUnavailableResponse)
            .mockResolvedValueOnce(serviceUnavailableResponse);

        (generateWithGemini as jest.Mock).mockResolvedValueOnce('Gemini Success');

        const result = await generateWithOpenRouter('test prompt', 'free', undefined, 5000);
        expect(result).toBe('Gemini Success');
    });

    it('should fallback to Gemini on Credit Exhaustion', async () => {
        // 401 doesn't trigger retry in requestWithRetry, so single mock is fine
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
            status: 401,
            statusText: 'Unauthorized',
            json: async () => ({ error: { message: 'Insufficient credits' } }),
            headers: { get: () => null }
        });

        (generateWithGemini as jest.Mock).mockResolvedValueOnce('Gemini Success');

        const result = await generateWithOpenRouter('test prompt', 'free');
        expect(result).toBe('Gemini Success');
    });

    it('should NOT fallback on invalid API key', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
            status: 401,
            statusText: 'Unauthorized',
            json: async () => ({ error: { message: 'Invalid API key' } }),
            headers: { get: () => null }
        });

        await expect(generateWithOpenRouter('test prompt', 'free'))
            .rejects.toThrow('Invalid API key');
        expect(generateWithGemini).not.toHaveBeenCalled();
    });

    it('should throw if both providers fail', async () => {
        const rateLimitResponse = {
            ok: false,
            status: 429,
            statusText: 'Too Many Requests',
            json: async () => ({ error: { message: 'Rate limit' } }),
            headers: { get: () => '1' }
        };

        (global.fetch as jest.Mock)
            .mockResolvedValueOnce(rateLimitResponse)
            .mockResolvedValueOnce(rateLimitResponse)
            .mockResolvedValueOnce(rateLimitResponse)
            .mockResolvedValueOnce(rateLimitResponse);

        (generateWithGemini as jest.Mock).mockRejectedValueOnce(new Error('Gemini Error'));

        await expect(generateWithOpenRouter('test prompt', 'free', undefined, 5000))
            .rejects.toThrow('Rate limit exceeded'); // Should throw original error
    });
});
