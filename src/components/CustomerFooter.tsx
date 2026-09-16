/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ShieldCheck, Mail, Phone, MapPin } from "lucide-react";
import { Category } from "../types";

interface CustomerFooterProps {
  categories: Category[];
  onSelectCategory: (catId: string) => void;
  onNavigatePage: (page: string) => void;
}

export function CustomerFooter({ categories, onSelectCategory, onNavigatePage }: CustomerFooterProps) {
  return (
    <footer id="elara-main-footer" className="bg-[#1C2C20] text-[#F9F6F0] font-sans pt-16 pb-8 border-t border-[#131F16]">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-10">
        
        {/* Column 1: Brand / About */}
        <div id="footer-about-col" className="flex flex-col space-y-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-[#D46A43] flex items-center justify-center">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <span className="font-display font-bold text-lg tracking-tight">ELARA HEALTH</span>
          </div>
          <p className="text-xs text-[#FAF7F2]/70 leading-relaxed max-w-xs">
            Premium hospital-grade clinical diagnostics and nursing support, dispatched directly to your residential doorstep in the UAE.
          </p>
          <div className="space-y-2 pt-1">
            <a href="mailto:support@elara.ae" className="flex items-center text-xs text-[#F9F6F0] hover:text-[#D46A43] transition-colors">
              <Mail className="w-4 h-4 mr-2 text-[#D46A43]" />
              <span>support@elara.ae</span>
            </a>
            <div className="flex items-center text-xs text-[#FAF7F2]/70">
              <Phone className="w-4 h-4 mr-2 text-[#D46A43]/80" />
              <span>+971 (0)6 500 ELARA</span>
            </div>
            <div className="flex items-center text-xs text-[#FAF7F2]/70">
              <MapPin className="w-4 h-4 mr-2 text-[#D46A43]/80" />
              <span>Al Majaz, Sharjah, UAE</span>
            </div>
          </div>
        </div>

        {/* Column 2: Service Categories */}
        <div id="footer-categories-col" className="flex flex-col space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-widest text-[#D46A43]">
            Service Categories
          </h4>
          <ul className="space-y-2.5 text-xs text-[#FAF7F2]/70">
            {categories.slice(0, 6).map((cat) => (
              <li key={cat.id}>
                <button 
                  onClick={() => onSelectCategory(cat.id)}
                  className="hover:text-white hover:underline focus:outline-none transition-colors"
                >
                  {cat.name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 3: Pages */}
        <div id="footer-pages-col" className="flex flex-col space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-widest text-[#D46A43]">
            Company Pages
          </h4>
          <ul className="space-y-2.5 text-xs text-[#FAF7F2]/70">
            <li>
              <button onClick={() => onNavigatePage("home")} className="hover:text-white hover:underline focus:outline-none">
                About Us
              </button>
            </li>
            <li>
              <button onClick={() => onNavigatePage("home")} className="hover:text-white hover:underline focus:outline-none">
                Contact Us
              </button>
            </li>
            <li>
              <button onClick={() => onNavigatePage("home")} className="hover:text-white hover:underline focus:outline-none">
                Help & Support
              </button>
            </li>
            <li>
              <button onClick={() => onNavigatePage("home")} className="hover:text-white hover:underline focus:outline-none">
                Cancellation & Refund Policy
              </button>
            </li>
            <li>
              <button onClick={() => onNavigatePage("home")} className="hover:text-white hover:underline focus:outline-none">
                Privacy Policy
              </button>
            </li>
            <li>
              <button onClick={() => onNavigatePage("home")} className="hover:text-white hover:underline focus:outline-none">
                FAQ's
              </button>
            </li>
          </ul>
        </div>

        {/* Column 4: Accepted Payment */}
        <div id="footer-payment-col" className="flex flex-col space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-widest text-[#D46A43]">
            Secure Payments
          </h4>
          <p className="text-xs text-[#FAF7F2]/70 leading-relaxed">
            All data and diagnostic sessions are heavily encrypted in line with local healthcare compliance guidelines.
          </p>
          
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {/* Visa Icon Card styling */}
            <div className="bg-white/10 px-3 py-1.5 rounded border border-white/10 flex items-center space-x-1">
              <span className="text-white font-extrabold text-[11px] italic tracking-tight font-sans">VISA</span>
              <span className="text-[7px] text-[#FAF7F2]/70 uppercase tracking-tighter">Verified</span>
            </div>
            <div className="bg-white/10 px-3 py-1.5 rounded border border-white/10 flex items-center space-x-1">
              <span className="text-white font-bold text-[11px] italic tracking-tight font-sans">MasterCard</span>
            </div>
            <div className="bg-white/10 px-3 py-1.5 rounded border border-white/10 flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-green-400" />
              <span className="text-[10px] font-medium">PCI Compliant</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center text-[11px] text-[#FAF7F2]/50">
        <p>© 2026 Elara Health Systems. All rights reserved. Registered DHA Clinical Service.</p>
        <p className="mt-2 sm:mt-0 cursor-pointer hover:text-white hover:underline" onClick={() => onNavigatePage("admin-login")}>
          Administrative Staff Access (FD Login)
        </p>
      </div>
    </footer>
  );
}
