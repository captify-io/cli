import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@captify-io/core/lib';
import { services } from '../../../services';
import { config } from '../../../config';

export async function POST(request: NextRequest) {
  try {
    // Check if request has a body
    const text = await request.text();
    if (!text || text.trim() === '') {
      console.warn('Empty POST request to /api/captify from:', {
        referer: request.headers.get('referer'),
        userAgent: request.headers.get('user-agent'),
        origin: request.headers.get('origin'),
      });
      return NextResponse.json(
        { error: 'Empty request body' },
        { status: 400 }
      );
    }

    const body = JSON.parse(text);
    const { service, app } = body;

    // Check if this request is explicitly for local services (app.slug)
    if (app === config.slug && service && service.startsWith(`${config.slug}.`)) {
      const serviceName = service.replace(`${config.slug}.`, '');
      const localService = services.use(serviceName);

      if (!localService) {
        return NextResponse.json(
          { error: `Service not found: ${service}` },
          { status: 404 }
        );
      }

      // Get session for authentication using platform's auth
      const session = await auth();

      if (!session?.user) {
        return NextResponse.json(
          { error: 'Not authenticated' },
          { status: 401 }
        );
      }

      // Execute the local service
      const result = await localService.execute(body, null, session);
      return NextResponse.json(result);
    }

    // For all other services (platform.* or no app specified), proxy to the platform server
    const externalApp = request.headers.get('x-app');

    // Only include identityPoolId if the request is from this app
    const requestBody = {
      ...body,
      ...(externalApp === config.appName && process.env.COGNITO_IDENTITY_POOL_ID && {
        identityPoolId: process.env.COGNITO_IDENTITY_POOL_ID
      })
    };

    const captifyUrl = process.env.CAPTIFY_API!;
    const captifyApiUrl = `${captifyUrl}/api/captify`;

    const response = await fetch(captifyApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('cookie') || '',
        'x-app': config.slug
      },
      body: JSON.stringify(requestBody)
    });

    const result = await response.text();

    try {
      const jsonResult = JSON.parse(result);
      return NextResponse.json(jsonResult, { status: response.status });
    } catch {
      return new NextResponse(result, { status: response.status });
    }
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to proxy request', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}