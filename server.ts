/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { 
  User, Category, Service, Package, Booking, CartItem, Order, Review, OrderItem
} from "./src/types";

// Database storage file
const DB_FILE = path.join(process.cwd(), "db.json");

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substring(2, 11).toUpperCase();

// Helper to generate public order hashes
const generateOrderCode = () => `EL-${Math.floor(1000 + Math.random() * 9000)}-${Math.random().toString(36).substring(2, 4).toUpperCase()}`;

// Database Interface
interface DatabaseSchema {
  users: User[];
  categories: Category[];
  services: Service[];
  packages: Package[];
  bookings: Booking[];
  cart: CartItem[];
  orders: Order[];
  reviews: Review[];
}

// Seed helper images
const IMAGES = {
  genetic: "https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?auto=format&fit=crop&q=80&w=600",
  cancer: "https://images.unsplash.com/photo-1579154204601-01588f351167?auto=format&fit=crop&q=80&w=600",
  doctor: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=600",
  wellness: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=600",
  nurse: "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&q=80&w=600",
  others: "https://images.unsplash.com/photo-1511174511562-5f7f18b874f8?auto=format&fit=crop&q=80&w=600",
};

// Initial database seed
const INITIAL_DATABASE: DatabaseSchema = {
  users: [
    {
      id: "USR-001",
      name: "John Doe",
      email: "user@elara.ae",
      passwordHash: "password123", // Keep simple plain comparisons to avoid compile-time binary requirements of bcrypt
      role: "customer",
      createdAt: new Date().toISOString()
    },
    {
      id: "USR-ADMIN",
      name: "Elara System Admin",
      email: "admin@elara.ae",
      passwordHash: "admin123",
      role: "admin",
      createdAt: new Date().toISOString()
    }
  ],
  categories: [
    {
      id: "cat-1",
      name: "Genetic Tests",
      image: IMAGES.genetic,
      description: "Advanced DNA profiling to understand your unique predispositions and health response."
    },
    {
      id: "cat-2",
      name: "Cancer Screening",
      image: IMAGES.cancer,
      description: "Early-detection diagnostic screens and specialized cancer markers."
    },
    {
      id: "cat-3",
      name: "Doctor Visit At Home",
      image: IMAGES.doctor,
      description: "Licensed general practitioners and geriatric specialists visiting you directly."
    },
    {
      id: "cat-4",
      name: "Wellness Programs",
      image: IMAGES.wellness,
      description: "Preventative vital metrics, lipid profiles, and health optimization packages."
    },
    {
      id: "cat-5",
      name: "Nurse Care",
      image: IMAGES.nurse,
      description: "Post-surgical recovery assistance, IV therapies, and dedicated home nursing."
    },
    {
      id: "cat-6",
      name: "Others",
      image: IMAGES.others,
      description: "Food intolerance panels, general diagnostic lab tests, and customizable checks."
    }
  ],
  services: [
    {
      id: "srv-101",
      name: "DNA Ancestry & Health Profiling",
      categoryId: "cat-1",
      ageGroup: "All Ages",
      gender: "All",
      image: "https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?auto=format&fit=crop&q=80&w=600",
      shortDescription: "Unlock your DNA secrets. Learn about health risks and carrier status.",
      longDescription: "This premium sequencing test looks at 150+ genetic variations. Includes an personalized report discussing nutritional requirements, skin condition risk, cardiometabolic traits, and genetic ancestry mapping. Requires a simple saliva collection done in-person.",
      status: "active"
    },
    {
      id: "srv-102",
      name: "Pharmacogenomics Screening",
      categoryId: "cat-1",
      ageGroup: "Adults",
      gender: "All",
      image: "https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&q=80&w=600",
      shortDescription: "Discover how your genes affect your medication responses.",
      longDescription: "Avoid the trial-and-error approach to prescriptions. Our screening identifies how your liver enzymes metabolize common cardiovascular, psychiatric, and pain management drugs to fine-tune therapeutic outcomes.",
      status: "active"
    },
    {
      id: "srv-201",
      name: "Comprehensive Multi-Cancer Screen",
      categoryId: "cat-2",
      ageGroup: "Adults",
      gender: "All",
      image: "https://images.unsplash.com/photo-1579154204601-01588f351167?auto=format&fit=crop&q=80&w=600",
      shortDescription: "Early detection markers for breast, lung, colorectal and prostate cancers.",
      longDescription: "A multi-marker assay designed to screen serum markers (CEA, CA19-9, CA125, PSA/CA15-3). Recommended for individuals over 35 or those with family histories of neoplastic conditions. Simple blood draw required.",
      status: "active"
    },
    {
      id: "srv-301",
      name: "General Practitioner Home Consultation",
      categoryId: "cat-3",
      ageGroup: "All Ages",
      gender: "All",
      image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=600",
      shortDescription: "Professional GP clinical consultation in the comfort of your living room.",
      longDescription: "Don't queue at hospitals. Our DHA-licensed general practitioners come fully equipped with medical kits to diagnose common respiratory, gastrointestinal, and metabolic concerns, issue prescriptions, and order diagnostic labs directly.",
      status: "active"
    },
    {
      id: "srv-401",
      name: "Advanced Lipid & Heart Health Check",
      categoryId: "cat-4",
      ageGroup: "Adults",
      gender: "All",
      image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=600",
      shortDescription: "Complete cardiovascular lipid profile with expert risk commentary.",
      longDescription: "Check ApoA, ApoB, hs-CRP, and LDL subclasses to obtain a true vascular risk profile. Fasting for 10 hours is required. Includes a telehealth consultation with a certified cardiologist.",
      status: "active"
    },
    {
      id: "srv-501",
      name: "Intravenous (IV) Hydration & Vitamin Therapy",
      categoryId: "cat-5",
      ageGroup: "Adults",
      gender: "All",
      image: "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&q=80&w=600",
      shortDescription: "Express hydration, cellular detox and high-dose Vitamin C drip.",
      longDescription: "Administered by experienced critical care nurses, this infusion contains optimized levels of glutathione, B-Complex, Vitamin C, and essential minerals to combat fatigue and bolster immune function.",
      status: "active"
    },
    {
      id: "srv-601",
      name: "Comprehensive Food Intolerance Panel",
      categoryId: "cat-6",
      ageGroup: "All Ages",
      gender: "All",
      image: "https://images.unsplash.com/photo-1511174511562-5f7f18b874f8?auto=format&fit=crop&q=80&w=600",
      shortDescription: "Test IgG antibodies against 220+ European and Middle-Eastern foodstuffs.",
      longDescription: "Identify hidden triggers behind chronic bloating, brain fog, and skin issues. Standardized lab analysis provides a detailed traffic-light dietary recommendation report and personalized replacement menu.",
      status: "active"
    }
  ],
  packages: [
    {
      id: "pkg-1",
      serviceId: "srv-101",
      title: "Essential Ancestry & Health",
      mrp: 598.97,
      sellingPrice: 234.00,
      serviceType: "In-person"
    },
    {
      id: "pkg-2",
      serviceId: "srv-101",
      title: "Elite DNA Sequence + Diet Masterclass",
      mrp: 999.00,
      sellingPrice: 499.00,
      serviceType: "In-person"
    },
    {
      id: "pkg-3",
      serviceId: "srv-102",
      title: "Standard Drug-Response Match",
      mrp: 750.00,
      sellingPrice: 380.00,
      serviceType: "In-person"
    },
    {
      id: "pkg-4",
      serviceId: "srv-201",
      title: "Male Multi-Cancer Screen",
      mrp: 850.00,
      sellingPrice: 420.00,
      serviceType: "In-person"
    },
    {
      id: "pkg-5",
      serviceId: "srv-201",
      title: "Female Multi-Cancer Screen (incl. BRCA)",
      mrp: 1250.00,
      sellingPrice: 650.00,
      serviceType: "In-person"
    },
    {
      id: "pkg-6",
      serviceId: "srv-301",
      title: "Home Visit Consultation (Single Patient)",
      mrp: 350.00,
      sellingPrice: 199.00,
      serviceType: "In-person"
    },
    {
      id: "pkg-7",
      serviceId: "srv-301",
      title: "Family Consultation Bundle (up to 3 members)",
      mrp: 800.00,
      sellingPrice: 399.00,
      serviceType: "In-person"
    },
    {
      id: "pkg-8",
      serviceId: "srv-401",
      title: "Core Lipid Panel + Doctor Consultation",
      mrp: 450.00,
      sellingPrice: 220.00,
      serviceType: "In-person"
    },
    {
      id: "pkg-9",
      serviceId: "srv-501",
      title: "Glow & Detox (Glutathione Boost)",
      mrp: 500.00,
      sellingPrice: 280.00,
      serviceType: "In-person"
    },
    {
      id: "pkg-10",
      serviceId: "srv-601",
      title: "Complete 220+ Food IgG Test",
      mrp: 990.00,
      sellingPrice: 480.00,
      serviceType: "In-person"
    }
  ],
  bookings: [
    {
      id: "BKG-1",
      serviceId: "srv-101",
      packageId: "pkg-1",
      userId: "USR-001",
      date: "2026-07-20",
      timeSlot: "09:00 AM - 10:00 AM",
      bookingFor: "self",
      firstName: "John",
      lastName: "Doe",
      remark: "Has a slight latex allergy.",
      status: "Confirmed"
    }
  ],
  cart: [],
  orders: [
    {
      id: "ORD-001",
      orderId: "EL-8245-QA",
      userId: "USR-001",
      customerName: "John Doe",
      customerEmail: "user@elara.ae",
      totalAmount: 234.00,
      status: "Confirmed",
      orderDate: "2026-07-12T14:30:00Z",
      items: [
        {
          packageId: "pkg-1",
          packageTitle: "Essential Ancestry & Health",
          serviceName: "DNA Ancestry & Health Profiling",
          mrp: 598.97,
          sellingPrice: 234.00,
          qty: 1
        }
      ],
      bookingDetails: {
        date: "2026-07-20",
        timeSlot: "09:00 AM - 10:00 AM",
        bookingFor: "self",
        firstName: "John",
        lastName: "Doe",
        remark: "Has a slight latex allergy."
      }
    }
  ],
  reviews: [
    {
      id: "REV-1",
      serviceId: "srv-101",
      userId: "USR-001",
      userName: "John Doe",
      rating: 5,
      comment: "Highly professional service! The practitioner visited right on time and walked me through the process seamlessly.",
      createdAt: "2026-07-12T18:00:00Z"
    }
  ]
};

// Database utility class
class JSONDatabase {
  private data: DatabaseSchema;

  constructor() {
    this.data = { ...INITIAL_DATABASE };
    this.load();
  }

  private load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, "utf-8");
        const parsed = JSON.parse(fileContent);
        // Merge with initial just in case fields are missing
        this.data = {
          users: parsed.users || INITIAL_DATABASE.users,
          categories: parsed.categories || INITIAL_DATABASE.categories,
          services: parsed.services || INITIAL_DATABASE.services,
          packages: parsed.packages || INITIAL_DATABASE.packages,
          bookings: parsed.bookings || INITIAL_DATABASE.bookings,
          cart: parsed.cart || INITIAL_DATABASE.cart,
          orders: parsed.orders || INITIAL_DATABASE.orders,
          reviews: parsed.reviews || INITIAL_DATABASE.reviews,
        };
        console.log("Database successfully loaded from", DB_FILE);
      } else {
        this.save();
        console.log("Database file created and seeded with defaults.");
      }
    } catch (e) {
      console.error("Failed to load database. Using seeded values instead.", e);
    }
  }

  public save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), "utf-8");
    } catch (e) {
      console.error("Failed to save database to disk:", e);
    }
  }

  // Getters
  public getUsers() { return this.data.users; }
  public getCategories() { return this.data.categories; }
  public getServices() { return this.data.services; }
  public getPackages() { return this.data.packages; }
  public getBookings() { return this.data.bookings; }
  public getCart() { return this.data.cart; }
  public getOrders() { return this.data.orders; }
  public getReviews() { return this.data.reviews; }

  // Setters & Mutators
  public addUser(user: User) {
    this.data.users.push(user);
    this.save();
  }

  public addCategory(cat: Category) {
    this.data.categories.push(cat);
    this.save();
  }

  public addService(srv: Service) {
    this.data.services.push(srv);
    this.save();
  }

  public updateService(id: string, srv: Partial<Service>) {
    const idx = this.data.services.findIndex(s => s.id === id);
    if (idx !== -1) {
      this.data.services[idx] = { ...this.data.services[idx], ...srv };
      this.save();
      return this.data.services[idx];
    }
    return null;
  }

  public deleteService(id: string) {
    this.data.services = this.data.services.filter(s => s.id !== id);
    // clean up associated packages
    this.data.packages = this.data.packages.filter(p => p.serviceId !== id);
    this.save();
  }

  public addPackage(pkg: Package) {
    this.data.packages.push(pkg);
    this.save();
  }

  public setPackagesForService(serviceId: string, packages: Omit<Package, 'serviceId'>[]) {
    // Clear existing
    this.data.packages = this.data.packages.filter(p => p.serviceId !== serviceId);
    // Add new ones
    packages.forEach(p => {
      this.data.packages.push({
        id: p.id || `pkg-${generateId()}`,
        serviceId,
        title: p.title,
        mrp: p.mrp,
        sellingPrice: p.sellingPrice,
        serviceType: p.serviceType
      });
    });
    this.save();
  }

  public addBooking(bkg: Booking) {
    this.data.bookings.push(bkg);
    this.save();
  }

  public getCartForUser(userId: string) {
    return this.data.cart.filter(item => item.userId === userId);
  }

  public addToCart(userId: string, packageId: string, qty: number) {
    const existing = this.data.cart.find(c => c.userId === userId && c.packageId === packageId);
    if (existing) {
      existing.qty += qty;
    } else {
      this.data.cart.push({
        id: `CRT-${generateId()}`,
        userId,
        packageId,
        qty
      });
    }
    this.save();
    return this.getCartForUser(userId);
  }

  public updateCartQty(id: string, qty: number) {
    const item = this.data.cart.find(c => c.id === id);
    if (item) {
      item.qty = qty;
      this.save();
    }
    return item;
  }

  public removeFromCart(id: string) {
    this.data.cart = this.data.cart.filter(c => c.id !== id);
    this.save();
  }

  public clearCart(userId: string) {
    this.data.cart = this.data.cart.filter(c => c.userId !== userId);
    this.save();
  }

  public addOrder(ord: Order) {
    this.data.orders.push(ord);
    this.save();
  }

  public updateOrderStatus(id: string, status: "Pending" | "Confirmed" | "Cancelled") {
    const ord = this.data.orders.find(o => o.id === id || o.orderId === id);
    if (ord) {
      ord.status = status;
      this.save();
    }
    return ord;
  }

  public addReview(rev: Review) {
    this.data.reviews.push(rev);
    this.save();
  }
}

// Instantiate Database
const db = new JSONDatabase();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for body parsing and standard headers
  app.use(express.json());

  // ==========================================
  // API ENDPOINTS
  // ==========================================

  // AUTH API
  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    const user = db.getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (user && user.passwordHash === password) {
      // In this environment, we can respond with a direct user details payload 
      // containing user role to keep the auth simulation simple, highly robust, and perfectly responsive.
      res.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        token: `mock-jwt-token-for-${user.id}`
      });
    } else {
      res.status(401).json({ success: false, message: "Invalid email or password." });
    }
  });

  app.post("/api/auth/register", (req, res) => {
    const { name, email, password } = req.body;
    
    const existing = db.getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(400).json({ success: false, message: "Email is already registered." });
    }

    const newUser: User = {
      id: `USR-${generateId()}`,
      name,
      email,
      passwordHash: password, // simple store
      role: "customer",
      createdAt: new Date().toISOString()
    };

    db.addUser(newUser);

    res.json({
      success: true,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      },
      token: `mock-jwt-token-for-${newUser.id}`
    });
  });

  app.post("/api/auth/forgot-password", (req, res) => {
    const { email } = req.body;
    const user = db.getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      res.json({ success: true, message: "A password reset link has been dispatched to your email address." });
    } else {
      res.status(404).json({ success: false, message: "No registered user found with that email address." });
    }
  });

  // CATEGORIES API
  app.get("/api/categories", (req, res) => {
    res.json(db.getCategories());
  });

  app.post("/api/categories", (req, res) => {
    const { name, description, image } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Category name is required" });
    }
    const newCat: Category = {
      id: `cat-${generateId()}`,
      name,
      description: description || "",
      image: image || IMAGES.others
    };
    db.addCategory(newCat);
    res.json(newCat);
  });

  // SERVICES API
  app.get("/api/services", (req, res) => {
    const { category } = req.query;
    let list = db.getServices();
    if (category) {
      list = list.filter(s => s.categoryId === category);
    }
    res.json(list);
  });

  app.get("/api/services/:id", (req, res) => {
    const service = db.getServices().find(s => s.id === req.params.id);
    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }
    // Join packages and reviews
    const packages = db.getPackages().filter(p => p.serviceId === service.id);
    const reviews = db.getReviews().filter(r => r.serviceId === service.id);
    res.json({
      ...service,
      packages,
      reviews
    });
  });

  app.post("/api/services", (req, res) => {
    const { name, categoryId, ageGroup, gender, image, shortDescription, longDescription, status, packages } = req.body;
    if (!name || !categoryId) {
      return res.status(400).json({ error: "Service name and Category are required." });
    }

    const serviceId = `srv-${generateId()}`;
    const newSrv: Service = {
      id: serviceId,
      name,
      categoryId,
      ageGroup: ageGroup || "All Ages",
      gender: gender || "All",
      image: image || IMAGES.others,
      shortDescription: shortDescription || "",
      longDescription: longDescription || "",
      status: status || "active"
    };

    db.addService(newSrv);

    // Save packages if provided
    if (packages && Array.isArray(packages)) {
      db.setPackagesForService(serviceId, packages);
    }

    res.json({
      ...newSrv,
      packages: db.getPackages().filter(p => p.serviceId === serviceId)
    });
  });

  app.put("/api/services/:id", (req, res) => {
    const { name, categoryId, ageGroup, gender, image, shortDescription, longDescription, status, packages } = req.body;
    const srv = db.updateService(req.params.id, {
      name, categoryId, ageGroup, gender, image, shortDescription, longDescription, status
    });

    if (!srv) {
      return res.status(404).json({ error: "Service not found." });
    }

    if (packages && Array.isArray(packages)) {
      db.setPackagesForService(req.params.id, packages);
    }

    res.json({
      ...srv,
      packages: db.getPackages().filter(p => p.serviceId === srv.id)
    });
  });

  app.delete("/api/services/:id", (req, res) => {
    db.deleteService(req.params.id);
    res.json({ success: true, message: "Service deleted successfully." });
  });

  // PACKAGES API
  app.get("/api/packages", (req, res) => {
    res.json(db.getPackages());
  });

  // CART API
  app.get("/api/cart", (req, res) => {
    const { userId } = req.query;
    if (!userId) {
      return res.json([]);
    }
    const userCart = db.getCartForUser(userId as string);
    // Enrich with package and service details
    const enriched = userCart.map(item => {
      const pkg = db.getPackages().find(p => p.id === item.packageId);
      const srv = pkg ? db.getServices().find(s => s.id === pkg.serviceId) : null;
      return {
        ...item,
        package: pkg,
        service: srv
      };
    }).filter(item => item.package !== undefined);
    res.json(enriched);
  });

  app.post("/api/cart", (req, res) => {
    const { userId, packageId, qty } = req.body;
    if (!userId || !packageId) {
      return res.status(400).json({ error: "userId and packageId are required" });
    }
    const cart = db.addToCart(userId, packageId, qty || 1);
    res.json(cart);
  });

  app.patch("/api/cart/:id", (req, res) => {
    const { qty } = req.body;
    const item = db.updateCartQty(req.params.id, qty);
    if (!item) {
      return res.status(404).json({ error: "Cart item not found" });
    }
    res.json(item);
  });

  app.delete("/api/cart/:id", (req, res) => {
    db.removeFromCart(req.params.id);
    res.json({ success: true });
  });

  // BOOKINGS API (Scheduling Appointment)
  app.post("/api/bookings", (req, res) => {
    const { serviceId, packageId, userId, date, timeSlot, bookingFor, firstName, lastName, remark } = req.body;
    if (!serviceId || !packageId || !date || !timeSlot || !firstName || !lastName) {
      return res.status(400).json({ error: "Missing required booking details." });
    }

    const newBooking: Booking = {
      id: `BKG-${generateId()}`,
      serviceId,
      packageId,
      userId: userId || null,
      date,
      timeSlot,
      bookingFor: bookingFor || "self",
      firstName,
      lastName,
      remark: remark || "",
      status: "Confirmed"
    };

    db.addBooking(newBooking);
    res.json(newBooking);
  });

  // ORDERS & CHECKOUT API
  app.get("/api/orders", (req, res) => {
    const { userId } = req.query;
    let list = db.getOrders();
    if (userId) {
      list = list.filter(o => o.userId === userId);
    }
    // Return sorted newest first
    list = [...list].sort((a,b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
    res.json(list);
  });

  app.get("/api/orders/:id", (req, res) => {
    const order = db.getOrders().find(o => o.id === req.params.id || o.orderId === req.params.id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json(order);
  });

  app.post("/api/orders", (req, res) => {
    const { userId, customerName, customerEmail, totalAmount, items, bookingDetails } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Order items are required." });
    }

    const orderId = generateOrderCode();
    const newOrder: Order = {
      id: `ORD-${generateId()}`,
      orderId,
      userId: userId || null,
      customerName: customerName || "Guest User",
      customerEmail: customerEmail || "guest@elara.ae",
      totalAmount: totalAmount || 0,
      status: "Confirmed",
      orderDate: new Date().toISOString(),
      items,
      bookingDetails
    };

    db.addOrder(newOrder);

    // If userId exists, clear their cart
    if (userId) {
      db.clearCart(userId);
    }

    res.json(newOrder);
  });

  // ADMIN ENDPOINTS
  app.get("/api/admin/orders", (req, res) => {
    // Return all orders
    res.json(db.getOrders());
  });

  app.patch("/api/admin/orders/:id/status", (req, res) => {
    const { status } = req.body;
    if (!["Pending", "Confirmed", "Cancelled"].includes(status)) {
      return res.status(400).json({ error: "Invalid status." });
    }
    const order = db.updateOrderStatus(req.params.id, status);
    if (!order) {
      return res.status(404).json({ error: "Order not found." });
    }
    res.json(order);
  });

  // REVIEWS API
  app.get("/api/reviews/:serviceId", (req, res) => {
    const reviews = db.getReviews().filter(r => r.serviceId === req.params.serviceId);
    res.json(reviews);
  });

  app.post("/api/reviews", (req, res) => {
    const { serviceId, userId, userName, rating, comment } = req.body;
    if (!serviceId || !userId || !rating || !comment) {
      return res.status(400).json({ error: "Missing review fields." });
    }
    const newReview: Review = {
      id: `REV-${generateId()}`,
      serviceId,
      userId,
      userName: userName || "Anonymous Patient",
      rating,
      comment,
      createdAt: new Date().toISOString()
    };
    db.addReview(newReview);
    res.json(newReview);
  });

  // REGISTERED USERS FOR ADMIN
  app.get("/api/admin/users", (req, res) => {
    res.json(db.getUsers());
  });

  // ==========================================
  // VITE DEV SERVER OR STATIC PRODUCTION BUILD
  // ==========================================

  if (process.env.NODE_ENV !== "production") {
    console.log("Serving application in DEVELOPMENT mode...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Serving application in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server successfully booted on port ${PORT}`);
    console.log(`Server accessible externally at port 3000`);
  });
}

startServer().catch(err => {
  console.error("Critical server boot error:", err);
});
