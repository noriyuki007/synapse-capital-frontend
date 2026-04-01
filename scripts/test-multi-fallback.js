/**
 * Enhanced test script for OpenRouter Multi-Model Fallback
 */
import fs from 'fs';

let OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

if (!OPENROUTER_API_KEY) {
    try {
        const envLocal = fs.readFileSync('.env.local', 'utf8');
        const match = envLocal.match(/^OPENROUTER_API_KEY=(.*)$/m);
        if (match) {
            OPENROUTER_API_KEY = match[1].trim();
        }
    } catch (e) {
        // Ignore
    }
}

const FREE_MODELS = [
    "invalid/model-fallback-test",                   // Should fail (tests fallback)
    "openrouter/free",                                // Auto-routes to best available free model
    "nvidia/nemotron-3-super-120b-a12b:free",         // Should succeed
];

async function testFallbackChain() {
    if (!OPENROUTER_API_KEY) {
        console.error("❌ OPENROUTER_API_KEY is not set.");
        process.exit(1);
    }

    console.log("🚀 Testing OpenRouter multi-model fallback chain...");

    for (const modelId of FREE_MODELS) {
        console.log(`[Test] Attempting: ${modelId}`);
        try {
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: modelId,
                    messages: [{ role: "user", content: "Hi" }],
                    temperature: 0.7
                })
            });

            if (!response.ok) {
                console.warn(`⚠️ Model ${modelId} failed as expected or due to error.`);
                continue;
            }

            const data = await response.json();
            console.log(`✅ Success with: ${modelId}`);
            console.log(`✅ Response: ${data.choices[0]?.message?.content}`);
            return;
        } catch (e) {
            console.warn(`⚠️ Error for ${modelId}: ${e.message}`);
        }
    }
    console.error("❌ All models in test chain failed.");
}

testFallbackChain();
