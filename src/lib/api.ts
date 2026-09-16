/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  Category, Service, Package, Booking, CartItem, Order, Review, User
} from "../types";

const API_BASE = ""; // relative paths target the Express server on same origin

export const api = {
  // Auth
  async login(email: string, passwordHash: string) {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: passwordHash })
    });
    return res.json();
  },

  async register(name: string, email: string, passwordHash: string) {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password: passwordHash })
    });
    return res.json();
  },

  async forgotPassword(email: string) {
    const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });
    return res.json();
  },

  // Categories
  async getCategories(): Promise<Category[]> {
    const res = await fetch(`${API_BASE}/api/categories`);
    return res.json();
  },

  async createCategory(category: Partial<Category>): Promise<Category> {
    const res = await fetch(`${API_BASE}/api/categories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(category)
    });
    return res.json();
  },

  // Services
  async getServices(categoryId?: string): Promise<Service[]> {
    const url = categoryId 
      ? `${API_BASE}/api/services?category=${categoryId}`
      : `${API_BASE}/api/services`;
    const res = await fetch(url);
    return res.json();
  },

  async getServiceById(id: string): Promise<Service & { packages: Package[]; reviews: Review[] }> {
    const res = await fetch(`${API_BASE}/api/services/${id}`);
    if (!res.ok) throw new Error("Service not found");
    return res.json();
  },

  async createService(serviceData: any): Promise<Service> {
    const res = await fetch(`${API_BASE}/api/services`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(serviceData)
    });
    return res.json();
  },

  async updateService(id: string, serviceData: any): Promise<Service> {
    const res = await fetch(`${API_BASE}/api/services/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(serviceData)
    });
    return res.json();
  },

  async deleteService(id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/api/services/${id}`, {
      method: "DELETE"
    });
    return res.json();
  },

  // Cart
  async getCart(userId: string): Promise<any[]> {
    const res = await fetch(`${API_BASE}/api/cart?userId=${encodeURIComponent(userId)}`);
    return res.json();
  },

  async addToCart(userId: string, packageId: string, qty: number = 1): Promise<any[]> {
    const res = await fetch(`${API_BASE}/api/cart`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, packageId, qty })
    });
    return res.json();
  },

  async updateCartQty(cartItemId: string, qty: number): Promise<any> {
    const res = await fetch(`${API_BASE}/api/cart/${cartItemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ qty })
    });
    return res.json();
  },

  async removeFromCart(cartItemId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/api/cart/${cartItemId}`, {
      method: "DELETE"
    });
    return res.json();
  },

  // Bookings (Schedule appointment)
  async createBooking(bookingData: any): Promise<Booking> {
    const res = await fetch(`${API_BASE}/api/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bookingData)
    });
    return res.json();
  },

  // Orders
  async getOrders(userId: string): Promise<Order[]> {
    const res = await fetch(`${API_BASE}/api/orders?userId=${encodeURIComponent(userId)}`);
    return res.json();
  },

  async createOrder(orderData: any): Promise<Order> {
    const res = await fetch(`${API_BASE}/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData)
    });
    return res.json();
  },

  // Admin specific
  async getAllOrdersForAdmin(): Promise<Order[]> {
    const res = await fetch(`${API_BASE}/api/admin/orders`);
    return res.json();
  },

  async updateOrderStatus(orderId: string, status: string): Promise<Order> {
    const res = await fetch(`${API_BASE}/api/admin/orders/${orderId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    return res.json();
  },

  async getRegisteredUsers(): Promise<User[]> {
    const res = await fetch(`${API_BASE}/api/admin/users`);
    return res.json();
  }
};
