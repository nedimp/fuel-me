import { useState } from "react";
import type {
  CreateOrderDto,
  FuelType,
  UrgencyLevel,
  ApiResponse,
  Order,
} from "shared";

const API_URL = "http://localhost:4000";

interface OrderFormProps {
  token: string;
}

export function OrderForm({ token }: OrderFormProps) {
  const [fuelType, setFuelType] = useState<FuelType>("Diesel");
  const [gallons, setGallons] = useState<string>("");
  const [urgencyLevel, setUrgencyLevel] = useState<UrgencyLevel>("Standard");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [lastOrder, setLastOrder] = useState<Order | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    const gallonsNum = parseFloat(gallons);
    if (isNaN(gallonsNum) || gallonsNum <= 0) {
      setError("Please enter a valid number of gallons greater than 0");
      setIsSubmitting(false);
      return;
    }

    const orderData: CreateOrderDto = {
      fuelType,
      gallons: gallonsNum,
      urgencyLevel,
    };

    try {
      const response = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      const result: ApiResponse<Order> = await response.json();

      if (result.success && result.data) {
        setSuccess(
          `Order created successfully! Total price: $${result.data.totalPrice.toFixed(2)}`,
        );
        setLastOrder(result.data);
        setGallons("");
        setFuelType("Diesel");
        setUrgencyLevel("Standard");
      } else {
        setError(result.error || "Failed to create order");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getUrgencyColor = (level: UrgencyLevel) => {
    switch (level) {
      case "Critical":
        return "text-red-600 font-semibold";
      case "High":
        return "text-orange-600 font-semibold";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Request Fuel Delivery
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Fuel Type */}
          <div>
            <label
              htmlFor="fuelType"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Fuel Type
            </label>
            <select
              id="fuelType"
              value={fuelType}
              onChange={(e) => setFuelType(e.target.value as FuelType)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isSubmitting}
            >
              <option value="Diesel">Diesel</option>
              <option value="Unleaded">Unleaded</option>
            </select>
          </div>

          {/* Gallons */}
          <div>
            <label
              htmlFor="gallons"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Gallons
            </label>
            <input
              id="gallons"
              type="number"
              step="0.01"
              min="0.01"
              value={gallons}
              onChange={(e) => setGallons(e.target.value)}
              placeholder="Enter number of gallons"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isSubmitting}
              required
            />
          </div>

          {/* Urgency Level */}
          <div>
            <label
              htmlFor="urgencyLevel"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Urgency Level
            </label>
            <select
              id="urgencyLevel"
              value={urgencyLevel}
              onChange={(e) => setUrgencyLevel(e.target.value as UrgencyLevel)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isSubmitting}
            >
              <option value="Standard">Standard (1.0x)</option>
              <option value="High">High Priority (1.1x)</option>
              <option value="Critical">Critical (1.5x)</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Base price: $3.50/gallon. Urgency multiplier applies.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-600">{success}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? "Submitting..." : "Submit Order"}
          </button>
        </form>
      </div>

      {/* Last Order Details */}
      {lastOrder && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Order Submitted
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Order ID:</span>
              <span className="font-mono text-xs">
                {lastOrder.id.slice(0, 8)}...
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Fuel Type:</span>
              <span className="font-medium">{lastOrder.fuelType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Gallons:</span>
              <span className="font-medium">{lastOrder.gallons}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Urgency:</span>
              <span className={getUrgencyColor(lastOrder.urgencyLevel)}>
                {lastOrder.urgencyLevel}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-200">
              <span className="text-gray-700 font-medium">Total Price:</span>
              <span className="text-lg font-bold text-blue-600">
                ${lastOrder.totalPrice.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Submitted:</span>
              <span className="text-xs">
                {new Date(lastOrder.createdAt).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
