import { Injectable } from "@nestjs/common";
import { UrgencyLevel } from "shared";

@Injectable()
export class PricingService {
  private readonly BASE_PRICE = 3.5; // $3.50 per gallon

  private readonly URGENCY_MULTIPLIERS: Record<UrgencyLevel, number> = {
    Standard: 1.0,
    High: 1.1,
    Critical: 1.5,
  };

  calculateTotalPrice(gallons: number, urgencyLevel: UrgencyLevel): number {
    const multiplier = this.URGENCY_MULTIPLIERS[urgencyLevel];
    const totalPrice = this.BASE_PRICE * gallons * multiplier;
    return Math.round(totalPrice * 100) / 100; // Round to 2 decimal places
  }
}
