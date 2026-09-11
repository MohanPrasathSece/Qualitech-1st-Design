import { Product, TieredPrice } from "@/data/products";

export interface CartItem {
  id: string; // product id
  product: Product;
  quantity: number;
  unitPrice: number;
  customNote?: string;
}

export interface Coupon {
  code: string;
  description: string;
  discountType: "percent" | "fixed" | "free_shipping";
  discountValue: number;
  minSpend?: number;
  maxDiscount?: number;
}

export interface CustomerInfo {
  fullName: string;
  email: string;
  phone: string;
  companyName?: string;
  gstin?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
  orderNotes?: string;
}

export type OrderStatus =
  | "Confirmed"
  | "Processing"
  | "Quality Check"
  | "Dispatched"
  | "Delivered"
  | "Cancelled";

export type PaymentMethod =
  | "UPI / Razorpay (Instant)"
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
  paymentStatus: "Paid" | "Pending Approval" | "Awaiting Wire" | "Verified";
  orderStatus: OrderStatus;
  subtotal: number;
  discount: number;
  couponCode?: string;
  tax: number; // 18% GST
  shippingCost: number;
  total: number;
  trackingNumber: string;
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

export function addToStoredCart(product: Product, quantity: number = 1, customNote?: string): CartItem[] {
  const current = getStoredCart();
  const existingIndex = current.findIndex((item) => item.product.id === product.id);

  let updated: CartItem[];
  if (existingIndex > -1) {
    const newQty = current[existingIndex].quantity + quantity;
    const unitPrice = getEffectiveUnitPrice(product, newQty);
    updated = current.map((item, idx) =>
      idx === existingIndex
        ? { ...item, quantity: newQty, unitPrice, customNote: customNote || item.customNote }
        : item
    );
  } else {
    const unitPrice = getEffectiveUnitPrice(product, quantity);
    const newItem: CartItem = {
      id: product.id,
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

export function updateStoredOrderStatus(orderId: string, status: OrderStatus, paymentStatus?: Order["paymentStatus"]): Order[] {
  const current = getStoredOrders();
  const updated = current.map((ord) => {
    if (ord.id === orderId) {
      return {
        ...ord,
        orderStatus: status,
        paymentStatus: paymentStatus || ord.paymentStatus,
      };
    }
    return ord;
  });
  saveStoredOrders(updated);
  return updated;
}

// Format Currency
export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}
