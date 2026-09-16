/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { X, Calendar, Clock, User, FileText, Info, AlertTriangle } from "lucide-react";
import { Service, Package } from "../types";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: Service | null;
  selectedPackage: Package | null;
  onConfirmBooking: (bookingDetails: {
    date: string;
    timeSlot: string;
    bookingFor: "self" | "family_member";
    firstName: string;
    lastName: string;
    remark: string;
    guestEmail?: string;
    addToCartOnly: boolean;
  }) => void;
  onToggleLogin: () => void;
  isLoggedIn: boolean;
}

export function BookingModal({
  isOpen,
  onClose,
  service,
  selectedPackage,
  onConfirmBooking,
  onToggleLogin,
  isLoggedIn,
}: BookingModalProps) {
  if (!isOpen || !service || !selectedPackage) return null;

  const [date, setDate] = useState("2026-07-20");
  const [timeSlot, setTimeSlot] = useState("09:00 AM - 10:00 AM");
  const [bookingFor, setBookingFor] = useState<"self" | "family_member">("self");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [remark, setRemark] = useState("");

  const timeSlots = [
    "08:00 AM - 09:00 AM",
    "09:00 AM - 10:00 AM",
    "10:00 AM - 11:00 AM",
    "11:00 AM - 12:00 PM",
    "01:00 PM - 02:00 PM",
    "02:00 PM - 03:00 PM",
    "03:00 PM - 04:00 PM",
    "04:00 PM - 05:00 PM"
  ];

  const handleSubmit = (addToCartOnly: boolean) => {
    if (!firstName || !lastName) {
      alert("Please provide the patient's First Name and Last Name.");
      return;
    }
    if (!isLoggedIn && !guestEmail) {
      alert("Please enter your Email Address for booking updates.");
      return;
    }

    onConfirmBooking({
      date,
      timeSlot,
      bookingFor,
      firstName,
      lastName,
      remark,
      guestEmail: isLoggedIn ? undefined : guestEmail,
      addToCartOnly
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 font-sans overflow-y-auto">
      <div 
        id="schedule-appointment-modal"
        className="bg-white rounded-2xl border border-gray-100 shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto flex flex-col"
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-[#FAF7F2] rounded-t-2xl">
          <div>
            <h2 className="text-base font-bold text-gray-900 font-display">Schedule Your Appointment</h2>
            <p className="text-[11px] text-gray-500">Secure clinical booking dispatched to your doorstep</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-full hover:bg-gray-200 text-gray-500 hover:text-black transition-colors focus:outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5 flex-1">
          
          {/* Read-Only Service Title + Fasting Guidelines Info Label */}
          <div className="bg-green-50/50 p-4 rounded-xl border border-[#2C422F]/10 flex items-start space-x-3">
            <Info className="w-5 h-5 text-[#2C422F] shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400">Selected Diagnostics</span>
              <p className="text-xs font-bold text-gray-900 leading-tight">{service.name}</p>
              <div className="flex items-center space-x-2 mt-1.5">
                <span className="text-xs font-semibold text-[#D46A43]">{selectedPackage.title}</span>
                <span className="text-gray-300 text-xs">|</span>
                <span className="text-xs font-bold text-gray-800">AED {selectedPackage.sellingPrice.toFixed(2)}</span>
              </div>
              <p className="text-[10px] text-gray-500 mt-1.5 italic font-medium">
                Note: 10 hours fasting is required. Drink only pure water prior to specimen collection.
              </p>
            </div>
          </div>

          {/* Date & Time selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-gray-700 flex items-center">
                <Calendar className="w-3.5 h-3.5 text-[#2C422F] mr-1" />
                Select Appointment Date
              </label>
              <input 
                id="booking-date-picker"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min="2026-07-14"
                className="w-full bg-gray-50 border border-gray-200 text-xs px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C422F]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-gray-700 flex items-center">
                <Clock className="w-3.5 h-3.5 text-[#2C422F] mr-1" />
                Select Time Slot
              </label>
              <select 
                id="booking-time-select"
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 text-xs px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C422F] appearance-none"
              >
                {timeSlots.map(slot => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Booking For dropdown + Login toggle */}
          <div className="space-y-3.5 p-4 rounded-xl border border-gray-100 bg-gray-50/50">
            <div className="flex justify-between items-center">
              <label className="text-[11px] font-bold text-gray-800 flex items-center">
                <User className="w-3.5 h-3.5 text-[#2C422F] mr-1" />
                Patient Identity & Relation
              </label>

              {/* Already Have An Account? Toggle link */}
              {!isLoggedIn && (
                <button 
                  id="booking-modal-login-toggle"
                  type="button"
                  onClick={() => { onClose(); onToggleLogin(); }}
                  className="text-[11px] text-[#D46A43] hover:text-[#C05C33] font-bold hover:underline"
                >
                  Already Have An Account? Login
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <span className="text-[10px] text-gray-500 font-medium">Select Self or a Member</span>
                <select 
                  id="booking-for-select"
                  value={bookingFor}
                  onChange={(e) => setBookingFor(e.target.value as any)}
                  className="w-full bg-white border border-gray-200 text-xs px-2.5 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2C422F]"
                >
                  <option value="self">My Self (Primary Holder)</option>
                  <option value="family_member">Family Member</option>
                </select>
              </div>

              {!isLoggedIn && (
                <div className="space-y-1">
                  <span className="text-[10px] text-gray-500 font-medium">Email Address (Guest Updates)</span>
                  <input 
                    type="email"
                    placeholder="e.g. guest@elara.ae"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    className="w-full bg-white border border-gray-200 text-xs px-2.5 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2C422F]"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="space-y-1">
                <span className="text-[10px] text-gray-500 font-medium">First Name</span>
                <input 
                  id="patient-first-name-input"
                  type="text" 
                  placeholder="First name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-white border border-gray-200 text-xs px-2.5 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2C422F]"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-gray-500 font-medium">Last Name</span>
                <input 
                  id="patient-last-name-input"
                  type="text" 
                  placeholder="Last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-white border border-gray-200 text-xs px-2.5 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2C422F]"
                />
              </div>
            </div>
          </div>

          {/* Remarks */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-gray-700 flex items-center">
              <FileText className="w-3.5 h-3.5 text-[#2C422F] mr-1" />
              Special Health Remarks / Requests (Optional)
            </label>
            <textarea 
              id="booking-remark-textarea"
              placeholder="e.g., Any pre-existing medical conditions, specific directions, or practitioner gender preference."
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 text-xs p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C422F] h-16 resize-none"
            ></textarea>
          </div>

          {/* Cancellation policy text list */}
          <div className="p-3.5 bg-amber-50/50 rounded-xl border border-amber-100 flex items-start space-x-2.5">
            <AlertTriangle className="w-4 h-4 text-[#D46A43] shrink-0 mt-0.5" />
            <div className="text-[10px] text-amber-800 space-y-1 leading-normal">
              <p className="font-bold uppercase tracking-wider text-[#D46A43]">Rescheduling & Cancellation Guidelines:</p>
              <ul className="list-disc pl-3.5 space-y-0.5">
                <li>Rescheduling is free of charge up to 4 hours before the booked time slot.</li>
                <li>Cancellations within 4 hours of appointment carry a 20% clinical preparation fee.</li>
                <li>Practitioner matches are finalized and confirmed via SMS 2 hours in advance.</li>
              </ul>
            </div>
          </div>

        </div>

        {/* Buttons: Checkout (primary) and Add to Cart (secondary) */}
        <div className="p-5 border-t border-gray-100 bg-[#FAF7F2] flex items-center justify-between gap-3 rounded-b-2xl">
          <button 
            id="booking-modal-cart-btn"
            onClick={() => handleSubmit(true)}
            className="px-4.5 py-3 text-xs text-[#2C422F] hover:text-[#1E2D20] bg-white border border-gray-200 hover:bg-gray-50 font-bold rounded-xl transition-all flex-1 text-center"
          >
            Add to Cart
          </button>
          
          <button 
            id="booking-modal-checkout-btn"
            onClick={() => handleSubmit(false)}
            className="bg-[#2C422F] hover:bg-[#1E2D20] text-white text-xs font-bold px-6 py-3.5 rounded-xl shadow-md transition-all flex-1 text-center"
          >
            Checkout Securely
          </button>
        </div>

      </div>
    </div>
  );
}
