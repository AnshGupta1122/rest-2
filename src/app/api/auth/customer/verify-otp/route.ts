import { prisma } from '@/lib/prisma';
import { signCustomerToken } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { phone, code } = await request.json();

    if (!phone || !code) {
      return NextResponse.json({ error: 'Phone and OTP code required' }, { status: 400 });
    }

    const otpRecord = await prisma.otpCode.findUnique({ where: { phone } });

    if (!otpRecord) {
      return NextResponse.json({ error: 'No OTP requested for this phone number' }, { status: 400 });
    }

    if (otpRecord.expiresAt < new Date()) {
      return NextResponse.json({ error: 'OTP has expired' }, { status: 400 });
    }

    if (otpRecord.code !== code) {
      return NextResponse.json({ error: 'Invalid OTP code' }, { status: 400 });
    }

    // OTP Verified Successfully!
    
    // Delete the used OTP
    await prisma.otpCode.delete({ where: { phone } });

    // Find or create customer
    await prisma.customer.upsert({
      where: { phone },
      update: {}, // Just touch it or leave as is
      create: { phone }
    });

    // Sign JWT
    const token = await signCustomerToken({ phone });

    return NextResponse.json({ success: true, token, phone });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json({ error: 'Failed to verify OTP' }, { status: 500 });
  }
}
