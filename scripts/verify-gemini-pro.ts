
import { generateWithGemini } from '../src/lib/gemini';
import * as fs from 'fs';
import * as path from 'path';

// Manually load .env.local since we're running a standalone script
function loadEnv() {
    try {
        const envPath = path.resolve(process.cwd(), '.env.local');
        if (fs.existsSync(envPath)) {
            const content = fs.readFileSync(envPath, 'utf-8');
            content.split('\n').forEach(line => {
                const match = line.match(/^([^=]+)=(.*)$/);
                if (match) {
                    const key = match[1].trim();
                    const value = match[2].trim().replace(/^["']|["']$/g, ''); // Remove quotes
                    if (!process.env[key]) {
                        process.env[key] = value;
                    }
                }
            });
            console.log('✓ Loaded .env.local\n');
        } else {
            console.warn('⚠ .env.local not found\n');
        }
    } catch (e) {
        console.error('✗ Failed to load .env.local', e);
    }
}

async function testGeminiPro() {
    loadEnv();
    console.log('Testing Gemini Pro Key with different models...');

    const modelsToTest = ['gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-2.0-flash-exp'];

    for (const model of modelsToTest) {
        console.log(`\n--- Testing model: ${model} ---`);
        try {
            const result = await generateWithGemini('Hello, are you working?', 'pro', model);
            console.log(`✅ Success with ${model}:`, result.substring(0, 50) + '...');
        } catch (error: any) {
            console.error(`❌ Failed with ${model}:`);
            if (error.message) console.error('  Error Message:', error.message);
            if (error.status) console.error('  Error Status:', error.status);
        }
    }
}

testGeminiPro();
