import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email, name, phone } = body;

    const username = (email ? email.split('@')[0] : name) || 'Member';
    return NextResponse.json({
      success: true,
      access_token: 'mv_session_token_' + Date.now(),
      user: {
        id: 'user-' + Date.now(),
        markatId: 'MV-' + Math.floor(100000 + Math.random() * 900000),
        name: name || username,
        email: email,
        role: 'buyer',
        phone: phone || '9876543210'
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || 'Verification failed' },
      { status: 500 }
    );
  }
}
