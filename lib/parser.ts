import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';
import TurndownService from 'turndown';
// @ts-ignore
import { gfm } from 'turndown-plugin-gfm';
import { estimateTokens, calculateSavings, estimateCostSavings } from './tokens';

export interface ParseResult {
  title: string;
  url: string;
  markdown: string;
  raw_tokens: number;
  md_tokens: number;
  reduction_rate: string;
  estimated_savings?: string;
  error?: string;
  process_time_ms?: number;
}

export async function parseUrl(url: string): Promise<ParseResult> {
  const startTime = Date.now();
  
  // Clean URL
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }
  
  // SSRF prevention: Check if URL points to localhost or private IPs (basic check)
  let urlObj;
  try {
    urlObj = new URL(url);
  } catch (e) {
    throw new Error('Geçersiz URL formatı.');
  }

  if (['localhost', '127.0.0.1', '0.0.0.0', '::1'].includes(urlObj.hostname) || urlObj.hostname.startsWith('192.168.') || urlObj.hostname.startsWith('10.')) {
    throw new Error('SSRF engeli: Yerel IP adreslerine veya localhost\'a istek yapılamaz.');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 seconds timeout

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Oku.site/1.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Sayfa yüklenemedi: HTTP ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    const rawTokens = estimateTokens(html);

    // JSDOM Initialization
    const dom = new JSDOM(html, { url });
    const { document } = dom.window;

    // Remove unwanted elements before Readability to improve speed and accuracy
    const elementsToRemove = document.querySelectorAll('script, style, iframe, noscript, svg, nav, footer, aside, .cookie-banner, #cookie-banner');
    elementsToRemove.forEach(el => el.remove());

    const reader = new Readability(document);
    const article = reader.parse();

    if (!article) {
      throw new Error('İçerik çıkarılamadı veya sayfa çok boş.');
    }

    // Turndown conversion
    const turndownService = new TurndownService({
      headingStyle: 'atx',
      codeBlockStyle: 'fenced',
      emDelimiter: '*',
    });
    
    turndownService.use(gfm);
    
    // Add custom rules if needed to further clean HTML
    const markdown = turndownService.turndown(article.content || '');
    const mdTokens = estimateTokens(markdown);

    const reductionRate = calculateSavings(rawTokens, mdTokens);
    const estimatedSavings = estimateCostSavings(rawTokens, mdTokens);
    
    const processTime = Date.now() - startTime;

    return {
      title: article.title || document.title,
      url: url,
      markdown: markdown,
      raw_tokens: rawTokens,
      md_tokens: mdTokens,
      reduction_rate: reductionRate,
      estimated_savings: estimatedSavings,
      process_time_ms: processTime,
    };
  } catch (error: any) {
    clearTimeout(timeoutId);
    let errorMsg = 'Bilinmeyen bir hata oluştu.';
    if (error.name === 'AbortError') {
      errorMsg = 'İstek zaman aşımına uğradı (8 saniye sınırı).';
    } else if (error.message) {
      errorMsg = error.message;
    }
    
    return {
      title: 'Hata',
      url: url,
      markdown: `**Hata:** ${errorMsg}`,
      raw_tokens: 0,
      md_tokens: 0,
      reduction_rate: '0%',
      error: errorMsg,
      process_time_ms: Date.now() - startTime,
    };
  }
}
