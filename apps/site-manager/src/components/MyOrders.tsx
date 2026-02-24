import { useEffect, useState } from "react";
import type { Order, ApiResponse, UrgencyLevel } from "shared";

const API_URL = "http://localhost:4000";

interface MyOrdersProps {
  token: string;
}

export function MyOrders({ token }: MyOrdersProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    fetchOrders();
  }, [token]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/orders/my-orders`, {
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
          text: "text-red-600 font-semibold",
        };
      case "High":
        return {
          badge: "bg-orange-100 text-orange-800 border-orange-300",
          text: "text-orange-600 font-semibold",
        };
      default:
        return {
          badge: "bg-gray-100 text-gray-800 border-gray-300",
          text: "text-gray-600",
        };
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">My Orders</h2>
        <div className="text-center text-gray-600">Loading orders...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">My Orders</h2>
        <div className="text-center text-red-600">{error}</div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">My Orders</h2>
        <div className="text-center text-gray-600">
          No orders yet. Submit your first fuel request above!
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">
          My Order History
        </h2>
        <button
          onClick={fetchOrders}
          className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
        >
          🔄 Refresh
        </button>
      </div>

      <div className="space-y-3">
        {orders.map((order) => {
          const styles = getUrgencyStyles(order.urgencyLevel);
          return (
            <div
              key={order.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded border ${styles.badge}`}
                  >
                    {order.urgencyLevel}
                  </span>
                  <span className="text-xs text-gray-500">
                    #{order.id.slice(0, 8)}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-blue-600">
                    ${order.totalPrice.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div>
                  <span className="text-gray-500">Fuel Type:</span>
                  <p className="font-medium text-gray-900">{order.fuelType}</p>
                </div>
                <div>
                  <span className="text-gray-500">Gallons:</span>
                  <p className="font-medium text-gray-900">
                    {order.gallons.toFixed(2)}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Urgency:</span>
                  <p className={styles.text}>{order.urgencyLevel}</p>
                </div>
                <div>
                  <span className="text-gray-500">Submitted:</span>
                  <p className="text-xs text-gray-600">
                    {new Date(order.createdAt).toLocaleDateString()}{" "}
                    {new Date(order.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Total Orders:</span>
          <span className="font-semibold text-gray-900">{orders.length}</span>
        </div>
        <div className="flex items-center justify-between text-sm mt-2">
          <span className="text-gray-600">Total Spent:</span>
          <span className="font-bold text-blue-600">
            $
            {orders
              .reduce((sum, order) => sum + order.totalPrice, 0)
              .toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
