import * as fs from 'fs';
import * as path from 'path';
import { generateWithOpenRouter } from '../src/lib/openrouter';
import { generateWithGemini } from '../src/lib/gemini';

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

async function testAPI(
    name: string,
    tier: 'free' | 'pro',
    apiType: 'openrouter' | 'gemini',
    requestCount: number = 3,
    delayMs: number = 6000
) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Testing: ${name}`);
    console.log(`${'='.repeat(60)}\n`);

    const results: Array<{ index: number; success: boolean; duration: number; error?: string; response?: string }> = [];

    for (let i = 1; i <= requestCount; i++) {
        console.log(`[${i}/${requestCount}] Sending request...`);
        const start = Date.now();

        try {
            const prompt = `Say "Test ${i} for ${name}" and nothing else.`;
            let result: string;

            if (apiType === 'openrouter') {
                result = await generateWithOpenRouter(prompt, tier);
            } else {
                result = await generateWithGemini(prompt, tier);
            }

            const duration = Date.now() - start;

            if (!result || result.trim().length === 0) {
                console.log(`  ✗ FAILED: Empty response`);
                results.push({ index: i, success: false, duration, error: 'Empty response' });
            } else {
                const preview = result.trim().substring(0, 50) + (result.length > 50 ? '...' : '');
                console.log(`  ✓ SUCCESS: "${preview}"`);
                console.log(`  Duration: ${duration}ms`);
                results.push({ index: i, success: true, duration, response: result.trim() });
            }
        } catch (error: any) {
            const duration = Date.now() - start;
            const errorMsg = error.message || String(error);

            if (errorMsg.includes('rate limit') || errorMsg.includes('429')) {
                console.log(`  ✗ FAILED: Rate limit (429)`);
                results.push({ index: i, success: false, duration, error: 'Rate limit (429)' });
            } else if (errorMsg.includes('credit') || errorMsg.includes('quota') || errorMsg.includes('empty')) {
                console.log(`  ✗ FAILED: No credits/Empty response`);
                results.push({ index: i, success: false, duration, error: 'No credits or empty' });
            } else {
                console.log(`  ✗ FAILED: ${errorMsg.substring(0, 80)}`);
                results.push({ index: i, success: false, duration, error: errorMsg.substring(0, 80) });
            }
        }

        // Wait before next request (except for the last one)
        if (i < requestCount) {
            console.log(`  Waiting ${delayMs / 1000}s...\n`);
            await new Promise(resolve => setTimeout(resolve, delayMs));
        }
    }

    // Summary for this API
    console.log('\n--- Summary ---');
    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;
    const rateLimitCount = results.filter(r => r.error?.includes('Rate limit')).length;
    const noCreditCount = results.filter(r => r.error?.includes('credit') || r.error?.includes('empty')).length;

    console.log(`Total: ${requestCount} | ✓ Success: ${successCount} | ✗ Failed: ${failCount}`);
    if (rateLimitCount > 0) console.log(`⚠ Rate Limited: ${rateLimitCount}`);
    if (noCreditCount > 0) console.log(`⚠ No Credits/Empty: ${noCreditCount}`);

    return {
        name,
        tier,
        apiType,
        results,
        successCount,
        failCount,
        rateLimitCount,
        noCreditCount
    };
}

async function testAllAPIs() {
    loadEnv();

    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║         API Keys & Rate Limit Comprehensive Test          ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log('\nTesting all 4 API configurations:');
    console.log('  1. OpenRouter Free (mistralai/mistral-7b-instruct:free)');
    console.log('  2. OpenRouter Pro (anthropic/claude-3.5-sonnet)');
    console.log('  3. Gemini Free (gemini-2.0-flash-exp)');
    console.log('  4. Gemini Pro (gemini-1.5-pro)');
    console.log('\nEach will send 3 requests with 6-second delays.\n');

    const allResults = [];

    // Test OpenRouter Free
    allResults.push(await testAPI('OpenRouter Free', 'free', 'openrouter', 3, 6000));

    // Test OpenRouter Pro
    allResults.push(await testAPI('OpenRouter Pro', 'pro', 'openrouter', 3, 6000));

    // Test Gemini Free
    allResults.push(await testAPI('Gemini Free', 'free', 'gemini', 3, 6000));

    // Test Gemini Pro
    allResults.push(await testAPI('Gemini Pro', 'pro', 'gemini', 3, 6000));

    // Final Summary
    console.log('\n\n╔════════════════════════════════════════════════════════════╗');
    console.log('║                    FINAL SUMMARY                           ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    allResults.forEach(result => {
        const status = result.successCount === 3 ? '✅' :
            result.successCount > 0 ? '⚠️' : '❌';
        console.log(`${status} ${result.name.padEnd(20)} | Success: ${result.successCount}/3 | Failed: ${result.failCount}/3`);
        if (result.rateLimitCount > 0) {
            console.log(`   └─ Rate Limited: ${result.rateLimitCount}`);
        }
        if (result.noCreditCount > 0) {
            console.log(`   └─ No Credits/Empty: ${result.noCreditCount}`);
        }
    });

    const totalSuccess = allResults.reduce((sum, r) => sum + r.successCount, 0);
    const totalRequests = allResults.length * 3;

    console.log('\n' + '─'.repeat(60));
    console.log(`Overall: ${totalSuccess}/${totalRequests} requests succeeded`);

    if (totalSuccess === totalRequests) {
        console.log('\n🎉 ALL TESTS PASSED! All API keys are working correctly.');
    } else if (totalSuccess > 0) {
        console.log('\n⚠️  PARTIAL SUCCESS: Some APIs are working, others need attention.');
    } else {
        console.log('\n❌ ALL TESTS FAILED: Check your API keys and rate limits.');
    }
}

testAllAPIs();
