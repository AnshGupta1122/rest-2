import { prisma } from '@/lib/prisma';
import { getAdminFromRequest } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status, isPaid } = body;

    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;
    if (isPaid !== undefined) updateData.isPaid = isPaid;

    const order = await prisma.order.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      ...order,
      items: JSON.parse(order.items),
    });
  } catch (error) {
    console.error('Order update error:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
