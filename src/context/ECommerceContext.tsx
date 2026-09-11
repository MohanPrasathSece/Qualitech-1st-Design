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
  updateStoredOrderStatus,
  CART_UPDATED_EVENT,
  ORDERS_UPDATED_EVENT,
} from "@/lib/ecommerceStore";
import { getStoredProducts, PRODUCTS_UPDATED_EVENT } from "@/lib/productsStore";

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
  isOrdersOpen: boolean;
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

  // Modal Controls
  openCart: () => void;
  closeCart: () => void;
  openCheckout: () => void;
  closeCheckout: () => void;
  openOrders: () => void;
  closeOrders: () => void;
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
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption>(SHIPPING_OPTIONS[0]);

  // Modal states
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
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

    return () => {
      window.removeEventListener(PRODUCTS_UPDATED_EVENT, handleProductsUpdate);
      window.removeEventListener(CART_UPDATED_EVENT, handleCartUpdate);
      window.removeEventListener(ORDERS_UPDATED_EVENT, handleOrdersUpdate);
    };
  }, []);

  const refreshProducts = () => {
    setProducts(getStoredProducts());
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
    setActiveCoupon(null);
    saveStoredCoupon(null);
    setIsCheckoutOpen(false);
    setIsCartOpen(false);
    setLastPlacedOrder(newOrder);
    return newOrder;
  };

  const updateOrderStatus = (
    orderId: string,
    status: Order["orderStatus"],
    paymentStatus?: Order["paymentStatus"]
  ) => {
    const updated = updateStoredOrderStatus(orderId, status, paymentStatus);
    setOrders(updated);
  };

  // Modals
  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const openCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };
  const closeCheckout = () => setIsCheckoutOpen(false);

  const openOrders = () => setIsOrdersOpen(true);
  const closeOrders = () => setIsOrdersOpen(false);

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
        isOrdersOpen,
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
        openCart,
        closeCart,
        openCheckout,
        closeCheckout,
        openOrders,
        closeOrders,
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
