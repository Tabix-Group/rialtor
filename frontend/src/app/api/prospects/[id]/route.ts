import { NextResponse } from 'next/server'

const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const auth = request.headers.get('authorization') || ''
    const backendUrl = `${BACKEND}/api/prospects/${id}`

    const res = await fetch(backendUrl, { headers: { Authorization: auth, 'Content-Type': 'application/json' } })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (err) {
    console.error('Error in prospects/[id] proxy GET:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const auth = request.headers.get('authorization') || ''
    const body = await request.json()
    const backendUrl = `${BACKEND}/api/prospects/${id}`

    const res = await fetch(backendUrl, { method: 'PUT', headers: { Authorization: auth, 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (err) {
    console.error('Error in prospects/[id] proxy PUT:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const auth = request.headers.get('authorization') || ''
    const backendUrl = `${BACKEND}/api/prospects/${id}`

    const res = await fetch(backendUrl, { method: 'DELETE', headers: { Authorization: auth, 'Content-Type': 'application/json' } })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (err) {
    console.error('Error in prospects/[id] proxy DELETE:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}