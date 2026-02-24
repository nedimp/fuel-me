import { Body, Controller, Get, Post, UseGuards, Request, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto, ApiResponse, Order } from 'shared';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

interface RequestWithUser extends Request {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createOrder(
    @Request() req: RequestWithUser,
    @Body() createOrderDto: CreateOrderDto,
  ): Promise<ApiResponse<Order>> {
    try {
      // Only users with role 'user' can create orders
      if (req.user.role !== 'user') {
        throw new UnauthorizedException('Only users can create orders');
      }

      // Validate gallons
      if (createOrderDto.gallons <= 0) {
        throw new BadRequestException('Gallons must be greater than 0');
      }

      const order = await this.ordersService.createOrder(req.user.id, createOrderDto);

      return {
        success: true,
        data: order,
        message: 'Order created successfully',
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to create order';
      return {
        success: false,
        error: message,
      };
    }
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getAllOrders(@Request() req: RequestWithUser): Promise<ApiResponse<Order[]>> {
    try {
      // Only admins can view all orders
      if (req.user.role !== 'admin') {
        throw new UnauthorizedException('Only admins can view all orders');
      }

      const orders = await this.ordersService.getAllOrders();

      return {
        success: true,
        data: orders,
        message: 'Orders retrieved successfully',
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to retrieve orders';
      return {
        success: false,
        error: message,
      };
    }
  }
}
