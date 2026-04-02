import { NextRequest, NextResponse } from 'next/server';
import { parseCSVData, parseCSVFromContent } from '@/lib/csv-parser';
import { Redis } from '@upstash/redis';

const CSV_DATA_KEY = 'deals_csv_content';

// Initialize Redis client
const redis = new Redis({
  url: process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN!,
});

/**
 * GET /api/deals
 * Returns parsed deal data from Redis (production) or CSV file (local dev)
 *
 * Response format:
 * {
 *   NM: string[],  // Array of advisor names (sorted)
 *   RW: any[][]    // Array of deal records (13 elements each)
 * }
 */
export async function GET() {
  try {
    // Try to get CSV content from Redis first (for production/uploaded data)
    let csvContent: string | null = null;
    try {
      csvContent = await redis.get<string>(CSV_DATA_KEY);
    } catch (redisError) {
      console.log('[CSV Parser] Redis not available, falling back to file:', redisError);
    }

    let NM: string[];
    let RW: any[][];

    if (csvContent) {
      // Parse from Redis
      console.log('[CSV Parser] Parsing from Redis');
      const parsed = await parseCSVFromContent(csvContent);
      NM = parsed.NM;
      RW = parsed.RW;
    } else {
      // Fall back to file system (for local development)
      console.log('[CSV Parser] Parsing from file system');
      const parsed = await parseCSVData();
      NM = parsed.NM;
      RW = parsed.RW;
    }

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

    // Save to Redis (works in serverless environments)
    try {
      await redis.set(CSV_DATA_KEY, csvContent);
      console.log('[CSV Upload] Successfully saved CSV to Redis');
    } catch (redisError) {
      console.error('[CSV Upload] Failed to save to Redis:', redisError);
      return NextResponse.json(
        { success: false, error: 'Failed to save CSV to storage' },
        { status: 500 }
      );
    }

    // Parse the new data to validate and get stats
    const { NM, RW } = await parseCSVFromContent(csvContent);

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
