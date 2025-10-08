import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Proxy the session request to the platform with cookies
    const response = await fetch(`${process.env.CAPTIFY_API}/api/auth/session`, {
      headers: {
        'cookie': request.headers.get('cookie') || '',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json(null, { status: response.status });
    }

    const session = await response.json();
    return NextResponse.json(session);
  } catch (error) {
    console.error('Session proxy error:', error);
    return NextResponse.json(null, { status: 500 });
  }
}