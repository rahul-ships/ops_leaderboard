import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const BOOKINGS_KEY = 'manual_bookings';

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

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

    // 3. Get current bookings from Redis
    let bookings: string[] = [];
    try {
      const stored = await redis.get<string[]>(BOOKINGS_KEY);
      if (stored) {
        bookings = stored;
      }
    } catch (err) {
      console.error('[Bookings API] Failed to read from Redis:', err);
      return NextResponse.json(
        { success: false, error: 'Failed to read bookings data' },
        { status: 500 }
      );
    }

    // 4. Update bookings list
    const newBookedState = action === 'mark';

    if (newBookedState) {
      // Add to bookings if not already present
      if (!bookings.includes(dealId)) {
        bookings.push(dealId);
      }
    } else {
      // Remove from bookings
      bookings = bookings.filter(id => id !== dealId);
    }

    // 5. Save back to Redis
    try {
      await redis.set(BOOKINGS_KEY, bookings);
    } catch (err) {
      console.error('[Bookings API] Failed to write to Redis:', err);
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

// GET endpoint to fetch all bookings
export async function GET() {
  try {
    const bookings = await redis.get<string[]>(BOOKINGS_KEY) || [];
    return NextResponse.json({ success: true, bookings });
  } catch (error) {
    console.error('[Bookings API] Error fetching bookings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}
