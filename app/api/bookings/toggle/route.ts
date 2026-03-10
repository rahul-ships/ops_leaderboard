import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

interface Deal {
  id: string;
  name: string;
  stage: string;
  ghb_owner: string;
  market_advisor: string;
  priority: string;
  is_converted: boolean;
  is_live?: boolean;
  is_manually_booked?: boolean;
}

interface DashboardData {
  deals: Deal[];
  expected_bookings: {
    ghb_owner: Record<string, number>;
    market_advisor: Record<string, number>;
    total: number;
  };
}

export async function POST(request: NextRequest) {
  try {
    // 1. Parse request body
    const { dealId, action } = await request.json();

    // 2. Validate input
    if (!dealId || !['mark', 'unmark'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Invalid request. Expected dealId and action (mark/unmark)' },
        { status: 400 }
      );
    }

    // 3. Read JSON file with retry logic
    const filePath = join(process.cwd(), 'data', 'deals-dashboard.json');
    let data: DashboardData;
    let retries = 3;

    while (retries > 0) {
      try {
        const raw = readFileSync(filePath, 'utf-8');
        data = JSON.parse(raw);
        break;
      } catch (err) {
        retries--;
        if (retries === 0) {
          console.error('[Bookings API] Failed to read file after retries:', err);
          return NextResponse.json(
            { success: false, error: 'Failed to read data file' },
            { status: 500 }
          );
        }
        // Exponential backoff: 100ms, 200ms, 300ms
        await new Promise(r => setTimeout(r, 100 * (4 - retries)));
      }
    }

    // 4. Find and update deal
    const deal = data.deals.find(d => d.id === dealId);
    if (!deal) {
      return NextResponse.json(
        { success: false, error: 'Deal not found' },
        { status: 404 }
      );
    }

    const newBookedState = action === 'mark';
    deal.is_manually_booked = newBookedState;

    // 5. Write back to file atomically
    try {
      writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[Bookings API] Failed to write file:', err);
      return NextResponse.json(
        { success: false, error: 'Failed to save booking' },
        { status: 500 }
      );
    }

    // 6. Return success
    return NextResponse.json({
      success: true,
      dealId,
      isBooked: newBookedState,
      message: `Deal ${action === 'mark' ? 'marked as booked' : 'unmarked'}`
    });

  } catch (error) {
    console.error('[Bookings API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
