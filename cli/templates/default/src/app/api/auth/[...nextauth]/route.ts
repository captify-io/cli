import { NextRequest, NextResponse } from "next/server";

/**
 * Proxy all NextAuth requests to the platform
 * This ensures centralized authentication without duplicating Cognito config
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ nextauth: string[] }> }
) {
  const { nextauth } = await params;
  const captifyUrl = process.env.CAPTIFY_API!;
  const path = nextauth.join("/");

  // For signin/signout routes, redirect directly to platform
  if (path === "signin" || path === "signout" || path === "error") {
    const searchParams = request.nextUrl.searchParams.toString();
    const redirectUrl = `${captifyUrl}/api/auth/${path}${
      searchParams ? `?${searchParams}` : ""
    }`;
    return NextResponse.redirect(redirectUrl);
  }

  const searchParams = request.nextUrl.searchParams.toString();
  const url = `${captifyUrl}/api/auth/${path}${
    searchParams ? `?${searchParams}` : ""
  }`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // Forward cookies from the original request
        ...(request.headers.get("cookie")
          ? { Cookie: request.headers.get("cookie")! }
          : {}),
      },
      credentials: "include",
    });

    const data = await response.json();
    const headers = new Headers();

    // Forward Set-Cookie headers from platform
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() === "set-cookie") {
        headers.append(key, value);
      }
    });

    return NextResponse.json(data, {
      status: response.status,
      headers,
    });
  } catch (error) {
    console.error("Auth proxy error:", error);
    // On proxy failure, redirect to platform login with original callback
    const existingCallback = request.nextUrl.searchParams.get('callbackUrl');
    const callbackUrl = existingCallback || request.headers.get('referer') || request.nextUrl.origin;
    return NextResponse.redirect(`${captifyUrl}/api/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ nextauth: string[] }> }
) {
  const { nextauth } = await params;
  const captifyUrl = process.env.CAPTIFY_API!;
  const path = nextauth.join("/");
  const searchParams = request.nextUrl.searchParams.toString();
  const url = `${captifyUrl}/api/auth/${path}${
    searchParams ? `?${searchParams}` : ""
  }`;

  try {
    const body = await request.text();
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(request.headers.get("cookie")
          ? { Cookie: request.headers.get("cookie")! }
          : {}),
      },
      body,
      credentials: "include",
    });

    const data = await response.json();
    const headers = new Headers();

    // Forward Set-Cookie headers from platform
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() === "set-cookie") {
        headers.append(key, value);
      }
    });

    return NextResponse.json(data, {
      status: response.status,
      headers,
    });
  } catch (error) {
    console.error("Auth proxy error:", error);
    // On proxy failure, redirect to platform login with original callback
    const existingCallback = request.nextUrl.searchParams.get('callbackUrl');
    const callbackUrl = existingCallback || request.headers.get('referer') || request.nextUrl.origin;
    return NextResponse.redirect(`${captifyUrl}/api/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }
}
