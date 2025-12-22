
import { Controller, Post, Body, Get, UseGuards, Request, Patch, Param } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Controller('subscription')
export class SubscriptionController {
  constructor(private prisma: PrismaService) {}

  @Post('submit')
  async submitPayment(@Body() body: any) {
    return this.prisma.subscriptionPayment.create({
      data: {
        userId: body.userId,
        txId: body.txId,
        receiptUrl: body.receiptUrl,
        amount: '1 USDT',
        status: 'pending'
      }
    });
  }

  @Get('pending')
  async getPending() {
    return this.prisma.subscriptionPayment.findMany({
      where: { status: 'pending' },
      include: { user: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  @Patch(':id/approve')
  async approve(@Param('id') id: string) {
    const payment = await this.prisma.subscriptionPayment.update({
      where: { id },
      data: { status: 'approved' }
    });
    // Upgrade User
    await this.prisma.user.update({
      where: { id: payment.userId },
      data: { role: 'premium' }
    });
    return payment;
  }
  
  @Patch(':id/reject')
  async reject(@Param('id') id: string) {
    return this.prisma.subscriptionPayment.update({
      where: { id },
      data: { status: 'rejected' }
    });
  }
}
