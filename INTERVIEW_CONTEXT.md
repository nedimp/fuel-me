# Interview Context - Quick Feature Development Guide

## 🚀 60-Minute Feature Implementation Workflow

This document provides battle-tested patterns for rapid feature development during the Fuel.me interview.

## Project Status: ✅ READY

All systems operational:

- ✅ Backend running on port 4000
- ✅ Site Manager running on port 3000
- ✅ Dispatcher running on port 3001
- ✅ PostgreSQL container running
- ✅ ESLint configured (zero errors)
- ✅ TypeScript strict mode enabled
- ✅ Shared types package built

## 📋 Feature Implementation Template

### Step 1: Define Types (2-3 minutes)

**Location**: `packages/shared/src/index.ts`

```typescript
// Add your interfaces at the bottom of the file

// Entity interface (what comes back from API)
export interface Order {
  id: string;
  customerId: string;
  status: "pending" | "confirmed" | "delivering" | "completed" | "cancelled";
  items: OrderItem[];
  total: number;
  deliveryAddress: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

// DTOs (what you send to API)
export interface CreateOrderDto {
  customerId: string;
  items: CreateOrderItemDto[];
  deliveryAddress: string;
}

export interface CreateOrderItemDto {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface UpdateOrderDto {
  status?: "pending" | "confirmed" | "delivering" | "completed" | "cancelled";
  deliveryAddress?: string;
}
```

**Build the shared package:**

```bash
pnpm --filter shared build
```

### Step 2: Database Schema (2-3 minutes)

**Location**: `apps/backend/prisma/schema.prisma`

```prisma
model Order {
  id              String      @id @default(uuid())
  customerId      String
  status          String      @default("pending")
  total           Float
  deliveryAddress String
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  items           OrderItem[]

  @@map("orders")
}

model OrderItem {
  id          String   @id @default(uuid())
  orderId     String
  order       Order    @relation(fields: [orderId], references: [id])
  productId   String
  productName String
  quantity    Int
  price       Float

  @@map("order_items")
}
```

**Create tables manually** (due to Prisma permissions workaround):

```bash
# Create orders table
docker exec fuel-me-postgres psql -U postgres -d fuel_me_dev -c "
CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  \"customerId\" TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  total NUMERIC NOT NULL,
  \"deliveryAddress\" TEXT NOT NULL,
  \"createdAt\" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  \"updatedAt\" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);"

# Create order_items table
docker exec fuel-me-postgres psql -U postgres -d fuel_me_dev -c "
CREATE TABLE order_items (
  id TEXT PRIMARY KEY,
  \"orderId\" TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  \"productId\" TEXT NOT NULL,
  \"productName\" TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  price NUMERIC NOT NULL
);"
```

**Generate Prisma client:**

```bash
pnpm --filter backend db:generate
```

### Step 3: Backend Implementation (10-15 minutes)

#### Create Module Folder

```bash
mkdir -p apps/backend/src/orders
```

#### Module (`apps/backend/src/orders/orders.module.ts`)

```typescript
import { Module } from "@nestjs/common";
import { OrdersController } from "./orders.controller";
import { OrdersService } from "./orders.service";
import { PrismaService } from "../prisma.service";

@Module({
  controllers: [OrdersController],
  providers: [OrdersService, PrismaService],
  exports: [OrdersService],
})
export class OrdersModule {}
```

#### Controller (`apps/backend/src/orders/orders.controller.ts`)

```typescript
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { OrdersService } from "./orders.service";
import type { Order, CreateOrderDto, UpdateOrderDto } from "shared";

@Controller("orders")
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  async findAll(@Query("status") status?: string): Promise<Order[]> {
    return this.ordersService.findAll(status);
  }

  @Get(":id")
  async findOne(@Param("id") id: string): Promise<Order | null> {
    return this.ordersService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createOrderDto: CreateOrderDto): Promise<Order> {
    return this.ordersService.create(createOrderDto);
  }

  @Put(":id")
  async update(
    @Param("id") id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ): Promise<Order> {
    return this.ordersService.update(id, updateOrderDto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param("id") id: string): Promise<void> {
    await this.ordersService.remove(id);
  }
}
```

#### Service (`apps/backend/src/orders/orders.service.ts`)

```typescript
import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import type { Order, CreateOrderDto, UpdateOrderDto } from "shared";

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async findAll(status?: string): Promise<Order[]> {
    const orders = await this.prisma.order.findMany({
      where: status ? { status } : undefined,
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });
    return orders.map(this.toDto);
  }

  async findOne(id: string): Promise<Order | null> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });
    return order ? this.toDto(order) : null;
  }

  async create(dto: CreateOrderDto): Promise<Order> {
    const total = dto.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    const order = await this.prisma.order.create({
      data: {
        id: crypto.randomUUID(),
        customerId: dto.customerId,
        deliveryAddress: dto.deliveryAddress,
        total,
        status: "pending",
        items: {
          create: dto.items.map((item) => ({
            id: crypto.randomUUID(),
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: { items: true },
    });

    return this.toDto(order);
  }

  async update(id: string, dto: UpdateOrderDto): Promise<Order> {
    const order = await this.prisma.order.update({
      where: { id },
      data: {
        ...dto,
        updatedAt: new Date(),
      },
      include: { items: true },
    });

    if (!order) {
      throw new NotFoundException(`Order ${id} not found`);
    }

    return this.toDto(order);
  }

  async remove(id: string): Promise<void> {
    await this.prisma.order.delete({ where: { id } });
  }

  private toDto(order: any): Order {
    return {
      id: order.id,
      customerId: order.customerId,
      status: order.status,
      total: Number(order.total),
      deliveryAddress: order.deliveryAddress,
      items: order.items.map((item: any) => ({
        id: item.id,
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        price: Number(item.price),
      })),
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    };
  }
}
```

#### Register Module in AppModule

**Location**: `apps/backend/src/app.module.ts`

```typescript
import { OrdersModule } from "./orders/orders.module";

@Module({
  imports: [OrdersModule], // Add this
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
```

### Step 4: Site Manager Frontend (10-15 minutes)

#### Create Component (`apps/site-manager/src/components/OrderList.tsx`)

```typescript
import { useState, useEffect } from 'react';
import type { Order } from 'shared';

const API_URL = 'http://localhost:4000';

export function OrderList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API_URL}/orders`);
      const data = await response.json();
      setOrders(data);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-blue-600">Loading orders...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">My Orders</h2>
        <div className="text-sm text-gray-500">
          {orders.length} {orders.length === 1 ? 'order' : 'orders'}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-semibold text-gray-900">
                Order #{order.id.slice(0, 8)}
              </h3>
              <StatusBadge status={order.status} />
            </div>

            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-500">Items:</span>{' '}
                <span className="font-medium">{order.items.length}</span>
              </div>
              <div>
                <span className="text-gray-500">Total:</span>{' '}
                <span className="font-semibold text-green-600">
                  ${order.total.toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Delivery:</span>{' '}
                <span className="text-gray-700">{order.deliveryAddress}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="text-xs text-gray-400">
                {new Date(order.createdAt).toLocaleString()}
              </div>
            </div>
          </div>
        ))}
      </div>

      {orders.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No orders found
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    delivering: 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${
        colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
      }`}
    >
      {status}
    </span>
  );
}
```

#### Add to App (`apps/site-manager/src/App.tsx`)

```typescript
import { OrderList } from './components/OrderList';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-blue-900 mb-8">
          Site Manager
        </h1>
        <OrderList />
      </div>
    </div>
  );
}

export default App;
```

### Step 5: Dispatcher Frontend (10-15 minutes)

#### Create Admin Component (`apps/dispatcher/src/components/OrdersAdmin.tsx`)

```typescript
import { useState, useEffect } from 'react';
import type { Order, UpdateOrderDto } from 'shared';

const API_URL = 'http://localhost:4000';

export function OrdersAdmin() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const fetchOrders = async () => {
    try {
      const url =
        filter === 'all'
          ? `${API_URL}/orders`
          : `${API_URL}/orders?status=${filter}`;
      const response = await fetch(url);
      const data = await response.json();
      setOrders(data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const response = await fetch(`${API_URL}/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status } as UpdateOrderDto),
      });

      if (response.ok) {
        fetchOrders();
      }
    } catch (err) {
      console.error('Failed to update order:', err);
    }
  };

  const statuses = ['pending', 'confirmed', 'delivering', 'completed', 'cancelled'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Orders Management</h2>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="all">All Orders</option>
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                    {order.id.slice(0, 8)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {order.customerId.slice(0, 8)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {order.items.length} items
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                    ${order.total.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      className="text-sm border border-gray-300 rounded px-2 py-1"
                    >
                      {statuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => fetchOrders()}
                      className="text-purple-600 hover:text-purple-900"
                    >
                      Refresh
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
```

#### Add to Dispatcher App (`apps/dispatcher/src/App.tsx`)

```typescript
import { OrdersAdmin } from './components/OrdersAdmin';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-purple-900 mb-8">
          Dispatcher Admin
        </h1>
        <OrdersAdmin />
      </div>
    </div>
  );
}

export default App;
```

## 🧪 Testing Your Implementation

### 1. Backend API Tests

```bash
# Test GET all orders
curl http://localhost:4000/orders

# Test GET single order
curl http://localhost:4000/orders/{id}

# Test CREATE order
curl -X POST http://localhost:4000/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "customer-123",
    "deliveryAddress": "123 Main St",
    "items": [
      {
        "productId": "prod-1",
        "productName": "Product 1",
        "quantity": 2,
        "price": 19.99
      }
    ]
  }'

# Test UPDATE order
curl -X PUT http://localhost:4000/orders/{id} \
  -H "Content-Type: application/json" \
  -d '{"status": "confirmed"}'

# Test DELETE order
curl -X DELETE http://localhost:4000/orders/{id}
```

### 2. Frontend Tests

1. Open http://localhost:3000 - Should see orders in Site Manager
2. Open http://localhost:3001 - Should see admin table with status dropdowns
3. Change status in Dispatcher - Should update immediately

### 3. Linting Test

```bash
pnpm lint
# Must show 0 errors
```

## 🔥 Common Issues & Quick Fixes

### Issue: "Cannot find module 'shared'"

```bash
# Solution: Build the shared package
pnpm --filter shared build
```

### Issue: Prisma client outdated

```bash
# Solution: Regenerate Prisma client
pnpm --filter backend db:generate
```

### Issue: Port already in use

```bash
# Solution: Kill processes on ports
lsof -ti:4000 | xargs kill -9
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
```

### Issue: Database connection error

```bash
# Solution: Verify PostgreSQL is running
docker ps | grep fuel-me-postgres

# If not running
cd /Users/nedimpriluskic/fuel-me-interview-prep
docker-compose up -d
```

### Issue: Type errors in frontend

```bash
# Solution: Make sure shared types are built
pnpm --filter shared build

# Restart Vite dev server
# (Ctrl+C in terminal, then pnpm dev)
```

## 📊 Time Management Strategy

| Phase        | Time       | Activity                               |
| ------------ | ---------- | -------------------------------------- |
| Planning     | 3 min      | Read user story, identify entities     |
| Types        | 3 min      | Define interfaces in shared package    |
| Database     | 3 min      | Prisma schema + manual table creation  |
| Backend      | 15 min     | Module, controller, service + register |
| Site Manager | 15 min     | Component + integration                |
| Dispatcher   | 15 min     | Admin component + integration          |
| Testing      | 6 min      | curl tests, browser tests, ESLint      |
| **Total**    | **60 min** | Complete feature implementation        |

## 🎯 Interview Success Checklist

Before the interview starts:

- [ ] Environment is running (`pnpm dev`)
- [ ] All ports accessible (3000, 3001, 4000, 5432)
- [ ] ESLint passing (`pnpm lint`)
- [ ] .cursorrules file in place
- [ ] This INTERVIEW_CONTEXT.md file open in editor
- [ ] AI assistant configured and authenticated

During the interview:

- [ ] Types defined in shared package and built
- [ ] Prisma schema updated
- [ ] Database tables created
- [ ] Backend module, controller, service implemented
- [ ] Backend module registered in AppModule
- [ ] Site Manager component created and integrated
- [ ] Dispatcher component created and integrated
- [ ] Tested with curl commands
- [ ] Tested in browser (both frontends)
- [ ] ESLint validation passed

## 💡 Pro Tips

1. **Start with the simplest version** - Get CRUD working, then add complexity
2. **Test as you go** - Don't wait until the end to test
3. **Use curl early** - Verify backend before building frontend
4. **Copy-paste patterns** - Use this document's templates liberally
5. **Keep types simple** - Add required fields first, optional later
6. **Status updates matter** - Show progress: "Backend done, moving to frontend"
7. **Don't over-engineer** - Working > Perfect
8. **If stuck, move on** - Come back to polish if time permits

## 🚀 Quick Start Commands

```bash
# Start everything
pnpm dev

# Open browser tabs
open http://localhost:3000
open http://localhost:3001

# Build shared types (after changes)
pnpm --filter shared build

# Lint check
pnpm lint

# Database access
docker exec -it fuel-me-postgres psql -U postgres -d fuel_me_dev
```

Good luck! 🎉
