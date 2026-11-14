import { NextRequest, NextResponse } from 'next/server';
import { getExpectedPin, createSessionToken, COOKIE_NAME } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { pin } = await req.json();
    const expectedPin = getExpectedPin();

    if (!pin || pin.trim() !== expectedPin.trim()) {
      return NextResponse.json(
        { error: 'Incorrect PIN. Please try again.' },
        { status: 401 }
      );
    }

    const token = createSessionToken();
    const response = NextResponse.json({
      success: true,
      message: 'Authentication successful',
    });

    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Authentication error' },
      { status: 500 }
    );
  }
}
