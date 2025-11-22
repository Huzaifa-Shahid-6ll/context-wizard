
import { parseLLMJson } from './utils';

describe('parseLLMJson', () => {
    it('parses valid JSON', () => {
        const input = '{"key": "value"}';
        expect(parseLLMJson(input)).toEqual({ key: 'value' });
    });

    it('parses JSON with markdown code fences', () => {
        const input = '```json\n{"key": "value"}\n```';
        expect(parseLLMJson(input)).toEqual({ key: 'value' });
    });

    it('parses JSON with markdown code fences and language identifier', () => {
        const input = '```json\n{"key": "value"}\n```';
        expect(parseLLMJson(input)).toEqual({ key: 'value' });
    });

    it('parses JSON with surrounding text', () => {
        const input = 'Here is the JSON:\n```json\n{"key": "value"}\n```\nHope this helps!';
        expect(parseLLMJson(input)).toEqual({ key: 'value' });
    });

    it('parses JSON with surrounding text without fences', () => {
        const input = 'Here is the JSON: {"key": "value"} Hope this helps!';
        expect(parseLLMJson(input)).toEqual({ key: 'value' });
    });

    it('fixes unquoted keys', () => {
        const input = '{key: "value"}';
        expect(parseLLMJson(input)).toEqual({ key: 'value' });
    });

    it('fixes trailing commas', () => {
        const input = '{"key": "value",}';
        expect(parseLLMJson(input)).toEqual({ key: 'value' });
    });

    it('returns fallback if parsing fails', () => {
        const input = 'Invalid JSON';
        const fallback = { fallback: true };
        expect(parseLLMJson(input, fallback)).toEqual(fallback);
    });

    it('throws error if parsing fails and no fallback provided', () => {
        const input = 'Invalid JSON';
        expect(() => parseLLMJson(input)).toThrow();
    });
});
