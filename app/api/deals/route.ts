import { NextRequest, NextResponse } from 'next/server';
import { parseCSVData } from '@/lib/csv-parser';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';

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

/**
 * POST /api/deals
 * Upload and save a new CSV file to replace the current deals data
 *
 * Accepts: multipart/form-data with 'file' field containing CSV
 *
 * Response format:
 * {
 *   success: boolean,
 *   stats?: { advisors: number, deals: number },
 *   error?: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    // Validate file exists
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.name.endsWith('.csv')) {
      return NextResponse.json(
        { success: false, error: 'File must be a CSV' },
        { status: 400 }
      );
    }

    // Validate file size (10MB max)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, error: 'File size must be less than 10MB' },
        { status: 400 }
      );
    }

    // Read file content
    const csvContent = await file.text();

    // Validate CSV content is not empty
    if (!csvContent || !csvContent.trim()) {
      return NextResponse.json(
        { success: false, error: 'CSV file is empty' },
        { status: 400 }
      );
    }

    // Save to data/deals.csv
    const csvPath = join(process.cwd(), 'data', 'deals.csv');

    // Ensure data directory exists
    const dataDir = dirname(csvPath);
    if (!existsSync(dataDir)) {
      mkdirSync(dataDir, { recursive: true });
      console.log('[CSV Upload] Created data directory:', dataDir);
    }

    writeFileSync(csvPath, csvContent, 'utf-8');

    console.log('[CSV Upload] Successfully saved file to:', csvPath);

    // Parse the new data to validate and get stats
    const { NM, RW } = await parseCSVData();

    return NextResponse.json({
      success: true,
      stats: {
        advisors: NM.length,
        deals: RW.length,
      },
      message: 'CSV uploaded successfully'
    });

  } catch (error) {
    console.error('[CSV Upload] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to upload CSV',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Revalidate every 5 minutes (300 seconds)
// This caches the parsed data and reduces CSV parsing overhead
export const revalidate = 300;
