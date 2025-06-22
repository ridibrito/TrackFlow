import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

// Regex para encontrar os IDs
const GTM_REGEX = /GTM-[A-Z0-9]{4,}/g;
const META_PIXEL_REGEX = /'https?:\/\/www\.facebook\.com\/tr\?id=(\d{15,})&/g;
const GA4_REGEX = /G-[A-Z0-9]{10}/g;

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Garante que a URL tenha um protocolo
    const fullUrl = url.startsWith('http') ? url : `https://${url}`;

    const response = await fetch(fullUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const gtmIds = (html.match(GTM_REGEX) || []).filter((v, i, a) => a.indexOf(v) === i);
    const metaPixelIds = (html.match(META_PIXEL_REGEX) || [])
        .map(match => match.split('id=')[1].split('&')[0])
        .filter((v, i, a) => a.indexOf(v) === i);
    const ga4Ids = (html.match(GA4_REGEX) || []).filter((v, i, a) => a.indexOf(v) === i);


    return NextResponse.json({
      gtmIds,
      metaPixelIds,
      ga4Ids
    });

  } catch (error: any) {
    console.error('Error scanning URL:', error);
    return NextResponse.json({ error: 'Failed to scan URL', details: error.message }, { status: 500 });
  }
} 