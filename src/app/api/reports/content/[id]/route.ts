import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(
    _req: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    const id = params?.id;

    // Cloudflare Edge context: We MUST NOT use 'fs' or 'path'.
    // Development fallback is removed to ensure absolute build stability on Cloudflare.
    // The client-side already has a fallback to fetch from GitHub if this endpoint returns 404.
    
    return new Response(`Intelligence layer [${id}] not found in Edge cache. Redirecting to distributed storage.`, { 
        status: 404,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
}
