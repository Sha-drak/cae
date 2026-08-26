const OEMBED_CACHE_TTL = 60 * 60 * 24

export default {
  async fetch(request, env) {
    const url = new URL(request.url)

    if (url.pathname === '/api/tiktok-oembed') {
      return handleOEmbed(url)
    }

    return env.ASSETS.fetch(request)
  },
}

async function handleOEmbed(url) {
  const target = url.searchParams.get('url')
  if (!target || !/^https:\/\/(www\.)?tiktok\.com\/[^/"']+/i.test(target)) {
    return json({ error: 'A valid TikTok url is required' }, 400)
  }

  const cache = caches.default
  const cacheKey = new Request('https://oembed.cache/?url=' + encodeURIComponent(target))

  const cached = await cache.match(cacheKey)
  if (cached) return cached

  let upstream
  try {
    upstream = await fetch('https://www.tiktok.com/oembed?url=' + encodeURIComponent(target), {
      cf: { cacheTtl: OEMBED_CACHE_TTL },
    })
  } catch {
    return json({ error: 'Could not reach TikTok' }, 502)
  }

  if (!upstream.ok) {
    return json({ error: 'TikTok replied with status ' + upstream.status }, 502)
  }

  const body = await upstream.text()
  const headers = {
    'Content-Type': 'application/json',
    'Cache-Control': 'public, max-age=' + OEMBED_CACHE_TTL,
  }

  await cache.put(cacheKey, new Response(body, { status: 200, headers }))
  return new Response(body, { status: 200, headers })
}

function json(payload, status) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  })
}
