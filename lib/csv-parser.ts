import { parse } from 'csv-parse/sync';
import { readFileSync } from 'fs';
import { join } from 'path';

// Stage to status code mapping (from convert-csv-to-data.py)
const STAGE_MAP: Record<string, string> = {
  'Yet To Start': 'L',
  'LongList Call Scheduled': 'D',
  'Shortlisting Done': 'D',
  'Site Visit Scheduled': 'H',
  'Site Visit Done': 'H',
  'Deep Dive Done': 'H',
  'Booking Done': 'B',
  'Invoice Raised': 'I',
  'Closure Done': 'C',
  'Collection Done': 'C',
  'Collection Done And Closed': 'C',
  'Loyalty Reward': 'R',
  'Loyalty Reward Issued': 'R',
  'EOI Submitted': 'E',
};

// Base date: April 1, 2025
const BASE_DATE = new Date(2025, 3, 1); // Month is 0-indexed

/**
 * Parse date string in format 'DD/MM/YYYY HH:MM AM/PM'
 * Returns Date object or null if invalid
 */
function parseDate(dateStr: string): Date | null {
  if (!dateStr || !dateStr.trim()) {
    return null;
  }

  try {
    // Take only the date part (before any space)
    const datePart = dateStr.trim().split(' ')[0];
    const [day, month, year] = datePart.split('/');

    // JavaScript Date constructor uses 0-indexed months
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

    // Validate the date is valid
    if (isNaN(date.getTime())) {
      return null;
    }

    return date;
  } catch {
    return null;
  }
}

/**
 * Calculate days since base date
 * Returns 0 if date is null or before base date
 */
function daysSince(date: Date | null): number {
  if (!date) {
    return 0;
  }

  const delta = Math.floor((date.getTime() - BASE_DATE.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, delta);
}

/**
 * Parse amount string like '₹ 2,499.00' to integer
 * Returns 2499 as default if parsing fails
 */
function parseAmount(amountStr: string): number {
  const DEFAULT_AMOUNT = 2499;

  if (!amountStr || !amountStr.trim()) {
    return DEFAULT_AMOUNT;
  }

  try {
    const clean = amountStr
      .replace('₹', '')
      .replace(/,/g, '')
      .replace('.00', '')
      .trim();

    if (!clean || clean === '0') {
      return DEFAULT_AMOUNT;
    }

    return parseInt(clean);
  } catch {
    return DEFAULT_AMOUNT;
  }
}

/**
 * Main function to parse CSV data from data/deals.csv
 * Returns object with NM (advisor names) and RW (deal records) arrays
 */
export async function parseCSVData(): Promise<{ NM: string[]; RW: any[][] }> {
  try {
    // Read CSV file
    const csvPath = join(process.cwd(), 'data', 'deals.csv');
    const fileContent = readFileSync(csvPath, 'utf-8');

    // CSV file has no metadata lines - header is on line 1
    const csvContent = fileContent;

    // Parse CSV with headers
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    console.log(`[CSV Parser] Read ${records.length} records from CSV`);

    // Extract unique advisors from all three columns
    const advisorsSet = new Set<string>();
    for (const row of records) {
      const fields = ['GHB Deal Owner', 'Research Partner', 'Txn. Partner'];
      for (const field of fields) {
        const name = (row[field] || '').trim();
        if (name) {
          advisorsSet.add(name);
        }
      }
    }

    // Create sorted NM array
    const NM = Array.from(advisorsSet).sort();
    console.log(`[CSV Parser] Found ${NM.length} unique advisors`);

    // Convert CSV to RW format
    const RW: any[][] = [];

    for (let idx = 0; idx < records.length; idx++) {
      const row = records[idx];

      try {
        const dealName = (row['Deal Name'] || '').trim();
        if (!dealName) {
          continue;
        }

        // Get status code from stage
        const stage = (row['GHB - Stage'] || 'Yet To Start').trim();
        const status = STAGE_MAP[stage] || 'L';

        // Get advisor indices
        const goName = (row['GHB Deal Owner'] || '').trim();
        const rpName = (row['Research Partner'] || '').trim();
        const tpName = (row['Txn. Partner'] || '').trim();

        const goIdx = goName && NM.includes(goName) ? NM.indexOf(goName) : -1;
        const rpIdx = rpName && NM.includes(rpName) ? NM.indexOf(rpName) : -1;
        const tpIdx = tpName && NM.includes(tpName) ? NM.indexOf(tpName) : -1;

        // Parse dates
        const createdDate = parseDate(row['Created On'] || '');
        const discoveryDate = parseDate(row['Discovery Call Done'] || '');
        const shortlistDate = parseDate(row['Shortlisting Done'] || '');
        const siteVisitDate = parseDate(row['Site Visit Done'] || '');
        const deepDiveDate = parseDate(row['Deep Dive Done'] || '');
        const closureDate = parseDate(row['Closure Done'] || '');
        const collectionDate = parseDate(row['Collection Done'] || '');

        // Calculate days from base date
        const cd = daysSince(createdDate);
        const dd = daysSince(discoveryDate);
        const sd = daysSince(shortlistDate);
        const svd = daysSince(siteVisitDate);
        const bd = daysSince(closureDate);
        const dvd = daysSince(deepDiveDate);

        // Parse amount
        const amount = parseAmount(row['GHB Amount Paid'] || '₹ 2,499.00');

        // Booking month (from closure or collection date)
        let bookingMonth = '';
        const bookDate = closureDate || collectionDate;
        if (bookDate) {
          const year = bookDate.getFullYear();
          const month = String(bookDate.getMonth() + 1).padStart(2, '0');
          bookingMonth = `${year}-${month}`;
        }

        // Add to RW array (13 elements)
        RW.push([
          dealName,      // [0]
          status,        // [1]
          goIdx,         // [2] GHB Deal Owner index
          rpIdx,         // [3] Research Partner index
          tpIdx,         // [4] Txn. Partner index
          cd,            // [5] Created days
          dd,            // [6] Discovery days
          sd,            // [7] Shortlist days
          svd,           // [8] Site visit days
          bd,            // [9] Closure/Booking days
          bookingMonth,  // [10] Booking month (YYYY-MM)
          dvd,           // [11] Deep dive days
          amount,        // [12] Amount
        ]);
      } catch (err) {
        console.error(`[CSV Parser] Error processing row ${idx}:`, err);
      }
    }

    console.log(`[CSV Parser] Converted ${RW.length} deals`);

    return { NM, RW };
  } catch (error) {
    console.error('[CSV Parser] Error reading or parsing CSV:', error);
    throw new Error(`Failed to parse CSV: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
