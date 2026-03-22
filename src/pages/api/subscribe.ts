import type { APIRoute } from 'astro'

const PUBLICATION_ID = '6520ad1b-ab0f-4fcc-9288-be956f5eaaa4'

export const POST: APIRoute = async ({ request }) => {
  const { email } = await request.json()

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return new Response(JSON.stringify({ error: 'Invalid email' }), { status: 400 })
  }

  const apiKey = import.meta.env.BEEHIIV_API_KEY
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'Newsletter not configured' }), { status: 500 })
  }

  const res = await fetch(
    `https://api.beehiiv.com/v2/publications/${PUBLICATION_ID}/subscriptions`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        email,
        reactivate_existing: false,
        send_welcome_email: true,
        utm_source: 'website',
        utm_medium: 'organic'
      })
    }
  )

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    console.error('Beehiiv error:', res.status, body)
    return new Response(JSON.stringify({ error: 'Subscription failed', detail: body }), { status: 500 })
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 })
}
