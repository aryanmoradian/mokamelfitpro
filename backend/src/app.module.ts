
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from './prisma.service';
import { AuthController } from './auth/auth.controller';
import { SubscriptionController } from './subscription/subscription.controller';
import { AiModule } from './ai/ai.module';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'secret',
      signOptions: { expiresIn: '7d' },
    }),
    AiModule,
  ],
  controllers: [AuthController, SubscriptionController],
  providers: [PrismaService],
})
export class AppModule {}
