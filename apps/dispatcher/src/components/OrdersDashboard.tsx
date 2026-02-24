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
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filter states
  const [sortBy, setSortBy] = useState<
    "urgency" | "price" | "gallons" | "date"
  >("urgency");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [fuelTypeFilter, setFuelTypeFilter] = useState<
    "All" | "Diesel" | "Unleaded"
  >("All");

  useEffect(() => {
    fetchOrders();
    // Auto-refresh every 5 seconds
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, [token]);

  const fetchOrders = async () => {
    try {
      setIsRefreshing(true);
      const response = await fetch(`${API_URL}/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result: ApiResponse<Order[]> = await response.json();

      if (result.success && result.data) {
        setOrders(result.data);
        setLastUpdate(new Date());
        setError("");
      } else {
        setError(result.error || "Failed to fetch orders");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
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

  // Filter orders by fuel type
  const filteredOrders = orders.filter((order) => {
    if (fuelTypeFilter === "All") return true;
    return order.fuelType === fuelTypeFilter;
  });

  // Sort orders based on selected criteria
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case "urgency":
        comparison =
          getOrderPriority(b.urgencyLevel) - getOrderPriority(a.urgencyLevel);
        if (comparison === 0) {
          comparison =
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        break;
      case "price":
        comparison = a.totalPrice - b.totalPrice;
        break;
      case "gallons":
        comparison = a.gallons - b.gallons;
        break;
      case "date":
        comparison =
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
    }

    return sortDirection === "asc" ? comparison : -comparison;
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
  const criticalCount = filteredOrders.filter(
    (o) => o.urgencyLevel === "Critical",
  ).length;
  const highCount = filteredOrders.filter(
    (o) => o.urgencyLevel === "High",
  ).length;
  const standardCount = filteredOrders.filter(
    (o) => o.urgencyLevel === "Standard",
  ).length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-sm font-medium text-gray-600 mb-1">
            Total Orders
          </h3>
          <p className="text-3xl font-bold text-purple-600">
            {filteredOrders.length}
          </p>
          {fuelTypeFilter !== "All" && (
            <p className="text-xs text-gray-500 mt-1">
              ({orders.length} total)
            </p>
          )}
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-red-500">
          <h3 className="text-sm font-medium text-gray-600 mb-1">
            🚨 Critical
          </h3>
          <p className="text-3xl font-bold text-red-600">{criticalCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-orange-500">
          <h3 className="text-sm font-medium text-gray-600 mb-1">
            ⚠️ High Priority
          </h3>
          <p className="text-3xl font-bold text-orange-600">{highCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-gray-300">
          <h3 className="text-sm font-medium text-gray-600 mb-1">
            📋 Standard
          </h3>
          <p className="text-3xl font-bold text-gray-600">{standardCount}</p>
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Active Orders
            </h2>
            <div className="flex items-center gap-3 mt-1">
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <div
                  className={`w-2 h-2 rounded-full ${isRefreshing ? "bg-green-500 animate-pulse" : "bg-gray-400"}`}
                ></div>
                <span>Auto-refresh: 5s</span>
              </div>
              <span className="text-xs text-gray-400">•</span>
              <span className="text-xs text-gray-500">
                Last updated: {lastUpdate.toLocaleTimeString()}
              </span>
            </div>
          </div>
          <button
            onClick={fetchOrders}
            disabled={isRefreshing}
            className="px-3 py-1 text-sm text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRefreshing ? "🔄 Updating..." : "🔄 Refresh Now"}
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-4 pb-4 border-b border-gray-200">
          {/* Sort By */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">
              Sort by:
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
            >
              <option value="urgency">Urgency</option>
              <option value="price">Price</option>
              <option value="gallons">Gallons</option>
              <option value="date">Date Created</option>
            </select>
          </div>

          {/* Sort Direction */}
          <button
            onClick={() =>
              setSortDirection(sortDirection === "asc" ? "desc" : "asc")
            }
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1"
            title={`Sort ${sortDirection === "asc" ? "ascending" : "descending"}`}
          >
            {sortDirection === "asc" ? "↑ Ascending" : "↓ Descending"}
          </button>

          {/* Fuel Type Filter */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">
              Fuel Type:
            </label>
            <select
              value={fuelTypeFilter}
              onChange={(e) =>
                setFuelTypeFilter(e.target.value as typeof fuelTypeFilter)
              }
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
            >
              <option value="All">All Types</option>
              <option value="Diesel">Diesel</option>
              <option value="Unleaded">Unleaded</option>
            </select>
          </div>

          {/* Results Count */}
          <div className="ml-auto flex items-center text-sm text-gray-600">
            Showing{" "}
            <span className="font-semibold mx-1">{sortedOrders.length}</span> of{" "}
            <span className="font-semibold ml-1">{orders.length}</span> orders
          </div>
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
