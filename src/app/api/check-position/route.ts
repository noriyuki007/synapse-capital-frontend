export const dynamic = 'force-static';
export const runtime = 'edge';

export async function GET() {
  return new Response(JSON.stringify({ message: 'Synapse API is active.' }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function POST() {
  return new Response(JSON.stringify({ error: 'This route is handled by Cloudflare Functions in production.' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
