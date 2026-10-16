import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Default admin credential match
    if (email.toLowerCase().includes('admin')) {
      return NextResponse.json({
        access_token: 'mock_admin_token_' + Date.now(),
        user: {
          id: 'admin-001',
          name: 'Platform Administrator',
          email: email,
          role: 'ADMIN',
          phone: '9876543210'
        }
      });
    }

    // Default authenticated customer/seller user session
    const username = email.split('@')[0] || 'Member';
    return NextResponse.json({
      access_token: 'mv_session_token_' + Date.now(),
      user: {
        id: 'user-' + Date.now(),
        markatId: 'MV-' + Math.floor(100000 + Math.random() * 900000),
        name: username.charAt(0).toUpperCase() + username.slice(1),
        email: email,
        role: 'buyer',
        phone: '9876543210',
        business: {
          name: username + ' Store',
          businessCode: 'MV-SPR-000013',
          sector: 'Retail Product'
        }
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || 'Authentication error' },
      { status: 500 }
    );
  }
}
