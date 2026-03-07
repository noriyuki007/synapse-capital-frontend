const WP_API_URL = 'https://agent-frontier.jp/wp-json/wp/v2';

// Fallback / Mock Data to prevent build failures when API is down
const MOCK_POST = {
  id: 0,
  date: new Date().toISOString(),
  title: { rendered: "コンテンツ提供まで少々お待ちください" },
  content: { rendered: "<p>現在、システムのメンテナンスを行っております。最新の記事はまもなく公開されます。</p>" },
  excerpt: { rendered: "メンテナンス中" },
  _embedded: {}
};

async function safeJson(res: Response, fallback: any) {
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return res.json();
  }
  return fallback;
}

export async function fetchPosts(perPage = 10, categoryId?: number) {
  let url = `${WP_API_URL}/posts?_embed&per_page=${perPage}`;
  if (categoryId) {
    url += `&categories=${categoryId}`;
  }
  try {
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    return safeJson(res, []);
  } catch (e: any) {
    console.warn("WP API Fetch Failure (fetchPosts):", e?.message || "Unknown error");
    return [];
  }
}

export async function fetchPost(id: string) {
  try {
    const res = await fetch(`${WP_API_URL}/posts/${id}?_embed`, { next: { revalidate: 60 } });
    if (!res.ok) {
      if (res.status === 404) return null;
      return { ...MOCK_POST, id: Number(id) };
    }
    const data = await safeJson(res, null);
    if (!data) return { ...MOCK_POST, id: Number(id) };
    return data;
  } catch (e: any) {
    console.warn("WP API Fetch Failure (fetchPost):", e?.message || "Unknown error");
    return { ...MOCK_POST, id: Number(id) };
  }
}

export async function fetchCategories() {
  try {
    const res = await fetch(`${WP_API_URL}/categories`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    return safeJson(res, []);
  } catch (e) {
    return [];
  }
}

export function getFeaturedImage(post: any): string {
  if (post?._embedded && post._embedded['wp:featuredmedia'] && post._embedded['wp:featuredmedia'][0]) {
    return post._embedded['wp:featuredmedia'][0].source_url;
  }
  return '/agent_economy_evolution.png'; // Fallback
}

export async function fetchPostBySlug(slug: string) {
  try {
    const res = await fetch(`${WP_API_URL}/posts?_embed&slug=${slug}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const posts = await safeJson(res, []);
    if (!posts || posts.length === 0) return null;
    return posts[0];
  } catch (e) {
    return null;
  }
}
