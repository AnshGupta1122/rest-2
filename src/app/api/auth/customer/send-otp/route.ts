import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email address is required' }, { status: 400 });
    }

    // Generate a 4-digit OTP
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    
    // Set expiration to 10 minutes from now
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Store in database
    await prisma.otpCode.upsert({
      where: { email },
      update: { code, expiresAt },
      create: { email, code, expiresAt }
    });

    let previewUrl = '';

    // Nodemailer Setup
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      // Use real SMTP config if provided
      const transporter = nodemailer.createTransport({
        service: 'gmail', // or your email provider
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: `"Spice Garden" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Your Login Code',
        html: `<h2>Welcome to Spice Garden!</h2><p>Your one-time login code is: <strong>${code}</strong></p><p>This code will expire in 10 minutes.</p>`,
      });
      console.log(`[EMAIL] OTP sent to ${email}`);
    } else {
      // Create a test account to snag an ethereal preview URL
      const testAccount = await nodemailer.createTestAccount();
      const transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: testAccount.user, // generated ethereal user
          pass: testAccount.pass, // generated ethereal password
        },
      });

      const info = await transporter.sendMail({
        from: '"Spice Garden Tester" <test@spicegarden.local>',
        to: email,
        subject: 'Your Login Code (Test)',
        html: `<h2>Welcome to Spice Garden!</h2><p>Your one-time login code is: <strong>${code}</strong></p>`,
      });
      
      previewUrl = nodemailer.getTestMessageUrl(info) || '';
      console.log(`[TEST EMAIL] OTP sent to ${email}. Preview: ${previewUrl}`);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'OTP sent successfully to your email',
      mockOtp: code,
      previewUrl
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
  }
}
