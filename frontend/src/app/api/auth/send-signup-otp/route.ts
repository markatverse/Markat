import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { identifier, email } = body;
    const target = identifier || email;

    return NextResponse.json({
      success: true,
      message: `OTP sent successfully to ${target}`,
      otpPreview: '123456'
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || 'Failed to send OTP' },
      { status: 500 }
    );
  }
}
