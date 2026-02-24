import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { PricingService } from '../pricing/pricing.service';
import { PrismaService } from '../prisma.service';
import { AuthService } from '../auth/auth.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService, PricingService, PrismaService, AuthService, JwtAuthGuard],
  exports: [OrdersService],
})
export class OrdersModule {}
