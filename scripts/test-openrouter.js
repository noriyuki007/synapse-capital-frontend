/**
 * Test script for OpenRouter integration
 */
import fs from 'fs';
import path from 'path';

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

async function testOpenRouter() {
    if (!OPENROUTER_API_KEY) {
        console.error("❌ OPENROUTER_API_KEY is not set in environment.");
        process.exit(1);
    }

    console.log("🚀 Testing OpenRouter connectivity...");

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "google/gemini-2.0-flash-001",
                messages: [
                    { role: "system", content: "You are a helpful assistant." },
                    { role: "user", content: "Say hello in Japanese and confirm you are working." }
                ],
                temperature: 0.7
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`OpenRouter API Error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log("✅ API Response Status:", response.status);
        console.log("✅ Model used:", data.model);
        console.log("✅ Response content:", data.choices[0]?.message?.content);
    } catch (e) {
        console.error("❌ Test failed:", e.message);
    }
}

testOpenRouter();
