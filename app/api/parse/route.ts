import { NextResponse } from 'next/server';
import { parseUrl } from '@/lib/parser';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'Lütfen bir URL belirtin.' }, { status: 400 });
  }

  try {
    const result = await parseUrl(url);
    if (result.error) {
      return NextResponse.json(result, { status: 400 });
    }
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Bir hata oluştu.' }, { status: 500 });
  }
}
