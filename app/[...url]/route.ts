import { NextResponse } from 'next/server';
import { parseUrl } from '@/lib/parser';

export async function GET(request: Request) {
  const reqUrl = new URL(request.url);
  
  // Extract target URL from pathname (removes the leading slash)
  let targetUrl = reqUrl.pathname.substring(1);
  if (reqUrl.search) {
    targetUrl += reqUrl.search;
  }

  if (!targetUrl) {
    return NextResponse.json({ error: 'Geçersiz URL. Lütfen geçerli bir adres girin.' }, { status: 400 });
  }

  try {
    const result = await parseUrl(targetUrl);
    
    // Check if JSON format is explicitly requested
    const acceptHeader = request.headers.get('accept') || '';
    const isJsonRequested = acceptHeader.includes('application/json') || reqUrl.searchParams.has('format') && reqUrl.searchParams.get('format') === 'json';

    if (isJsonRequested) {
      return NextResponse.json(result, { status: result.error ? 400 : 200 });
    }

    // Default: return raw markdown as plain text
    if (result.error) {
       return new NextResponse(result.markdown, {
        status: 400,
        headers: {
          'Content-Type': 'text/markdown; charset=utf-8',
        },
      });
    }

    return new NextResponse(result.markdown, {
      status: 200,
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
      },
    });
  } catch (error: any) {
    return new NextResponse(`**Hata:** ${error.message || 'Bilinmeyen Hata'}`, {
      status: 500,
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
      },
    });
  }
}
