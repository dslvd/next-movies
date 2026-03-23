const EMBED_ORIGIN = 'https://vidsrc.cc';

const HOP_BY_HOP_HEADERS = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
]);

function buildUpstreamUrl(path: string[], search: string) {
  const pathname = path.filter(Boolean).join('/');
  return `${EMBED_ORIGIN}/${pathname}${search}`;
}

function copyResponseHeaders(source: Headers) {
  const headers = new Headers();

  source.forEach((value, key) => {
    const lower = key.toLowerCase();

    if (HOP_BY_HOP_HEADERS.has(lower)) {
      return;
    }

    // Strip framing restrictions from upstream since this response is intended for an in-site iframe.
    if (lower === 'x-frame-options' || lower === 'content-security-policy') {
      return;
    }

    headers.set(key, value);
  });

  return headers;
}

function rewriteHtmlToProxyAssets(html: string) {
  return html
    .replace(/(["'])\/(?!\/)/g, '$1/api/embed/')
    .replace(/https:\/\/vidsrc\.cc\//g, '/api/embed/');
}

export async function GET(
  request: Request,
  { params }: { params: { path: string[] } },
) {
  const { search } = new URL(request.url);
  const upstreamUrl = buildUpstreamUrl(params.path, search);

  const upstreamResponse = await fetch(upstreamUrl, {
    cache: 'no-store',
    headers: {
      accept: request.headers.get('accept') ?? '*/*',
      'accept-language': request.headers.get('accept-language') ?? 'en-US,en',
      'user-agent': request.headers.get('user-agent') ?? 'Mozilla/5.0',
      referer: EMBED_ORIGIN,
      origin: EMBED_ORIGIN,
    },
    redirect: 'follow',
  });

  const headers = copyResponseHeaders(upstreamResponse.headers);
  const contentType = headers.get('content-type') ?? '';

  if (contentType.includes('text/html')) {
    const html = await upstreamResponse.text();
    const rewrittenHtml = rewriteHtmlToProxyAssets(html);

    return new Response(rewrittenHtml, {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
      headers,
    });
  }

  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    statusText: upstreamResponse.statusText,
    headers,
  });
}
