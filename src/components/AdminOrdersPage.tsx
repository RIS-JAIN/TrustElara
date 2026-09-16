/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { 
  Search, Eye, CheckCircle2, AlertCircle, XCircle, X, ChevronRight, Mail, User, 
  Calendar, Clock, DollarSign, Activity, FileText
} from "lucide-react";
import { Order } from "../types";

interface AdminOrdersPageProps {
  orders: Order[];
  onUpdateStatus: (orderId: string, status: "Pending" | "Confirmed" | "Cancelled") => Promise<void>;
}

export function AdminOrdersPage({ orders, onUpdateStatus }: AdminOrdersPageProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const handleStatusChange = async (orderId: string, newStatus: "Pending" | "Confirmed" | "Cancelled") => {
    try {
      await onUpdateStatus(orderId, newStatus);
      // Update local modal view if open
      if (selectedOrder && (selectedOrder.id === orderId || selectedOrder.orderId === orderId)) {
        setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (err) {
      alert("Failed to update status.");
    }
  };

  const filteredOrders = orders.filter(o => 
    o.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 font-sans">
      
      {/* Header */}
      <div className="border-b border-gray-100 pb-5">
        <h2 className="text-xl font-bold text-gray-900 font-display">Order Tracker</h2>
        <p className="text-xs text-gray-500">Monitor diagnostics transactions, update session status, and view clinical appointments.</p>
      </div>

      {/* Search Input Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs flex items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input 
            id="admin-orders-search"
            type="text"
            placeholder="Search by public Order ID, customer name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 text-xs pl-10 pr-4 py-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2C422F]"
          />
        </div>
        <div className="ml-auto text-[11px] text-gray-400 font-medium">
          Showing {filteredOrders.length} of {orders.length} bookings
        </div>
      </div>

      {/* Orders Table Grid */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table id="admin-orders-table" className="w-full text-left border-collapse">
            <thead className="bg-[#FAF7F2] border-b border-gray-200 text-gray-700 text-xs uppercase font-semibold">
              <tr>
                <th className="py-3 px-4 font-bold">S.No</th>
                <th className="py-3 px-4 font-bold">Order ID</th>
                <th className="py-3 px-4 font-bold">User / Customer ID</th>
                <th className="py-3 px-4 font-bold">Total Amount</th>
                <th className="py-3 px-4 font-bold">Current Status</th>
                <th className="py-3 px-4 font-bold">Order Date</th>
                <th className="py-3 px-4 font-bold text-right">Details</th>
              </tr>
            </thead>
            <tbody className="text-xs divide-y divide-gray-100 text-gray-600">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-gray-400">
                    No diagnostics orders found.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord, idx) => {
                  return (
                    <tr key={ord.id} className="hover:bg-gray-50/50">
                      <td className="py-3.5 px-4 font-semibold text-gray-400">{idx + 1}</td>
                      <td className="py-3.5 px-4 font-bold text-gray-900">{ord.orderId}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-gray-950">{ord.customerName}</div>
                        <div className="text-[10px] text-gray-400">{ord.customerEmail}</div>
                        <div className="text-[9px] font-mono text-gray-400">UID: {ord.userId || "GUEST"}</div>
                      </td>
                      
                      {/* Total Amount (₹ symbol shown in recording) */}
                      <td className="py-3.5 px-4 font-extrabold text-gray-900">
                        ₹{ord.totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        <span className="block text-[9px] text-gray-400 font-medium">AED {(ord.totalAmount).toFixed(2)} equivalent</span>
                      </td>

                      {/* Current Status Dropdown color coded */}
                      <td className="py-3.5 px-4">
                        <select
                          id={`admin-order-status-select-${ord.id}`}
                          value={ord.status}
                          onChange={(e) => handleStatusChange(ord.id, e.target.value as any)}
                          className={`px-3 py-1.5 rounded-full text-[10px] font-bold border focus:outline-none appearance-none cursor-pointer tracking-wider uppercase shadow-2xs ${
                            ord.status === "Confirmed" 
                              ? "bg-green-50 text-green-700 border-green-200" 
                              : ord.status === "Pending"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-red-50 text-red-700 border-red-200"
                          }`}
                        >
                          <option value="Pending">Pending ▾</option>
                          <option value="Confirmed">Confirmed ▾</option>
                          <option value="Cancelled">Cancelled ▾</option>
                        </select>
                      </td>

                      <td className="py-3.5 px-4 text-gray-500 font-medium">
                        {new Date(ord.orderDate).toLocaleDateString("en-GB", {
                          day: "2-digit", month: "short", year: "numeric"
                        })}
                      </td>

                      {/* View Details action */}
                      <td className="py-3.5 px-4 text-right">
                        <button 
                          id={`admin-view-order-btn-${ord.id}`}
                          onClick={() => setSelectedOrder(ord)}
                          className="bg-[#2C422F]/5 text-[#2C422F] hover:bg-[#2C422F] hover:text-white border border-[#2C422F]/10 font-bold px-3 py-1.5 rounded-lg text-[11px] transition-colors inline-flex items-center space-x-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Details</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* VIEW ORDER DETAILS POPUP MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto flex flex-col font-sans text-xs">
            
            {/* Header */}
            <div className="p-5 border-b border-gray-100 bg-[#FAF7F2] rounded-t-2xl flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900 font-display flex items-center space-x-2">
                  <span>Order Profile: {selectedOrder.orderId}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest ${
                    selectedOrder.status === "Confirmed" 
                      ? "bg-green-100 text-green-800" 
                      : selectedOrder.status === "Pending"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-red-100 text-red-800"
                  }`}>
                    {selectedOrder.status}
                  </span>
                </h3>
                <p className="text-[10px] text-gray-500">Transaction completed on {new Date(selectedOrder.orderDate).toLocaleString()}</p>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="p-1 rounded-full hover:bg-gray-200 text-gray-500 focus:outline-none"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 flex-1">
              
              {/* Customer Account Segment */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-[#D46A43] block">Account Holder</span>
                  <div className="flex items-center space-x-2.5">
                    <User className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="font-bold text-gray-900">{selectedOrder.customerName}</p>
                      <p className="text-[10px] text-gray-500">{selectedOrder.customerEmail}</p>
                      <span className="text-[9px] bg-gray-200 text-gray-600 font-bold px-1 py-0.2 rounded">
                        UID: {selectedOrder.userId || "GUEST"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-[#D46A43] block">Payment Summary</span>
                  <div>
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-gray-500">Total Charged (₹):</span>
                      <span className="font-bold text-gray-900">₹{selectedOrder.totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <span className="text-gray-500">Local Equiv (AED):</span>
                      <span className="font-extrabold text-[#2C422F]">AED {selectedOrder.totalAmount.toFixed(2)}</span>
                    </div>
                    <p className="text-[9px] text-gray-400 mt-1 italic">Tax is inclusive. Doorstep Dispatch: FREE</p>
                  </div>
                </div>
              </div>

              {/* Patient Scheduling details */}
              {selectedOrder.bookingDetails && (
                <div className="p-4 rounded-xl border border-green-100 bg-green-50/20 space-y-3">
                  <span className="text-[10px] uppercase font-bold text-[#2C422F] block tracking-wider">Doorstep Appointment Schedule</span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-gray-400 block">Target Patient</span>
                      <p className="font-bold text-gray-800 flex items-center">
                        {selectedOrder.bookingDetails.firstName} {selectedOrder.bookingDetails.lastName}
                        <span className="ml-1.5 text-[9px] bg-[#2C422F]/10 text-[#2C422F] font-bold px-1 py-0.2 rounded">
                          {selectedOrder.bookingDetails.bookingFor}
                        </span>
                      </p>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[10px] text-gray-400 block">Date</span>
                      <p className="font-bold text-gray-800 flex items-center">
                        <Calendar className="w-3.5 h-3.5 text-[#2C422F] mr-1 shrink-0" />
                        {selectedOrder.bookingDetails.date}
                      </p>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[10px] text-gray-400 block">Time Slot</span>
                      <p className="font-bold text-gray-800 flex items-center">
                        <Clock className="w-3.5 h-3.5 text-[#2C422F] mr-1 shrink-0" />
                        {selectedOrder.bookingDetails.timeSlot}
                      </p>
                    </div>
                  </div>

                  {selectedOrder.bookingDetails.remark && (
                    <div className="pt-2 border-t border-dashed border-gray-200/80">
                      <span className="text-[10px] text-gray-400 block">Patient Remark / Request:</span>
                      <p className="text-gray-700 italic bg-white p-2.5 rounded-lg border border-gray-100 mt-1 leading-normal">
                        "{selectedOrder.bookingDetails.remark}"
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Items List */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Prescribed / Booked Items</span>
                <div className="border border-gray-150 rounded-xl overflow-hidden divide-y divide-gray-100 bg-white">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="p-3.5 flex items-center justify-between gap-4 hover:bg-gray-50/50">
                      <div>
                        <p className="font-bold text-gray-900">{item.packageTitle}</p>
                        <span className="text-[10px] text-gray-500 flex items-center">
                          <Activity className="w-3 h-3 text-[#D46A43] mr-1" />
                          {item.serviceName}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-semibold text-gray-900">
                          {item.qty} x AED {item.sellingPrice.toFixed(2)}
                        </span>
                        <p className="text-[10px] text-gray-400 line-through">MRP AED {item.mrp.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Actions Footer */}
            <div className="p-5 border-t border-gray-100 bg-[#FAF7F2] rounded-b-2xl flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500">Quick Update Status:</span>
                <button 
                  onClick={() => handleStatusChange(selectedOrder.id, "Confirmed")}
                  className="bg-green-700 hover:bg-green-800 text-white font-bold px-3 py-1.5 rounded text-[10px] uppercase tracking-wider transition-colors"
                >
                  Approve / Confirm
                </button>
                <button 
                  onClick={() => handleStatusChange(selectedOrder.id, "Cancelled")}
                  className="bg-red-700 hover:bg-red-800 text-white font-bold px-3 py-1.5 rounded text-[10px] uppercase tracking-wider transition-colors"
                >
                  Cancel Order
                </button>
              </div>

              <button 
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-xl transition-all"
              >
                Close View
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
