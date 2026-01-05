import { NextResponse } from 'next/server'

const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003'

export async function GET(request: Request) {
  try {
    const auth = request.headers.get('authorization') || ''
    const url = new URL(request.url)
    const params = url.searchParams.toString()
    const backendUrl = `${BACKEND}/api/prospects${params ? `?${params}` : ''}`

    const res = await fetch(backendUrl, { headers: { Authorization: auth, 'Content-Type': 'application/json' } })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (err) {
    console.error('Error in prospects proxy GET:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const auth = request.headers.get('authorization') || ''
    const body = await request.json()
    const backendUrl = `${BACKEND}/api/prospects`

    const res = await fetch(backendUrl, { method: 'POST', headers: { Authorization: auth, 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (err) {
    console.error('Error in prospects proxy POST:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}