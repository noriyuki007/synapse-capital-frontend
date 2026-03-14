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
    isBeginner?: boolean;
    scores: {
        cost: number;
        platform: number;
        speed: number;
        security: number;
        support: number;
    };
};

export async function getExchanges() {
    try {
        const data = await client.get({
            endpoint: 'exchanges',
            queries: { limit: 10 },
        });
        return data.contents as Exchange[];
    } catch (e) {
        console.warn("microCMS getExchanges failed, using unbiased local data.");
        
        // Map local data to match Exchange type
        return (brokerData as any[]).map(b => ({
            ...b,
            features: b.features || [],
            pros: b.pros || [],
            cons: b.cons || []
        })) as Exchange[];
    }
}

export async function getExchangeById(id: string) {
    try {
        const data = await client.get({
            endpoint: 'exchanges',
            contentId: id,
        });
        return data as Exchange;
    } catch (e) {
        const mocks = await getExchanges();
        return mocks.find(m => m.id === id) || mocks[0];
    }
}
