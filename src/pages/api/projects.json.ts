import type { APIContext } from 'astro';

const GITHUB_API_URL = 'https://api.github.com/users/t2ne/repos?per_page=100&sort=updated';
const EDGE_TTL_SECONDS = 900; // 15 minutes at the edge
const BROWSER_TTL_SECONDS = 300; // 5 minutes in the browser

interface GithubRepo {
	name?: string;
	html_url?: string;
	language?: string | null;
	[other: string]: unknown;
}

interface SimplifiedRepo {
	name: string;
	url: string;
	language: string;
}

const simplifyRepos = (repos: unknown): SimplifiedRepo[] => {
	if (!Array.isArray(repos)) return [];
	return repos
		.filter((repo): repo is GithubRepo => !!repo && typeof repo === 'object')
		.filter((repo) => repo.name && repo.html_url)
		.map((repo) => ({
			name: String(repo.name),
			url: String(repo.html_url),
			language: repo.language ? String(repo.language) : 'Other',
		}));
};

const buildHeaders = (origin: string | null) => {
	const headers: Record<string, string> = {
		'Content-Type': 'application/json; charset=utf-8',
		'Cache-Control': `public, max-age=${BROWSER_TTL_SECONDS}, s-maxage=${EDGE_TTL_SECONDS}`,
		'X-Content-Type-Options': 'nosniff',
	};

	// Only allow JS running on your own origin to read this response
	if (origin) {
		headers['Access-Control-Allow-Origin'] = origin;
		headers['Vary'] = 'Origin';
	}

	return headers;
};

export async function GET(context: APIContext): Promise<Response> {
	const request = context.request;
	const url = new URL(context.url);
	const siteOrigin = url.origin;
	const origin = request.headers.get('Origin');

	// Basic origin check: allow same-origin requests and non-CORS requests (like server-to-server or direct curl)
	if (origin && origin !== siteOrigin) {
		return new Response(JSON.stringify({ error: 'Forbidden' }), {
			status: 403,
			headers: buildHeaders(null),
		});
	}

	const cache = (globalThis as any).caches?.default as Cache | undefined;
	const cacheKey = new Request(GITHUB_API_URL, { method: 'GET' });

	// Try edge cache first
	if (cache) {
		const cached = await cache.match(cacheKey);
		if (cached) {
			// Cached response already contains simplified data
			return new Response(cached.body, {
				status: 200,
				headers: buildHeaders(origin ?? null),
			});
		}
	}

	// Fallback to GitHub API
	const upstream = await fetch(GITHUB_API_URL, {
		headers: {
			// GitHub requires a User-Agent
			'User-Agent': 'no-tone-site',
		},
	});

	if (!upstream.ok) {
		return new Response(JSON.stringify([]), {
			status: 200,
			headers: buildHeaders(origin ?? null),
		});
	}

	const raw = await upstream.json();
	const simplified = simplifyRepos(raw);
	const body = JSON.stringify(simplified);

	const response = new Response(body, {
		status: 200,
		headers: buildHeaders(origin ?? null),
	});

	// Store in edge cache for subsequent requests
	if (cache) {
		try {
			await cache.put(cacheKey, response.clone());
		} catch {
			// ignore cache errors
		}
	}

	return response;
}
