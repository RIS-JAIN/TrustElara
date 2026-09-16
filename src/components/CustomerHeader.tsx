/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { ShoppingCart, User as UserIcon, LogOut, FileText, Search, ChevronDown, Check, X } from "lucide-react";
import { User } from "../types";

interface CustomerHeaderProps {
  currentUser: User | null;
  cartCount: number;
  onNavigate: (view: any) => void;
  onSearch: (term: string) => void;
  onLogout: () => void;
}

export function CustomerHeader({ 
  currentUser, 
  cartCount, 
  onNavigate, 
  onSearch, 
  onLogout 
}: CustomerHeaderProps) {
  const [showPromo, setShowPromo] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchText);
  };

  return (
    <div className="w-full font-sans">
      {/* Top Dismissible Promo Banner Bar */}
      {showPromo && (
        <div id="top-promo-bar" className="w-full bg-[#591F26] text-[#F9F6F0] text-xs py-2 px-4 flex flex-col sm:flex-row justify-between items-center transition-all duration-300">
          <div className="flex-1 text-center sm:text-left font-medium">
            Launch Offer — Free service for a limited time on all services!
          </div>
          <div className="flex items-center space-x-4 mt-1 sm:mt-0 text-[11px] opacity-90">
            <div className="flex items-center cursor-pointer hover:underline">
              <span>English</span>
              <ChevronDown className="w-3 h-3 ml-0.5" />
            </div>
            <span className="opacity-40">|</span>
            <div className="flex items-center cursor-pointer hover:underline">
              <span>Sharjah</span>
              <ChevronDown className="w-3 h-3 ml-0.5" />
            </div>
            <button 
              id="dismiss-promo-btn"
              onClick={() => setShowPromo(false)} 
              className="ml-2 text-[#F9F6F0] hover:text-[#D46A43] focus:outline-none"
              title="Dismiss Offer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Navigation Header */}
      <header id="main-customer-header" className="w-full bg-[#2C422F] text-[#F9F6F0] border-b border-[#1E2D20] shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 sm:h-20 flex items-center justify-between gap-4">
          
          {/* Logo Brand Brand Section */}
          <div 
            id="brand-logo-container"
            onClick={() => onNavigate("home")} 
            className="flex items-center space-x-2.5 cursor-pointer select-none shrink-0"
          >
            <div className="w-10 h-10 rounded-full bg-[#D46A43] flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-lg leading-none tracking-tighter">E</span>
            </div>
            <div>
              <div className="flex items-center font-display tracking-tight font-bold text-xl sm:text-2xl leading-none">
                <span>ELARA</span>
                <span className="text-[#D46A43] ml-0.5 font-sans text-xs uppercase tracking-widest font-semibold bg-white/10 px-1 py-0.5 rounded">Health</span>
              </div>
              <span className="text-[10px] tracking-wider uppercase opacity-70">Care at home</span>
            </div>
          </div>

          {/* Search Bar */}
          <form 
            id="global-search-form"
            onSubmit={handleSearchSubmit} 
            className="hidden md:flex flex-1 max-w-md relative"
          >
            <input 
              id="global-search-input"
              type="text"
              placeholder="Search for services, doctors, and more..."
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                onSearch(e.target.value);
              }}
              className="w-full bg-white/10 text-white placeholder-white/60 text-sm pl-4 pr-10 py-2.5 rounded-full border border-white/20 focus:outline-none focus:ring-2 focus:ring-[#D46A43] focus:bg-white focus:text-[#2C422F] focus:placeholder-gray-400 transition-all duration-200"
            />
            <button 
              id="global-search-submit"
              type="submit" 
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/70 hover:text-[#D46A43] focus:outline-none transition-colors"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* Cart & Authentication Credentials */}
          <div id="header-actions" className="flex items-center space-x-3 shrink-0">
            {/* Cart Icon trigger */}
            <button 
              id="customer-cart-trigger"
              onClick={() => onNavigate("cart")}
              className="relative p-2.5 text-[#F9F6F0] bg-white/5 rounded-full hover:bg-white/10 hover:text-[#D46A43] transition-all duration-200 focus:outline-none group"
            >
              <ShoppingCart className="w-5.5 h-5.5" />
              {cartCount > 0 && (
                <span id="cart-badge-count" className="absolute -top-1 -right-1 bg-[#D46A43] text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow border-2 border-[#2C422F] animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Authentication Buttons / Profile Dropdown */}
            {currentUser ? (
              <div className="relative">
                <button 
                  id="user-profile-menu-trigger"
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center space-x-2 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full transition-all duration-200 focus:outline-none border border-white/10"
                >
                  <div className="w-7 h-7 rounded-full bg-[#D46A43] text-white font-bold text-xs flex items-center justify-center shadow-inner">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline text-xs font-medium tracking-wide">
                    {currentUser.name.split(" ")[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-75" />
                </button>

                {showUserDropdown && (
                  <div id="user-profile-dropdown" className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 text-gray-800 py-2 z-50 animate-fade-in font-sans">
                    <div className="px-4 py-2 border-b border-gray-100 mb-1">
                      <p className="text-xs font-semibold text-gray-900">{currentUser.name}</p>
                      <p className="text-[10px] text-gray-500 truncate">{currentUser.email}</p>
                    </div>
                    
                    <button 
                      id="dropdown-goto-cart"
                      onClick={() => { onNavigate("cart"); setShowUserDropdown(false); }}
                      className="w-full text-left px-4 py-2 text-xs hover:bg-gray-50 flex items-center space-x-2 text-gray-700 hover:text-[#2C422F]"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>My Cart</span>
                    </button>
                    
                    <button 
                      id="dropdown-goto-orders"
                      onClick={() => { onNavigate("orders"); setShowUserDropdown(false); }}
                      className="w-full text-left px-4 py-2 text-xs hover:bg-gray-50 flex items-center space-x-2 text-gray-700 hover:text-[#2C422F]"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>My Orders</span>
                    </button>

                    {currentUser.role === "admin" && (
                      <button 
                        id="dropdown-goto-admin"
                        onClick={() => { onNavigate("admin-dashboard"); setShowUserDropdown(false); }}
                        className="w-full text-left px-4 py-2 text-xs hover:bg-[#FAF7F2] flex items-center space-x-2 text-[#D46A43] font-medium"
                      >
                        <UserIcon className="w-3.5 h-3.5" />
                        <span>Go to Admin (FD)</span>
                      </button>
                    )}

                    <div className="border-t border-gray-100 my-1"></div>
                    
                    <button 
                      id="dropdown-logout-btn"
                      onClick={() => { onLogout(); setShowUserDropdown(false); }}
                      className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center space-x-2 font-medium"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div id="auth-buttons-container" className="flex items-center space-x-2">
                <button 
                  id="header-login-btn"
                  onClick={() => onNavigate("login")}
                  className="px-3.5 py-1.5 text-xs text-[#F9F6F0] hover:text-[#D46A43] font-medium tracking-wide focus:outline-none"
                >
                  Log In
                </button>
                <button 
                  id="header-register-btn"
                  onClick={() => onNavigate("register")}
                  className="bg-[#D46A43] hover:bg-[#C05C33] text-white text-xs px-4 py-2 rounded-full font-medium tracking-wide shadow-md transition-all duration-200 focus:outline-none hover:-translate-y-0.5"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
    </div>
  );
}
