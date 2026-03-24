import { prisma } from '@/lib/prisma';
import { signCustomerToken } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json({ error: 'Email and OTP code required' }, { status: 400 });
    }

    const otpRecord = await prisma.otpCode.findUnique({ where: { email } });

    if (!otpRecord) {
      return NextResponse.json({ error: 'No OTP requested for this email' }, { status: 400 });
    }

    if (otpRecord.expiresAt < new Date()) {
      return NextResponse.json({ error: 'OTP has expired' }, { status: 400 });
    }

    if (otpRecord.code !== code) {
      return NextResponse.json({ error: 'Invalid OTP code' }, { status: 400 });
    }

    // OTP Verified Successfully!
    
    // Delete the used OTP
    await prisma.otpCode.delete({ where: { email } });

    // Find or create customer
    await prisma.customer.upsert({
      where: { email },
      update: {}, // Just touch it or leave as is
      create: { email }
    });

    // Sign JWT
    const token = await signCustomerToken({ email });

    return NextResponse.json({ success: true, token, email });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json({ error: 'Failed to verify OTP' }, { status: 500 });
  }
}
