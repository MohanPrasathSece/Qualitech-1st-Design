import { Product, TieredPrice } from "@/data/products";

export interface CartItem {
  id: string; // product id
  product: Product;
  quantity: number;
  unitPrice: number;
  customNote?: string | undefined;
}

export interface Coupon {
  code: string;
  description: string;
  discountType: "percent" | "fixed" | "free_shipping";
  discountValue: number;
  minSpend?: number | undefined;
  maxDiscount?: number | undefined;
}

export interface CustomerInfo {
  fullName: string;
  email: string;
  phone: string;
  companyName?: string | undefined;
  gstin?: string | undefined;
  address: string;
  city: string;
  state: string;
  pincode: string;
  country?: string | undefined;
  orderNotes?: string | undefined;
}

export type OrderStatus =
  | "Confirmed"
  | "Processing"
  | "Quality Check"
  | "Shipped"
  | "Dispatched"
  | "Delivered"
  | "Cancelled";

export type PaymentMethod =
  | "UPI / Razorpay (Instant)"
  | "Cash on Delivery"
  | "Corporate Purchase Order (Net-30)"
  | "Bank Transfer (NEFT/RTGS)"
  | "Proforma Invoice / COD";

export interface ShippingOption {
  id: string;
  name: string;
  description: string;
  cost: number;
  estimatedDays: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  items: CartItem[];
  customer: CustomerInfo;
  shippingMethod: ShippingOption;
  paymentMethod: PaymentMethod;
  paymentStatus: "Paid" | "Pending Approval" | "Awaiting Wire" | "Verified" | "Cash on Delivery";
  orderStatus: OrderStatus;
  subtotal: number;
  discount: number;
  couponCode?: string | undefined;
  tax: number; // 18% GST
  shippingCost: number;
  total: number;
  trackingNumber: string;
  trackingLink?: string | undefined;
  estimatedDelivery: string;
}

// Storage Keys
const CART_STORAGE_KEY = "qualitech_ecommerce_cart_v1";
const ORDERS_STORAGE_KEY = "qualitech_ecommerce_orders_v1";
const ACTIVE_COUPON_KEY = "qualitech_ecommerce_coupon_v1";

// Events
export const CART_UPDATED_EVENT = "qualitech:cart_updated";
export const ORDERS_UPDATED_EVENT = "qualitech:orders_updated";

// Default Shipping Options
export const SHIPPING_OPTIONS: ShippingOption[] = [
  {
    id: "standard",
    name: "Standard Surface Express",
    description: "Reliable road express freight (3-5 business days)",
    cost: 250,
    estimatedDays: "3 - 5 Days",
  },
  {
    id: "express_air",
    name: "Priority Air Cargo",
    description: "Fast track air dispatch for critical deadlines (24-48 hrs)",
    cost: 750,
    estimatedDays: "24 - 48 Hours",
  },
  {
    id: "pickup",
    name: "Factory Self-Pickup (Cherlapally)",
    description: "Collect directly from our Hyderabad works",
    cost: 0,
    estimatedDays: "Same Day (Post QC)",
  },
];

// Available Promo Codes
export const AVAILABLE_COUPONS: Coupon[] = [
  {
    code: "QUALITECH10",
    description: "10% off your entire industrial component order",
    discountType: "percent",
    discountValue: 10,
    minSpend: 1000,
  },
  {
    code: "INDUS2026",
    description: "15% off orders exceeding ₹5,000 for OEMs",
    discountType: "percent",
    discountValue: 15,
    minSpend: 5000,
  },
  {
    code: "WELCOME500",
    description: "Flat ₹500 discount on first purchase over ₹2,000",
    discountType: "fixed",
    discountValue: 500,
    minSpend: 2000,
  },
  {
    code: "FREESHIP",
    description: "Free express shipping on your entire shipment",
    discountType: "free_shipping",
    discountValue: 0,
  },
  {
    code: "BULK20",
    description: "20% off high-volume orders exceeding ₹25,000",
    discountType: "percent",
    discountValue: 20,
    minSpend: 25000,
    maxDiscount: 10000,
  },
];

// Default Pricing Generator for Products that don't have prices yet
export function getProductDefaultPrice(product: Product): number {
  if (product.price && product.price > 0) return product.price;

  // Generate realistic industrial price based on brand and category
  let basePrice = 1250;
  if (product.brand === "Amphenol") {
    if (product.category.includes("Fiber") || product.name.includes("Fiber") || product.name.includes("Optical")) {
      basePrice = 4850;
    } else if (product.category.includes("Antenna") || product.name.includes("Antenna")) {
      basePrice = 3200;
    } else if (product.name.includes("MIL") || product.name.includes("Tactical") || product.name.includes("RADSOK")) {
      basePrice = 6400;
    } else if (product.name.includes("High Speed") || product.name.includes("Backplane")) {
      basePrice = 2850;
    } else {
      basePrice = 1650;
    }
  } else if (product.brand === "Zolex") {
    if (product.category.includes("Gland") || product.name.includes("Flameproof")) {
      basePrice = 850;
    } else if (product.category.includes("Earth") || product.name.includes("Rod")) {
      basePrice = 1450;
    } else if (product.category.includes("SS Cable Ties") || product.name.includes("Ties")) {
      basePrice = 420;
    } else if (product.category.includes("Bimetallic") || product.name.includes("Bimetal")) {
      basePrice = 680;
    } else if (product.category.includes("Lug") || product.name.includes("Lug")) {
      basePrice = 350;
    } else {
      basePrice = 290;
    }
  } else {
    // Qualitech Manufacturing
    if (product.name.includes("Defense") || product.name.includes("Military")) {
      basePrice = 14500;
    } else if (product.name.includes("Harness") || product.name.includes("OEM")) {
      basePrice = 8900;
    } else if (product.name.includes("RF") || product.name.includes("Coaxial")) {
      basePrice = 2450;
    } else {
      basePrice = 5200;
    }
  }

  // Add deterministic pseudo-hash based on SKU or ID length for variation
  const idStr = product.id || product.sku || "p";
  const variation = (idStr.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % 15) * 50;
  return basePrice + variation;
}

// Compute Tiered Volume Discounts for B2B procurement
export function getProductTieredPricing(product: Product): TieredPrice[] {
  if (product.tieredPricing && product.tieredPricing.length > 0) {
    return product.tieredPricing;
  }
  const basePrice = getProductDefaultPrice(product);
  return [
    { minQty: 1, price: basePrice, discountLabel: "Standard" },
    { minQty: 10, price: Math.round(basePrice * 0.92), discountLabel: "8% Off" },
    { minQty: 50, price: Math.round(basePrice * 0.85), discountLabel: "15% Off (Volume)" },
    { minQty: 100, price: Math.round(basePrice * 0.78), discountLabel: "22% Off (OEM Bulk)" },
  ];
}

// Calculate the effective unit price for a given quantity
export function getEffectiveUnitPrice(product: Product, quantity: number): number {
  const tiers = getProductTieredPricing(product);
  let effectivePrice = getProductDefaultPrice(product);
  for (const tier of tiers) {
    if (quantity >= tier.minQty) {
      effectivePrice = tier.price;
    }
  }
  return effectivePrice;
}

// ─────────────────────────────────────────────────────────────
// CART STORAGE HELPERS
// ─────────────────────────────────────────────────────────────

export function getStoredCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.error("Failed to parse cart from localStorage", err);
  }
  return [];
}

export function saveStoredCart(items: CartItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent(CART_UPDATED_EVENT, { detail: items }));
  } catch (err) {
    console.error("Failed to save cart to localStorage", err);
  }
}

export function addToStoredCart(product: Product, quantity: number = 1, customNote?: string | undefined): CartItem[] {
  const current = getStoredCart();
  const prodId = product.id || product.sku;
  const existingIndex = current.findIndex((item) => (item.product.id || item.product.sku) === prodId);

  let updated: CartItem[];
  if (existingIndex > -1 && current[existingIndex]) {
    const existing = current[existingIndex]!;
    const newQty = existing.quantity + quantity;
    const unitPrice = getEffectiveUnitPrice(product, newQty);
    updated = current.map((item, idx) =>
      idx === existingIndex
        ? { ...item, quantity: newQty, unitPrice, customNote: customNote || item.customNote }
        : item
    );
  } else {
    const unitPrice = getEffectiveUnitPrice(product, quantity);
    const newItem: CartItem = {
      id: prodId,
      product,
      quantity,
      unitPrice,
      customNote,
    };
    updated = [newItem, ...current];
  }

  saveStoredCart(updated);
  return updated;
}

export function updateStoredCartQty(productId: string, quantity: number): CartItem[] {
  const current = getStoredCart();
  if (quantity <= 0) {
    return removeStoredCartItem(productId);
  }

  const updated = current.map((item) => {
    if (item.product.id === productId) {
      const unitPrice = getEffectiveUnitPrice(item.product, quantity);
      return { ...item, quantity, unitPrice };
    }
    return item;
  });

  saveStoredCart(updated);
  return updated;
}

export function removeStoredCartItem(productId: string): CartItem[] {
  const current = getStoredCart();
  const updated = current.filter((item) => item.product.id !== productId);
  saveStoredCart(updated);
  return updated;
}

export function clearStoredCart(): CartItem[] {
  saveStoredCart([]);
  return [];
}

// ─────────────────────────────────────────────────────────────
// COUPON STORAGE HELPERS
// ─────────────────────────────────────────────────────────────

export function getStoredCoupon(): Coupon | null {
  if (typeof window === "undefined") return null;
  try {
    const saved = localStorage.getItem(ACTIVE_COUPON_KEY);
    if (saved) return JSON.parse(saved);
  } catch (err) {
    console.error("Failed to parse coupon", err);
  }
  return null;
}

export function saveStoredCoupon(coupon: Coupon | null): void {
  if (typeof window === "undefined") return;
  if (!coupon) {
    localStorage.removeItem(ACTIVE_COUPON_KEY);
  } else {
    localStorage.setItem(ACTIVE_COUPON_KEY, JSON.stringify(coupon));
  }
}

export function validateCoupon(code: string, subtotal: number): { valid: boolean; coupon?: Coupon; error?: string } {
  const cleanCode = code.trim().toUpperCase();
  const coupon = AVAILABLE_COUPONS.find((c) => c.code === cleanCode);
  if (!coupon) {
    return { valid: false, error: "Invalid coupon code. Try 'QUALITECH10' or 'INDUS2026'." };
  }
  if (coupon.minSpend && subtotal < coupon.minSpend) {
    return {
      valid: false,
      error: `Minimum order of ₹${coupon.minSpend.toLocaleString("en-IN")} required for this coupon.`,
    };
  }
  return { valid: true, coupon };
}

// ─────────────────────────────────────────────────────────────
// ORDERS STORAGE HELPERS
// ─────────────────────────────────────────────────────────────

export function getStoredOrders(): Order[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.error("Failed to parse orders from localStorage", err);
  }
  return [];
}

export function saveStoredOrders(orders: Order[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    window.dispatchEvent(new CustomEvent(ORDERS_UPDATED_EVENT, { detail: orders }));
  } catch (err) {
    console.error("Failed to save orders to localStorage", err);
  }
}

export function createStoredOrder(orderData: Omit<Order, "id" | "orderNumber" | "createdAt" | "trackingNumber" | "estimatedDelivery">): Order {
  const current = getStoredOrders();
  const randomSerial = Math.floor(10000 + Math.random() * 90000);
  const orderNumber = `QT-2026-${randomSerial}`;
  const id = `ord-${Date.now()}-${randomSerial}`;

  const estDays = orderData.shippingMethod.id === "express_air" ? 2 : 4;
  const estimatedDelivery = new Date(Date.now() + estDays * 24 * 60 * 60 * 1000).toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const trackingNumber = `QT-EXP-${Date.now().toString().slice(-6)}${Math.floor(1000 + Math.random() * 9000)}`;

  const newOrder: Order = {
    ...orderData,
    id,
    orderNumber,
    createdAt: new Date().toISOString(),
    trackingNumber,
    estimatedDelivery,
  };

  const updated = [newOrder, ...current];
  saveStoredOrders(updated);

  // Clear active cart upon successful order
  clearStoredCart();
  saveStoredCoupon(null);

  return newOrder;
}

export function updateStoredOrder(orderId: string, updates: Partial<Order>): Order[] {
  const current = getStoredOrders();
  const updated = current.map((ord) => {
    if (ord.id === orderId || ord.orderNumber === orderId) {
      return {
        ...ord,
        ...updates,
      };
    }
    return ord;
  });
  saveStoredOrders(updated);
  return updated;
}

export function updateStoredOrderStatus(orderId: string, status: OrderStatus, paymentStatus?: Order["paymentStatus"]): Order[] {
  return updateStoredOrder(orderId, {
    orderStatus: status,
    ...(paymentStatus ? { paymentStatus } : {}),
  });
}

export function deleteStoredOrders(orderIds: string[]): Order[] {
  const current = getStoredOrders();
  const idSet = new Set(orderIds);
  const updated = current.filter((ord) => !idSet.has(ord.id) && !idSet.has(ord.orderNumber));
  saveStoredOrders(updated);
  return updated;
}

/**
 * Export orders array to CSV formatted string (Excel compatible)
 */
export function exportOrdersToCsv(orders: Order[]): string {
  const headers = [
    "Order ID",
    "Date & Time",
    "Customer Name",
    "Customer Email",
    "Customer Phone",
    "Company Name",
    "GSTIN",
    "Address",
    "City",
    "State",
    "Pincode",
    "Line Items",
    "Subtotal (INR)",
    "Discount (INR)",
    "Coupon Code",
    "Tax 18% GST (INR)",
    "Shipping Freight (INR)",
    "Total Paid (INR)",
    "Payment Method",
    "Payment Status",
    "Order Status",
    "Tracking Number",
    "Tracking Link",
  ];

  const rows = orders.map((ord) => {
    const itemsSummary = ord.items
      .map((i) => `${i.product.name} [SKU:${i.product.sku}] x${i.quantity}`)
      .join(" | ");

    return [
      `"${ord.orderNumber}"`,
      `"${new Date(ord.createdAt).toLocaleString("en-IN")}"`,
      `"${(ord.customer.fullName || "").replace(/"/g, '""')}"`,
      `"${(ord.customer.email || "").replace(/"/g, '""')}"`,
      `"${(ord.customer.phone || "").replace(/"/g, '""')}"`,
      `"${(ord.customer.companyName || "").replace(/"/g, '""')}"`,
      `"${(ord.customer.gstin || "").replace(/"/g, '""')}"`,
      `"${(ord.customer.address || "").replace(/"/g, '""')}"`,
      `"${(ord.customer.city || "").replace(/"/g, '""')}"`,
      `"${(ord.customer.state || "").replace(/"/g, '""')}"`,
      `"${(ord.customer.pincode || "").replace(/"/g, '""')}"`,
      `"${itemsSummary.replace(/"/g, '""')}"`,
      ord.subtotal,
      ord.discount,
      `"${ord.couponCode || ""}"`,
      ord.tax,
      ord.shippingCost,
      ord.total,
      `"${ord.paymentMethod}"`,
      `"${ord.paymentStatus}"`,
      `"${ord.orderStatus}"`,
      `"${ord.trackingNumber || ""}"`,
      `"${ord.trackingLink || ""}"`,
    ].join(",");
  });

  return [headers.join(","), ...rows].join("\r\n");
}

/**
 * Identify and clean up orders older than X days (default 30 days)
 */
export function cleanupOrdersOlderThanDays(days: number = 30): {
  archivedOrders: Order[];
  remainingOrders: Order[];
  csvContent: string;
} {
  const current = getStoredOrders();
  const cutoffTime = Date.now() - days * 24 * 60 * 60 * 1000;

  const archivedOrders = current.filter((ord) => {
    const orderTime = new Date(ord.createdAt).getTime();
    return !isNaN(orderTime) && orderTime < cutoffTime;
  });

  const remainingOrders = current.filter((ord) => {
    const orderTime = new Date(ord.createdAt).getTime();
    return isNaN(orderTime) || orderTime >= cutoffTime;
  });

  if (archivedOrders.length > 0) {
    saveStoredOrders(remainingOrders);
  }

  const csvContent = exportOrdersToCsv(archivedOrders.length > 0 ? archivedOrders : current);

  return {
    archivedOrders,
    remainingOrders,
    csvContent,
  };
}

// Format Currency
export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export interface ExternalLinkInfo {
  url: string;
  label: string;
  isExternal: boolean;
  brandColor: string;
  badgeText: string;
}

/**
 * Returns the official manufacturer catalog link (Amphenol, Zolex, or Qualitech)
 * for a product with rich labeling and badge metadata.
 */
export function getProductExternalLink(product: Product): ExternalLinkInfo {
  if (product.externalUrl && product.externalUrl.trim() !== "") {
    return {
      url: product.externalUrl,
      label: `View on ${product.brand}`,
      isExternal: true,
      brandColor: product.brand === "Amphenol" ? "text-blue-600 border-blue-200 bg-blue-50/70" : "text-emerald-700 border-emerald-200 bg-emerald-50/70",
      badgeText: `Official ${product.brand} Catalog ↗`,
    };
  }

  if (product.brand === "Amphenol") {
    const query = encodeURIComponent(product.sku || product.name);
    return {
      url: `https://www.amphenol-icc.com/search?q=${query}`,
      label: "View on Amphenol",
      isExternal: true,
      brandColor: "text-brand-blue border-brand-blue/30 bg-blue-50/80 hover:bg-brand-blue hover:text-white",
      badgeText: "Amphenol ICC ↗",
    };
  }

  if (product.brand === "Zolex") {
    const query = encodeURIComponent(product.sku || product.name);
    return {
      url: `https://zolex.in/?s=${query}`,
      label: "View on Zolex",
      isExternal: true,
      brandColor: "text-emerald-700 border-emerald-300 bg-emerald-50/80 hover:bg-emerald-600 hover:text-white",
      badgeText: "Zolex Official ↗",
    };
  }

  return {
    url: "#manufacturing",
    label: "View Qualitech Specs",
    isExternal: false,
    brandColor: "text-amber-700 border-amber-300 bg-amber-50/80 hover:bg-amber-600 hover:text-white",
    badgeText: "Qualitech In-House ↗",
  };
}

