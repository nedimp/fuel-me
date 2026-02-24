import { useEffect, useState } from "react";
import type { Order, ApiResponse, UrgencyLevel } from "shared";

const API_URL = "http://localhost:4000";

interface OrdersDashboardProps {
  token: string;
}

export function OrdersDashboard({ token }: OrdersDashboardProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    fetchOrders();
    // Refresh every 10 seconds
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, [token]);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API_URL}/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result: ApiResponse<Order[]> = await response.json();

      if (result.success && result.data) {
        setOrders(result.data);
        setError("");
      } else {
        setError(result.error || "Failed to fetch orders");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyStyles = (level: UrgencyLevel) => {
    switch (level) {
      case "Critical":
        return {
          badge: "bg-red-100 text-red-800 border-red-300",
          card: "border-l-4 border-red-500 bg-red-50",
          dot: "bg-red-500",
          icon: "🚨",
        };
      case "High":
        return {
          badge: "bg-orange-100 text-orange-800 border-orange-300",
          card: "border-l-4 border-orange-500 bg-orange-50",
          dot: "bg-orange-500",
          icon: "⚠️",
        };
      default:
        return {
          badge: "bg-gray-100 text-gray-800 border-gray-300",
          card: "border-l-4 border-gray-300 bg-white",
          dot: "bg-gray-500",
          icon: "📋",
        };
    }
  };

  const getOrderPriority = (level: UrgencyLevel): number => {
    switch (level) {
      case "Critical":
        return 3;
      case "High":
        return 2;
      default:
        return 1;
    }
  };

  // Sort orders by urgency (Critical > High > Standard), then by date
  const sortedOrders = [...orders].sort((a, b) => {
    const priorityDiff = getOrderPriority(b.urgencyLevel) - getOrderPriority(a.urgencyLevel);
    if (priorityDiff !== 0) return priorityDiff;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center text-gray-600">Loading orders...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center text-red-600">{error}</div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center text-gray-600">
          No orders yet. Waiting for site managers to submit fuel requests.
        </div>
      </div>
    );
  }

  // Summary stats
  const criticalCount = orders.filter((o) => o.urgencyLevel === "Critical").length;
  const highCount = orders.filter((o) => o.urgencyLevel === "High").length;
  const standardCount = orders.filter((o) => o.urgencyLevel === "Standard").length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-sm font-medium text-gray-600 mb-1">Total Orders</h3>
          <p className="text-3xl font-bold text-purple-600">{orders.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-red-500">
          <h3 className="text-sm font-medium text-gray-600 mb-1">🚨 Critical</h3>
          <p className="text-3xl font-bold text-red-600">{criticalCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-orange-500">
          <h3 className="text-sm font-medium text-gray-600 mb-1">⚠️ High Priority</h3>
          <p className="text-3xl font-bold text-orange-600">{highCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-gray-300">
          <h3 className="text-sm font-medium text-gray-600 mb-1">📋 Standard</h3>
          <p className="text-3xl font-bold text-gray-600">{standardCount}</p>
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Active Orders</h2>
          <button
            onClick={fetchOrders}
            className="px-3 py-1 text-sm text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded transition-colors"
          >
            🔄 Refresh
          </button>
        </div>

        <div className="space-y-3">
          {sortedOrders.map((order) => {
            const styles = getUrgencyStyles(order.urgencyLevel);
            return (
              <div
                key={order.id}
                className={`${styles.card} rounded-lg p-4 transition-all hover:shadow-md`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">{styles.icon}</span>
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded border ${styles.badge}`}
                      >
                        {order.urgencyLevel}
                      </span>
                      <span className="text-xs text-gray-500">
                        #{order.id.slice(0, 8)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <span className="text-gray-500">Customer:</span>
                        <p className="font-medium text-gray-900">
                          {order.user?.name || "Unknown"}
                        </p>
                        <p className="text-xs text-gray-600">
                          {order.user?.email}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Fuel Type:</span>
                        <p className="font-medium text-gray-900">
                          {order.fuelType}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Gallons:</span>
                        <p className="font-medium text-gray-900">
                          {order.gallons.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Total Price:</span>
                        <p className="font-bold text-lg text-purple-600">
                          ${order.totalPrice.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-2 text-xs text-gray-500">
                      Submitted: {new Date(order.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
