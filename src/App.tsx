/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  CustomerHeader 
} from "./components/CustomerHeader";
import { 
  CustomerFooter 
} from "./components/CustomerFooter";
import { 
  ServiceDetailView 
} from "./components/ServiceDetailView";
import { 
  BookingModal 
} from "./components/BookingModal";
import { 
  AdminSidebar, AdminTab 
} from "./components/AdminSidebar";
import { 
  AdminServicesPage 
} from "./components/AdminServicesPage";
import { 
  AdminOrdersPage 
} from "./components/AdminOrdersPage";
import { 
  api 
} from "./lib/api";
import { 
  Category, Service, Package, Booking, CartItem, Order, User, ActivePageView 
} from "./types";
import { 
  Search, Info, Plus, ChevronRight, ShoppingCart, User as UserIcon, Lock, 
  Trash2, Mail, PlusCircle, CheckCircle, FileText, Calendar, Clock, Sparkles, Award, ShieldAlert, Heart, X
} from "lucide-react";

export default function App() {
  
  // NAVIGATION & ROUTING STATE
  const [view, setView] = useState<ActivePageView>("home");
  
  // CORE CATALOG DATA STATE
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<(Service & { packages: Package[] })[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [activeCategoryId, setActiveCategoryId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // CART & TRANSACTION STATE
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [guestSessionId, setGuestSessionId] = useState<string>("");

  // ACTIVE BOOKING FLOW
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingService, setBookingService] = useState<Service | null>(null);
  const [bookingPackage, setBookingPackage] = useState<Package | null>(null);

  // USER SESSION STATE
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // ADMIN PANEL NAVIGATION STATE
  const [adminTab, setAdminTab] = useState<AdminTab>("category");
  const [adminUsers, setAdminUsers] = useState<User[]>([]);

  // ADMIN VIEW DETAILS CONTROL
  const [showCatCreateModal, setShowCatCreateModal] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatImage, setNewCatImage] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");

  // LOGIN & REGISTER FORM FIELDS
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authForgotPasswordMode, setAuthForgotPasswordMode] = useState(false);

  // GUEST DETAILS CACHE
  const [guestBookingCache, setGuestBookingCache] = useState<any>(null);

  // 1. Initial Seeding and Guest Session Setup
  useEffect(() => {
    // Generate or fetch guest session ID
    let sessId = localStorage.getItem("elara_guest_session");
    if (!sessId) {
      sessId = `GUEST-${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
      localStorage.setItem("elara_guest_session", sessId);
    }
    setGuestSessionId(sessId);

    // Load initial data
    loadCatalogData();
  }, []);

  // 2. Load Cart and Orders when session / user changes
  useEffect(() => {
    const activeUserId = currentUser ? currentUser.id : guestSessionId;
    if (activeUserId) {
      loadCartAndOrders(activeUserId);
    }
  }, [currentUser, guestSessionId]);

  const loadCatalogData = async () => {
    try {
      const cats = await api.getCategories();
      setCategories(cats);

      // Load all services and their packages
      const srvs = await api.getServices();
      const enriched = await Promise.all(
        srvs.map(async (s) => {
          const detail = await api.getServiceById(s.id);
          return {
            ...s,
            packages: detail.packages || []
          };
        })
      );
      setServices(enriched);
    } catch (err) {
      console.error("Failed to load clinical catalog.", err);
    }
  };

  const loadCartAndOrders = async (userId: string) => {
    try {
      const cart = await api.getCart(userId);
      setCartItems(cart);

      if (currentUser) {
        const userOrders = await api.getOrders(currentUser.id);
        setOrders(userOrders);
      }
    } catch (err) {
      console.error("Error loading cart/orders.", err);
    }
  };

  // Auth Operations
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.login(authEmail, authPassword);
      if (res.success) {
        setCurrentUser(res.user);
        alert(`Welcome back, ${res.user.name}!`);
        setAuthEmail("");
        setAuthPassword("");
        
        if (res.user.role === "admin") {
          setAdminTab("category");
          setView("admin-dashboard");
        } else {
          setView("home");
        }
      } else {
        alert(res.message || "Invalid email or password.");
      }
    } catch (err) {
      alert("Authentication service offline.");
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.register(authName, authEmail, authPassword);
      if (res.success) {
        setCurrentUser(res.user);
        alert(`Registration successful! Welcome to Elara, ${res.user.name}.`);
        setAuthName("");
        setAuthEmail("");
        setAuthPassword("");
        setView("home");
      } else {
        alert(res.message || "Registration failed.");
      }
    } catch (err) {
      alert("Authentication service offline.");
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.forgotPassword(authEmail);
      alert(res.message);
      setAuthForgotPasswordMode(false);
    } catch (err) {
      alert("Forgot password service error.");
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setOrders([]);
    alert("You have successfully logged out.");
    setView("home");
  };

  // Cart Operations
  const handleAddToCart = async (packageId: string, qty: number) => {
    const activeUserId = currentUser ? currentUser.id : guestSessionId;
    try {
      await api.addToCart(activeUserId, packageId, qty);
      await loadCartAndOrders(activeUserId);
      alert("Selected diagnostic package successfully added to your Cart.");
    } catch (err) {
      alert("Failed to update Cart.");
    }
  };

  const handleUpdateCartQty = async (itemId: string, newQty: number) => {
    const activeUserId = currentUser ? currentUser.id : guestSessionId;
    try {
      await api.updateCartQty(itemId, newQty);
      await loadCartAndOrders(activeUserId);
    } catch (err) {
      alert("Failed to update quantity.");
    }
  };

  const handleRemoveFromCart = async (itemId: string) => {
    const activeUserId = currentUser ? currentUser.id : guestSessionId;
    try {
      await api.removeFromCart(itemId);
      await loadCartAndOrders(activeUserId);
    } catch (err) {
      alert("Failed to remove item.");
    }
  };

  // Booking Modal Triggers
  const handleTriggerBooking = (packageId: string) => {
    // Find service and package
    const foundSrv = services.find(s => s.packages.some(p => p.id === packageId));
    const foundPkg = foundSrv?.packages.find(p => p.id === packageId);
    
    if (foundSrv && foundPkg) {
      setBookingService(foundSrv);
      setBookingPackage(foundPkg);
      setBookingModalOpen(true);
    }
  };

  const handleConfirmBookingModal = async (details: {
    date: string;
    timeSlot: string;
    bookingFor: "self" | "family_member";
    firstName: string;
    lastName: string;
    remark: string;
    guestEmail?: string;
    addToCartOnly: boolean;
  }) => {
    setBookingModalOpen(false);
    
    // Create the booking metadata payload
    const activeUserId = currentUser ? currentUser.id : guestSessionId;
    const targetPackageId = bookingPackage!.id;

    if (details.addToCartOnly) {
      // Add booking data as a custom parameter if guest, and place package in Cart
      try {
        await api.addToCart(activeUserId, targetPackageId, 1);
        await loadCartAndOrders(activeUserId);
        
        // Cache booking details for checkout time
        setGuestBookingCache({
          date: details.date,
          timeSlot: details.timeSlot,
          bookingFor: details.bookingFor,
          firstName: details.firstName,
          lastName: details.lastName,
          remark: details.remark,
          guestEmail: details.guestEmail
        });

        alert("Appointment scheduled and added to your Cart! Click Cart to review and checkout.");
      } catch (err) {
        alert("Failed to place booking in Cart.");
      }
    } else {
      // Direct checkout booking! Save appointment cache and route to Cart for checkout
      setGuestBookingCache({
        date: details.date,
        timeSlot: details.timeSlot,
        bookingFor: details.bookingFor,
        firstName: details.firstName,
        lastName: details.lastName,
        remark: details.remark,
        guestEmail: details.guestEmail
      });

      // Quick add to cart
      await api.addToCart(activeUserId, targetPackageId, 1);
      await loadCartAndOrders(activeUserId);
      setView("cart");
    }
  };

  // Place Order / Checkout Submit
  const handlePlaceOrderCheckout = async () => {
    const activeUserId = currentUser ? currentUser.id : guestSessionId;
    
    if (cartItems.length === 0) {
      alert("Your Cart is empty. Please add services to book.");
      return;
    }

    // Prepare items list
    const itemsPayload = cartItems.map(item => ({
      packageId: item.packageId,
      packageTitle: item.package?.title || "Diagnostic Package",
      serviceName: item.service?.name || "Clinical Diagnostics",
      mrp: item.package?.mrp || 0,
      sellingPrice: item.package?.sellingPrice || 0,
      qty: item.qty
    }));

    const subTotal = cartItems.reduce((acc, item) => acc + (item.package?.sellingPrice || 0) * item.qty, 0);

    // Gather scheduling metadata (use default values if they skipped scheduling modal)
    const bookingDetails = guestBookingCache || {
      date: "2026-07-21",
      timeSlot: "10:00 AM - 11:00 AM",
      bookingFor: "self",
      firstName: currentUser ? currentUser.name.split(" ")[0] : "Guest",
      lastName: currentUser ? currentUser.name.split(" ")[1] || "Patient" : "User",
      remark: "Direct immediate checkout request."
    };

    const orderPayload = {
      userId: currentUser ? currentUser.id : null,
      customerName: currentUser ? currentUser.name : `${bookingDetails.firstName} ${bookingDetails.lastName}`,
      customerEmail: currentUser ? currentUser.email : (bookingDetails.guestEmail || "guest@elara.ae"),
      totalAmount: subTotal,
      items: itemsPayload,
      bookingDetails
    };

    try {
      const order = await api.createOrder(orderPayload);
      alert(`Checkout successful! Your doorstep clinical visit has been booked. Order Code: ${order.orderId}`);
      
      // Reset state
      setGuestBookingCache(null);
      setCartItems([]);
      
      if (currentUser) {
        setView("orders");
        loadCartAndOrders(currentUser.id);
      } else {
        setView("home");
      }
    } catch (err) {
      alert("Checkout failed. Please review fields.");
    }
  };

  // ADMIN OPERATIONS
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName) return;
    try {
      await api.createCategory({
        name: newCatName,
        image: newCatImage || undefined,
        description: newCatDesc
      });
      alert("New diagnostic category successfully created!");
      setNewCatName("");
      setNewCatImage("");
      setNewCatDesc("");
      setShowCatCreateModal(false);
      loadCatalogData();
    } catch (err) {
      alert("Failed to create category.");
    }
  };

  const handleAdminCreateService = async (serviceData: any) => {
    await api.createService(serviceData);
    await loadCatalogData();
    alert("New clinical service published successfully.");
  };

  const handleAdminUpdateService = async (id: string, serviceData: any) => {
    await api.updateService(id, serviceData);
    await loadCatalogData();
    alert("Service catalog updated successfully.");
  };

  const handleAdminDeleteService = async (id: string) => {
    await api.deleteService(id);
    await loadCatalogData();
    alert("Service deleted successfully from catalog.");
  };

  const handleAdminUpdateOrderStatus = async (orderId: string, status: "Pending" | "Confirmed" | "Cancelled") => {
    await api.updateOrderStatus(orderId, status);
    // Reload admin orders
    const allOrds = await api.getAllOrdersForAdmin();
    // Also sync standard orders state
    setOrders(allOrds);
  };

  // Fetch admin-roles, collections, practitioners, and other panels on mount/trigger
  useEffect(() => {
    if (view === "admin-dashboard") {
      api.getAllOrdersForAdmin().then(setOrders);
      api.getRegisteredUsers().then(setAdminUsers);
    }
  }, [view]);

  // Search callbacks
  const handleSearchTerm = (term: string) => {
    setSearchQuery(term);
    if (term) {
      setActiveCategoryId("all");
    }
  };

  // NAVIGATION HELPER
  const navigateTo = (target: ActivePageView) => {
    setView(target);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Compute filtered storefront services based on Active Category Tab and Search query
  const filteredStorefrontServices = services.filter((srv) => {
    const matchesCategory = activeCategoryId === "all" || srv.categoryId === activeCategoryId;
    const matchesSearch = searchQuery === "" || 
      srv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      srv.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      srv.packages.some(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesCategory && matchesSearch && srv.status === "active";
  });

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2C422F] flex flex-col justify-between selection:bg-[#D46A43] selection:text-white antialiased">
      
      {/* ------------------------------------------------------------- */}
      {/* SECTION 1: CUSTOMER FRONTEND VIEWS */}
      {/* ------------------------------------------------------------- */}
      {view !== "admin-dashboard" && (
        <div className="flex-1 flex flex-col">
          
          {/* Header */}
          <CustomerHeader 
            currentUser={currentUser}
            cartCount={cartItems.reduce((acc, item) => acc + item.qty, 0)}
            onNavigate={navigateTo}
            onSearch={handleSearchTerm}
            onLogout={handleLogout}
          />

          {/* MAIN PAGE CONTAINER */}
          <main className="flex-grow">
            
            {/* VIEW A: HOME & CATALOG LISTINGS */}
            {(view === "home" || view === "services") && (
              <div className="animate-fade-in">
                
                {/* Hero Section */}
                <section className="relative w-full bg-[#2C422F] text-[#F9F6F0] py-16 sm:py-24 overflow-hidden border-b border-[#1E2D20]">
                  {/* Subtle geometric overlay decoration */}
                  <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#FAF7F2_1px,transparent_1px)] [background-size:16px_16px]"></div>
                  
                  <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-12 gap-12 items-center relative z-10">
                    <div className="md:col-span-7 space-y-6 text-center md:text-left">
                      <div className="inline-flex items-center space-x-2 bg-white/10 px-3.5 py-1.5 rounded-full border border-white/10">
                        <Sparkles className="w-3.5 h-3.5 text-[#D46A43]" />
                        <span className="text-[10px] tracking-widest uppercase font-semibold">Hospital-Grade Nursing Care</span>
                      </div>
                      
                      <h1 className="text-3.5xl sm:text-5xl font-display font-extrabold tracking-tight leading-tight">
                        Your All-in-One <br />
                        Platform for Booking
                      </h1>
                      
                      <p className="text-sm sm:text-base text-[#FAF7F2]/80 font-normal leading-relaxed max-w-lg">
                        Delivered Right to Your Doorstep. <br />
                        Skip the hospital clinic queues. Licensed clinical practitioners and diagnostics, scheduled on-demand.
                      </p>

                      <div className="flex flex-wrap items-center justify-center md:justify-start gap-3.5 pt-2">
                        <button 
                          id="hero-browse-btn"
                          onClick={() => {
                            setActiveCategoryId("all");
                            const catEl = document.getElementById("category-tabs-nav");
                            catEl?.scrollIntoView({ behavior: "smooth" });
                          }}
                          className="bg-[#D46A43] hover:bg-[#C05C33] text-white text-xs font-bold px-7 py-3.5 rounded-full shadow-lg transition-all duration-200 hover:-translate-y-0.5"
                        >
                          Browse for More
                        </button>
                        
                        <div className="flex items-center space-x-1 text-xs text-[#FAF7F2]/70 font-medium">
                          <CheckCircle className="w-4 h-4 text-[#D46A43]" />
                          <span>Sharjah & Dubai coverage</span>
                        </div>
                      </div>
                    </div>

                    {/* Caregiver and patient image */}
                    <div className="md:col-span-5 relative">
                      <div className="w-full h-80 sm:h-96 rounded-2xl overflow-hidden shadow-2xl border-4 border-white/5 relative">
                        <img 
                          src="https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&q=80&w=600" 
                          alt="Patient and Nurse Caregiver Home Visit" 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                        <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-xs p-4 rounded-xl shadow border border-gray-100 text-gray-800">
                          <p className="text-xs font-bold text-[#2C422F]">Registered Home Nurse Visit</p>
                          <p className="text-[10px] text-gray-500 mt-0.5">Dispatched in under 60 minutes for priority therapies.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Horizontal Category Nav Bar Section */}
                <section id="category-tabs-nav" className="bg-white border-b border-gray-200 sticky top-16 sm:top-20 z-30 shadow-xs">
                  <div className="max-w-7xl mx-auto px-4 flex items-center space-x-1.5 overflow-x-auto py-3 scrollbar-none">
                    <button
                      id="cat-tab-all"
                      onClick={() => { setActiveCategoryId("all"); setSearchQuery(""); }}
                      className={`px-4.5 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                        activeCategoryId === "all" 
                          ? "bg-[#2C422F] text-white" 
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      All Services
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        id={`cat-tab-${cat.id}`}
                        onClick={() => { setActiveCategoryId(cat.id); setSearchQuery(""); }}
                        className={`px-4.5 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                          activeCategoryId === cat.id 
                            ? "bg-[#2C422F] text-white underline decoration-[#D46A43] decoration-2 underline-offset-4" 
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </section>

                {/* Service Catalog Package Grid Section */}
                <section className="max-w-7xl mx-auto px-4 py-12">
                  <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-baseline gap-2">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold font-display text-gray-900 tracking-tight">
                        {activeCategoryId === "all" ? "Our Signature Diagnostic Services" : categories.find(c => c.id === activeCategoryId)?.name}
                      </h2>
                      <p className="text-xs text-gray-500 mt-0.5">Choose from DHA-certified options. Clinical results integrated with local health records.</p>
                    </div>
                    {searchQuery && (
                      <div className="text-xs text-gray-500 font-semibold">
                        Showing results for: <span className="text-[#D46A43]">"{searchQuery}"</span>
                      </div>
                    )}
                  </div>

                  {filteredStorefrontServices.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 shadow-2xs">
                      <p className="text-sm text-gray-400">No active healthcare services match your current selection.</p>
                      <button 
                        onClick={() => { setActiveCategoryId("all"); setSearchQuery(""); }}
                        className="mt-4 bg-[#2C422F] text-white text-xs px-4 py-2 rounded-lg font-bold"
                      >
                        Reset Filters
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredStorefrontServices.map((srv) => {
                        const defaultPkg = srv.packages[0] || { mrp: 0, sellingPrice: 0 };
                        return (
                          <div 
                            key={srv.id}
                            id={`service-card-${srv.id}`}
                            className="bg-white rounded-2xl border border-gray-150 overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col group hover:-translate-y-0.5"
                          >
                            <div className="w-full h-48 overflow-hidden relative bg-gray-50 shrink-0 cursor-pointer" onClick={() => { setSelectedServiceId(srv.id); setView("service-details"); }}>
                              <img 
                                src={srv.image} 
                                alt={srv.name} 
                                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                                referrerPolicy="no-referrer"
                              />
                              <span className="absolute top-3.5 right-3.5 bg-white/95 backdrop-blur-xs border border-gray-100 text-[#2C422F] text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                                {srv.ageGroup}
                              </span>
                            </div>

                            <div className="p-5 flex-1 flex flex-col justify-between">
                              <div className="space-y-2">
                                <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                                  {categories.find(c => c.id === srv.categoryId)?.name || "Diagnostics"}
                                </div>
                                <h3 
                                  onClick={() => { setSelectedServiceId(srv.id); setView("service-details"); }}
                                  className="text-sm font-bold font-display text-gray-950 line-clamp-1 group-hover:text-[#D46A43] cursor-pointer transition-colors"
                                >
                                  {srv.name}
                                </h3>
                                <p className="text-[11px] text-gray-500 leading-normal line-clamp-2">
                                  {srv.shortDescription}
                                </p>
                              </div>

                              {/* Price block and Book Now CTA */}
                              <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
                                <div>
                                  <span className="text-[10px] text-gray-400 line-through block">
                                    AED {defaultPkg.mrp.toFixed(2)}
                                  </span>
                                  <span className="text-sm font-extrabold text-[#D46A43]">
                                    AED {defaultPkg.sellingPrice.toFixed(2)}
                                  </span>
                                </div>

                                <div className="flex space-x-1.5">
                                  <button 
                                    onClick={() => { setSelectedServiceId(srv.id); setView("service-details"); }}
                                    className="px-3.5 py-2 text-[10px] font-bold text-[#2C422F] hover:bg-gray-50 border border-[#2C422F]/15 rounded-lg transition-colors"
                                  >
                                    Details
                                  </button>
                                  
                                  <button 
                                    id={`book-now-srv-${srv.id}`}
                                    onClick={() => handleTriggerBooking(defaultPkg.id)}
                                    className="bg-[#2C422F] hover:bg-[#1E2D20] text-white text-[11px] font-bold px-4 py-2 rounded-lg shadow-sm transition-all hover:scale-101"
                                  >
                                    Book Now
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>

              </div>
            )}

            {/* VIEW B: SERVICE DETAILS SCREEN */}
            {view === "service-details" && selectedServiceId && (
              <div className="animate-fade-in">
                {(() => {
                  const srv = services.find(s => s.id === selectedServiceId);
                  if (!srv) return <p className="text-center py-20 text-gray-400">Service profile not found.</p>;
                  return (
                    <ServiceDetailView 
                      service={srv}
                      onAddToCart={handleAddToCart}
                      onBookNow={handleTriggerBooking}
                    />
                  );
                })()}
              </div>
            )}

            {/* VIEW C: CART SCREEN */}
            {view === "cart" && (
              <div className="max-w-7xl mx-auto px-4 py-12 animate-fade-in font-sans">
                
                <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-8">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold font-display text-gray-950">My Shopping Cart</h2>
                    <p className="text-xs text-gray-500">Confirm clinical diagnostics packages before finalizing doorway schedule</p>
                  </div>
                  
                  <button 
                    onClick={() => setView("home")}
                    className="text-xs text-[#D46A43] hover:text-[#C05C33] font-bold hover:underline flex items-center"
                  >
                    Continue Shopping →
                  </button>
                </div>

                {cartItems.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 shadow-2xs space-y-4">
                    <p className="text-sm text-gray-400">Your clinical shopping cart is currently empty.</p>
                    <button 
                      onClick={() => setView("home")}
                      className="bg-[#2C422F] text-white text-xs px-5 py-2.5 rounded-xl font-bold shadow-sm"
                    >
                      Browse Diagnostic Services
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Line Items List */}
                    <div className="lg:col-span-8 space-y-4">
                      <div className="bg-white rounded-2xl border border-gray-150 overflow-hidden shadow-xs divide-y divide-gray-100">
                        {cartItems.map((item) => (
                          <div key={item.id} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-gray-50/50">
                            
                            {/* Product info */}
                            <div className="flex items-start space-x-3.5">
                              <img 
                                src={item.service?.image} 
                                alt={item.service?.name} 
                                className="w-16 h-16 object-cover rounded-xl border border-gray-200 mt-0.5 shrink-0"
                                referrerPolicy="no-referrer"
                              />
                              <div>
                                <span className="text-[9px] uppercase font-bold text-gray-400">
                                  {item.package?.serviceType || "In-person"}
                                </span>
                                <h4 className="text-xs font-bold text-gray-900 leading-tight">
                                  {item.package?.title}
                                </h4>
                                <p className="text-[11px] text-gray-500 mt-0.5">
                                  Clinical Service: {item.service?.name}
                                </p>
                              </div>
                            </div>

                            {/* Stepper & Price Column */}
                            <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6 border-t sm:border-t-0 pt-3 sm:pt-0">
                              
                              {/* Qty Stepper */}
                              <div className="flex items-center space-x-2.5 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-200/80 shadow-2xs">
                                <button 
                                  onClick={() => handleUpdateCartQty(item.id, Math.max(1, item.qty - 1))}
                                  className="w-5.5 h-5.5 bg-white text-gray-600 rounded-full border border-gray-200 hover:bg-gray-100 flex items-center justify-center font-bold"
                                >
                                  -
                                </button>
                                <span className="text-xs font-bold text-gray-900 w-4 text-center">{item.qty}</span>
                                <button 
                                  onClick={() => handleUpdateCartQty(item.id, item.qty + 1)}
                                  className="w-5.5 h-5.5 bg-white text-gray-600 rounded-full border border-gray-200 hover:bg-gray-100 flex items-center justify-center font-bold"
                                >
                                  +
                                </button>
                              </div>

                              <div className="text-right shrink-0">
                                <p className="text-xs font-extrabold text-gray-900">
                                  AED {(item.package?.sellingPrice * item.qty).toFixed(2)}
                                </p>
                                <span className="text-[10px] text-gray-400">
                                  {item.qty} x AED {item.package?.sellingPrice.toFixed(2)}
                                </span>
                              </div>

                              {/* Remove icon button */}
                              <button 
                                onClick={() => handleRemoveFromCart(item.id)}
                                className="p-1.5 rounded text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors focus:outline-none"
                                title="Remove package"
                              >
                                <Trash2 className="w-4.5 h-4.5" />
                              </button>

                            </div>

                          </div>
                        ))}
                      </div>

                      {/* Guest checkout notice if guest */}
                      {!currentUser && (
                        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-start space-x-3">
                          <Info className="w-5 h-5 text-[#D46A43] shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-bold text-amber-900">Booking as GUEST</p>
                            <p className="text-[11px] text-amber-800 leading-normal">
                              You are currently placing an order without an account. Your updates will be dispatched to the patient contact details provided during checkout. Alternatively, click "Log In" above to sync history.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Order Summary Box Column */}
                    <div className="lg:col-span-4">
                      <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-xs space-y-5">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-[#2C422F] font-display">
                          Order Summary
                        </h3>

                        <div className="space-y-3.5 border-b border-gray-100 pb-4 text-xs text-gray-600">
                          <div className="flex justify-between">
                            <span>Subtotal:</span>
                            <span className="font-bold text-gray-900">
                              AED {cartItems.reduce((acc, item) => acc + (item.package?.sellingPrice || 0) * item.qty, 0).toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-green-700 bg-green-50 px-2.5 py-1.5 rounded">
                            <span className="font-medium">Service Fee (Visit):</span>
                            <span className="font-bold uppercase tracking-wider text-[10px]">FREE</span>
                          </div>
                          <div className="flex justify-between text-[11px]">
                            <span>TAX / VAT (5%):</span>
                            <span className="font-medium text-gray-400">Included</span>
                          </div>
                        </div>

                        <div className="flex justify-between items-baseline pt-1">
                          <span className="text-xs font-bold text-gray-900">Total Booking:</span>
                          <span className="text-base font-extrabold text-[#D46A43]">
                            AED {cartItems.reduce((acc, item) => acc + (item.package?.sellingPrice || 0) * item.qty, 0).toFixed(2)}
                          </span>
                        </div>

                        {/* Booking Appointment details summary preview */}
                        {guestBookingCache && (
                          <div className="bg-green-50/40 p-3 rounded-lg border border-green-100 text-[10px] text-green-800 space-y-1">
                            <p className="font-bold uppercase">Scheduled Visit Slot:</p>
                            <p>Patient: <strong className="text-gray-900">{guestBookingCache.firstName} {guestBookingCache.lastName}</strong></p>
                            <p>Date: <strong className="text-gray-900">{guestBookingCache.date}</strong></p>
                            <p>Time: <strong className="text-gray-900">{guestBookingCache.timeSlot}</strong></p>
                          </div>
                        )}

                        <button 
                          id="cart-place-order-btn"
                          onClick={handlePlaceOrderCheckout}
                          className="w-full bg-[#2C422F] hover:bg-[#1E2D20] text-white text-xs font-bold py-3.5 rounded-xl shadow-md transition-all duration-200 hover:-translate-y-0.5 text-center"
                        >
                          Place Order
                        </button>

                        <div className="text-center pt-2">
                          <span className="text-[10px] text-gray-400 flex items-center justify-center">
                            <CheckCircle className="w-3.5 h-3.5 text-green-600 mr-1.5" />
                            Secure PCI-DSS Encrypted Gateway
                          </span>
                        </div>

                      </div>
                    </div>

                  </div>
                )}

              </div>
            )}

            {/* VIEW D: MY ORDERS HISTORY LIST */}
            {view === "orders" && (
              <div className="max-w-7xl mx-auto px-4 py-12 animate-fade-in font-sans">
                
                <div className="border-b border-gray-200 pb-4 mb-8">
                  <h2 className="text-xl sm:text-2xl font-bold font-display text-gray-950">My Orders</h2>
                  <p className="text-xs text-gray-500">Track current and past clinical home appointment visit histories.</p>
                </div>

                {orders.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 shadow-2xs">
                    <p className="text-sm text-gray-400">You haven't placed any bookings yet.</p>
                    <button 
                      onClick={() => setView("home")}
                      className="mt-4 bg-[#2C422F] text-white text-xs px-4 py-2 rounded-lg font-bold"
                    >
                      Browse Diagnostic Services
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {orders.map((ord) => (
                      <div 
                        key={ord.id}
                        className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden"
                      >
                        {/* Order card header */}
                        <div className="bg-[#FAF7F2] px-6 py-4 border-b border-gray-150 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-600">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-gray-400">Order ID</span>
                            <p className="font-extrabold text-gray-950 text-sm mt-0.5">{ord.orderId}</p>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-bold text-gray-400">Order Date</span>
                            <p className="font-medium text-gray-900 mt-0.5">
                              {new Date(ord.orderDate).toLocaleDateString("en-GB", {
                                day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
                              })}
                            </p>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-bold text-gray-400">Total Paid</span>
                            <p className="font-extrabold text-[#D46A43] text-sm mt-0.5">AED {ord.totalAmount.toFixed(2)}</p>
                          </div>
                          <div>
                            {/* status badge */}
                            <span className="text-[10px] uppercase font-bold text-gray-400 block mb-0.5">Status</span>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              ord.status === "Confirmed" 
                                ? "bg-green-100 text-green-800" 
                                : ord.status === "Pending"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-red-100 text-red-800"
                            }`}>
                              {ord.status}
                            </span>
                          </div>
                        </div>

                        {/* Order Details Body */}
                        <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
                          
                          {/* Items Column */}
                          <div className="md:col-span-8 divide-y divide-gray-100 pr-0 md:pr-6 md:border-r border-gray-100">
                            <span className="text-[10px] uppercase font-bold text-gray-400 block mb-3.5">Diagnostic Items</span>
                            <div className="space-y-4">
                              {ord.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center py-2">
                                  <div>
                                    <h4 className="text-xs font-bold text-gray-900">{item.packageTitle}</h4>
                                    <span className="text-[10px] text-gray-400">{item.serviceName}</span>
                                  </div>
                                  <div className="text-right">
                                    <span className="text-xs font-semibold text-gray-800">{item.qty} x AED {item.sellingPrice.toFixed(2)}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Scheduling Column */}
                          <div className="md:col-span-4 text-xs text-gray-600 space-y-3.5">
                            <span className="text-[10px] uppercase font-bold text-gray-400 block">Doorstep Schedule Details</span>
                            
                            {ord.bookingDetails ? (
                              <div className="space-y-2.5">
                                <div className="flex items-center space-x-2">
                                  <UserIcon className="w-4 h-4 text-gray-400 shrink-0" />
                                  <p>Patient: <strong className="text-gray-900">{ord.bookingDetails.firstName} {ord.bookingDetails.lastName}</strong></p>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Calendar className="w-4 h-4 text-[#2C422F] shrink-0" />
                                  <p>Appointment Date: <strong className="text-gray-900">{ord.bookingDetails.date}</strong></p>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Clock className="w-4 h-4 text-[#2C422F] shrink-0" />
                                  <p>Time Slot: <strong className="text-gray-900">{ord.bookingDetails.timeSlot}</strong></p>
                                </div>
                                {ord.bookingDetails.remark && (
                                  <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-100 text-[10px] italic">
                                    "{ord.bookingDetails.remark}"
                                  </div>
                                )}
                              </div>
                            ) : (
                              <p className="text-[11px] text-gray-400">Appointment specifics scheduled independently.</p>
                            )}

                            <div className="pt-3 border-t border-gray-100">
                              <span className="text-[10px] text-gray-400 block">Support Hotline:</span>
                              <p className="font-bold text-[#D46A43]">+971 (0)6 500 ELARA</p>
                            </div>
                          </div>

                        </div>
                      </div>
                    ))}
                  </div>
                )}

              </div>
            )}

            {/* VIEW E: SPLIT SCREEN LOGIN PAGE */}
            {view === "login" && (
              <div className="grid grid-cols-1 md:grid-cols-12 min-h-[calc(100vh-80px)] font-sans">
                
                {/* Left lifestyle illustration image */}
                <div className="hidden md:block md:col-span-6 relative">
                  <img 
                    src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=600" 
                    alt="Licensed Nurse Consultation" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#FAF7F2]"></div>
                </div>

                {/* Right Form Card */}
                <div className="col-span-12 md:col-span-6 flex items-center justify-center p-6 bg-[#FAF7F2]">
                  <div className="bg-white p-8 rounded-2xl border border-gray-150 shadow-md max-w-sm w-full space-y-6">
                    
                    <div className="text-center space-y-2">
                      <div className="w-12 h-12 bg-[#D46A43] rounded-full flex items-center justify-center font-bold text-white text-xl mx-auto shadow">E</div>
                      <h2 className="text-xl font-bold text-gray-900 font-display">Welcome Back</h2>
                      <p className="text-xs text-gray-500">Sign in to your account to continue</p>
                    </div>

                    {authForgotPasswordMode ? (
                      <form onSubmit={handleForgotPasswordSubmit} className="space-y-4 text-xs">
                        <div className="space-y-1">
                          <label className="font-bold text-gray-700">Registered Email Address</label>
                          <input 
                            type="email" 
                            required
                            placeholder="e.g. user@elara.ae"
                            value={authEmail}
                            onChange={(e) => setAuthEmail(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 px-3 py-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2C422F]"
                          />
                        </div>
                        <button 
                          type="submit" 
                          className="w-full bg-[#2C422F] text-white font-bold py-2.5 rounded-lg text-xs"
                        >
                          Request Reset Code
                        </button>
                        <button 
                          type="button" 
                          onClick={() => setAuthForgotPasswordMode(false)}
                          className="w-full text-center text-gray-500 hover:underline font-semibold"
                        >
                          Back to Sign In
                        </button>
                      </form>
                    ) : (
                      <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
                        <div className="space-y-1">
                          <label className="font-bold text-gray-700">Email Address</label>
                          <input 
                            id="login-email-input"
                            type="email" 
                            required
                            placeholder="e.g. user@elara.ae"
                            value={authEmail}
                            onChange={(e) => setAuthEmail(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 px-3 py-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2C422F]"
                          />
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between items-baseline">
                            <label className="font-bold text-gray-700">Password</label>
                            <button 
                              type="button" 
                              onClick={() => setAuthForgotPasswordMode(true)}
                              className="text-[10px] text-[#D46A43] font-bold hover:underline"
                            >
                              Forgot Password?
                            </button>
                          </div>
                          <input 
                            id="login-password-input"
                            type="password" 
                            required
                            placeholder="••••••••"
                            value={authPassword}
                            onChange={(e) => setAuthPassword(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 px-3 py-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2C422F]"
                          />
                        </div>

                        <div className="flex items-center">
                          <input 
                            type="checkbox" 
                            id="remember-me" 
                            className="rounded text-[#2C422F] focus:ring-[#2C422F] h-4 w-4"
                          />
                          <label htmlFor="remember-me" className="ml-2 text-gray-600 text-[11px] cursor-pointer">
                            Remember Me
                          </label>
                        </div>

                        <button 
                          id="login-submit-btn"
                          type="submit" 
                          className="w-full bg-[#2C422F] hover:bg-[#1E2D20] text-white font-bold py-3 rounded-lg text-xs shadow transition-all duration-200"
                        >
                          Log In
                        </button>
                      </form>
                    )}

                    <div className="text-center text-xs text-gray-500 border-t border-gray-100 pt-4">
                      Don't have an account?{" "}
                      <button 
                        onClick={() => setView("register")}
                        className="text-[#D46A43] font-bold hover:underline"
                      >
                        Register
                      </button>
                    </div>

                  </div>
                </div>

              </div>
            )}

            {/* VIEW F: REGISTER PAGE */}
            {view === "register" && (
              <div className="grid grid-cols-1 md:grid-cols-12 min-h-[calc(100vh-80px)] font-sans">
                
                {/* Left lifestyle illustration image */}
                <div className="hidden md:block md:col-span-6 relative">
                  <img 
                    src="https://images.unsplash.com/photo-1579154204601-01588f351167?auto=format&fit=crop&q=80&w=600" 
                    alt="Early Detection Diagnostics" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#FAF7F2]"></div>
                </div>

                {/* Right Form Card */}
                <div className="col-span-12 md:col-span-6 flex items-center justify-center p-6 bg-[#FAF7F2]">
                  <div className="bg-white p-8 rounded-2xl border border-gray-150 shadow-md max-w-sm w-full space-y-6">
                    
                    <div className="text-center space-y-2">
                      <div className="w-12 h-12 bg-[#D46A43] rounded-full flex items-center justify-center font-bold text-white text-xl mx-auto shadow">E</div>
                      <h2 className="text-xl font-bold text-gray-900 font-display">Create Patient Account</h2>
                      <p className="text-xs text-gray-500">Register with Elara for integrated health records</p>
                    </div>

                    <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
                      <div className="space-y-1">
                        <label className="font-bold text-gray-700">Full Name</label>
                        <input 
                          id="register-name-input"
                          type="text" 
                          required
                          placeholder="e.g. John Doe"
                          value={authName}
                          onChange={(e) => setAuthName(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 px-3 py-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2C422F]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-gray-700">Email Address</label>
                        <input 
                          id="register-email-input"
                          type="email" 
                          required
                          placeholder="e.g. user@elara.ae"
                          value={authEmail}
                          onChange={(e) => setAuthEmail(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 px-3 py-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2C422F]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-gray-700">Create Password</label>
                        <input 
                          id="register-password-input"
                          type="password" 
                          required
                          placeholder="••••••••"
                          value={authPassword}
                          onChange={(e) => setAuthPassword(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 px-3 py-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2C422F]"
                        />
                      </div>

                      <button 
                        id="register-submit-btn"
                        type="submit" 
                        className="w-full bg-[#2C422F] hover:bg-[#1E2D20] text-white font-bold py-3 rounded-lg text-xs shadow transition-all duration-200"
                      >
                        Create Account
                      </button>
                    </form>

                    <div className="text-center text-xs text-gray-500 border-t border-gray-100 pt-4">
                      Already have an account?{" "}
                      <button 
                        onClick={() => setView("login")}
                        className="text-[#D46A43] font-bold hover:underline"
                      >
                        Log In
                      </button>
                    </div>

                  </div>
                </div>

              </div>
            )}

            {/* VIEW G: ADMIN AUTH LOGIN */}
            {view === "admin-login" && (
              <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-[#1E2D20] p-4 text-[#F9F6F0] font-sans">
                <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/15 max-w-sm w-full space-y-6 text-xs text-white">
                  
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-[#D46A43] rounded-xl flex items-center justify-center font-bold text-white text-xl mx-auto shadow-md">FD</div>
                    <h2 className="text-lg font-bold font-display uppercase tracking-widest text-[#D46A43]">FD Operator Authenticate</h2>
                    <p className="text-[11px] text-white/70">Secure Administrative Personnel Portal gateway</p>
                  </div>

                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <div className="space-y-1">
                      <label className="font-bold text-white/80">Staff Identifier (Email)</label>
                      <input 
                        id="admin-login-email"
                        type="email" 
                        required
                        placeholder="e.g. admin@elara.ae"
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 px-3 py-2.5 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-[#D46A43]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-white/80">Security Token (Password)</label>
                      <input 
                        id="admin-login-password"
                        type="password" 
                        required
                        placeholder="••••••••"
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 px-3 py-2.5 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-[#D46A43]"
                      />
                    </div>

                    <button 
                      id="admin-authenticate-submit"
                      type="submit" 
                      className="w-full bg-[#D46A43] hover:bg-[#C05C33] text-white font-extrabold py-3 rounded-lg text-xs uppercase tracking-wider shadow-md transition-all duration-200"
                    >
                      Authenticate System
                    </button>
                  </form>

                  <div className="text-center border-t border-white/5 pt-4">
                    <button 
                      onClick={() => setView("home")}
                      className="text-white/60 hover:text-[#D46A43] hover:underline text-[11px]"
                    >
                      ← Return to Storefront Public Site
                    </button>
                  </div>

                </div>
              </div>
            )}

          </main>

          {/* Footer */}
          <CustomerFooter 
            categories={categories}
            onSelectCategory={(catId) => {
              setActiveCategoryId(catId);
              setView("home");
              const el = document.getElementById("category-tabs-nav");
              el?.scrollIntoView({ behavior: "smooth" });
            }}
            onNavigatePage={(pg) => {
              if (pg === "admin-login") setView("admin-login");
              else setView("home");
            }}
          />

          {/* Schedulers Modal Overlay */}
          <BookingModal 
            isOpen={bookingModalOpen}
            onClose={() => setBookingModalOpen(false)}
            service={bookingService}
            selectedPackage={bookingPackage}
            onConfirmBooking={handleConfirmBookingModal}
            onToggleLogin={() => setView("login")}
            isLoggedIn={!!currentUser}
          />

        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SECTION 2: ADMINISTRATIVE FD PANEL (FULL ADMIN DESKTOP VIEW) */}
      {/* ------------------------------------------------------------- */}
      {view === "admin-dashboard" && (
        <div className="min-h-screen bg-gray-50 flex font-sans animate-fade-in text-gray-800">
          
          {/* Left Fixed Sidebar layout */}
          <AdminSidebar 
            activeTab={adminTab}
            onSelectTab={setAdminTab}
            adminName={currentUser?.name || "System Administrator"}
            onLogout={handleLogout}
          />

          {/* Right Workspace container */}
          <div className="flex-1 flex flex-col h-screen overflow-y-auto">
            
            {/* Top Workspace Header Bar */}
            <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shrink-0 sticky top-0 z-10 shadow-3xs">
              <div className="flex items-center space-x-2.5">
                <span className="text-xs font-bold text-[#D46A43] uppercase tracking-widest bg-gray-100 px-2.5 py-1 rounded">Language: English</span>
                <span className="text-gray-300">|</span>
                <span className="text-xs text-gray-400 font-medium">FD Dashboard System Management Control</span>
              </div>

              {/* Status indicators */}
              <div className="flex items-center space-x-4">
                <div className="relative cursor-pointer hover:bg-gray-100 p-1.5 rounded-full" onClick={() => alert("No system alerts logged.")}>
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 absolute top-1 right-1"></div>
                  <span className="text-gray-600 block text-xs">🔔 Alerts</span>
                </div>
                
                <div className="flex items-center space-x-2 border-l pl-4">
                  <div className="w-6.5 h-6.5 rounded-full bg-[#2C422F] text-white flex items-center justify-center font-bold text-[11px]">
                    AD
                  </div>
                  <span className="text-xs font-bold text-gray-700">Admin Staff</span>
                </div>
              </div>
            </header>

            {/* Main view panel body switcher */}
            <main className="flex-1 overflow-y-auto">
              
              {/* TAB 1: CATEGORIES CRUD VIEW */}
              {adminTab === "category" && (
                <div className="p-6 space-y-6">
                  <div className="flex justify-between items-center border-b border-gray-100 pb-5">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 font-display">Category Listings</h2>
                      <p className="text-xs text-gray-500">Monitor active clinical diagnostics categories and configure visual directories.</p>
                    </div>

                    <button 
                      id="admin-create-cat-trigger"
                      onClick={() => setShowCatCreateModal(true)}
                      className="bg-[#2C422F] hover:bg-[#1E2D20] text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow-sm flex items-center space-x-1"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Create New Category</span>
                    </button>
                  </div>

                  {/* Grid displays */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories.map((cat, idx) => {
                      const associatedCount = services.filter(s => s.categoryId === cat.id).length;
                      return (
                        <div key={cat.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-2xs flex flex-col justify-between p-5">
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-gray-400 font-bold text-xs">S.No: {idx + 1}</span>
                              <span className="text-[10px] bg-[#D46A43]/15 text-[#D46A43] font-bold px-2 py-0.5 rounded-full">
                                {associatedCount} active services
                              </span>
                            </div>
                            
                            <img 
                              src={cat.image} 
                              alt={cat.name} 
                              className="w-full h-32 object-cover rounded-lg border border-gray-100 mb-4 bg-gray-50"
                              referrerPolicy="no-referrer"
                            />
                            
                            <h3 className="font-bold text-gray-950 font-display text-sm">{cat.name}</h3>
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">{cat.description}</p>
                          </div>

                          <div className="pt-4 border-t border-dashed border-gray-100 mt-4 flex items-center justify-between">
                            <span className="text-[10px] text-gray-400">UID: {cat.id}</span>
                            <button 
                              onClick={() => alert(`Direct editing for Category ${cat.name} is scheduled for Version 1.1.`)}
                              className="text-xs text-[#2C422F] hover:underline font-bold"
                            >
                              Config Details →
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* CATEGORY CREATE MODAL VIEW */}
                  {showCatCreateModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                      <div id="category-create-modal" className="bg-white rounded-2xl border border-gray-150 shadow-2xl max-w-sm w-full p-6 text-xs text-gray-700 space-y-4">
                        
                        <div className="flex justify-between items-center border-b pb-2">
                          <h3 className="text-sm font-bold text-gray-900 font-display">Category Create</h3>
                          <button onClick={() => setShowCatCreateModal(false)} className="text-gray-500 hover:text-black focus:outline-none">
                            <X className="w-5 h-5" />
                          </button>
                        </div>

                        <form onSubmit={handleCreateCategory} className="space-y-4">
                          <div className="space-y-1">
                            <label className="font-bold text-gray-700">Category Name *</label>
                            <input 
                              id="cat-name-input"
                              type="text"
                              required
                              placeholder="e.g. Genetic Tests"
                              value={newCatName}
                              onChange={(e) => setNewCatName(e.target.value)}
                              className="w-full bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2C422F]"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="font-bold text-gray-700">Image Asset URL / Path</label>
                            <input 
                              type="text"
                              placeholder="Paste visual thumbnail URL address"
                              value={newCatImage}
                              onChange={(e) => setNewCatImage(e.target.value)}
                              className="w-full bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2C422F]"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="font-bold text-gray-700">Description / Clinical scope</label>
                            <textarea 
                              placeholder="Type in core laboratory diagnostics scope details..."
                              value={newCatDesc}
                              onChange={(e) => setNewCatDesc(e.target.value)}
                              rows={3}
                              className="w-full bg-gray-50 border border-gray-200 p-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2C422F] resize-none"
                            ></textarea>
                          </div>

                          <div className="flex items-center justify-end space-x-2 pt-2 border-t">
                            <button 
                              type="button" 
                              onClick={() => setShowCatCreateModal(false)}
                              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-lg"
                            >
                              Cancel
                            </button>
                            <button 
                              id="cat-save-publish-btn"
                              type="submit"
                              className="bg-[#2C422F] hover:bg-[#1E2D20] text-white font-bold px-4 py-2 rounded-lg shadow-xs"
                            >
                              Save & Publish
                            </button>
                          </div>
                        </form>

                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* TAB 2: SERVICES CATALOG LISTINGS & COMPLEX REPEATABLE FORM */}
              {adminTab === "services" && (
                <AdminServicesPage 
                  services={services}
                  categories={categories}
                  onCreateService={handleAdminCreateService}
                  onUpdateService={handleAdminUpdateService}
                  onDeleteService={handleAdminDeleteService}
                />
              )}

              {/* TAB 3: TRANSACTIONS AND VISITS ORDERS LIST TRACKER */}
              {adminTab === "orders" && (
                <AdminOrdersPage 
                  orders={orders}
                  onUpdateStatus={handleAdminUpdateOrderStatus}
                />
              )}

              {/* TAB 4: REGISTERED USERS SYSTEM VIEW */}
              {adminTab === "registered-users" && (
                <div className="p-6 space-y-6">
                  <div className="border-b border-gray-100 pb-5">
                    <h2 className="text-xl font-bold text-gray-900 font-display">Registered Patients & Staff</h2>
                    <p className="text-xs text-gray-500">Overview of active patient profiles, secure identifiers, registration records, and system roles.</p>
                  </div>

                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-[#FAF7F2] border-b border-gray-200 text-gray-700 text-xs uppercase font-semibold">
                        <tr>
                          <th className="py-3 px-4 font-bold">S.No</th>
                          <th className="py-3 px-4 font-bold">Patient Name</th>
                          <th className="py-3 px-4 font-bold">Email Address</th>
                          <th className="py-3 px-4 font-bold">System Role</th>
                          <th className="py-3 px-4 font-bold">Registration Date</th>
                        </tr>
                      </thead>
                      <tbody className="text-xs divide-y divide-gray-100 text-gray-600">
                        {adminUsers.map((u, idx) => (
                          <tr key={u.id} className="hover:bg-gray-50/50">
                            <td className="py-3.5 px-4 font-semibold text-gray-400">{idx + 1}</td>
                            <td className="py-3.5 px-4 font-bold text-gray-950">{u.name}</td>
                            <td className="py-3.5 px-4 text-gray-600">{u.email}</td>
                            <td className="py-3.5 px-4">
                              <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                                u.role === "admin" ? "bg-red-50 text-red-700 border border-red-100" : "bg-green-50 text-green-700 border border-green-100"
                              }`}>
                                {u.role}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-gray-400">
                              {new Date(u.createdAt).toLocaleDateString("en-GB", {
                                day: "2-digit", month: "short", year: "numeric"
                              })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TABS 5 - 12: INFORMATIONAL placeholder dashboards for workflow completeness */}
              {!["category", "services", "orders", "registered-users"].includes(adminTab) && (
                <div className="p-8 max-w-2xl mx-auto text-center space-y-5 animate-fade-in text-xs text-gray-500">
                  <div className="w-16 h-16 rounded-full bg-[#FAF7F2] text-[#D46A43] flex items-center justify-center mx-auto shadow-inner border border-gray-100">
                    <ShieldAlert className="w-8 h-8" />
                  </div>
                  
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest font-display">
                      {adminTab.replace("-", " ")} Workspace Panel
                    </h3>
                    <p className="text-[11px] text-gray-400">Workflow is active and monitored under Clinical DHA Guideline Registry.</p>
                  </div>

                  <div className="p-5 bg-white border border-gray-200 rounded-xl shadow-2xs text-left space-y-3 max-w-sm mx-auto">
                    <span className="text-[10px] font-bold uppercase text-[#D46A43] tracking-widest block">Operational Metrics</span>
                    <ul className="space-y-2 text-gray-600 leading-normal list-disc pl-4">
                      <li>Resource allocations are synchronized to local Sharjah regional hospitals automatically.</li>
                      <li>To configure clinical credentials or allocate duty physicians, submit a request file directly through the administrative settings panel.</li>
                      <li>Collected payments are audited each evening at 23:59 UTC.</li>
                    </ul>
                  </div>

                  <p className="text-[10px] text-gray-400 italic">Elara Administrative Dashboard • Version 1.0.4 Live</p>
                </div>
              )}

            </main>

          </div>

        </div>
      )}

    </div>
  );
}
