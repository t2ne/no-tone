import type { MiddlewareHandler } from 'astro';

const CSP_HEADER = 'Content-Security-Policy';

const generateNonce = (): string => {
	// Use Web Crypto when available (Cloudflare Workers, modern browsers)
	if (typeof crypto !== 'undefined' && 'getRandomValues' in crypto) {
		const bytes = new Uint8Array(16);
		crypto.getRandomValues(bytes);
		let binary = '';
		for (let i = 0; i < bytes.length; i++) {
			binary += String.fromCharCode(bytes[i]);
		}
		return btoa(binary);
	}

	// Fallback for non-Web Crypto environments (e.g. some local dev setups)
	return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
};

export const onRequest: MiddlewareHandler = async (context, next) => {
	const nonce = generateNonce();
	context.locals.cspNonce = nonce;

	const response = await next();

	// Optionally prevent caching of HTML responses that contain nonces
	const contentType = response.headers.get('Content-Type') || '';
	if (contentType.startsWith('text/html')) {
		response.headers.set('Cache-Control', 'private, no-store');
	}

	const url = new URL(context.request.url);
	const isLocalDev = url.hostname === 'localhost' || url.hostname === '127.0.0.1';

	const scriptSrc = isLocalDev
		? "script-src 'self' 'unsafe-inline'"
		: `script-src 'self' 'nonce-${nonce}'`;

	const styleSrc = isLocalDev
		? "style-src 'self' 'unsafe-inline'"
		: "style-src 'self'";

	const directives = [
		"default-src 'none'",
		scriptSrc,
		styleSrc,
		"img-src 'self' https: data:",
		"font-src 'self' https: data:",
		"connect-src 'self' https://api.github.com https://static.cloudflareinsights.com",
		"frame-ancestors 'none'",
		"base-uri 'none'",
		"form-action 'self'",
		"object-src 'none'",
	];

	if (!isLocalDev) {
		directives.push("trusted-types default");
		directives.push("require-trusted-types-for 'script'");
	}

	const csp = directives.join('; ');

	response.headers.set(CSP_HEADER, csp);
	return response;
};
