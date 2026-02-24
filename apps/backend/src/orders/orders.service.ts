import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { CreateOrderDto, Order, FuelType, UrgencyLevel } from "shared";
import { PricingService } from "../pricing/pricing.service";

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pricingService: PricingService,
  ) {}

  async createOrder(
    userId: string,
    createOrderDto: CreateOrderDto,
  ): Promise<Order> {
    const { fuelType, gallons, urgencyLevel } = createOrderDto;

    // Calculate total price
    const totalPrice = this.pricingService.calculateTotalPrice(
      gallons,
      urgencyLevel,
    );

    // Create order in database
    const order = await this.prisma.order.create({
      data: {
        userId,
        fuelType,
        gallons,
        urgencyLevel,
        totalPrice,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return {
      id: order.id,
      userId: order.userId,
      fuelType: order.fuelType as FuelType,
      gallons: order.gallons,
      urgencyLevel: order.urgencyLevel as UrgencyLevel,
      totalPrice: order.totalPrice,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      user: order.user,
    };
  }

  async getAllOrders(): Promise<Order[]> {
    const orders = await this.prisma.order.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: [
        // Critical first, then High, then Standard
        { urgencyLevel: "desc" },
        { createdAt: "desc" },
      ],
    });

    return orders.map((order) => ({
      id: order.id,
      userId: order.userId,
      fuelType: order.fuelType as FuelType,
      gallons: order.gallons,
      urgencyLevel: order.urgencyLevel as UrgencyLevel,
      totalPrice: order.totalPrice,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      user: order.user,
    }));
  }
}
