import { createClient } from 'microcms-js-sdk';
import brokerData from './broker-data.json';

export const client = createClient({
    serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN || 'synapsecapital',
    apiKey: process.env.MICROCMS_API_KEY || 'mock_key',
});

export type Exchange = {
    id: string;
    name: string;
    affiliateLink: string;
    description: string;
    logo?: {
        url: string;
    };
    features: string[];
    pros: string[];
    cons: string[];
    campaignText?: string;
    rating: number;
    targetAudience?: string;
    recommendation?: string;
    supportedLocales?: string[];
    scores: {
        cost: number;
        platform: number;
        speed: number;
        security: number;
        support: number;
    };
};

export async function getExchanges(locale: string = 'ja') {
    const isEn = locale === 'en';
    
    // 1. Load Local Data (The Authority for this session)
    const localExchanges = (brokerData as any[])
        .filter(b => !b.supportedLocales || b.supportedLocales.includes(locale))
        .map(b => ({
            ...b,
            name: isEn ? (b.name_en || b.name) : b.name,
            description: isEn ? (b.description_en || b.description) : b.description,
            affiliateLink: isEn ? (b.affiliateLink_en || b.affiliateLink) : b.affiliateLink,
            features: isEn ? (b.features_en || b.features || []) : (b.features || []),
            pros: isEn ? (b.pros_en || b.pros || []) : (b.pros || []),
            cons: isEn ? (b.cons_en || b.cons || []) : (b.cons || []),
            targetAudience: isEn ? (b.targetAudience_en || b.targetAudience) : b.targetAudience,
            recommendation: isEn ? (b.recommendation_en || b.recommendation) : b.recommendation,
        })) as Exchange[];

    try {
        // 2. Fetch from microCMS for any additional dynamic content
        const data = await client.get({
            endpoint: 'exchanges',
            queries: { limit: 30 },
        });
        
        const remoteExchanges = (data.contents as any[])
            .filter(b => !b.supportedLocales || b.supportedLocales.includes(locale))
            .map(b => ({
                ...b,
                name: isEn ? (b.name_en || b.name) : b.name,
                description: isEn ? (b.description_en || b.description) : b.description,
                affiliateLink: isEn ? (b.affiliateLink_en || b.affiliateLink) : b.affiliateLink,
                features: isEn ? (b.features_en || b.features || []) : (b.features || []),
                pros: isEn ? (b.pros_en || b.pros || []) : (b.pros || []),
                cons: isEn ? (b.cons_en || b.cons || []) : (b.cons || []),
                targetAudience: isEn ? (b.targetAudience_en || b.targetAudience) : b.targetAudience,
                recommendation: isEn ? (b.recommendation_en || b.recommendation) : b.recommendation,
            })) as Exchange[];

        // Combine: Use local data if present, otherwise use remote
        const merged = [...localExchanges];
        remoteExchanges.forEach(re => {
            // Only add if not already in local (prevents re-adding deleted items or overriding local updates)
            if (!merged.find(le => le.id === re.id)) {
                merged.push(re);
            }
        });
        
        return merged;
    } catch (e) {
        console.warn("microCMS getExchanges failed or skipped, using local data.");
        return localExchanges;
    }
}

export async function getExchangeById(id: string, locale: string = 'ja') {
    const mocks = await getExchanges(locale);
    return mocks.find(m => m.id === id) || mocks[0];
}
