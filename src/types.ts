/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = "customer" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  image: string;
  description: string;
}

export interface Service {
  id: string;
  name: string;
  categoryId: string;
  ageGroup: string; // e.g., "All", "Adults", "Kids"
  gender: string; // e.g., "All", "Male", "Female"
  image: string;
  shortDescription: string;
  longDescription: string;
  status: "active" | "inactive";
}

export interface Package {
  id: string;
  serviceId: string;
  title: string;
  mrp: number;
  sellingPrice: number;
  serviceType: "In-person" | "Online";
}

export interface Booking {
  id: string;
  serviceId: string;
  packageId: string;
  userId: string | null; // null for guest
  date: string;
  timeSlot: string;
  bookingFor: "self" | "family_member";
  firstName: string;
  lastName: string;
  remark: string;
  status: "Pending" | "Confirmed" | "Cancelled";
}

export interface CartItem {
  id: string;
  userId: string; // or sessionId for guests
  packageId: string;
  qty: number;
}

export interface OrderItem {
  packageId: string;
  packageTitle: string;
  serviceName: string;
  mrp: number;
  sellingPrice: number;
  qty: number;
}

export interface Order {
  id: string; // UUID or internal
  orderId: string; // Public hashed/code, e.g., EL-5928-AD
  userId: string | null; // guest can checkout
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  status: "Pending" | "Confirmed" | "Cancelled";
  orderDate: string;
  items: OrderItem[];
  bookingDetails?: {
    date: string;
    timeSlot: string;
    bookingFor: "self" | "family_member";
    firstName: string;
    lastName: string;
    remark: string;
  };
}

export interface Review {
  id: string;
  serviceId: string;
  userId: string;
  userName: string;
  rating: number; // 1 to 5
  comment: string;
  createdAt: string;
}

// Frontend navigation views
export type ActivePageView = 
  | "home"
  | "services"
  | "service-details"
  | "cart"
  | "login"
  | "register"
  | "orders"
  | "admin-login"
  | "admin-dashboard";
