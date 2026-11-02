import { NextResponse } from 'next/server';
import { hasGeminiApiKey } from '@/lib/config';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    hasApiKey: hasGeminiApiKey(),
  });
}
