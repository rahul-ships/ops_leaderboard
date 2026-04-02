import { AuthGuard } from "@/components/auth-guard";
import { parseCSVData, parseCSVFromContent } from "@/lib/csv-parser";
import DashboardClient from "./page-client";
import { Redis } from '@upstash/redis';

const CSV_DATA_KEY = 'deals_csv_content';

// Dynamic page - no caching to ensure fresh data after uploads
export const dynamic = 'force-dynamic';

export default async function Page() {
  // Initialize Redis client
  const redis = new Redis({
    url: process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN!,
  });

  // Try to get CSV content from Redis first (for production/uploaded data)
  let data;
  try {
    const csvContent = await redis.get<string>(CSV_DATA_KEY);
    if (csvContent) {
      console.log('[Page] Loading data from Redis');
      data = await parseCSVFromContent(csvContent);
    } else {
      console.log('[Page] Loading data from file system (no Redis data)');
      data = await parseCSVData();
    }
  } catch (error) {
    console.log('[Page] Redis not available, falling back to file:', error);
    data = await parseCSVData();
  }

  return (
    <AuthGuard>
      <DashboardClient initialData={data} />
    </AuthGuard>
  );
}
