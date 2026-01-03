import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// ═══════════════════════════════════════════════════════════════════════════
// WAITLIST API ROUTE
// Collects and stores email addresses for the waiting list (Supabase)
// ═══════════════════════════════════════════════════════════════════════════

// Validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// POST - Add email to waitlist
export async function POST(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { email, source = 'website' } = body;

    // Validate email
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();

    if (!isValidEmail(trimmedEmail)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Check for duplicate
    const { data: existing } = await supabase
      .from('waitlist')
      .select('email')
      .eq('email', trimmedEmail)
      .single();

    if (existing) {
      return NextResponse.json(
        { message: "You're already on the list!", alreadyExists: true },
        { status: 200 }
      );
    }

    // Add new entry
    const { error } = await supabase
      .from('waitlist')
      .insert({ email: trimmedEmail, source });

    if (error) {
      // Handle unique constraint violation (race condition)
      if (error.code === '23505') {
        return NextResponse.json(
          { message: "You're already on the list!", alreadyExists: true },
          { status: 200 }
        );
      }
      throw error;
    }

    return NextResponse.json(
      { message: "You're on the list! We'll be in touch soon.", success: true },
      { status: 201 }
    );
  } catch (error) {
    console.error('Waitlist API error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}

// GET - Get waitlist count (for admin purposes)
export async function GET() {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    const { count, error } = await supabase
      .from('waitlist')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;

    return NextResponse.json({
      count: count || 0,
      message: `${count || 0} people on the waitlist`,
    });
  } catch (error) {
    console.error('Waitlist GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch waitlist count' },
      { status: 500 }
    );
  }
}
