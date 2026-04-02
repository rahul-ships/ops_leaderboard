# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an operations/sales leaderboard dashboard for tracking real estate deal progression and team performance. The application visualizes advisor metrics, conversion rates, deal funnel stages, and booking trends.

## Commands

**Development:**
```bash
pnpm dev              # Start development server (localhost:3000)
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Run ESLint
```

**Data Updates:**
```bash
# Simply place your CSV file at data/deals.csv and refresh the browser
# No scripts to run, no rebuilding required!
```

**Note:** The application now uses API-based CSV loading. The old Python script (`scripts/convert-csv-to-data.py`) and generated file (`app/leaderboard-data.js`) are kept for reference but are no longer used in the data flow.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Package Manager:** pnpm
- **Styling:** Tailwind CSS v4
- **UI Components:** shadcn/ui (Radix UI primitives)
- **Charts:** recharts
- **Forms:** react-hook-form + zod
- **Icons:** lucide-react
- **Analytics:** Vercel Analytics
- **CSV Parsing:** csv-parse (server-side data processing)

## Architecture

### Data Flow

**Current Architecture (Server-side with Upload):**

1. **CSV File** (`data/deals.csv`) → Server-side parsing → **API Response** (`/api/deals`)
2. **Server-side render** (`app/page.tsx`) reads data directly → **Client** receives initial data
3. **CSV Upload** → POST to `/api/deals` → Saves to server → Page reload → New data displayed

**API Endpoints:**

**GET `/api/deals`**
- Reads CSV from `data/deals.csv`
- Parses using `lib/csv-parser.ts`
- Returns JSON with two arrays:
  - `NM`: Array of advisor names (sorted alphabetically)
  - `RW`: Array of deal records with format: `[clientName, statusCode, goIndex, rpIndex, tpIndex, createdDays, discoveryDays, shortlistDays, siteVisitDays, closureDays, bookingMonth, deepDiveDays, amount]`
- Cached for 5 minutes (300 seconds) for performance

**POST `/api/deals`**
- Accepts `multipart/form-data` with CSV file
- Validates file type (.csv), size (max 10MB), and content
- Saves to `data/deals.csv` on server (creates data directory if needed)
- Parses and returns stats (advisors count, deals count)
- **All users see updated data** after page refresh

**Dashboard Processing:**
- Main dashboard (`app/page.tsx`) uses server-side rendering to fetch data
- Initial data loaded from `parseCSVData()` on server
- Client receives pre-parsed data via `initialData` prop
- Processes data to compute:
  - Advisor metrics (deals assigned, conversion rates, avg TAT)
  - Deal funnel stages (Discovery → Shortlist → Site Visit → Deep Dive → Booking)
  - Time-series trends and booking cohorts
  - Advisor-market partner combinations

**CSV Upload Flow:**
1. User clicks "Upload CSV" in sidebar
2. Selects CSV file from device
3. Client sends file via POST to `/api/deals`
4. Server validates, saves to `data/deals.csv`
5. Server parses and returns success with stats
6. Client reloads page
7. **All devices now see the new data** (server-side persistence)

**Legacy Files (No Longer Used):**
- `scripts/convert-csv-to-data.py` - Old Python conversion script (kept for reference)
- `app/leaderboard-data.js` - Old hardcoded data file (kept as backup)

### Key Files

**Active Files:**
- **`app/page.tsx`**: Main dashboard component - contains all visualization logic, filtering, metric calculations, and data fetching
- **`lib/csv-parser.ts`**: Server-side CSV parser - reads `data/deals.csv`, extracts advisors, transforms records to NM/RW format
- **`app/api/deals/route.ts`**: API endpoint - serves parsed CSV data as JSON with 5-minute cache
- **`data/deals.csv`**: CSV data source (gitignored) - user places their CSV here to update data
- **`DATA_UPDATE_GUIDE.md`**: Complete guide for updating leaderboard data

**Legacy/Reference Files:**
- **`app/leaderboard-data.js`**: Old hardcoded data file (no longer imported, kept as backup)
- **`leaderboard-latest.tsx`**: Alternative/backup version of the leaderboard component (not actively used)
- **`scripts/convert-csv-to-data.py`**: Old Python script (kept for reference, data structure documentation)

### Status Codes

The app uses single-letter status codes mapped from deal stages:
- `L` = "Live" (active deals)
- `D` = "Dropped"
- `H` = "On Hold"
- `B` = "Booking Done"
- `I` = "Invoice Raised"
- `C` = "Collection Done"
- `R` = "Loyalty Reward"
- `E` = "EOI Submitted"

### Component Structure

- **`components/ui/`**: 50+ shadcn/ui components (button, card, dialog, table, chart, etc.)
- **`components/theme-provider.tsx`**: Dark/light theme support via next-themes
- **`hooks/`**: Custom hooks (use-mobile, use-toast)
- **`lib/utils.ts`**: Utility functions (cn for className merging)

### Path Aliases

TypeScript paths configured in `tsconfig.json`:
- `@/*` maps to project root
- Access components via `@/components/ui/button`

## Development Notes

### Data Updates

**Current Workflow (Upload to Server):**

To update the leaderboard data:

**Option 1: Upload via UI (Recommended for users)**
1. Click "Upload CSV" button in the sidebar
2. Select your CSV file
3. Server validates, saves, and confirms with stats
4. Page auto-reloads with new data
5. **All users across all devices see the updated data immediately**

**Option 2: Manual file replacement (For developers/deployment)**
1. Place your CSV file at `data/deals.csv` on the server
2. Restart dev server OR wait up to 5 minutes for cache to clear
3. Done!

**CSV Requirements:**
- Must be in the expected format with all required columns (see DATA_UPDATE_GUIDE.md)
- Required columns: Deal Name, GHB - Stage, GHB Deal Owner, Research Partner, Txn. Partner, date fields, GHB Amount Paid
- Date format: `DD/MM/YYYY HH:MM AM/PM`
- Amount format: `₹ 2,499.00` (or plain numbers)
- Max file size: 10MB
- File extension: `.csv`

**How It Works:**
1. **Upload:** POST endpoint (`/api/deals`) receives CSV file via FormData
2. **Validation:** Checks file type, size, and content
3. **Save:** Writes to `data/deals.csv` on server (creates directory if needed)
4. **Parse:** CSV parser (`lib/csv-parser.ts`) processes the file:
   - Extracts unique advisor names into the `NM` array
   - Converts deal records into compact format with date offsets from base date (April 1, 2025)
   - Maps stage names to single-letter status codes
5. **Response:** Returns success with advisor/deal counts
6. **Reload:** Client refreshes to load new server-side data
7. **Persistence:** All users now see the new data (server-side file updated)

**Important Notes:**
- ✅ **Data persists on the server** - all users see the same data
- ✅ **Multi-device sync** - upload from one device, see on all devices
- The CSV file is tracked in git (not ignored) for deployment
- Server-side cache revalidates every 5 minutes
- For immediate updates during development, restart the dev server
- See `DATA_UPDATE_GUIDE.md` for complete documentation

**Legacy Workflow (No Longer Used):**
The old Python script workflow (`scripts/convert-csv-to-data.py` → `app/leaderboard-data.js`) is deprecated but kept for reference.

### Theme System

The app supports dark/light modes with color constants defined inline in `app/page.tsx`:
- `DARK` and `LIGHT` objects contain the color palette
- Current theme colors assigned to `C` variable
- Chart colors in `CC` array

### TypeScript Configuration

Note: `next.config.mjs` has `ignoreBuildErrors: true` to allow deployment despite type errors. When fixing issues, consider removing this and addressing type errors properly.

### Performance Considerations

- The main dashboard component is client-side (`"use client"`) and processes large datasets in-browser
- Metrics are computed on-the-fly using array filters and reduce operations
- Consider memoization (useMemo) if performance degrades with larger datasets

## UI Component Library

This project uses shadcn/ui with the "new-york" style variant. To add new components:
```bash
npx shadcn@latest add [component-name]
```

Components are automatically added to `components/ui/` with proper imports configured.
