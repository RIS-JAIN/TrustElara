/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { Star, CheckCircle, Info, ChevronRight, Phone, MessageSquare, AlertCircle, ShoppingCart } from "lucide-react";
import { Service, Package } from "../types";

interface ServiceDetailViewProps {
  service: Service & { packages: Package[] };
  onAddToCart: (packageId: string, qty: number) => void;
  onBookNow: (packageId: string) => void;
}

export function ServiceDetailView({ service, onAddToCart, onBookNow }: ServiceDetailViewProps) {
  const [selectedPackageId, setSelectedPackageId] = useState(
    service.packages[0]?.id || ""
  );
  const [qty, setQty] = useState(1);

  // Related Learning checklists with state!
  const [prepChecklist, setPrepChecklist] = useState([
    { id: "prep-1", label: "Fast for 10 hours prior to the diagnostic blood draw (Water is allowed).", checked: true },
    { id: "prep-2", label: "Avoid intense physical workouts or high-fat meals 24 hours prior.", checked: false },
  ]);

  const [consentChecklist, setConsentChecklist] = useState([
    { id: "con-1", label: "Digitally sign the DHA Electronic Health Record Integration permission.", checked: true },
    { id: "con-2", label: "Authorize secure genomic ancestry report compilation.", checked: true },
  ]);

  const togglePrep = (id: string) => {
    setPrepChecklist(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  const toggleConsent = (id: string) => {
    setConsentChecklist(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  const prepCompletedCount = prepChecklist.filter(item => item.checked).length;
  const prepProgress = Math.round((prepCompletedCount / prepChecklist.length) * 100);

  const consentCompletedCount = consentChecklist.filter(item => item.checked).length;
  const consentProgress = Math.round((consentCompletedCount / consentChecklist.length) * 100);

  const activePackage = service.packages.find(p => p.id === selectedPackageId) || service.packages[0];

  return (
    <div id="service-detail-container" className="max-w-7xl mx-auto px-4 py-8 font-sans">
      
      {/* Page Title & Star Ratings */}
      <div id="service-title-section" className="mb-8">
        <div className="flex flex-wrap items-center gap-2 mb-2 text-xs">
          <span className="bg-[#FAF7F2] text-[#2C422F] px-2.5 py-1 rounded-full border border-[#2C422F]/15 font-medium">
            Category: {service.categoryId === "cat-1" ? "Genetic Tests" : 
                       service.categoryId === "cat-2" ? "Cancer Screening" :
                       service.categoryId === "cat-3" ? "Doctor Visit At Home" :
                       service.categoryId === "cat-4" ? "Wellness Programs" :
                       service.categoryId === "cat-5" ? "Nurse Care" : "Diagnostics"}
          </span>
          <span className="text-gray-500">•</span>
          <span className="text-gray-600">Age: {service.ageGroup}</span>
          <span className="text-gray-500">•</span>
          <span className="text-gray-600">Gender: {service.gender}</span>
        </div>
        <h1 id="service-main-title" className="text-2xl sm:text-3.5xl font-display font-bold text-gray-900 tracking-tight">
          {service.name}
        </h1>
        
        {/* Star Rating Panel (0 Reviews) */}
        <div id="service-rating-line" className="flex items-center space-x-1.5 mt-2.5">
          <div className="flex text-[#D46A43]">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className="w-4 h-4 fill-current text-gray-300" />
            ))}
          </div>
          <span className="text-xs font-semibold text-gray-500">0 Reviews</span>
          <span className="text-gray-300">|</span>
          <span className="text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-100 font-medium flex items-center">
            <CheckCircle className="w-3 h-3 mr-1" /> DHA Licensed
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT PANEL: Related Learning/Info cards with progress bars */}
        <div id="left-learning-info-panel" className="lg:col-span-4 space-y-6">
          <div className="bg-[#FAF7F2] p-5 rounded-2xl border border-[#2C422F]/10 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#2C422F] mb-4 flex items-center">
              <Info className="w-4 h-4 mr-1.5 text-[#D46A43]" />
              Patient Instructions
            </h3>

            {/* Instruction Card 1 */}
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs mb-4">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-gray-800">1. Fasting Preparation</span>
                <span className="text-[10px] bg-amber-50 text-amber-700 font-semibold px-1.5 py-0.5 rounded border border-amber-100">
                  {prepCompletedCount} of {prepChecklist.length} Complete
                </span>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-100 h-2 rounded-full mb-3 overflow-hidden">
                <div 
                  className="bg-[#D46A43] h-full transition-all duration-300"
                  style={{ width: `${prepProgress}%` }}
                ></div>
              </div>

              {/* Checklist */}
              <div className="space-y-2.5">
                {prepChecklist.map(item => (
                  <label key={item.id} className="flex items-start space-x-2.5 text-[11px] text-gray-600 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={item.checked}
                      onChange={() => togglePrep(item.id)}
                      className="mt-0.5 rounded text-[#2C422F] focus:ring-[#2C422F] border-gray-300"
                    />
                    <span className={item.checked ? "line-through text-gray-400" : ""}>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Instruction Card 2 */}
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-gray-800">2. Clinical Consent</span>
                <span className="text-[10px] bg-green-50 text-green-700 font-semibold px-1.5 py-0.5 rounded border border-green-100">
                  {consentCompletedCount} of {consentChecklist.length} Complete
                </span>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-100 h-2 rounded-full mb-3 overflow-hidden">
                <div 
                  className="bg-green-600 h-full transition-all duration-300"
                  style={{ width: `${consentProgress}%` }}
                ></div>
              </div>

              {/* Checklist */}
              <div className="space-y-2.5">
                {consentChecklist.map(item => (
                  <label key={item.id} className="flex items-start space-x-2.5 text-[11px] text-gray-600 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={item.checked}
                      onChange={() => toggleConsent(item.id)}
                      className="mt-0.5 rounded text-[#2C422F] focus:ring-[#2C422F] border-gray-300"
                    />
                    <span className={item.checked ? "line-through text-gray-400" : ""}>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mt-4 p-3 bg-blue-50/50 rounded-lg border border-blue-100 flex items-start space-x-2">
              <AlertCircle className="w-3.5 h-3.5 text-blue-600 mt-0.5 shrink-0" />
              <p className="text-[10px] text-blue-800 leading-normal">
                Results are typically uploaded to your secure customer dashboard within 24 to 36 hours post specimen extraction.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT/CENTER CONTENT: Image, Service Info, Packages Selector, Quantity Stepper, Checkout Actions */}
        <div id="right-details-main-panel" className="lg:col-span-8 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
            
            {/* Service Main Image */}
            <div className="w-full h-64 md:h-80 rounded-xl overflow-hidden relative shadow-inner bg-gray-50">
              <img 
                src={service.image} 
                alt={service.name} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-xs px-3 py-1 rounded-full text-xs font-semibold text-gray-800 border border-gray-100 shadow-xs flex items-center">
                <CheckCircle className="w-3.5 h-3.5 text-green-600 mr-1" />
                DHA Registered
              </div>
            </div>

            {/* Description Text */}
            <div className="space-y-3">
              <h3 className="text-base font-bold text-gray-900 font-display">Clinical Overview</h3>
              <p className="text-xs text-gray-600 leading-relaxed">{service.longDescription}</p>
            </div>

            {/* PACKAGE SELECTOR: Radio buttons for Packages */}
            <div id="package-selector-section" className="space-y-3.5 pt-2">
              <h3 className="text-sm font-bold text-gray-900 font-display uppercase tracking-wider text-[#2C422F]">
                Select Package Option
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {service.packages.map((pkg) => {
                  const isSelected = selectedPackageId === pkg.id;
                  return (
                    <div 
                      key={pkg.id}
                      onClick={() => setSelectedPackageId(pkg.id)}
                      className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex flex-col justify-between ${
                        isSelected 
                          ? "border-[#2C422F] bg-green-50/25 shadow-xs" 
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/50"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2.5">
                          <input 
                            type="radio" 
                            name="service-package-option" 
                            checked={isSelected}
                            onChange={() => setSelectedPackageId(pkg.id)}
                            className="text-[#2C422F] focus:ring-[#2C422F] h-4.5 w-4.5"
                          />
                          <span className="text-xs font-bold text-gray-900">{pkg.title}</span>
                        </div>
                        <span className="text-[10px] bg-[#2C422F]/10 text-[#2C422F] px-2 py-0.5 rounded font-medium">
                          {pkg.serviceType}
                        </span>
                      </div>
                      
                      <div className="mt-4 pt-3 border-t border-dashed border-gray-100 flex items-baseline justify-between">
                        <span className="text-gray-400 text-[11px]">Pricing:</span>
                        <div className="text-right">
                          <span className="text-[11px] text-gray-400 line-through mr-1.5">
                            AED {pkg.mrp.toFixed(2)}
                          </span>
                          <span className="text-sm font-extrabold text-[#D46A43]">
                            AED {pkg.sellingPrice.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quantity Stepper & Add to Cart Container */}
            <div className="border-t border-gray-100 pt-6 flex flex-wrap items-center justify-between gap-4">
              
              {/* Stepper block */}
              <div className="flex items-center space-x-3 bg-gray-50 px-3.5 py-1.5 rounded-full border border-gray-200 shadow-inner">
                <span className="text-xs text-gray-500 font-medium mr-1 select-none">Qty:</span>
                <button 
                  onClick={() => setQty(prev => Math.max(1, prev - 1))}
                  className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-gray-600 hover:text-black border border-gray-200 hover:bg-gray-100 focus:outline-none transition-colors"
                >
                  -
                </button>
                <span className="text-xs font-bold text-gray-900 w-5 text-center">{qty}</span>
                <button 
                  onClick={() => setQty(prev => prev + 1)}
                  className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-gray-600 hover:text-black border border-gray-200 hover:bg-gray-100 focus:outline-none transition-colors"
                >
                  +
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2.5 flex-1 justify-end min-w-[280px]">
                <button 
                  id="srv-detail-add-cart-btn"
                  onClick={() => onAddToCart(selectedPackageId, qty)}
                  className="bg-transparent hover:bg-gray-50 text-[#2C422F] border-2 border-[#2C422F] text-xs font-semibold px-5 py-3 rounded-xl flex items-center justify-center transition-all duration-200 flex-1"
                >
                  <ShoppingCart className="w-4 h-4 mr-1.5" />
                  Add to Cart
                </button>

                <button 
                  id="srv-detail-book-now-btn"
                  onClick={() => onBookNow(selectedPackageId)}
                  className="bg-[#2C422F] hover:bg-[#1E2D20] text-white text-xs font-bold px-7 py-3.5 rounded-xl shadow-md transition-all duration-200 hover:-translate-y-0.5 flex-1 text-center"
                >
                  Book Now
                </button>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-5 flex items-center justify-between">
              <span className="text-[11px] text-gray-500 flex items-center">
                <CheckCircle className="w-4 h-4 text-green-600 mr-1.5 shrink-0" />
                Instant scheduling available on booking
              </span>
              
              {/* Talk to Expert outlined button */}
              <button 
                id="talk-to-expert-btn"
                onClick={() => alert("Connecting you with an Elara Health clinical care agent. Please stand by.")}
                className="text-xs text-[#D46A43] hover:text-[#C05C33] font-bold flex items-center space-x-1 hover:underline"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Talk To An Expert</span>
              </button>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
