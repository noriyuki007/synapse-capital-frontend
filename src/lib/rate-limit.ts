/**
 * Simple In-Memory Rate Limiter for Beta Phase
 * Tracks IP usage per day.
 * Note: Resets on server restart/re-deploy.
 */

interface RateLimitRecord {
    count: number;
    lastReset: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();
const LIMIT_PER_DAY = 5;

/**
 * Check if a request from a given IP is allowed
 */
export async function checkRateLimit(ip: string, adminIp?: string): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime?: string;
}> {
    // 1. Admin Bypass
    if (adminIp && ip === adminIp) {
        return { allowed: true, remaining: 999 };
    }

    const now = Date.now();
    const today = new Date().setHours(0, 0, 0, 0); // Start of today

    let record = rateLimitMap.get(ip);

    // 2. Initial or Daily Reset
    if (!record || record.lastReset < today) {
        record = { count: 0, lastReset: now };
    }

    // 3. Increment and Check
    if (record.count >= LIMIT_PER_DAY) {
        return { 
            allowed: false, 
            remaining: 0,
            resetTime: new Date(today + 24 * 60 * 60 * 1000).toLocaleTimeString('ja-JP')
        };
    }

    record.count += 1;
    rateLimitMap.set(ip, record);

    return { 
        allowed: true, 
        remaining: LIMIT_PER_DAY - record.count 
    };
}
