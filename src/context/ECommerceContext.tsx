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
  createStoredOrder,
  updateStoredOrder,
  updateStoredOrderStatus,
  deleteStoredOrders,
  exportOrdersToCsv,
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
  run30DayCleanup: (days?: number) => { count: number; totalAmount: number };
  exportOrdersCsv: () => string;

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

const FREE_SHIPPING_THRESHOLD = 5000; // Free shipping over ₹5,000

export const ECommerceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeCoupon, setActiveCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption>(
    SHIPPING_OPTIONS[0] || {
      id: "standard",
      name: "Standard Road Logistics",
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
          setOrders(cloudOrders);
        }
      } catch (err) {
        console.warn("Supabase background sync skipped (offline or unconfigured):", err);
      }
    }
    syncFromSupabase();

    return () => {
      window.removeEventListener(PRODUCTS_UPDATED_EVENT, handleProductsUpdate);
      window.removeEventListener(CART_UPDATED_EVENT, handleCartUpdate);
      window.removeEventListener(ORDERS_UPDATED_EVENT, handleOrdersUpdate);
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
    if (freeShippingEligible && selectedShipping.id === "standard") return 0;
    if (activeCoupon?.discountType === "free_shipping") return 0;
    return selectedShipping.cost;
  }, [cart.length, freeShippingEligible, selectedShipping, activeCoupon]);

  const taxableAmount = Math.max(0, cartSubtotal - cartDiscount);
  // 18% GST standard on electronic components & cables in India
  const cartTax = Math.round(taxableAmount * 0.18);
  const cartTotal = taxableAmount + cartTax + cartShipping;

  // Actions
  const addToCart = (product: Product, quantity = 1, note?: string) => {
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
    setOrders((prev) => [newOrder, ...prev]);
    setCart([]);
    setIsCheckoutOpen(false);
    setIsCartOpen(false);
    setLastPlacedOrder(newOrder);

    // 1. Deduct stock for each ordered item from catalogue and sync to Supabase
    orderData.items.forEach((item) => {
      const prodId = item.product.id || item.product.sku;
      const currentProds = getStoredProducts();
      const currentProd = currentProds.find((p) => (p.id || p.sku) === prodId);
      if (currentProd) {
        const currentStock = typeof currentProd.stockCount === "number" ? currentProd.stockCount : 100;
        const newStock = Math.max(0, currentStock - item.quantity);
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
      }
    });

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
    const updated = updateStoredOrder(orderId, updates);
    setOrders(updated);

    const targetOrder = updated.find((o) => o.id === orderId || o.orderNumber === orderId);
    if (targetOrder) {
      // 1. Sync to Supabase
      updateOrderInSupabase(targetOrder.orderNumber, updates).catch((err) => {
        console.warn("Supabase order update error:", err);
      });

      // 2. Dispatch status update email to customer & admin
      if (notifyCustomer) {
        sendOrderStatusEmail(targetOrder).catch((err) => {
          console.warn("Status notification email send error:", err);
        });
      }
    }
    return targetOrder;
  };

  const deleteOrders = (orderIds: string[]) => {
    const targetOrders = orders.filter((o) => orderIds.includes(o.id) || orderIds.includes(o.orderNumber));
    const orderNumbers = targetOrders.map((o) => o.orderNumber);

    const updated = deleteStoredOrders(orderIds);
    setOrders(updated);

    if (orderNumbers.length > 0) {
      deleteOrdersFromSupabase(orderNumbers).catch((err) => {
        console.warn("Supabase order deletion error:", err);
      });
    }
  };

  const run30DayCleanup = (days = 30): { count: number; totalAmount: number } => {
    const { archivedOrders, remainingOrders, csvContent } = cleanupOrdersOlderThanDays(days);
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

  // Modals
  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const openCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
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
        updateOrderStatus,
        updateOrderDetails,
        deleteOrders,
        run30DayCleanup,
        exportOrdersCsv,
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
