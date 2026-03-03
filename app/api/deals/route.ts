import { NextResponse } from 'next/server';
import { parseCSVData } from '@/lib/csv-parser';

/**
 * GET /api/deals
 * Returns parsed deal data from CSV file
 *
 * Response format:
 * {
 *   NM: string[],  // Array of advisor names (sorted)
 *   RW: any[][]    // Array of deal records (13 elements each)
 * }
 */
export async function GET() {
  try {
    const { NM, RW } = await parseCSVData();

    return NextResponse.json({ NM, RW });
  } catch (error) {
    console.error('Error parsing CSV:', error);

    return NextResponse.json(
      {
        error: 'Failed to load deals data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Revalidate every 5 minutes (300 seconds)
// This caches the parsed data and reduces CSV parsing overhead
export const revalidate = 300;
