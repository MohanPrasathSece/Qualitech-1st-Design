import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from "react";
import { Product } from "@/data/products";
import {
  CartItem,
  Coupon,
  Order,
  ShippingOption,
  SHIPPING_OPTIONS,
  getStoredCart,
  addToStoredCart,
  updateStoredCartQty,
  removeStoredCartItem,
  clearStoredCart,
  getStoredCoupon,
  saveStoredCoupon,
  validateCoupon,
  getStoredOrders,
  saveStoredOrders,
  createStoredOrder,
  updateStoredOrder,
  updateStoredOrderStatus,
  deleteStoredOrders,
  clearAllStoredOrders,
  exportOrdersToCsv,
  exportAbandonedCheckoutsToCsv,
  cleanupOrdersOlderThanDays,
  CART_UPDATED_EVENT,
  ORDERS_UPDATED_EVENT,
} from "@/lib/ecommerceStore";
import {
  getStoredProducts,
  saveStoredProducts,
  updateStoredProduct,
  PRODUCTS_UPDATED_EVENT,
} from "@/lib/productsStore";
import {
  fetchProductsFromSupabase,
  fetchOrdersFromSupabase,
  saveOrderToSupabase,
  saveProductToSupabase,
  updateOrderInSupabase,
  updateOrderStatusInSupabase,
  deleteOrdersFromSupabase,
} from "@/lib/supabaseService";
import {
  sendOrderConfirmationEmail,
  sendOrderStatusEmail,
  send30DayOrderCleanupEmail,
  sendLowStockAlertEmail,
  LowStockItemAlert,
} from "@/lib/emailService";

interface ECommerceContextType {
  products: Product[];
  cart: CartItem[];
  cartCount: number;
  cartSubtotal: number;
  cartDiscount: number;
  cartTax: number;
  cartShipping: number;
  cartTotal: number;
  freeShippingThreshold: number;
  freeShippingRemaining: number;
  selectedShipping: ShippingOption;
  setSelectedShipping: (shipping: ShippingOption) => void;
  orders: Order[];
  activeCoupon: Coupon | null;
  couponError: string | null;

  // UI Modals & Drawers State
  isCartOpen: boolean;
  isCheckoutOpen: boolean;
  quickViewProduct: Product | null;
  lastPlacedOrder: Order | null;

  // Actions
  addToCart: (product: Product, quantity?: number, note?: string) => void;
  updateCartQty: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  placeOrder: (
    orderData: Omit<
      Order,
      "id" | "orderNumber" | "createdAt" | "trackingNumber" | "estimatedDelivery"
    >
  ) => Order;
  recordIncompleteOrder: (
    orderData: Omit<
      Order,
      "id" | "orderNumber" | "createdAt" | "trackingNumber" | "estimatedDelivery"
    >,
    existingOrderNumber?: string
  ) => Order;
  updateLeadStatus: (
    orderNumber: string,
    status: "New Lead" | "Contacted" | "Followed Up" | "Recovered" | "Lost",
    notes?: string
  ) => void;
  markLeadRecovered: (orderNumber: string) => void;
  deleteAbandonedOrder: (orderNumber: string) => void;
  exportAbandonedOrdersCsv: () => string;
  updateOrderStatus: (
    orderId: string,
    status: Order["orderStatus"],
    paymentStatus?: Order["paymentStatus"]
  ) => void;
  updateOrderDetails: (
    orderId: string,
    updates: Partial<Order>,
    notifyCustomer?: boolean
  ) => Order | undefined;
  deleteOrders: (orderIds: string[]) => void;
  clearAllOrders: () => void;
  run30DayCleanup: (days?: number, onlyCancelled?: boolean) => { count: number; totalAmount: number };
  exportOrdersCsv: () => string;
  checkAndTriggerLowStockAlerts: (triggerReason?: string) => Promise<number>;

  // Modal Controls
  openCart: () => void;
  closeCart: () => void;
  openCheckout: () => void;
  closeCheckout: () => void;
  openQuickView: (product: Product) => void;
  closeQuickView: () => void;
  closeOrderSuccess: () => void;
  refreshProducts: () => void;
}

const ECommerceContext = createContext<ECommerceContextType | undefined>(undefined);

const FREE_SHIPPING_THRESHOLD = 0; // Flat 150 Rs shipping on all orders

export const ECommerceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeCoupon, setActiveCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption>(
    SHIPPING_OPTIONS[0] || {
      id: "standard",
      name: "Standard Surface Express",
      description: "Surface Express cargo across India",
      cost: 150,
      estimatedDays: "3-5 Business Days",
    }
  );

  // Modal states
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [lastPlacedOrder, setLastPlacedOrder] = useState<Order | null>(null);

  // Initial load
  useEffect(() => {
    setProducts(getStoredProducts());
    setCart(getStoredCart());
    setOrders(getStoredOrders());
    setActiveCoupon(getStoredCoupon());

    const handleProductsUpdate = (e: any) => {
      setProducts(e.detail || getStoredProducts());
    };
    const handleCartUpdate = (e: any) => {
      setCart(e.detail || getStoredCart());
    };
    const handleOrdersUpdate = (e: any) => {
      setOrders(e.detail || getStoredOrders());
    };

    window.addEventListener(PRODUCTS_UPDATED_EVENT, handleProductsUpdate);
    window.addEventListener(CART_UPDATED_EVENT, handleCartUpdate);
    window.addEventListener(ORDERS_UPDATED_EVENT, handleOrdersUpdate);

    // Async Supabase Hydration
    async function syncFromSupabase() {
      try {
        const [cloudProducts, cloudOrders] = await Promise.all([
          fetchProductsFromSupabase(),
          fetchOrdersFromSupabase(),
        ]);

        if (cloudProducts && cloudProducts.length > 0) {
          setProducts(cloudProducts);
          saveStoredProducts(cloudProducts);
        }

        if (cloudOrders && cloudOrders.length > 0) {
          const currentStored = getStoredOrders();
          const orderMap = new Map<string, Order>();
          cloudOrders.forEach((o) => orderMap.set((o.orderNumber || o.id).toLowerCase(), o));
          currentStored.forEach((o) => {
            const key = (o.orderNumber || o.id).toLowerCase();
            if (!orderMap.has(key)) {
              orderMap.set(key, o);
            }
          });
          const merged = Array.from(orderMap.values());
          setOrders(merged);
          saveStoredOrders(merged);
        }

        // Automated 30-day retention check: Cancelled orders older than 30 days
        try {
          const { archivedOrders, remainingOrders, csvContent } = cleanupOrdersOlderThanDays(30, true);
          if (archivedOrders.length > 0) {
            console.log(`[Retention Daemon] Found ${archivedOrders.length} cancelled orders older than 30 days. Purging and emailing Excel backup...`);
            setOrders(remainingOrders);
            const orderNumbers = archivedOrders.map((o) => o.orderNumber);
            deleteOrdersFromSupabase(orderNumbers).catch(console.warn);
            send30DayOrderCleanupEmail(archivedOrders, csvContent).catch(console.warn);
          }
        } catch (cleanErr) {
          console.warn("Automated 30-day cleanup note:", cleanErr);
        }
      } catch (err) {
        console.warn("Supabase background sync skipped (offline or unconfigured):", err);
      }
    }
    syncFromSupabase();

    // Periodic live sync so updates in Supabase or background are instantly reflected
    const syncInterval = setInterval(() => {
      syncFromSupabase();
    }, 4000);

    // Cross-tab instant reactivity
    const handleStorageUpdate = (e: StorageEvent) => {
      if (!e.key || e.key.includes("qualitech")) {
        setOrders(getStoredOrders());
        setProducts(getStoredProducts());
        setCart(getStoredCart());
      }
    };
    window.addEventListener("storage", handleStorageUpdate);

    return () => {
      clearInterval(syncInterval);
      window.removeEventListener(PRODUCTS_UPDATED_EVENT, handleProductsUpdate);
      window.removeEventListener(CART_UPDATED_EVENT, handleCartUpdate);
      window.removeEventListener(ORDERS_UPDATED_EVENT, handleOrdersUpdate);
      window.removeEventListener("storage", handleStorageUpdate);
    };
  }, []);

  const refreshProducts = async () => {
    const cloudProducts = await fetchProductsFromSupabase();
    if (cloudProducts && cloudProducts.length > 0) {
      setProducts(cloudProducts);
      saveStoredProducts(cloudProducts);
    } else {
      setProducts(getStoredProducts());
    }
  };

  // Calculations
  const cartCount = useMemo(() => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  }, [cart]);

  const cartSubtotal = useMemo(() => {
    return cart.reduce((total, item) => total + item.unitPrice * item.quantity, 0);
  }, [cart]);

  const cartDiscount = useMemo(() => {
    if (!activeCoupon || cartSubtotal <= 0) return 0;
    if (activeCoupon.discountType === "percent") {
      const disc = Math.round((cartSubtotal * activeCoupon.discountValue) / 100);
      return activeCoupon.maxDiscount ? Math.min(disc, activeCoupon.maxDiscount) : disc;
    }
    if (activeCoupon.discountType === "fixed") {
      return Math.min(activeCoupon.discountValue, cartSubtotal);
    }
    return 0;
  }, [activeCoupon, cartSubtotal]);

  const freeShippingEligible = cartSubtotal >= FREE_SHIPPING_THRESHOLD || activeCoupon?.discountType === "free_shipping";
  const freeShippingRemaining = Math.max(0, FREE_SHIPPING_THRESHOLD - cartSubtotal);

  const cartShipping = useMemo(() => {
    if (cart.length === 0) return 0;
    if (selectedShipping?.id === "pickup") return 0;
    return 150; // Flat 150 Rs shipping on all deliveries
  }, [cart.length, selectedShipping?.id]);

  const taxableAmount = Math.max(0, cartSubtotal - cartDiscount);
  // 18% GST standard on electronic components & cables in India
  const cartTax = Math.round(taxableAmount * 0.18);
  const cartTotal = taxableAmount + cartTax + cartShipping;

  // Actions
  const addToCart = (product: Product, quantity = 1, note?: string) => {
    if (!product.inStock || (product.stockCount !== undefined && product.stockCount <= 0)) {
      alert(`"${product.name}" is currently out of stock and cannot be added to cart.`);
      return;
    }
    const updated = addToStoredCart(product, quantity, note);
    setCart(updated);
    setIsCartOpen(true);
  };

  const updateCartQty = (productId: string, quantity: number) => {
    const updated = updateStoredCartQty(productId, quantity);
    setCart(updated);
  };

  const removeFromCart = (productId: string) => {
    const updated = removeStoredCartItem(productId);
    setCart(updated);
  };

  const clearCart = () => {
    const updated = clearStoredCart();
    setCart(updated);
  };

  const applyCoupon = (code: string): boolean => {
    setCouponError(null);
    const res = validateCoupon(code, cartSubtotal);
    if (res.valid && res.coupon) {
      setActiveCoupon(res.coupon);
      saveStoredCoupon(res.coupon);
      return true;
    } else {
      setCouponError(res.error || "Invalid coupon code");
      return false;
    }
  };

  const removeCoupon = () => {
    setActiveCoupon(null);
    setCouponError(null);
    saveStoredCoupon(null);
  };

  const placeOrder = (
    orderData: Omit<
      Order,
      "id" | "orderNumber" | "createdAt" | "trackingNumber" | "estimatedDelivery"
    >
  ): Order => {
    const newOrder = createStoredOrder(orderData);
    setOrders((prev) => {
      const exists = prev.some((o) => (o.orderNumber || o.id) === (newOrder.orderNumber || newOrder.id));
      return exists ? prev : [newOrder, ...prev];
    });
    setCart([]);
    setIsCheckoutOpen(false);
    setIsCartOpen(false);
    setLastPlacedOrder(newOrder);

    // 1. Deduct stock for each ordered item from catalogue and sync to Supabase
    const depletedItems: LowStockItemAlert[] = [];
    orderData.items.forEach((item) => {
      const prodId = item.product.id || item.product.sku;
      const currentProds = getStoredProducts();
      const currentProd = currentProds.find((p) => (p.id || p.sku) === prodId);
      if (currentProd) {
        const currentStock = typeof currentProd.stockCount === "number" ? currentProd.stockCount : 100;
        const newStock = Math.max(0, currentStock - item.quantity);
        const threshold = currentProd.lowStockThreshold || 15;
        const updatedProds = updateStoredProduct(prodId, {
          stockCount: newStock,
          inStock: newStock > 0,
        });
        setProducts(updatedProds);
        const updatedTarget = updatedProds.find((p) => (p.id || p.sku) === prodId);
        if (updatedTarget) {
          saveProductToSupabase(updatedTarget).catch((err) => {
            console.warn("Stock update sync to Supabase error:", err);
          });
        }
        if (newStock <= threshold) {
          depletedItems.push({
            id: currentProd.id || currentProd.sku,
            sku: currentProd.sku,
            name: currentProd.name,
            brand: currentProd.brand,
            category: currentProd.category,
            stockCount: newStock,
            lowStockThreshold: threshold,
          });
        }
      }
    });

    // Dispatch automated Low-Stock Warning Email if any products reached safety threshold
    if (depletedItems.length > 0) {
      sendLowStockAlertEmail(depletedItems, `Order #${newOrder.orderNumber} Depletion`).catch((err) => {
        console.warn("Low stock alert email error:", err);
      });
    }

    // 2. Send Automated Confirmation & Admin Alert Emails
    sendOrderConfirmationEmail(newOrder).catch((err) => {
      console.warn("Automated email dispatch note:", err);
    });

    // 3. Save order to Supabase in background
    saveOrderToSupabase(newOrder).catch((err) => {
      console.warn("Supabase order save error:", err);
    });

    return newOrder;
  };

  const recordIncompleteOrder = (
    orderData: Omit<
      Order,
      "id" | "orderNumber" | "createdAt" | "trackingNumber" | "estimatedDelivery"
    >,
    existingOrderNumber?: string
  ): Order => {
    let incompleteOrder: Order;
    const currentStored = getStoredOrders();

    if (existingOrderNumber) {
      const existing = currentStored.find(
        (o) => (o.orderNumber || "").toLowerCase() === existingOrderNumber.toLowerCase()
      );
      if (existing) {
        incompleteOrder = {
          ...existing,
          ...orderData,
          customer: {
            ...existing.customer,
            ...orderData.customer,
          },
          updatedAt: new Date().toISOString(),
        };
      } else {
        incompleteOrder = {
          ...orderData,
          id: `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          orderNumber: existingOrderNumber,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          orderStatus: orderData.orderStatus || "Payment Incomplete",
          paymentStatus: orderData.paymentStatus || "Incomplete",
          trackingNumber: "N/A - Incomplete",
          estimatedDelivery: "Pending Payment",
          followUpStatus: orderData.followUpStatus || "New Lead",
        };
      }
    } else {
      const randNum = Math.floor(10000 + Math.random() * 90000);
      incompleteOrder = {
        ...orderData,
        id: `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        orderNumber: `QT-INC-${randNum}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        orderStatus: orderData.orderStatus || "Payment Incomplete",
        paymentStatus: orderData.paymentStatus || "Incomplete",
        trackingNumber: "N/A - Incomplete",
        estimatedDelivery: "Pending Payment",
        followUpStatus: orderData.followUpStatus || "New Lead",
      };
    }

    // 1. Update orders in localStorage & React state
    const filtered = currentStored.filter(
      (o) => (o.orderNumber || o.id).toLowerCase() !== (incompleteOrder.orderNumber || incompleteOrder.id).toLowerCase()
    );
    const updatedOrders = [incompleteOrder, ...filtered];
    saveStoredOrders(updatedOrders);
    setOrders(updatedOrders);

    // 2. Also persist in dedicated abandoned checkouts local storage
    try {
      const abandonedKey = "qualitech_abandoned_checkouts_v1";
      const existingAbandoned = JSON.parse(localStorage.getItem(abandonedKey) || "[]");
      const filteredAbandoned = (Array.isArray(existingAbandoned) ? existingAbandoned : []).filter(
        (o: Order) => (o.orderNumber || o.id).toLowerCase() !== (incompleteOrder.orderNumber || incompleteOrder.id).toLowerCase()
      );
      localStorage.setItem(abandonedKey, JSON.stringify([incompleteOrder, ...filteredAbandoned]));
    } catch (_) {}

    // 3. Upsert to Supabase in background
    saveOrderToSupabase(incompleteOrder).catch((err) => {
      console.warn("Supabase record incomplete order note:", err);
    });

    return incompleteOrder;
  };

  const updateLeadStatus = (
    orderNumber: string,
    status: "New Lead" | "Contacted" | "Followed Up" | "Recovered" | "Lost",
    notes?: string
  ) => {
    const cleanNum = (orderNumber || "").trim().toLowerCase();
    const current = getStoredOrders();
    const updated = current.map((ord) => {
      if ((ord.orderNumber || ord.id).toLowerCase() === cleanNum) {
        return {
          ...ord,
          followUpStatus: status,
          ...(notes !== undefined ? { adminNotes: notes } : {}),
          updatedAt: new Date().toISOString(),
        };
      }
      return ord;
    });
    saveStoredOrders(updated);
    setOrders(updated);

    // Update in dedicated abandoned storage
    try {
      const abandonedKey = "qualitech_abandoned_checkouts_v1";
      const existingAbandoned = JSON.parse(localStorage.getItem(abandonedKey) || "[]");
      if (Array.isArray(existingAbandoned)) {
        const updatedAbandoned = existingAbandoned.map((ord: Order) => {
          if ((ord.orderNumber || ord.id).toLowerCase() === cleanNum) {
            return {
              ...ord,
              followUpStatus: status,
              ...(notes !== undefined ? { adminNotes: notes } : {}),
              updatedAt: new Date().toISOString(),
            };
          }
          return ord;
        });
        localStorage.setItem(abandonedKey, JSON.stringify(updatedAbandoned));
      }
    } catch (_) {}

    // Also update order in Supabase
    const target = updated.find((o) => (o.orderNumber || o.id).toLowerCase() === cleanNum);
    if (target) {
      saveOrderToSupabase(target).catch(console.warn);
    }
  };

  const markLeadRecovered = (orderNumber: string) => {
    updateLeadStatus(orderNumber, "Recovered");
  };

  const deleteAbandonedOrder = (orderNumber: string) => {
    deleteOrders([orderNumber]);
    try {
      const abandonedKey = "qualitech_abandoned_checkouts_v1";
      const existingAbandoned = JSON.parse(localStorage.getItem(abandonedKey) || "[]");
      if (Array.isArray(existingAbandoned)) {
        const clean = (orderNumber || "").toLowerCase();
        const filtered = existingAbandoned.filter(
          (o: Order) => (o.orderNumber || o.id).toLowerCase() !== clean
        );
        localStorage.setItem(abandonedKey, JSON.stringify(filtered));
      }
    } catch (_) {}
  };

  const updateOrderStatus = (
    orderId: string,
    status: Order["orderStatus"],
    paymentStatus?: Order["paymentStatus"]
  ) => {
    updateOrderDetails(orderId, {
      orderStatus: status,
      ...(paymentStatus ? { paymentStatus } : {}),
    }, true);
  };

  const updateOrderDetails = (
    orderId: string,
    updates: Partial<Order>,
    notifyCustomer: boolean = true
  ): Order | undefined => {
    const cleanId = (orderId || "").trim().toLowerCase();
    let targetOrder: Order | undefined;

    // 1. Gather all existing orders from current state and storage
    const currentOrders = orders && orders.length > 0 ? orders : getStoredOrders();
    const nextOrders = currentOrders.map((ord) => {
      const ordId = (ord.id || "").trim().toLowerCase();
      const ordNum = (ord.orderNumber || "").trim().toLowerCase();
      const isMatch = ordId === cleanId || ordNum === cleanId || (updates.orderNumber && ord.orderNumber === updates.orderNumber);

      if (isMatch) {
        targetOrder = {
          ...ord,
          ...updates,
        };
        return targetOrder;
      }
      return ord;
    });

    if (targetOrder) {
      // 2. Immediately update in-memory React state so UI re-renders without refreshing
      setOrders(nextOrders);
      // 3. Persist to localStorage and dispatch event for any other open tabs
      saveStoredOrders(nextOrders);

      // 4. Sync status/tracking update to Supabase orders table
      updateOrderInSupabase(targetOrder.orderNumber, updates).catch((err) => {
        console.warn("Supabase order update error:", err);
      });

      // 5. Dispatch automated email (e.g. Delivered / Shipped) to customer and admin
      if (notifyCustomer) {
        sendOrderStatusEmail(targetOrder).catch((err) => {
          console.warn("Status notification email send error:", err);
        });
      }
    } else {
      console.warn("Order not found for update:", orderId);
    }

    return targetOrder;
  };

  const deleteOrders = (orderIds: string[]) => {
    const idSet = new Set(orderIds.map((id) => (id || "").trim().toLowerCase()));
    const targetOrders = orders.filter((o) => idSet.has((o.id || "").toLowerCase()) || idSet.has((o.orderNumber || "").toLowerCase()));
    const orderNumbers = targetOrders.map((o) => o.orderNumber);

    const nextOrders = orders.filter(
      (o) => !idSet.has((o.id || "").toLowerCase()) && !idSet.has((o.orderNumber || "").toLowerCase())
    );
    setOrders(nextOrders);
    saveStoredOrders(nextOrders);

    if (orderNumbers.length > 0) {
      deleteOrdersFromSupabase(orderNumbers).catch((err) => {
        console.warn("Supabase order deletion error:", err);
      });
    }
  };

  const clearAllOrders = () => {
    const allNums = orders.map((o) => o.orderNumber).filter(Boolean);
    clearAllStoredOrders();
    setOrders([]);
    if (allNums.length > 0) {
      deleteOrdersFromSupabase(allNums).catch(console.warn);
    }
  };

  const run30DayCleanup = (days = 30, onlyCancelled = false): { count: number; totalAmount: number } => {
    const { archivedOrders, remainingOrders, csvContent } = cleanupOrdersOlderThanDays(days, onlyCancelled);
    setOrders(remainingOrders);

    if (archivedOrders.length > 0) {
      const orderNumbers = archivedOrders.map((o) => o.orderNumber);
      deleteOrdersFromSupabase(orderNumbers).catch(console.warn);

      // Trigger automatic backup report email to sales/admin
      send30DayOrderCleanupEmail(archivedOrders, csvContent).catch(console.warn);

      // Trigger direct CSV file download for admin
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `qualitech-orders-archive-30days-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }

    const totalAmount = archivedOrders.reduce((sum, o) => sum + o.total, 0);
    return { count: archivedOrders.length, totalAmount };
  };

  const exportOrdersCsv = (): string => {
    return exportOrdersToCsv(orders);
  };

  const exportAbandonedOrdersCsv = (): string => {
    const incomplete = orders.filter(
      (o) =>
        o.orderStatus === "Payment Incomplete" ||
        o.orderStatus === "Payment Failed" ||
        o.paymentStatus === "Failed" ||
        o.paymentStatus === "Incomplete"
    );
    return exportAbandonedCheckoutsToCsv(incomplete);
  };

  const checkAndTriggerLowStockAlerts = async (triggerReason = "Manual Inventory Health Audit"): Promise<number> => {
    const currentProds = getStoredProducts();
    const lowStock: LowStockItemAlert[] = currentProds
      .filter((p) => (p.stockCount || 0) <= (p.lowStockThreshold || 15))
      .map((p) => ({
        id: p.id || p.sku,
        sku: p.sku,
        name: p.name,
        brand: p.brand,
        category: p.category,
        stockCount: p.stockCount || 0,
        lowStockThreshold: p.lowStockThreshold || 15,
      }));
    if (lowStock.length > 0) {
      await sendLowStockAlertEmail(lowStock, triggerReason);
    }
    return lowStock.length;
  };

  // Modals
  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const openCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(false);
    if (typeof window !== "undefined") {
      window.location.hash = "#checkout";
      try {
        window.dispatchEvent(new HashChangeEvent("hashchange"));
      } catch (_) {
        window.dispatchEvent(new Event("hashchange"));
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };
  const closeCheckout = () => setIsCheckoutOpen(false);

  const openQuickView = (product: Product) => setQuickViewProduct(product);
  const closeQuickView = () => setQuickViewProduct(null);

  const closeOrderSuccess = () => setLastPlacedOrder(null);

  return (
    <ECommerceContext.Provider
      value={{
        products,
        cart,
        cartCount,
        cartSubtotal,
        cartDiscount,
        cartTax,
        cartShipping,
        cartTotal,
        freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
        freeShippingRemaining,
        selectedShipping,
        setSelectedShipping,
        orders,
        activeCoupon,
        couponError,
        isCartOpen,
        isCheckoutOpen,
        quickViewProduct,
        lastPlacedOrder,
        addToCart,
        updateCartQty,
        removeFromCart,
        clearCart,
        applyCoupon,
        removeCoupon,
        placeOrder,
        recordIncompleteOrder,
        updateLeadStatus,
        markLeadRecovered,
        deleteAbandonedOrder,
        exportAbandonedOrdersCsv,
        updateOrderStatus,
        updateOrderDetails,
        deleteOrders,
        clearAllOrders,
        run30DayCleanup,
        exportOrdersCsv,
        checkAndTriggerLowStockAlerts,
        openCart,
        closeCart,
        openCheckout,
        closeCheckout,
        openQuickView,
        closeQuickView,
        closeOrderSuccess,
        refreshProducts,
      }}
    >
      {children}
    </ECommerceContext.Provider>
  );
};

export const useECommerce = (): ECommerceContextType => {
  const context = useContext(ECommerceContext);
  if (!context) {
    throw new Error("useECommerce must be used within an ECommerceProvider");
  }
  return context;
};
