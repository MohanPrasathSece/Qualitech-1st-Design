import React, { useState, useMemo, useEffect, useRef } from "react";
import { Product, BRAND_CATALOGUE_TREE, ALL_INDUSTRIES } from "@/data/products";
import {
  getStoredProducts,
  saveStoredProducts,
  addStoredProduct,
  updateStoredProduct,
  deleteStoredProduct,
  resetStoredProductsToDefault,
  exportProductsToJson,
  exportProductsToCsv,
  importProductsFromJson,
  importProductsFromCsv,
  importProductsFromExcel,
  generateProductExcelTemplate,
  exportProductsToExcel,
  PRODUCTS_UPDATED_EVENT,
} from "@/lib/productsStore";
import { downloadProductDatasheet, readFileAsDataUrl } from "@/lib/datasheetService";
import * as XLSX from "xlsx";
import { useECommerce } from "@/context/ECommerceContext";
import { formatINR, Order, OrderStatus, getProductDefaultPrice, getProductExternalLink } from "@/lib/ecommerceStore";
import { downloadQuotationFromOrder } from "@/lib/pdfQuotationService";
import { sendOrderCancellationAdminRefundAlert } from "@/lib/emailService";
import { testSupabaseConnection, isSupabaseConfigured } from "@/lib/supabaseClient";
import {
  syncAllProductsToSupabase,
  fetchProductsFromSupabase,
  saveProductToSupabase,
  deleteProductFromSupabase,
  uploadProductImageToSupabase,
  fetchQuoteRequestsFromSupabase,
  deleteQuoteRequestFromSupabase,
  SupabaseQuoteRecord,
} from "@/lib/supabaseService";
import { ProductImage } from "@/components/common/ProductImage";

import p1 from "@/assets/p1.jpg";
import p2 from "@/assets/p2.jpg";
import p3 from "@/assets/p3.jpg";
import p4 from "@/assets/p4.jpg";
import p5 from "@/assets/p5.jpg";
import p6 from "@/assets/p6.jpg";
import cardCable from "@/assets/card-cable-assemblies.jpg";
import cardConnectors from "@/assets/card-connectors.jpg";
import cardFacilities from "@/assets/card-facilities.jpg";
import heroHarness from "@/assets/hero-harness.jpg";
import indDefense from "@/assets/ind-defense.jpg";
import indTelecom from "@/assets/ind-telecom.jpg";
import indPower from "@/assets/ind-power.jpg";
import indRailways from "@/assets/ind-railways.jpg";

const PRESET_IMAGES = [
  { label: "Product 1 (Generic)", src: p1 },
  { label: "Product 2 (Generic)", src: p2 },
  { label: "Product 3 (Generic)", src: p3 },
  { label: "Product 4 (RF / Cable)", src: p4 },
  { label: "Product 5 (Generic)", src: p5 },
  { label: "Product 6 (Generic)", src: p6 },
  { label: "Cable Assemblies", src: cardCable },
  { label: "Connectors", src: cardConnectors },
  { label: "Wire Harness", src: heroHarness },
  { label: "Facilities", src: cardFacilities },
  { label: "Defense Spec", src: indDefense },
  { label: "Telecom Spec", src: indTelecom },
  { label: "Power & Energy", src: indPower },
  { label: "Railways Spec", src: indRailways },
];

interface AdminPageProps {
  onNavigateHome: (target: string, isPage?: boolean) => void;
}

type AdminSection = "overview" | "products" | "orders" | "incomplete" | "tracking" | "quotes" | "analytics";

export function AdminPage({ onNavigateHome }: AdminPageProps) {
  const {
    orders,
    updateOrderStatus,
    updateOrderDetails,
    deleteOrders,
    run30DayCleanup,
    exportOrdersCsv,
    checkAndTriggerLowStockAlerts,
    updateLeadStatus,
    deleteAbandonedOrder,
    exportAbandonedOrdersCsv,
  } = useECommerce();

  // Valid, Completed Orders (Excludes Incomplete/Abandoned Checkouts & duplicates, sorted newest first)
  const validOrders = useMemo(() => {
    const seen = new Set<string>();
    return orders
      .filter((o) => {
        const key = (o.orderNumber || o.id || "").trim().toLowerCase();
        if (key && seen.has(key)) return false;
        if (key) seen.add(key);
        return (
          o.orderStatus !== "Payment Incomplete" &&
          o.orderStatus !== "Payment Failed" &&
          o.paymentStatus !== "Failed" &&
          o.paymentStatus !== "Incomplete"
        );
      })
      .sort((a, b) => {
        const timeA = new Date(a.createdAt || 0).getTime() || 0;
        const timeB = new Date(b.createdAt || 0).getTime() || 0;
        return timeB - timeA;
      });
  }, [orders]);

  // Incomplete / Abandoned Checkouts (Customer Leads captured before payment)
  const incompleteOrders = useMemo(() => {
    const seen = new Set<string>();
    return orders
      .filter((o) => {
        const key = (o.orderNumber || o.id || "").trim().toLowerCase();
        if (key && seen.has(key)) return false;
        if (key) seen.add(key);
        return (
          o.orderStatus === "Payment Incomplete" ||
          o.orderStatus === "Payment Failed" ||
          o.paymentStatus === "Failed" ||
          o.paymentStatus === "Incomplete"
        );
      })
      .sort((a, b) => {
        const timeA = new Date(a.createdAt || 0).getTime() || 0;
        const timeB = new Date(b.createdAt || 0).getTime() || 0;
        return timeB - timeA;
      });
  }, [orders]);

  const [leadSearch, setLeadSearch] = useState("");
  const [leadStatusFilter, setLeadStatusFilter] = useState("All");

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return (
      sessionStorage.getItem("qualitech_admin_auth") === "true" ||
      localStorage.getItem("qualitech_admin_auth") === "true"
    );
  });
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isAuditingStock, setIsAuditingStock] = useState(false);

  // Navigation & Layout
  const [activeSection, setActiveSection] = useState<AdminSection>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Supabase Live State
  const [supabaseStatus, setSupabaseStatus] = useState<{ connected: boolean; message: string; url?: string | undefined }>({
    connected: false,
    message: isSupabaseConfigured ? "Checking Supabase connection..." : "Local Storage Mode (.env optional)",
  });
  const [quoteRequests, setQuoteRequests] = useState<SupabaseQuoteRecord[]>([]);
  const [selectedRFQ, setSelectedRFQ] = useState<SupabaseQuoteRecord | null>(null);

  // Products State
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<string>("All");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedStock, setSelectedStock] = useState<string>("All");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Orders State (Redesigned per exact user design)
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("All");
  const [orderTimeFilter, setOrderTimeFilter] = useState<string>("All Time");
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [modalTrackingId, setModalTrackingId] = useState("");
  const [modalTrackingLink, setModalTrackingLink] = useState("");
  const [modalStatusSaving, setModalStatusSaving] = useState(false);

  // Tracking Filter
  const [trackingFilter, setTrackingFilter] = useState<string>("All");

  // Monthly Analytics State
  const [analyticsSelectedMonth, setAnalyticsSelectedMonth] = useState<string>("all");
  const [analyticsRangeMonths, setAnalyticsRangeMonths] = useState<number>(6); // 6, 12, or 0 (all)
  const [analyticsActiveMetric, setAnalyticsActiveMetric] = useState<"revenue" | "orders" | "units">("revenue");
  const [analyticsSubTab, setAnalyticsSubTab] = useState<"monthly" | "overview">("monthly");

  // Seen Badges Tracking state (persisted to localStorage)
  const [seenBadges, setSeenBadges] = useState<{
    orders: string[];
    tracking: string[];
    quotes: string[];
    productsCount: number;
  }>(() => {
    try {
      const cached = localStorage.getItem("qualitech_admin_seen_badges_v2");
      if (cached) return JSON.parse(cached);
    } catch (_) {}
    return {
      orders: [],
      tracking: [],
      quotes: [],
      productsCount: 0,
    };
  });

  // Whenever a section is active, mark all its current items as seen so the badge clears
  useEffect(() => {
    if (!isAuthenticated) return;

    setSeenBadges((prev) => {
      let changed = false;
      const next = { ...prev };

      if (activeSection === "orders") {
        const currentIds = validOrders.map((o) => (o.orderNumber || o.id).toLowerCase());
        const merged = Array.from(new Set([...(prev.orders || []), ...currentIds]));
        if (merged.length !== (prev.orders || []).length) {
          next.orders = merged;
          changed = true;
        }
      } else if (activeSection === "tracking") {
        const activeShipmentIds = validOrders
          .filter((o) => o.orderStatus !== "Delivered" && o.orderStatus !== "Cancelled")
          .map((o) => (o.orderNumber || o.id).toLowerCase());
        const merged = Array.from(new Set([...(prev.tracking || []), ...activeShipmentIds]));
        if (merged.length !== (prev.tracking || []).length) {
          next.tracking = merged;
          changed = true;
        }
      } else if (activeSection === "quotes") {
        const currentQuoteIds = quoteRequests.map((q) => (q.rfq_number || q.id).toLowerCase());
        const merged = Array.from(new Set([...(prev.quotes || []), ...currentQuoteIds]));
        if (merged.length !== (prev.quotes || []).length) {
          next.quotes = merged;
          changed = true;
        }
      } else if (activeSection === "products") {
        if (prev.productsCount !== products.length) {
          next.productsCount = products.length;
          changed = true;
        }
      }

      if (changed) {
        try {
          localStorage.setItem("qualitech_admin_seen_badges_v2", JSON.stringify(next));
        } catch (_) {}
        return next;
      }
      return prev;
    });
  }, [activeSection, validOrders, quoteRequests, products.length, isAuthenticated]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  // Modals & Forms State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [importFormat, setImportFormat] = useState<"csv" | "json">("csv");
  const [toastMessage, setToastMessage] = useState<{ title: string; type: "success" | "error" | "info" } | null>(null);

  // Excel Bulk Import State
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [excelPreviewRows, setExcelPreviewRows] = useState<any[]>([]);
  const [excelTotalCount, setExcelTotalCount] = useState(0);
  const [isProcessingExcel, setIsProcessingExcel] = useState(false);
  const excelFileInputRef = useRef<HTMLInputElement>(null);
  const datasheetInputRef = useRef<HTMLInputElement>(null);

  // Product Form Data State
  const [formData, setFormData] = useState<Partial<Product>>({
    sku: "",
    name: "",
    brand: "Qualitech",
    category: "Custom Cable Assemblies",
    subCategory: "",
    price: 4500,
    salePrice: undefined,
    stockCount: 150,
    unit: "pcs",
    leadTime: "Ships in 24-48 Hours",
    description: "",
    features: [""],
    specs: { Manufacturer: "Qualitech Connectronics" },
    industries: ["Telecommunications", "Industrial Automation"],
    inStock: true,
    featured: false,
    image: p1,
    externalUrl: "",
    isEnquiry: false,
    datasheetUrl: "",
  });

  const [activeFormTab, setActiveFormTab] = useState<"basic" | "pricing" | "features" | "specs" | "media">("basic");
  const [newSpecKey, setNewSpecKey] = useState("");
  const [newSpecVal, setNewSpecVal] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const importFileInputRef = useRef<HTMLInputElement>(null);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setIsLoggingIn(true);

    const validEmails = [
      "admin@qualitech.com",
      "admin@qualitechconnectronics.com",
      "admin",
      "qualitech",
      ((import.meta.env["VITE_ADMIN_USER"] as string | undefined) || "").toLowerCase(),
    ].filter(Boolean);

    const validPasswords = [
      "Qualitech@2026",
      "qualitech123",
      "Qualitech123",
      "admin123",
      (import.meta.env["VITE_ADMIN_PASSWORD"] as string | undefined) || "",
    ].filter(Boolean);

    const inputEmail = loginEmail.trim().toLowerCase();
    const inputPass = loginPassword.trim();

    const emailMatches = validEmails.some((ve) => ve === inputEmail);
    const passMatches = validPasswords.some((vp) => vp === inputPass);

    setTimeout(() => {
      if (emailMatches && passMatches) {
        sessionStorage.setItem("qualitech_admin_auth", "true");
        if (rememberMe) {
          localStorage.setItem("qualitech_admin_auth", "true");
        }
        setIsAuthenticated(true);
        setLoginError("");
        showToast("Welcome to Qualitech Admin Dashboard", "success");
      } else {
        setLoginError("Invalid Administrator ID or Password. Please try again.");
      }
      setIsLoggingIn(false);
    }, 350);
  };

  const handleAdminLogout = () => {
    sessionStorage.removeItem("qualitech_admin_auth");
    localStorage.removeItem("qualitech_admin_auth");
    setIsAuthenticated(false);
    setLoginEmail("");
    setLoginPassword("");
    showToast("Logged out successfully.", "info");
  };

  // Initial Data & Backend Hydration
  useEffect(() => {
    // 1. Load initial cached/seed products
    const initial = getStoredProducts();
    setProducts(initial);

    // 2. Check Supabase connection health & pull real products if available
    testSupabaseConnection().then((res) => {
      setSupabaseStatus(res);
      if (res.connected) {
        fetchProductsFromSupabase().then((cloudProds) => {
          if (cloudProds && cloudProds.length > 0) {
            setProducts(cloudProds);
          }
        });
      }
    });

    // 3. Load RFQ quotation requests
    fetchQuoteRequestsFromSupabase().then((quotes) => {
      setQuoteRequests(quotes);
    });

    // 4. Live reactivity: auto-update products without requiring manual page refresh
    const handleProductsUpdated = (e: any) => {
      if (e.detail && Array.isArray(e.detail)) {
        setProducts(e.detail);
      } else {
        setProducts(getStoredProducts());
      }
    };
    window.addEventListener(PRODUCTS_UPDATED_EVENT, handleProductsUpdated);

    // Periodic live background sync every 4 seconds so admin section always takes latest updates
    const livePoll = setInterval(() => {
      fetchQuoteRequestsFromSupabase().then((quotes) => {
        if (Array.isArray(quotes)) {
          setQuoteRequests(quotes);
        }
      }).catch(() => {});

      if (isSupabaseConfigured) {
        fetchProductsFromSupabase().then((cloudProds) => {
          if (cloudProds && cloudProds.length > 0) {
            setProducts((prev) => (prev.length !== cloudProds.length ? cloudProds : prev));
          }
        }).catch(() => {});
      }
    }, 4000);

    const handleStorageChange = (e: StorageEvent) => {
      if (!e.key || e.key.includes("qualitech")) {
        setProducts(getStoredProducts());
      }
    };
    window.addEventListener("storage", handleStorageChange);

    return () => {
      clearInterval(livePoll);
      window.removeEventListener(PRODUCTS_UPDATED_EVENT, handleProductsUpdated);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Keep viewingOrder reactive to real-time order state updates
  useEffect(() => {
    if (viewingOrder) {
      const match = orders.find(
        (o) =>
          o.orderNumber === viewingOrder.orderNumber ||
          o.id === viewingOrder.id
      );
      if (
        match &&
        (match.orderStatus !== viewingOrder.orderStatus ||
          match.trackingNumber !== viewingOrder.trackingNumber ||
          match.trackingLink !== viewingOrder.trackingLink)
      ) {
        setViewingOrder(match);
      }
    }
  }, [orders, viewingOrder]);

  const showToast = (title: string, type: "success" | "error" | "info" = "success") => {
    setToastMessage({ title, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (selectedBrand !== "All" && p.brand !== selectedBrand) return false;
      if (selectedCategory !== "All" && p.category !== selectedCategory) return false;
      if (selectedStock === "InStock" && !p.inStock) return false;
      if (selectedStock === "OutOfStock" && p.inStock) return false;
      if (selectedStock === "LowStock" && (p.stockCount || 100) > (p.lowStockThreshold || 15)) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          p.sku.toLowerCase().includes(q) ||
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [products, selectedBrand, selectedCategory, selectedStock, searchQuery]);

  // Paginated Slice
  const totalPages = Math.ceil(filteredProducts.length / pageSize) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, currentPage, pageSize]);

  // Date & Time formatting helper
  const formatOrderDateTime = (isoString: string): string => {
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return isoString;
      const day = d.getDate();
      const month = d.getMonth() + 1;
      const year = d.getFullYear();
      let hours = d.getHours();
      const minutes = d.getMinutes().toString().padStart(2, "0");
      const ampm = hours >= 12 ? "pm" : "am";
      hours = hours % 12;
      hours = hours ? hours : 12;
      return `${day}/${month}/${year} ${hours.toString().padStart(2, "0")}:${minutes} ${ampm}`;
    } catch {
      return isoString;
    }
  };

  // Recognized Total Order Revenue:
  // - Prepaid orders: counted immediately once order comes (unless cancelled)
  // - Cash on Delivery orders: counted only once the order is Delivered
  // - Cancelled orders: excluded
  const { totalSimulatedRevenue, prepaidRevenue, codDeliveredRevenue, pendingCodRevenue } = useMemo(() => {
    let total = 0;
    let prepaid = 0;
    let codDelivered = 0;
    let pendingCod = 0;

    validOrders.forEach((ord) => {
      const isCancelled = (ord.orderStatus || "").trim().toLowerCase() === "cancelled";
      if (isCancelled) return; // Completely excluded from store analytics revenue

      const isCod =
        ord.paymentMethod?.toLowerCase().includes("cash") ||
        ord.paymentMethod?.toLowerCase().includes("cod");
      const isPrepaid = ord.paymentStatus === "Paid" || !isCod;

      if (isPrepaid) {
        total += ord.total || 0;
        prepaid += ord.total || 0;
      } else if (isCod) {
        if (ord.orderStatus === "Delivered") {
          total += ord.total || 0;
          codDelivered += ord.total || 0;
        } else {
          pendingCod += ord.total || 0;
        }
      }
    });

    return {
      totalSimulatedRevenue: total,
      prepaidRevenue: prepaid,
      codDeliveredRevenue: codDelivered,
      pendingCodRevenue: pendingCod,
    };
  }, [validOrders]);

  const totalCatalogValue = useMemo(() => {
    return products.reduce((sum, p) => sum + getProductDefaultPrice(p) * (p.stockCount || 100), 0);
  }, [products]);

  const lowStockCount = useMemo(() => {
    return products.filter((p) => (p.stockCount || 100) <= (p.lowStockThreshold || 15)).length;
  }, [products]);

  // ── Monthly Analytics Aggregation ──
  const monthlyAnalyticsData = useMemo(() => {
    const now = new Date();
    const monthsMap: Record<
      string,
      {
        key: string;
        label: string;
        year: number;
        month: number;
        totalOrders: number;
        activeOrders: number;
        cancelledOrders: number;
        deliveredOrders: number;
        revenue: number;
        grossRevenue: number;
        prepaidRevenue: number;
        codDeliveredRevenue: number;
        pendingCodRevenue: number;
        totalUnitsSold: number;
        customersSet: Set<string>;
        brandRevenue: { Amphenol: number; Zolex: number; Qualitech: number; Other: number };
        brandUnits: { Amphenol: number; Zolex: number; Qualitech: number; Other: number };
        productsSold: Record<string, { sku: string; name: string; brand: string; quantity: number; revenue: number }>;
        statusCounts: Record<string, number>;
      }
    > = {};

    const monthsCount = analyticsRangeMonths === 0 ? 24 : analyticsRangeMonths;
    for (let i = monthsCount - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleString("en-US", { month: "short", year: "numeric" });
      monthsMap[key] = {
        key,
        label,
        year: d.getFullYear(),
        month: d.getMonth() + 1,
        totalOrders: 0,
        activeOrders: 0,
        cancelledOrders: 0,
        deliveredOrders: 0,
        revenue: 0,
        grossRevenue: 0,
        prepaidRevenue: 0,
        codDeliveredRevenue: 0,
        pendingCodRevenue: 0,
        totalUnitsSold: 0,
        customersSet: new Set<string>(),
        brandRevenue: { Amphenol: 0, Zolex: 0, Qualitech: 0, Other: 0 },
        brandUnits: { Amphenol: 0, Zolex: 0, Qualitech: 0, Other: 0 },
        productsSold: {},
        statusCounts: {},
      };
    }

    validOrders.forEach((ord) => {
      const ordDate = new Date(ord.createdAt || Date.now());
      if (isNaN(ordDate.getTime())) return;
      const key = `${ordDate.getFullYear()}-${String(ordDate.getMonth() + 1).padStart(2, "0")}`;

      if (!monthsMap[key]) {
        if (analyticsRangeMonths !== 0 && Object.keys(monthsMap).length >= monthsCount) {
          return;
        }
        monthsMap[key] = {
          key,
          label: ordDate.toLocaleString("en-US", { month: "short", year: "numeric" }),
          year: ordDate.getFullYear(),
          month: ordDate.getMonth() + 1,
          totalOrders: 0,
          activeOrders: 0,
          cancelledOrders: 0,
          deliveredOrders: 0,
          revenue: 0,
          grossRevenue: 0,
          prepaidRevenue: 0,
          codDeliveredRevenue: 0,
          pendingCodRevenue: 0,
          totalUnitsSold: 0,
          customersSet: new Set<string>(),
          brandRevenue: { Amphenol: 0, Zolex: 0, Qualitech: 0, Other: 0 },
          brandUnits: { Amphenol: 0, Zolex: 0, Qualitech: 0, Other: 0 },
          productsSold: {},
          statusCounts: {},
        };
      }

      const m = monthsMap[key];
      m.totalOrders++;

      const isCancelled = (ord.orderStatus || "").trim().toLowerCase() === "cancelled";
      if (isCancelled) {
        m.cancelledOrders++;
        m.statusCounts["Cancelled"] = (m.statusCounts["Cancelled"] || 0) + 1;
        return;
      }

      m.activeOrders++;
      const status = ord.orderStatus || "Confirmed";
      m.statusCounts[status] = (m.statusCounts[status] || 0) + 1;
      if (status === "Delivered") {
        m.deliveredOrders++;
      }

      const custId = ord.customer?.email || ord.customer?.phone || ord.customer?.fullName || ord.orderNumber;
      if (custId) m.customersSet.add(custId.toLowerCase());

      const orderTotal = ord.total || 0;
      m.grossRevenue += orderTotal;

      const isCod =
        ord.paymentMethod?.toLowerCase().includes("cash") ||
        ord.paymentMethod?.toLowerCase().includes("cod");
      const isPrepaid = ord.paymentStatus === "Paid" || !isCod;

      if (isPrepaid) {
        m.revenue += orderTotal;
        m.prepaidRevenue += orderTotal;
      } else if (isCod) {
        if (status === "Delivered") {
          m.revenue += orderTotal;
          m.codDeliveredRevenue += orderTotal;
        } else {
          m.pendingCodRevenue += orderTotal;
        }
      }

      (ord.items || []).forEach((item) => {
        const qty = item.quantity || 1;
        const lineTotal = (item.unitPrice || 0) * qty;
        m.totalUnitsSold += qty;

        const brand = item.product?.brand || "Qualitech";
        if (brand === "Amphenol" || brand === "Zolex" || brand === "Qualitech") {
          m.brandRevenue[brand] += lineTotal;
          m.brandUnits[brand] += qty;
        } else {
          m.brandRevenue.Other += lineTotal;
          m.brandUnits.Other += qty;
        }

        const sku = item.product?.sku || item.id || "SKU-UNKNOWN";
        if (!m.productsSold[sku]) {
          m.productsSold[sku] = {
            sku,
            name: item.product?.name || sku,
            brand: item.product?.brand || "Qualitech",
            quantity: 0,
            revenue: 0,
          };
        }
        m.productsSold[sku].quantity += qty;
        m.productsSold[sku].revenue += lineTotal;
      });
    });

    const sortedList = Object.values(monthsMap)
      .sort((a, b) => a.key.localeCompare(b.key))
      .map((m, idx, arr) => {
        const prev = idx > 0 ? arr[idx - 1] : null;
        let momRevenueGrowth: number | null = null;
        let momOrdersGrowth: number | null = null;

        if (prev) {
          if (prev.revenue > 0) {
            momRevenueGrowth = Math.round(((m.revenue - prev.revenue) / prev.revenue) * 100);
          } else if (m.revenue > 0) {
            momRevenueGrowth = 100;
          }
          if (prev.activeOrders > 0) {
            momOrdersGrowth = Math.round(((m.activeOrders - prev.activeOrders) / prev.activeOrders) * 100);
          } else if (m.activeOrders > 0) {
            momOrdersGrowth = 100;
          }
        }

        const aov = m.activeOrders > 0 ? Math.round(m.revenue / m.activeOrders) : 0;
        const topProducts = Object.values(m.productsSold).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

        return {
          ...m,
          uniqueCustomerCount: m.customersSet.size,
          aov,
          momRevenueGrowth,
          momOrdersGrowth,
          topProducts,
        };
      });

    return sortedList;
  }, [validOrders, analyticsRangeMonths]);

  const selectedMonthData = useMemo(() => {
    if (analyticsSelectedMonth === "all") {
      let totalOrders = 0;
      let activeOrders = 0;
      let cancelledOrders = 0;
      let deliveredOrders = 0;
      let revenue = 0;
      let grossRevenue = 0;
      let prepaidRevenue = 0;
      let codDeliveredRevenue = 0;
      let pendingCodRevenue = 0;
      let totalUnitsSold = 0;
      const brandRevenue = { Amphenol: 0, Zolex: 0, Qualitech: 0, Other: 0 };
      const brandUnits = { Amphenol: 0, Zolex: 0, Qualitech: 0, Other: 0 };
      const productsSold: Record<string, { sku: string; name: string; brand: string; quantity: number; revenue: number }> = {};
      const statusCounts: Record<string, number> = {};

      monthlyAnalyticsData.forEach((m) => {
        totalOrders += m.totalOrders;
        activeOrders += m.activeOrders;
        cancelledOrders += m.cancelledOrders;
        deliveredOrders += m.deliveredOrders;
        revenue += m.revenue;
        grossRevenue += m.grossRevenue;
        prepaidRevenue += m.prepaidRevenue;
        codDeliveredRevenue += m.codDeliveredRevenue;
        pendingCodRevenue += m.pendingCodRevenue;
        totalUnitsSold += m.totalUnitsSold;
        brandRevenue.Amphenol += m.brandRevenue.Amphenol;
        brandRevenue.Zolex += m.brandRevenue.Zolex;
        brandRevenue.Qualitech += m.brandRevenue.Qualitech;
        brandRevenue.Other += m.brandRevenue.Other;
        brandUnits.Amphenol += m.brandUnits.Amphenol;
        brandUnits.Zolex += m.brandUnits.Zolex;
        brandUnits.Qualitech += m.brandUnits.Qualitech;
        brandUnits.Other += m.brandUnits.Other;

        Object.entries(m.statusCounts).forEach(([st, cnt]) => {
          statusCounts[st] = (statusCounts[st] || 0) + cnt;
        });

        Object.values(m.productsSold).forEach((p) => {
          const existing = productsSold[p.sku];
          if (!existing) {
            productsSold[p.sku] = { ...p };
          } else {
            existing.quantity += p.quantity;
            existing.revenue += p.revenue;
          }
        });
      });

      const aov = activeOrders > 0 ? Math.round(revenue / activeOrders) : 0;
      const topProducts = Object.values(productsSold).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

      return {
        key: "all",
        label: "All Analyzed Months (Combined Summary)",
        totalOrders,
        activeOrders,
        cancelledOrders,
        deliveredOrders,
        revenue,
        grossRevenue,
        prepaidRevenue,
        codDeliveredRevenue,
        pendingCodRevenue,
        totalUnitsSold,
        uniqueCustomerCount: 0,
        aov,
        momRevenueGrowth: null,
        momOrdersGrowth: null,
        brandRevenue,
        brandUnits,
        topProducts,
        statusCounts,
      };
    }

    return (
      monthlyAnalyticsData.find((m) => m.key === analyticsSelectedMonth) ||
      monthlyAnalyticsData[monthlyAnalyticsData.length - 1] ||
      null
    );
  }, [monthlyAnalyticsData, analyticsSelectedMonth]);

  const maxMonthlyMetricVal = useMemo(() => {
    return Math.max(
      ...monthlyAnalyticsData.map((m) => {
        if (analyticsActiveMetric === "revenue") return m.revenue;
        if (analyticsActiveMetric === "orders") return m.activeOrders;
        return m.totalUnitsSold;
      }),
      1
    );
  }, [monthlyAnalyticsData, analyticsActiveMetric]);

  const peakMonth = useMemo(() => {
    if (!monthlyAnalyticsData.length) return null;
    return [...monthlyAnalyticsData].sort((a, b) => {
      if (analyticsActiveMetric === "revenue") return b.revenue - a.revenue;
      if (analyticsActiveMetric === "orders") return b.activeOrders - a.activeOrders;
      return b.totalUnitsSold - a.totalUnitsSold;
    })[0];
  }, [monthlyAnalyticsData, analyticsActiveMetric]);

  const handleExportMonthlyAnalytics = () => {
    try {
      const rows = monthlyAnalyticsData.map((m) => ({
        "Month": m.label,
        "Total Orders": m.totalOrders,
        "Active Orders": m.activeOrders,
        "Cancelled Orders": m.cancelledOrders,
        "Units Sold": m.totalUnitsSold,
        "Recognized Revenue (INR)": m.revenue,
        "Gross Value (INR)": m.grossRevenue,
        "Prepaid Revenue (INR)": m.prepaidRevenue,
        "COD Delivered (INR)": m.codDeliveredRevenue,
        "COD In-Transit (INR)": m.pendingCodRevenue,
        "Average Order Value (INR)": m.aov,
        "Amphenol Revenue (INR)": m.brandRevenue.Amphenol,
        "Zolex Revenue (INR)": m.brandRevenue.Zolex,
        "Qualitech Revenue (INR)": m.brandRevenue.Qualitech,
        "MoM Revenue Growth (%)": m.momRevenueGrowth !== null ? `${m.momRevenueGrowth}%` : "N/A",
      }));

      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Monthly Analytics");
      XLSX.writeFile(wb, `Qualitech_Monthly_Analytics_${new Date().toISOString().slice(0, 10)}.xlsx`);
      showToast("Monthly analytics exported to Excel successfully!", "success");
    } catch (err: any) {
      showToast("Failed to export analytics: " + (err?.message || "Unknown error"), "error");
    }
  };

  // Filtered Orders (Supports Time Filter, Status Filter & Full text search, sorted newest first)
  const filteredOrders = useMemo(() => {
    return validOrders
      .filter((ord) => {
        if (orderStatusFilter !== "All" && ord.orderStatus !== orderStatusFilter) {
          return false;
        }

        // Time Range Filter
        if (orderTimeFilter !== "All Time") {
          const ordTime = new Date(ord.createdAt || 0).getTime() || 0;
          const now = Date.now();
          if (orderTimeFilter === "Today") {
            const startOfDay = new Date().setHours(0, 0, 0, 0);
            if (ordTime < startOfDay) return false;
          } else if (orderTimeFilter === "This Week") {
            const startOfWeek = now - 7 * 24 * 60 * 60 * 1000;
            if (ordTime < startOfWeek) return false;
          } else if (orderTimeFilter === "This Month") {
            const startOfMonth = now - 30 * 24 * 60 * 60 * 1000;
            if (ordTime < startOfMonth) return false;
          }
        }

        if (orderSearch.trim()) {
          const q = orderSearch.toLowerCase();
          return (
            ord.orderNumber.toLowerCase().includes(q) ||
            ord.customer.fullName.toLowerCase().includes(q) ||
            (ord.customer.email && ord.customer.email.toLowerCase().includes(q)) ||
            (ord.customer.phone && ord.customer.phone.toLowerCase().includes(q)) ||
            (ord.customer.companyName && ord.customer.companyName.toLowerCase().includes(q)) ||
            (ord.trackingNumber && ord.trackingNumber.toLowerCase().includes(q))
          );
        }
        return true;
      })
      .sort((a, b) => {
        const timeA = new Date(a.createdAt || 0).getTime() || 0;
        const timeB = new Date(b.createdAt || 0).getTime() || 0;
        return timeB - timeA;
      });
  }, [validOrders, orderStatusFilter, orderTimeFilter, orderSearch]);

  // Order Handlers
  const handleOpenOrderModal = (ord: Order) => {
    setViewingOrder(ord);
    setModalTrackingId(ord.trackingNumber || "");
    setModalTrackingLink(ord.trackingLink || "");
  };

  const PROGRESSION_STAGES: OrderStatus[] = [
    "Confirmed",
    "Processing",
    "Quality Check",
    "Dispatched",
    "Delivered",
  ];

  const handleModalStatusChange = async (newStatus: OrderStatus) => {
    if (!viewingOrder) return;

    if (viewingOrder.orderStatus === "Cancelled") {
      showToast("This order is cancelled and cannot be reverted to any other status.", "warning");
      return;
    }

    const currentNormalized = viewingOrder.orderStatus === "Shipped" ? "Dispatched" : viewingOrder.orderStatus;
    const currentIdx = PROGRESSION_STAGES.indexOf(currentNormalized as OrderStatus);
    const targetIdx = PROGRESSION_STAGES.indexOf(newStatus);

    // Prevent going backwards in workflow
    if (newStatus !== "Cancelled" && currentIdx !== -1 && targetIdx !== -1 && targetIdx < currentIdx) {
      showToast("Order status can only move forward, cannot go backwards.", "warning");
      return;
    }

    if (viewingOrder.orderStatus === "Delivered" && newStatus === "Cancelled") {
      showToast("Delivered orders cannot be cancelled.", "warning");
      return;
    }

    if (newStatus === "Cancelled") {
      if (!confirm(`Are you sure you want to cancel Order #${viewingOrder.orderNumber}? Once cancelled, inventory will be restocked and the order CANNOT be reverted to any other status.`)) {
        return;
      }
    }

    setModalStatusSaving(true);
    try {
      const orderKey = viewingOrder.orderNumber || viewingOrder.id;
      const oldStatus = viewingOrder.orderStatus;
      const updated = updateOrderDetails(
        orderKey,
        {
          orderStatus: newStatus,
          trackingNumber: modalTrackingId.trim() || viewingOrder.trackingNumber,
          trackingLink: modalTrackingLink.trim() || viewingOrder.trackingLink,
        },
        true // dispatches status update email
      );
      if (updated) {
        setViewingOrder(updated);
      } else {
        setViewingOrder({
          ...viewingOrder,
          orderStatus: newStatus,
          trackingNumber: modalTrackingId.trim() || viewingOrder.trackingNumber,
          trackingLink: modalTrackingLink.trim() || viewingOrder.trackingLink,
        });
      }

      // Automatically restock products to catalogue inventory when an order is Cancelled
      if (newStatus === "Cancelled" && oldStatus !== "Cancelled") {
        const currentProds = getStoredProducts();
        let restockCount = 0;
        const updatedProds = currentProds.map((p) => {
          const matchedItem = (viewingOrder.items || []).find(
            (item) => item.product.id === p.id || item.product.sku === p.sku
          );
          if (matchedItem) {
            const addedQty = matchedItem.quantity || 1;
            restockCount += addedQty;
            const newStock = (p.stockCount || 0) + addedQty;
            return {
              ...p,
              stockCount: newStock,
              inStock: newStock > 0,
            };
          }
          return p;
        });

        saveStoredProducts(updatedProds);
        setProducts(updatedProds);
        if (isSupabaseConfigured) {
          syncAllProductsToSupabase(updatedProds).catch(console.warn);
        }

        // Send manual refund instructions to Admin email with customer ID and details
        sendOrderCancellationAdminRefundAlert(viewingOrder).catch((err) => {
          console.warn("Failed to dispatch manual refund alert email to admin:", err);
        });

        showToast(
          `Order #${viewingOrder.orderNumber} cancelled. Restocked ${restockCount} items. Refund details emailed to Admin!`,
          "success"
        );
      } else if (oldStatus === "Cancelled" && newStatus !== "Cancelled") {
        // Re-deduct inventory if order is un-cancelled
        const currentProds = getStoredProducts();
        const updatedProds = currentProds.map((p) => {
          const matchedItem = (viewingOrder.items || []).find(
            (item) => item.product.id === p.id || item.product.sku === p.sku
          );
          if (matchedItem) {
            const subQty = matchedItem.quantity || 1;
            const newStock = Math.max(0, (p.stockCount || 0) - subQty);
            return {
              ...p,
              stockCount: newStock,
              inStock: newStock > 0,
            };
          }
          return p;
        });

        saveStoredProducts(updatedProds);
        setProducts(updatedProds);
        if (isSupabaseConfigured) {
          syncAllProductsToSupabase(updatedProds).catch(console.warn);
        }
        showToast(
          `Order #${viewingOrder.orderNumber} restored to ${newStatus}. Inventory adjusted.`,
          "info"
        );
      } else {
        showToast(`Order #${viewingOrder.orderNumber} updated to ${newStatus} & notification emailed to ${viewingOrder.customer.email}!`, "success");
      }
    } catch (err) {
      showToast("Failed to update status", "error");
    } finally {
      setModalStatusSaving(false);
    }
  };

  const handleSaveTracking = () => {
    if (!viewingOrder) return;
    const orderKey = viewingOrder.orderNumber || viewingOrder.id;
    const updated = updateOrderDetails(
      orderKey,
      {
        trackingNumber: modalTrackingId.trim(),
        trackingLink: modalTrackingLink.trim(),
      },
      viewingOrder.orderStatus === "Shipped" || viewingOrder.orderStatus === "Dispatched"
    );
    if (updated) {
      setViewingOrder(updated);
    }
    showToast("Tracking ID & Link saved and synced!", "success");
  };

  const handleRun30DayCleanup = () => {
    const res = run30DayCleanup(30);
    if (res.count > 0) {
      showToast(`30-Day Cleanup: Archived & removed ${res.count} expired orders. Excel report emailed to admin and downloaded!`, "success");
    } else {
      // Export current orders
      const csv = exportOrdersCsv();
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `qualitech-orders-active-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      showToast("No orders older than 30 days. Exported full active orders ledger to Excel CSV.", "info");
    }
  };

  const handleAuditLowStock = async () => {
    setIsAuditingStock(true);
    try {
      const count = await checkAndTriggerLowStockAlerts("Admin Manual Stock Audit");
      if (count > 0) {
        showToast(`Stock Audit Complete: ${count} depleted items detected. Warning email sent to admin!`, "success");
      } else {
        showToast("All products are above minimum safety stock levels.", "info");
      }
    } catch (err) {
      showToast("Error running stock audit.", "error");
    } finally {
      setIsAuditingStock(false);
    }
  };

  const handleExportOrders = () => {
    const csv = exportOrdersCsv();
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `qualitech-orders-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${orders.length} orders to Excel CSV.`, "success");
  };

  // Filtered Tracking Shipments (sorted newest first with case-insensitivity & Shipped/Dispatched normalization)
  const trackingOrders = useMemo(() => {
    const normalize = (status?: string): string => {
      const s = (status || "").trim().toLowerCase();
      if (s === "shipped") return "dispatched";
      return s;
    };

    const target = normalize(trackingFilter);
    const list = validOrders.filter((o) => {
      if (trackingFilter === "All") return true;
      return normalize(o.orderStatus) === target;
    });

    return [...list].sort((a, b) => {
      const timeA = new Date(a.createdAt || 0).getTime() || 0;
      const timeB = new Date(b.createdAt || 0).getTime() || 0;
      return timeB - timeA;
    });
  }, [validOrders, trackingFilter]);

  // Form Handlers
  const handleOpenAddForm = () => {
    setEditingProduct(null);
    const randomSkuNum = Math.floor(1000 + Math.random() * 9000);
    setFormData({
      sku: `QT-${randomSkuNum}`,
      name: "",
      brand: "Qualitech",
      category: "Custom Wire Harnesses",
      subCategory: "Wire / Cable / Flex to Board",
      price: 3200,
      salePrice: undefined,
      stockCount: 150,
      unit: "pcs",
      leadTime: "Ships in 24-48 Hours",
      description: "Precision engineered point-to-point harness assembly for industrial and aerospace applications.",
      features: [
        "100% automated electrical continuity & hipot verified",
        "IPC/WHMA-A-620 Class 3 workmanship standard",
      ],
      specs: {
        Manufacturer: "Qualitech Connectronics Pvt Ltd",
        Standard: "IPC/WHMA-A-620 Class 3",
        OperatingTemp: "-40°C to +125°C",
      },
      industries: ["Telecommunications", "Industrial Automation", "Defense"],
      inStock: true,
      featured: false,
      image: p1,
      externalUrl: "",
      isEnquiry: false,
    });
    setActiveFormTab("basic");
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (prod: Product) => {
    setEditingProduct(prod);
    setFormData({
      ...prod,
      price: getProductDefaultPrice(prod),
      features: prod.features && prod.features.length > 0 ? [...prod.features] : [""],
      specs: prod.specs ? { ...prod.specs } : {},
      industries: prod.industries ? [...prod.industries] : [],
    });
    setActiveFormTab("basic");
    setIsFormOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      showToast("Please enter a product name.", "error");
      return;
    }
    const cleanFeatures = (formData.features || []).filter((f) => f.trim() !== "");

    if (editingProduct) {
      const prodId = editingProduct.id || editingProduct.sku;
      const updatedList = updateStoredProduct(prodId, {
        ...formData,
        features: cleanFeatures,
      });
      setProducts(updatedList);
      const savedProd = updatedList.find((p) => (p.id || p.sku) === prodId);
      if (savedProd) {
        saveProductToSupabase(savedProd).catch(console.warn);
      }
      showToast(`Product "${formData.name}" updated & synced!`, "success");
    } else {
      const updatedList = addStoredProduct({
        ...formData,
        features: cleanFeatures,
      });
      setProducts(updatedList);
      const savedProd = updatedList[0];
      if (savedProd) {
        saveProductToSupabase(savedProd).catch(console.warn);
      }
      showToast(`Product "${formData.name}" added to catalogue & synced!`, "success");
    }
    setIsFormOpen(false);
  };

  const handleDeleteProduct = () => {
    if (!productToDelete) return;
    const prodId = productToDelete.id || productToDelete.sku;
    deleteProductFromSupabase(prodId).catch(console.warn);
    const updated = deleteStoredProduct(prodId);
    setProducts(updated);
    showToast(`Deleted product "${productToDelete.name}".`, "info");
    setProductToDelete(null);
  };

  const handleDuplicateProduct = (prod: Product) => {
    const randomSku = `QT-${Math.floor(1000 + Math.random() * 9000)}`;
    const duplicate: Partial<Product> = {
      ...prod,
      id: undefined,
      sku: randomSku,
      name: `${prod.name} (Copy)`,
      featured: false,
    };
    const updated = addStoredProduct(duplicate);
    setProducts(updated);
    if (updated[0]) saveProductToSupabase(updated[0]).catch(console.warn);
    showToast(`Duplicated product as "${duplicate.name}".`, "success");
  };

  const handleUpdateStockCount = (prod: Product, newCount: number) => {
    const qty = Math.max(0, newCount);
    const prodId = prod.id || prod.sku;
    const updated = updateStoredProduct(prodId, { stockCount: qty, inStock: qty > 0 });
    setProducts(updated);
    const updatedProd = updated.find((p) => (p.id || p.sku) === prodId);
    if (updatedProd) saveProductToSupabase(updatedProd).catch(console.warn);
    showToast(`Updated stock for ${prod.name} to ${qty} ${prod.unit || "pcs"}.`, "success");
  };

  const handleToggleStock = (prod: Product) => {
    const prodId = prod.id || prod.sku;
    const newStockState = !prod.inStock;
    const newCount = newStockState ? Math.max(10, prod.stockCount || 10) : 0;
    const updated = updateStoredProduct(prodId, { inStock: newStockState, stockCount: newCount });
    setProducts(updated);
    const updatedProd = updated.find((p) => (p.id || p.sku) === prodId);
    if (updatedProd) saveProductToSupabase(updatedProd).catch(console.warn);
    showToast(`${prod.name} is now ${newStockState ? "In Stock" : "Out of Stock"}.`, "info");
  };

  const handleExportJson = () => {
    const json = exportProductsToJson();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `qualitech-catalogue-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Exported catalogue as JSON.", "success");
  };

  const handleExportCsv = () => {
    const csv = exportProductsToCsv();
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `qualitech-catalogue-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Exported catalogue as CSV.", "success");
  };

  const handleImportSubmit = () => {
    if (!importText.trim()) {
      showToast("Please enter or paste catalogue data to import.", "error");
      return;
    }

    if (importFormat === "csv") {
      const res = importProductsFromCsv(importText);
      if (res.success) {
        setProducts(getStoredProducts());
        showToast(`Successfully imported ${res.count} products from CSV!`, "success");
        setIsImportModalOpen(false);
        setImportText("");
      } else {
        showToast(res.error || "Failed to import CSV.", "error");
      }
    } else {
      const res = importProductsFromJson(importText);
      if (res.success) {
        setProducts(getStoredProducts());
        showToast(`Successfully imported ${res.count} products from JSON!`, "success");
        setIsImportModalOpen(false);
        setImportText("");
      } else {
        showToast(res.error || "Failed to import JSON.", "error");
      }
    }
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    showToast("Uploading image to Supabase Storage 'product-images'...", "info");
    const res = await uploadProductImageToSupabase(file);
    if (res.url) {
      setFormData((prev) => ({ ...prev, image: res.url! }));
      showToast("Product image uploaded to Storage successfully!", "success");
    } else {
      showToast(res.error || "Failed to upload image.", "error");
    }
  };

  const handleDatasheetFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      showToast(`Processing datasheet file "${file.name}"...`, "info");
      const dataUrl = await readFileAsDataUrl(file);
      setFormData((prev) => ({ ...prev, datasheetUrl: dataUrl }));
      showToast(`Datasheet "${file.name}" attached successfully!`, "success");
    } catch (err: any) {
      showToast("Failed to read datasheet file.", "error");
    }
  };

  const handleQuickUploadDatasheet = async (prod: Product, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      showToast(`Attaching datasheet for ${prod.sku}...`, "info");
      const dataUrl = await readFileAsDataUrl(file);
      const prodId = prod.id || prod.sku;
      const updated = updateStoredProduct(prodId, { datasheetUrl: dataUrl });
      setProducts(updated);
      const updatedProd = updated.find((p) => (p.id || p.sku) === prodId);
      if (updatedProd) saveProductToSupabase(updatedProd).catch(console.warn);
      showToast(`Datasheet attached to ${prod.sku} (${file.name})!`, "success");
    } catch (err: any) {
      showToast("Failed to attach datasheet.", "error");
    }
  };

  const handleExcelFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setExcelFile(file);
    try {
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: "array" });
      const sheetName = wb.SheetNames[0];
      if (!sheetName) {
        showToast("Excel spreadsheet contains no sheets.", "error");
        return;
      }
      const sheet = wb.Sheets[sheetName];
      if (!sheet) {
        showToast("Excel spreadsheet contains an unreadable sheet.", "error");
        return;
      }
      const rows = XLSX.utils.sheet_to_json<any>(sheet, { defval: "" });
      setExcelTotalCount(rows.length);
      setExcelPreviewRows(rows.slice(0, 5));
      showToast(`Read ${rows.length} rows from Excel sheet "${sheetName}".`, "info");
    } catch (err) {
      console.error("Failed to parse Excel preview", err);
      showToast("Failed to parse Excel spreadsheet preview.", "error");
    }
  };

  const handleConfirmExcelImport = async () => {
    if (!excelFile) {
      showToast("Please choose an Excel file first.", "error");
      return;
    }
    setIsProcessingExcel(true);
    try {
      const buffer = await excelFile.arrayBuffer();
      const result = importProductsFromExcel(buffer);
      if (result.success) {
        const refreshed = getStoredProducts();
        setProducts(refreshed);
        if (isSupabaseConfigured) {
          syncAllProductsToSupabase(refreshed).catch(console.warn);
        }
        showToast(
          `Success: Imported ${result.count} products (${result.added} added, ${result.updated} updated)!`,
          "success"
        );
        setIsExcelModalOpen(false);
        setExcelFile(null);
        setExcelPreviewRows([]);
        setExcelTotalCount(0);
      } else {
        showToast(result.error || "Failed to import Excel file.", "error");
      }
    } catch (err: any) {
      showToast(err?.message || "Failed to process Excel spreadsheet.", "error");
    } finally {
      setIsProcessingExcel(false);
    }
  };

  const handleDownloadExcelTemplate = () => {
    const binary = generateProductExcelTemplate();
    const blob = new Blob([binary as any], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "qualitech_products_import_template.xlsx";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast("Downloaded sample Excel import template (.xlsx)!", "success");
  };

  const handleExportExcel = () => {
    const binary = exportProductsToExcel();
    const blob = new Blob([binary as any], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `qualitech_products_export_${new Date().toISOString().slice(0, 10)}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast("Exported all products to Excel (.xlsx)!", "success");
  };

  const handleResetDefaults = () => {
    if (confirm("Reset catalogue to default items? Any custom products added will be replaced with defaults.")) {
      const defs = resetStoredProductsToDefault();
      setProducts(defs);
      showToast("Catalogue reset to default items.", "info");
    }
  };

  const handleDeleteQuoteRequest = async (id: string, rfqNum: string) => {
    if (confirm(`Are you sure you want to delete RFQ Enquiry #${rfqNum}?`)) {
      await deleteQuoteRequestFromSupabase(id, rfqNum);
      setQuoteRequests((prev) => prev.filter((q) => q.id !== id && q.rfq_number !== id && q.rfq_number !== rfqNum));
      showToast(`RFQ #${rfqNum} deleted.`, "info");
    }
  };

  // Compute unseen counts for badges (only shows badge if new items arrived since last visit)
  const unseenOrdersCount = useMemo(() => {
    if (activeSection === "orders") return 0;
    const seenSet = new Set(seenBadges.orders || []);
    return validOrders.filter((o) => !seenSet.has((o.orderNumber || o.id).toLowerCase())).length;
  }, [validOrders, seenBadges.orders, activeSection]);

  const unseenTrackingCount = useMemo(() => {
    if (activeSection === "tracking") return 0;
    const seenSet = new Set(seenBadges.tracking || []);
    const activeShipments = validOrders.filter(
      (o) => o.orderStatus !== "Delivered" && o.orderStatus !== "Cancelled"
    );
    return activeShipments.filter((o) => !seenSet.has((o.orderNumber || o.id).toLowerCase())).length;
  }, [validOrders, seenBadges.tracking, activeSection]);

  const unseenQuotesCount = useMemo(() => {
    if (activeSection === "quotes") return 0;
    const seenSet = new Set(seenBadges.quotes || []);
    return quoteRequests.filter((q) => !seenSet.has((q.rfq_number || q.id).toLowerCase())).length;
  }, [quoteRequests, seenBadges.quotes, activeSection]);

  const unseenProductsCount = useMemo(() => {
    if (activeSection === "products") return 0;
    if ((seenBadges.productsCount || 0) === 0) return 0;
    return Math.max(0, products.length - (seenBadges.productsCount || 0));
  }, [products.length, seenBadges.productsCount, activeSection]);

  // Sidebar navigation configuration
  const NAV_ITEMS: {
    id: AdminSection;
    label: string;
    icon: React.ReactNode;
    count?: number | undefined;
    badgeColor?: string | undefined;
  }[] = [
    {
      id: "overview",
      label: "Overview",
      icon: (
        <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      id: "products",
      label: "Products Catalogue",
      icon: (
        <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      count: unseenProductsCount,
      badgeColor: "bg-blue-100 text-[#004f9e]",
    },
    {
      id: "orders",
      label: "Customer Orders",
      icon: (
        <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      count: unseenOrdersCount,
      badgeColor: "bg-emerald-100 text-emerald-800",
    },
    {
      id: "incomplete",
      label: "Incomplete Payments",
      icon: (
        <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      count: incompleteOrders.filter((o) => o.followUpStatus !== "Recovered").length,
      badgeColor: "bg-amber-100 text-amber-800",
    },
    {
      id: "tracking",
      label: "Shipment Tracking",
      icon: (
        <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
        </svg>
      ),
      count: unseenTrackingCount,
      badgeColor: "bg-blue-100 text-[#004f9e]",
    },
    {
      id: "quotes",
      label: "Custom RFQ Enquiries",
      icon: (
        <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      ),
      count: unseenQuotesCount,
      badgeColor: "bg-amber-100 text-amber-800",
    },
    {
      id: "analytics",
      label: "Store Analytics",
      icon: (
        <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
  ];

  // If not authenticated, render the dedicated Admin Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden font-sans select-none">
        {/* Ambient background glow */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#004f9e]/30 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />

        {/* Toast Notification */}
        {toastMessage && (
          <div
            className={`fixed bottom-6 right-6 z-[200] flex items-center gap-3 rounded-2xl px-5 py-3.5 shadow-2xl text-sm font-semibold transition-all ${
              toastMessage.type === "success"
                ? "bg-emerald-600 text-white"
                : toastMessage.type === "error"
                ? "bg-rose-600 text-white"
                : "bg-slate-900 text-white"
            }`}
          >
            <span>{toastMessage.title}</span>
          </div>
        )}

        <div className="w-full max-w-md relative z-10">
          {/* Top Brand Header */}
          <div className="text-center mb-8">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#004f9e] text-white font-black text-2xl shadow-xl shadow-[#004f9e]/30 mb-4 ring-4 ring-blue-500/20">
              QT
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Qualitech Connectronics
            </h1>
            <p className="text-sm font-medium text-slate-400 mt-1.5">
              Secure Operations & Order Management Portal
            </p>
          </div>

          {/* Login Card */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 backdrop-blur-xl p-7 sm:p-9 shadow-2xl shadow-black/60">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-white tracking-tight">Admin Access Login</h2>
              <p className="text-xs text-slate-400 mt-1">
                Enter your authorized administrator credentials to proceed.
              </p>
            </div>

            {loginError && (
              <div className="mb-5 flex items-center gap-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs font-semibold text-rose-400">
                <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Admin ID / Email
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="admin@qualitech.com"
                    className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 pl-10 text-sm font-medium text-white placeholder-slate-500 focus:border-[#004f9e] focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#004f9e]/30 transition-all"
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                    Admin Password
                  </label>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 pl-10 pr-10 text-sm font-medium text-white placeholder-slate-500 focus:border-[#004f9e] focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#004f9e]/30 transition-all"
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-white transition-colors"
                  >
                    {showPassword ? (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 font-medium select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-[#004f9e] focus:ring-[#004f9e]"
                  />
                  <span>Remember session</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#004f9e] py-3.5 text-sm font-bold text-white hover:bg-blue-600 transition-all shadow-lg shadow-[#004f9e]/30 cursor-pointer disabled:opacity-60"
              >
                {isLoggingIn ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Admin Panel</span>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Return link */}
          <div className="mt-6 text-center">
            <button
              onClick={() => onNavigateHome("#top")}
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Return to Qualitech Storefront</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans flex antialiased">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-[200] flex items-center gap-3 rounded-2xl px-5 py-3.5 shadow-2xl text-sm font-semibold transition-all animate-in slide-in-from-bottom-5 duration-300 ${
            toastMessage.type === "success"
              ? "bg-emerald-600 text-white shadow-emerald-900/20"
              : toastMessage.type === "error"
              ? "bg-rose-600 text-white shadow-rose-900/20"
              : "bg-slate-900 text-white shadow-slate-950/20"
          }`}
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20">
            {toastMessage.type === "success" ? (
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : toastMessage.type === "error" ? (
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            ) : (
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </span>
          <span>{toastMessage.title}</span>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* LEFT SIDEBAR NAVIGATION */}
      {/* ───────────────────────────────────────────────────────────── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col justify-between border-r border-slate-200 bg-white transition-all duration-300 shadow-sm ${
          sidebarOpen ? "w-64" : "w-20"
        }`}
      >
        {/* Sidebar Brand Header */}
        <div>
          {sidebarOpen ? (
            <div className="flex h-16 items-center justify-between px-4 border-b border-slate-100">
              <button
                onClick={() => onNavigateHome("#top")}
                className="flex items-center gap-3 overflow-hidden text-left cursor-pointer min-w-0"
                title="Return to Storefront"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#004f9e] text-white font-bold text-base shadow-sm">
                  QT
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-sm font-bold uppercase tracking-wider text-slate-900 truncate">
                    Qualitech Ops
                  </h1>
                  <p className="text-xs text-slate-500 font-medium truncate">B2B Core v2.4</p>
                </div>
              </button>

              <button
                onClick={() => setSidebarOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors shrink-0 cursor-pointer"
                title="Collapse sidebar"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="flex h-16 items-center justify-center border-b border-slate-100 px-2 relative">
              <button
                onClick={() => setSidebarOpen(true)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#004f9e] text-white font-bold text-base shadow-sm hover:scale-105 transition-all cursor-pointer"
                title="Click to expand sidebar"
              >
                QT
              </button>
              <button
                onClick={() => setSidebarOpen(true)}
                className="absolute -right-3 top-5 z-20 flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-xs hover:bg-[#004f9e] hover:text-white hover:border-[#004f9e] transition-all cursor-pointer"
                title="Expand sidebar"
              >
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}

          {/* Nav List */}
          <nav className="space-y-1.5 px-3 mt-3">
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center ${
                    sidebarOpen ? "justify-between px-3.5" : "justify-center px-2"
                  } py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#004f9e] text-white shadow-md shadow-[#004f9e]/20"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                  title={!sidebarOpen ? item.label : undefined}
                >
                  <div className="relative flex items-center gap-3 min-w-0">
                    <span className={isActive ? "text-white" : "text-slate-400"}>
                      {item.icon}
                    </span>
                    {!sidebarOpen && typeof item.count === "number" && item.count > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                      </span>
                    )}
                    {sidebarOpen && <span className="truncate">{item.label}</span>}
                  </div>
                  {sidebarOpen && typeof item.count === "number" && item.count > 0 && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-bold transition-all ${
                        isActive
                          ? "bg-white/20 text-white"
                          : item.badgeColor || "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer with Log Out */}
        <div className="p-3 border-t border-slate-100 space-y-1.5">
          {sidebarOpen && (
            <button
              onClick={() => onNavigateHome("#top")}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 py-2 text-xs font-bold text-slate-700 hover:bg-[#004f9e] hover:text-white hover:border-[#004f9e] transition-all cursor-pointer shadow-xs"
            >
              <span>View Storefront</span>
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </button>
          )}

          {/* Log Out button matching Screenshot 2 design */}
          <button
            onClick={handleAdminLogout}
            className={`w-full flex items-center ${
              sidebarOpen ? "justify-start px-3" : "justify-center"
            } gap-2 rounded-xl py-2 text-xs font-bold text-red-600 hover:bg-red-50 hover:text-red-700 transition-all cursor-pointer`}
            title="Log Out"
          >
            <svg className="h-4 w-4 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {sidebarOpen && <span>Log Out</span>}
          </button>

          <p className={`text-[11px] text-slate-400 font-medium ${sidebarOpen ? "px-1 text-left" : "text-center"}`}>
            {sidebarOpen ? "Qualitech Connectronics © 2026" : "QC"}
          </p>
        </div>
      </aside>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MAIN CONTENT WORKSPACE */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-20"} min-h-screen flex flex-col`}>
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/90 bg-white/95 px-4 sm:px-6 backdrop-blur-md">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <h2 className="text-sm sm:text-lg lg:text-xl font-bold text-slate-900 tracking-tight capitalize truncate">
              {activeSection === "overview" && "Executive Dashboard & Operations"}
              {activeSection === "products" && "Product Catalogue & Inventory (167+ Items)"}
              {activeSection === "orders" && "Customer Orders & Invoices"}
              {activeSection === "tracking" && "Shipment & Courier Logistics"}
              {activeSection === "quotes" && "Custom RFQ Quotation Requests"}
              {activeSection === "analytics" && "Store Analytics & Metrics"}
            </h2>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Live Auto-Sync Indicator & Manual Refresh */}
            <button
              onClick={() => {
                fetchProductsFromSupabase().then((p) => { if (p && p.length) setProducts(p); });
                fetchQuoteRequestsFromSupabase().then((q) => { if (q && q.length) setQuoteRequests(q); });
                showToast("Admin dashboard synced with latest cloud data!", "success");
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-all cursor-pointer shadow-2xs"
              title="Click to sync latest data now"
            >
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="hidden sm:inline">Live Sync</span>
              <svg className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>

            <button
              onClick={handleOpenAddForm}
              className="inline-flex items-center gap-2 rounded-xl bg-[#004f9e] px-4 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-slate-900 transition-all shadow-sm cursor-pointer"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span>Add Product</span>
            </button>

            <button
              onClick={handleAdminLogout}
              className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs sm:text-sm font-bold text-red-600 hover:bg-red-100 transition-all cursor-pointer shadow-xs"
              title="Log Out of Admin Panel"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Log Out</span>
            </button>
          </div>
        </header>

        {/* Dynamic Section Content */}
        <main className="flex-1 p-4 sm:p-6 w-full min-w-0 max-w-full">
          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* 0. OVERVIEW DASHBOARD SECTION */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {activeSection === "overview" && (
            <div className="space-y-6">
              {/* Top Greeting Card */}
              <div className="rounded-3xl border border-blue-200/60 bg-gradient-to-r from-[#004f9e] to-slate-900 p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
                <div className="relative z-10 max-w-2xl">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md mb-3">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Qualitech Operations Console</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                    Dashboard Overview
                  </h3>
                  <p className="text-xs sm:text-sm text-blue-100 mt-1.5 leading-relaxed">
                    Real-time monitoring of live customer procurement, order fulfillments, courier dispatches, and custom RFQ specifications.
                  </p>
                </div>
              </div>

              {/* Metric KPI Cards */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div 
                  onClick={() => setActiveSection("orders")}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-[#004f9e]/40 transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Orders</span>
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </span>
                  </div>
                  <p className="mt-3 text-3xl font-black text-slate-900">{validOrders.length}</p>
                  <p className="mt-1 text-xs text-emerald-600 font-semibold">
                    {validOrders.filter((o) => o.orderStatus === "Confirmed" || o.orderStatus === "Shipped").length} in active processing
                  </p>
                </div>

                <div 
                  onClick={() => setActiveSection("products")}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-[#004f9e]/40 transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Catalogue Items</span>
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-[#004f9e]">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </span>
                  </div>
                  <p className="mt-3 text-3xl font-black text-slate-900">{products.length}</p>
                  <p className="mt-1 text-xs text-slate-500 font-medium">
                    {products.filter((p) => p.inStock).length} in stock
                  </p>
                </div>

                <div 
                  onClick={() => setActiveSection("tracking")}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-[#004f9e]/40 transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Shipments</span>
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                      </svg>
                    </span>
                  </div>
                  <p className="mt-3 text-3xl font-black text-slate-900">
                    {validOrders.filter((o) => o.orderStatus === "Shipped" || o.orderStatus === "Dispatched").length}
                  </p>
                  <p className="mt-1 text-xs text-sky-600 font-semibold">Active in transit</p>
                </div>

                <div 
                  onClick={() => setActiveSection("quotes")}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-[#004f9e]/40 transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Custom RFQs</span>
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                    </span>
                  </div>
                  <p className="mt-3 text-3xl font-black text-slate-900">{quoteRequests.length}</p>
                  <p className="mt-1 text-xs text-amber-600 font-semibold">Customer enquiries</p>
                </div>

                <div 
                  onClick={() => setActiveSection("incomplete")}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-[#004f9e]/40 transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Leads / Incomplete</span>
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-700 font-bold text-xs">
                      ⚡
                    </span>
                  </div>
                  <p className="mt-3 text-3xl font-black text-slate-900">{incompleteOrders.length}</p>
                  <p className="mt-1 text-xs text-amber-600 font-semibold">
                    {incompleteOrders.filter(o => o.followUpStatus !== "Recovered").length} pending follow-up
                  </p>
                </div>
              </div>

              {/* Two Column: Recent Orders & Recent RFQs */}
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Recent Orders Widget */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">Recent Orders</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Real customer purchase orders</p>
                    </div>
                    <button
                      onClick={() => setActiveSection("orders")}
                      className="text-xs font-bold text-[#004f9e] hover:underline cursor-pointer"
                    >
                      View All Orders →
                    </button>
                  </div>

                  {validOrders.length === 0 ? (
                    <p className="text-xs text-slate-400 py-6 text-center">No orders recorded yet.</p>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {validOrders.slice(0, 5).map((ord) => (
                        <div key={ord.id} className="flex items-center justify-between py-3">
                          <div>
                            <p className="font-mono text-xs font-bold text-[#004f9e]">#{ord.orderNumber}</p>
                            <p className="text-xs font-bold text-slate-800 mt-0.5">{ord.customer.fullName}</p>
                            <p className="text-[11px] text-slate-400">{formatOrderDateTime(ord.createdAt)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-bold text-slate-900">{formatINR(ord.total)}</p>
                            <button
                              onClick={() => handleOpenOrderModal(ord)}
                              className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-[#004f9e] hover:underline cursor-pointer"
                            >
                              <span>Details &gt;</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recent RFQs Widget */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">Recent Custom RFQ Enquiries</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Enquiry submissions from contact &amp; specs</p>
                    </div>
                    <button
                      onClick={() => setActiveSection("quotes")}
                      className="text-xs font-bold text-[#004f9e] hover:underline cursor-pointer"
                    >
                      View All RFQs →
                    </button>
                  </div>

                  {quoteRequests.length === 0 ? (
                    <p className="text-xs text-slate-400 py-6 text-center">No quotation requests yet.</p>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {quoteRequests.slice(0, 5).map((q) => (
                        <div key={q.id} className="flex items-center justify-between py-3">
                          <div>
                            <p className="font-mono text-xs font-bold text-amber-700">#{q.rfq_number}</p>
                            <p className="text-xs font-bold text-slate-800 mt-0.5">{q.full_name}</p>
                            <p className="text-[11px] text-slate-400">{q.company_name || q.email} • {q.product_category}</p>
                          </div>
                          <div className="text-right flex items-center gap-2">
                            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-700">
                              {q.estimated_qty} pcs
                            </span>
                            <button
                              onClick={() => handleDeleteQuoteRequest(q.id, q.rfq_number)}
                              className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                              title="Delete Enquiry"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Shortcuts */}
              <div className="grid gap-3 sm:grid-cols-4">
                <button
                  onClick={handleOpenAddForm}
                  className="flex items-center justify-center gap-2 rounded-xl bg-white border border-slate-200 p-3.5 text-xs font-bold text-slate-800 hover:bg-[#004f9e] hover:text-white hover:border-[#004f9e] transition-all shadow-xs cursor-pointer"
                >
                  <span>+ Add New Product</span>
                </button>
                <button
                  onClick={() => setActiveSection("orders")}
                  className="flex items-center justify-center gap-2 rounded-xl bg-white border border-slate-200 p-3.5 text-xs font-bold text-slate-800 hover:bg-[#004f9e] hover:text-white hover:border-[#004f9e] transition-all shadow-xs cursor-pointer"
                >
                  <span>Manage Orders</span>
                </button>
                <button
                  onClick={handleExportOrders}
                  className="flex items-center justify-center gap-2 rounded-xl bg-white border border-slate-200 p-3.5 text-xs font-bold text-slate-800 hover:bg-[#004f9e] hover:text-white hover:border-[#004f9e] transition-all shadow-xs cursor-pointer"
                >
                  <span>Export Orders (Excel CSV)</span>
                </button>
                <button
                  onClick={() => onNavigateHome("#top")}
                  className="flex items-center justify-center gap-2 rounded-xl bg-white border border-slate-200 p-3.5 text-xs font-bold text-slate-800 hover:bg-slate-900 hover:text-white transition-all shadow-xs cursor-pointer"
                >
                  <span>View Public Storefront ↗</span>
                </button>
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* 1. PRODUCTS SECTION */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {activeSection === "products" && (
            <div className="space-y-5">
              {/* Product Filters Toolbar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
                <div className="flex flex-wrap items-center gap-3 flex-1">
                  {/* Search Bar */}
                  <div className="relative min-w-[260px] flex-1 max-w-md">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search SKU, name, category, brand..."
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#004f9e] focus:bg-white focus:outline-hidden"
                    />
                    <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>

                  {/* Brand Selector */}
                  <select
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    className="rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:border-[#004f9e] focus:outline-hidden"
                  >
                    <option value="All">All Brands</option>
                    <option value="Amphenol">Amphenol</option>
                    <option value="Zolex">Zolex</option>
                    <option value="Qualitech">Qualitech</option>
                  </select>

                  {/* Stock Selector */}
                  <select
                    value={selectedStock}
                    onChange={(e) => setSelectedStock(e.target.value)}
                    className="rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:border-[#004f9e] focus:outline-hidden"
                  >
                    <option value="All">All Stock Levels</option>
                    <option value="InStock">In Stock Only</option>
                    <option value="LowStock">Low Stock (≤15)</option>
                    <option value="OutOfStock">Out of Stock</option>
                  </select>
                </div>

                {/* Secondary Actions */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setIsExcelModalOpen(true)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer shadow-2xs"
                    title="Upload multiple products at once via Excel spreadsheet (.xlsx, .xls)"
                  >
                    <svg className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Import Excel (.xlsx)</span>
                  </button>

                  <button
                    onClick={handleDownloadExcelTemplate}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                    title="Download pre-formatted Excel template with sample products"
                  >
                    <svg className="h-3.5 w-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span>Template</span>
                  </button>

                  <button
                    onClick={handleExportExcel}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                    title="Export full catalog to Excel spreadsheet (.xlsx)"
                  >
                    <svg className="h-3.5 w-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Export Excel</span>
                  </button>

                  <button
                    onClick={handleOpenAddForm}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-brand-blue px-3.5 py-2 text-xs font-bold text-white hover:bg-slate-900 transition-colors cursor-pointer shadow-xs"
                  >
                    <span>+ Add Product</span>
                  </button>
                </div>
              </div>

              {/* Products Table (Fully responsive with sticky actions and compact layout for laptops) */}
              <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
                <table className="w-full text-left text-sm min-w-[860px]">
                  <thead className="border-b border-slate-200 bg-slate-50/95 font-bold uppercase tracking-wider text-xs text-slate-500">
                    <tr>
                      <th className="py-2.5 px-3 min-w-[170px] max-w-[210px]">Product &amp; SKU</th>
                      <th className="py-2.5 px-2.5">Brand</th>
                      <th className="py-2.5 px-2.5 max-w-[130px]">Category</th>
                      <th className="py-2.5 px-3 text-right">Unit Price</th>
                      <th className="py-2.5 px-2 text-center">Stock</th>
                      <th className="py-2.5 px-2 text-center">Datasheet</th>
                      <th className="py-2.5 px-2 text-center">Status</th>
                      <th className="py-2.5 px-3 text-right sticky right-0 bg-slate-50/95 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.04)] z-10">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedProducts.map((p) => {
                      const price = getProductDefaultPrice(p);
                      const extLink = getProductExternalLink(p);

                      return (
                        <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-2.5 px-3 min-w-[170px] max-w-[210px]">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="h-9 w-9 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 p-0.5">
                                <ProductImage src={p.image} alt={p.name} className="h-full w-full object-contain" showText={false} />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="font-bold text-slate-900 text-xs sm:text-sm truncate" title={p.name}>{p.name}</p>
                                {p.sku && p.sku !== p.name && (
                                  <p className="font-mono text-[11px] text-slate-400 truncate">{p.sku}</p>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="py-2.5 px-2.5 whitespace-nowrap">
                            <span
                              className={`rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
                                p.brand === "Amphenol"
                                  ? "bg-blue-50 text-blue-700 border border-blue-200/60"
                                  : p.brand === "Zolex"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                                  : "bg-amber-50 text-amber-800 border border-amber-200/60"
                              }`}
                            >
                              {p.brand}
                            </span>
                          </td>

                          <td className="py-2.5 px-2.5 text-slate-600 font-medium max-w-[130px]">
                            <p className="text-xs truncate" title={p.category}>{p.category}</p>
                            {p.subCategory && (
                              <p className="text-[11px] text-slate-400 truncate" title={p.subCategory}>{p.subCategory}</p>
                            )}
                          </td>

                          <td className="py-2.5 px-3 text-right font-mono text-xs sm:text-sm font-bold text-slate-900 whitespace-nowrap">
                            {formatINR(price)}
                          </td>

                          <td className="py-2.5 px-2 text-center whitespace-nowrap">
                            <div className="inline-flex items-center justify-center gap-0.5">
                              <button
                                onClick={() => handleUpdateStockCount(p, (p.stockCount || 0) - 10)}
                                className="h-6 px-1 rounded border border-slate-200 bg-slate-100 text-[0.62rem] font-bold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                                title="Decrease by 10"
                              >
                                -10
                              </button>
                              <button
                                onClick={() => handleUpdateStockCount(p, (p.stockCount || 0) - 1)}
                                className="h-6 w-6 rounded border border-slate-200 bg-slate-100 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                                title="Decrease by 1"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                min="0"
                                value={p.stockCount ?? 0}
                                onChange={(e) => handleUpdateStockCount(p, parseInt(e.target.value, 10) || 0)}
                                className="w-12 text-center font-mono text-xs font-bold text-slate-900 border border-slate-300 rounded py-0.5 bg-white focus:border-[#004f9e] focus:outline-hidden"
                              />
                              <button
                                onClick={() => handleUpdateStockCount(p, (p.stockCount || 0) + 1)}
                                className="h-6 w-6 rounded border border-slate-200 bg-slate-100 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                                title="Increase by 1"
                              >
                                +
                              </button>
                              <button
                                onClick={() => handleUpdateStockCount(p, (p.stockCount || 0) + 10)}
                                className="h-6 px-1 rounded border border-slate-200 bg-slate-100 text-[0.62rem] font-bold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                                title="Increase by 10"
                              >
                                +10
                              </button>
                            </div>
                          </td>

                          {/* Datasheet Column */}
                          <td className="py-2.5 px-2 text-center whitespace-nowrap">
                            {p.datasheetUrl ? (
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => downloadProductDatasheet(p)}
                                  className="inline-flex items-center gap-1 rounded-md bg-blue-50 border border-blue-200 px-2 py-0.5 text-[0.68rem] font-bold text-[#004f9e] hover:bg-[#004f9e] hover:text-white transition-all cursor-pointer shadow-2xs"
                                  title="Download / View Technical Datasheet"
                                >
                                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                  <span>PDF</span>
                                </button>
                                <label
                                  className="p-1 text-slate-400 hover:text-[#004f9e] cursor-pointer rounded hover:bg-slate-100"
                                  title="Replace Datasheet"
                                >
                                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                  </svg>
                                  <input
                                    type="file"
                                    accept=".pdf,.doc,.docx"
                                    className="hidden"
                                    onChange={(e) => handleQuickUploadDatasheet(p, e)}
                                  />
                                </label>
                              </div>
                            ) : (
                              <label
                                className="inline-flex items-center gap-1 rounded-md border border-dashed border-slate-300 px-2 py-0.5 text-[0.65rem] font-semibold text-slate-500 hover:border-[#004f9e] hover:text-[#004f9e] hover:bg-blue-50/50 transition-all cursor-pointer"
                                title="Attach PDF Datasheet for this product"
                              >
                                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                </svg>
                                <span>+ PDF</span>
                                <input
                                  type="file"
                                  accept=".pdf,.doc,.docx"
                                  className="hidden"
                                  onChange={(e) => handleQuickUploadDatasheet(p, e)}
                                />
                              </label>
                            )}
                          </td>

                          <td className="py-2.5 px-2 text-center whitespace-nowrap">
                            <button
                              onClick={() => handleToggleStock(p)}
                              className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold cursor-pointer transition-all ${
                                p.inStock
                                  ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                                  : "bg-rose-100 text-rose-800 hover:bg-rose-200"
                              }`}
                            >
                              {p.inStock ? "In Stock" : "Out of Stock"}
                            </button>
                          </td>

                          <td className="py-2.5 px-3 text-right sticky right-0 bg-white/95 backdrop-blur-xs shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.05)] z-10 whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1">
                              {p.brand !== "Qualitech" && (
                                <a
                                  href={extLink.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:text-[#004f9e] hover:border-[#004f9e] transition-colors"
                                  title={`View on official ${p.brand} catalog`}
                                >
                                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                  </svg>
                                </a>
                              )}
                              <button
                                onClick={() => handleOpenEditForm(p)}
                                className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:border-[#004f9e] hover:text-[#004f9e] transition-colors cursor-pointer"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDuplicateProduct(p)}
                                className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
                                title="Duplicate product"
                              >
                                Copy
                              </button>
                              <button
                                onClick={() => setProductToDelete(p)}
                                className="rounded-lg border border-slate-200 p-1.5 text-slate-400 hover:text-rose-600 hover:border-rose-300 transition-colors cursor-pointer"
                                title="Delete product"
                              >
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-slate-200 pt-4">
                  <p className="text-xs text-slate-500">
                    Showing <strong>{paginatedProducts.length}</strong> of <strong>{filteredProducts.length}</strong> products
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 disabled:opacity-40 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      ← Previous
                    </button>
                    <span className="text-xs font-bold text-slate-700">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 disabled:opacity-40 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* 2. CUSTOMER ORDERS SECTION (Redesigned per exact user design) */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {activeSection === "orders" && (
            <div className="space-y-6">
              {/* Order Management Header Bar */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Order Management</h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    View and manage customer orders across all stages.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Time Filter */}
                  <select
                    value={orderTimeFilter}
                    onChange={(e) => setOrderTimeFilter(e.target.value)}
                    className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:border-slate-300 focus:outline-hidden cursor-pointer shadow-2xs"
                  >
                    <option value="All Time">All Time</option>
                    <option value="Today">Today</option>
                    <option value="This Week">This Week</option>
                    <option value="This Month">This Month</option>
                  </select>

                  {/* Status Filter */}
                  <select
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:border-slate-300 focus:outline-hidden cursor-pointer shadow-2xs"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Processing">Processing</option>
                    <option value="Quality Check">Quality Check</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>

                  {/* Export Button */}
                  <button
                    onClick={handleExportOrders}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
                  >
                    <svg className="h-3.5 w-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span>Export</span>
                  </button>

                  {/* 30-Day Cleanup Button */}
                  <button
                    onClick={handleRun30DayCleanup}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50/70 px-3.5 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-colors shadow-2xs cursor-pointer"
                    title="Export Excel, email report to admin, and delete orders older than 30 days"
                  >
                    <svg className="h-3.5 w-3.5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <span>Run 30-Day Cleanup</span>
                  </button>
                </div>
              </div>

              {/* Live Orders Table */}
              {filteredOrders.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-14 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-3">
                    <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h4 className="text-base font-bold text-slate-800">No Orders in this view</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Orders placed on the storefront or recorded via admin will appear here in real time.
                  </p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-slate-200 bg-white font-bold text-xs text-slate-400">
                      <tr>
                        <th className="py-4 px-5">Order ID</th>
                        <th className="py-4 px-5">Customer</th>
                        <th className="py-4 px-5">Status</th>
                        <th className="py-4 px-5">Payment</th>
                        <th className="py-4 px-5">Total</th>
                        <th className="py-4 px-5">Date &amp; Time</th>
                        <th className="py-4 px-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredOrders.map((ord) => {
                        const statusLower = (ord.orderStatus || "").toLowerCase();
                        const isCancelled = statusLower === "cancelled";

                        return (
                          <tr
                            key={ord.id}
                            className={`transition-colors duration-200 ${
                              isCancelled
                                ? "bg-slate-100/60 hover:bg-slate-100/90 border-l-4 border-l-slate-300"
                                : "hover:bg-slate-50/70"
                            }`}
                          >
                            {/* Order ID */}
                            <td className="py-4 px-5 font-mono text-sm font-semibold">
                              <span className={isCancelled ? "text-slate-500 font-semibold" : "text-[#004f9e] font-bold"}>
                                #{ord.orderNumber}
                              </span>
                            </td>

                            {/* Customer */}
                            <td className="py-4 px-5">
                              <p className={`font-bold text-sm ${isCancelled ? "text-slate-600" : "text-slate-900"}`}>{ord.customer.fullName}</p>
                              <p className="text-xs text-slate-400 font-normal">{ord.customer.email}</p>
                            </td>

                            {/* Status Pill */}
                            <td className="py-4 px-5">
                              {statusLower === "cancelled" ? (
                                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 bg-slate-200/60 px-2.5 py-1 rounded-full border border-slate-300/80">
                                  <span className="h-2 w-2 rounded-full bg-slate-400" />
                                  <span>cancelled</span>
                                </span>
                              ) : statusLower === "confirmed" ? (
                                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600">
                                  <svg className="h-4 w-4 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <circle cx="12" cy="12" r="9" stroke="currentColor" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
                                  </svg>
                                  <span>confirmed</span>
                                </span>
                              ) : statusLower === "delivered" ? (
                                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                                  <svg className="h-4 w-4 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <circle cx="12" cy="12" r="9" stroke="currentColor" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
                                  </svg>
                                  <span>delivered</span>
                                </span>
                              ) : statusLower === "shipped" || statusLower === "dispatched" ? (
                                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600">
                                  <svg className="h-4 w-4 text-indigo-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <circle cx="12" cy="12" r="9" stroke="currentColor" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
                                  </svg>
                                  <span>shipped</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                                  <span className="h-2 w-2 rounded-full bg-slate-400" />
                                  <span>{statusLower}</span>
                                </span>
                              )}
                            </td>

                            {/* Payment Badge */}
                            <td className="py-4 px-5">
                              <span
                                className={`inline-block rounded-full px-3 py-1 font-extrabold text-[0.65rem] uppercase tracking-wider ${
                                  isCancelled
                                    ? "bg-slate-200/80 text-slate-600 border border-slate-300"
                                    : ord.paymentStatus === "Paid" || (ord.paymentMethod && (ord.paymentMethod.includes("Razorpay") || ord.paymentMethod.includes("UPI")))
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                                    : "bg-amber-100/80 text-amber-800"
                                }`}
                              >
                                {ord.paymentStatus === "Paid" || (ord.paymentMethod && (ord.paymentMethod.includes("Razorpay") || ord.paymentMethod.includes("UPI")))
                                  ? "PREPAID"
                                  : ord.paymentMethod.toUpperCase()}
                              </span>
                            </td>

                            {/* Total Amount */}
                            <td className={`py-4 px-5 text-sm ${isCancelled ? "font-medium text-slate-500" : "font-bold text-slate-900"}`}>
                              {formatINR(ord.total)}
                            </td>

                            {/* Date & Time */}
                            <td className="py-4 px-5 text-xs text-slate-500">
                              {formatOrderDateTime(ord.createdAt)}
                            </td>

                            {/* Action Link */}
                            <td className="py-4 px-5 text-right">
                              <button
                                onClick={() => handleOpenOrderModal(ord)}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-[#004f9e] transition-colors cursor-pointer"
                              >
                                <span>Details</span>
                                <span className="text-slate-400">&gt;</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* 2B. INCOMPLETE PAYMENTS & CUSTOMER LEADS SECTION */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {activeSection === "incomplete" && (
            <div className="space-y-5">
              {/* Toolbar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span>Incomplete Payments &amp; Abandoned Leads</span>
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">
                      {incompleteOrders.length} Leads
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Customers who progressed to payment without completing order transaction.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onNavigateHome("#incomplete-payments")}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-3.5 py-2 text-xs font-bold text-[#004f9e] hover:bg-blue-100 transition-colors cursor-pointer"
                  >
                    <span>Open Standalone Lead Manager ↗</span>
                  </button>

                  <button
                    onClick={() => {
                      const csv = exportAbandonedOrdersCsv();
                      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `qualitech-incomplete-leads-${new Date().toISOString().slice(0, 10)}.csv`;
                      a.click();
                      URL.revokeObjectURL(url);
                      showToast("Leads exported to CSV!", "success");
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#004f9e] px-3.5 py-2 text-xs font-bold text-white hover:bg-slate-900 transition-colors cursor-pointer"
                  >
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              {/* Incomplete Leads Table */}
              {incompleteOrders.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-14 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-3">
                    <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h4 className="text-base font-bold text-slate-800">No Abandoned Checkouts Recorded</h4>
                  <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                    When buyers fill their details and advance to payment without finishing, their full contact details appear here.
                  </p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-slate-200 bg-slate-50/90 font-bold uppercase tracking-wider text-xs text-slate-500">
                      <tr>
                        <th className="py-3.5 px-4">Lead ID</th>
                        <th className="py-3.5 px-4">Customer</th>
                        <th className="py-3.5 px-4">Contact &amp; Recovery</th>
                        <th className="py-3.5 px-4">Cart Total</th>
                        <th className="py-3.5 px-4">Drop-Off Reason</th>
                        <th className="py-3.5 px-4">Follow-up Status</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {incompleteOrders.map((lead) => {
                        const cleanPhone = (lead.customer?.phone || "").replace(/\D/g, "");
                        const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
                        const leadStatus = lead.followUpStatus || "New Lead";

                        return (
                          <tr key={lead.orderNumber || lead.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-3.5 px-4 font-mono font-bold text-[#004f9e] align-top">
                              {lead.orderNumber}
                              <p className="text-[10px] text-slate-400 font-normal">
                                {new Date(lead.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                              </p>
                            </td>

                            <td className="py-3.5 px-4 align-top">
                              <p className="font-bold text-slate-900">{lead.customer?.fullName}</p>
                              {lead.customer?.companyName && (
                                <p className="text-slate-500 text-[11px] font-semibold">{lead.customer.companyName}</p>
                              )}
                              <p className="text-slate-400 text-[10px]">{lead.customer?.city}, {lead.customer?.state}</p>
                            </td>

                            <td className="py-3.5 px-4 align-top space-y-1">
                              <div className="flex items-center gap-2">
                                <a href={`tel:${lead.customer?.phone}`} className="font-mono text-slate-800 hover:text-[#004f9e] font-semibold">
                                  {lead.customer?.phone}
                                </a>
                                {lead.customer?.phone && (
                                  <a
                                    href={`https://wa.me/${formattedPhone}?text=${encodeURIComponent(
                                      `Hi ${lead.customer.fullName}, this is Qualitech Connectronics regarding your order for industrial components (Total: ${formatINR(lead.total)}). Can we assist you with payment or corporate billing?`
                                    )}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="rounded-md bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 hover:bg-emerald-100"
                                  >
                                    WhatsApp 💬
                                  </a>
                                )}
                              </div>
                              <p className="text-slate-400 text-[11px] truncate max-w-[160px]">{lead.customer?.email}</p>
                            </td>

                            <td className="py-3.5 px-4 align-top">
                              <p className="font-bold text-slate-900">{formatINR(lead.total)}</p>
                              <p className="text-[11px] text-slate-400">
                                {(lead.items || []).reduce((acc, i) => acc + i.quantity, 0)} Units ({(lead.items || []).length} items)
                              </p>
                            </td>

                            <td className="py-3.5 px-4 align-top">
                              <span
                                className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold uppercase border ${
                                  (lead.customer?.orderNotes || "").includes("Dismissed")
                                    ? "bg-amber-50 text-amber-700 border-amber-200"
                                    : (lead.customer?.orderNotes || "").includes("Failed")
                                    ? "bg-rose-50 text-rose-700 border-rose-200"
                                    : "bg-blue-50 text-blue-700 border-blue-200"
                                }`}
                              >
                                {(lead.customer?.orderNotes || "").includes("Dismissed")
                                  ? "Dismissed"
                                  : (lead.customer?.orderNotes || "").includes("Failed")
                                  ? "Failed"
                                  : "Reached Step 2"}
                              </span>
                            </td>

                            <td className="py-3.5 px-4 align-top">
                              <select
                                value={leadStatus}
                                onChange={(e) =>
                                  updateLeadStatus(lead.orderNumber, e.target.value as any, lead.adminNotes)
                                }
                                aria-label="Lead Follow-up Status"
                                className={`rounded-lg px-2 py-1 text-[11px] font-bold border cursor-pointer ${
                                  leadStatus === "Recovered"
                                    ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                                    : leadStatus === "New Lead"
                                    ? "bg-amber-50 text-amber-800 border-amber-300"
                                    : "bg-slate-50 text-slate-700 border-slate-300"
                                }`}
                              >
                                <option value="New Lead">New Lead</option>
                                <option value="Contacted">Contacted</option>
                                <option value="Followed Up">Followed Up</option>
                                <option value="Recovered">Recovered ✓</option>
                                <option value="Lost">Lost</option>
                              </select>
                            </td>

                            <td className="py-3.5 px-4 align-top text-right">
                              <button
                                onClick={() => onNavigateHome("#incomplete-payments")}
                                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
                              >
                                <span>Inspect</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* 3. SHIPMENT TRACKING & LOGISTICS */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {activeSection === "tracking" && (
            <div className="space-y-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Live Courier &amp; Shipment Tracking Manager
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Real-time AWB tracking numbers, dispatch status, and carrier milestones.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {["All", "Confirmed", "Processing", "Quality Check", "Dispatched", "Delivered", "Cancelled"].map((st) => {
                    const normalize = (s?: string) => {
                      const v = (s || "").trim().toLowerCase();
                      return v === "shipped" ? "dispatched" : v;
                    };
                    const target = normalize(st);
                    const count = st === "All"
                      ? validOrders.length
                      : validOrders.filter((o) => normalize(o.orderStatus) === target).length;

                    const isActive = normalize(trackingFilter) === target;

                    return (
                      <button
                        key={st}
                        onClick={() => setTrackingFilter(st)}
                        className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                          isActive
                            ? "bg-[#004f9e] text-white shadow-xs ring-2 ring-[#004f9e]/30"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        <span>{st}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                            isActive ? "bg-white/25 text-white" : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {trackingOrders.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-14 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-3">
                    <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                    </svg>
                  </div>
                  <h4 className="text-base font-bold text-slate-800">No Shipments in this status</h4>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {trackingOrders.map((ord) => {
                    const statusSteps: OrderStatus[] = ["Confirmed", "Processing", "Quality Check", "Dispatched", "Delivered"];
                    const normalizedStatus = (ord.orderStatus === "Shipped" ? "Dispatched" : ord.orderStatus) as OrderStatus;
                    const rawIdx = statusSteps.indexOf(normalizedStatus);
                    const currentIdx = rawIdx >= 0 ? rawIdx : 0;
                    const isCancelled = ord.orderStatus === "Cancelled";

                    return (
                      <div
                        key={ord.id}
                        className={`rounded-2xl border p-5 shadow-xs space-y-4 transition-all duration-200 ${
                          isCancelled
                            ? "border-slate-200 bg-slate-50/70"
                            : "border-slate-200 bg-white"
                        }`}
                      >
                        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                          <div>
                            <span className={`font-mono text-sm font-bold ${isCancelled ? "text-slate-500" : "text-[#004f9e]"}`}>
                              #{ord.orderNumber}
                            </span>
                            <p className={`text-sm font-bold mt-0.5 ${isCancelled ? "text-slate-600" : "text-slate-900"}`}>{ord.customer.fullName}</p>
                            <p className="text-xs text-slate-400">{ord.customer.city}, {ord.customer.state}</p>
                          </div>

                          <div className="text-right">
                            {isCancelled ? (
                              <span className="inline-block rounded-full bg-slate-200/80 px-3 py-1 text-xs font-bold text-slate-600 border border-slate-300">
                                Cancelled
                              </span>
                            ) : (
                              <span className="inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-[#004f9e] border border-blue-200">
                                {ord.shippingMethod.name}
                              </span>
                            )}
                            <p className="font-mono text-xs font-bold text-slate-500 mt-1">
                              AWB: {ord.trackingNumber}
                            </p>
                          </div>
                        </div>

                        {/* Progress Stepper Bar OR Cancelled Banner */}
                        {isCancelled ? (
                          <div className="rounded-xl border border-slate-200 bg-slate-100/80 p-3.5 text-center">
                            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-600">
                              <svg className="h-4 w-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <circle cx="12" cy="12" r="9" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 9l-6 6M9 9l6 6" />
                              </svg>
                              <span>Shipment Inactive (Cancelled)</span>
                            </div>
                            <p className="text-[0.68rem] text-slate-400 mt-0.5">
                              Consignment cancelled. Archived for 30-day automated backup &amp; cleanup.
                            </p>
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-1.5">
                              {statusSteps.map((stepName, i) => (
                                <span
                                  key={stepName}
                                  className={i <= currentIdx ? "text-[#004f9e] font-extrabold" : "text-slate-300"}
                                >
                                  {stepName}
                                </span>
                              ))}
                            </div>
                            <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                              <div
                                className="h-full bg-[#004f9e] transition-all duration-500"
                                style={{ width: `${Math.max(10, ((currentIdx + 1) / statusSteps.length) * 100)}%` }}
                              />
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-2">
                          <span className={`text-xs font-medium ${isCancelled ? "text-slate-400" : "text-slate-500"}`}>
                            Est. Delivery: <strong>{ord.estimatedDelivery}</strong>
                          </span>
                          <button
                            onClick={() => setViewingOrder(ord)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-[#004f9e] hover:text-white transition-colors cursor-pointer"
                          >
                            <span>{isCancelled ? "View Details" : "Update AWB"}</span>
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* 4. CUSTOM RFQ ENQUIRIES */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {activeSection === "quotes" && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    B2B Custom Cable RFQ Quotations
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Engineering requirements with custom pinouts, wire gauges, and CAD drawings.
                  </p>
                </div>
                <button
                  onClick={() => {
                    fetchQuoteRequestsFromSupabase().then((q) => {
                      setQuoteRequests(q);
                      showToast("Refreshed quotation requests from Supabase.", "info");
                    });
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh Enquiries
                </button>
              </div>

              {quoteRequests.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-14 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-3">
                    <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </div>
                  <h4 className="text-base font-bold text-slate-800">No RFQ Quotes Submitted Yet</h4>
                  <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                    Customer custom harness specs and CAD uploads will automatically sync here.
                  </p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-slate-200 bg-slate-50/90 font-bold uppercase tracking-wider text-xs text-slate-500">
                      <tr>
                        <th className="py-3.5 px-4">RFQ ID</th>
                        <th className="py-3.5 px-4">Date</th>
                        <th className="py-3.5 px-4">Client &amp; Company</th>
                        <th className="py-3.5 px-4">Category</th>
                        <th className="py-3.5 px-4">Specs / Qty</th>
                        <th className="py-3.5 px-4">CAD Drawing</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {quoteRequests.map((q) => (
                        <tr key={q.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-[#004f9e]">#{q.rfq_number}</td>
                          <td className="py-3.5 px-4 text-slate-500">
                            {new Date(q.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                          </td>
                          <td className="py-3.5 px-4">
                            <p className="font-bold text-slate-900">{q.full_name}</p>
                            <p className="text-xs text-slate-400">{q.company_name || q.email}</p>
                            <p className="text-xs text-[#004f9e] font-medium">{q.phone}</p>
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-slate-700">{q.product_category}</td>
                          <td className="py-3.5 px-4">
                            <p className="font-semibold text-slate-900">{q.estimated_qty} Units</p>
                            <p className="text-xs text-slate-500 line-clamp-1">{q.technical_specs || "Standard"}</p>
                          </td>
                          <td className="py-3.5 px-4">
                            {q.drawing_attachment_url ? (
                              <a
                                href={q.drawing_attachment_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#004f9e] hover:underline"
                              >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                </svg>
                                View CAD
                              </a>
                            ) : (
                              <span className="text-slate-400 text-xs">No Attachment</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="inline-block whitespace-nowrap rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-[#004f9e]">
                              {q.status || "New Enquiry"}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setSelectedRFQ(q)}
                                className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold text-[#004f9e] hover:bg-blue-50 transition-colors cursor-pointer"
                                title="View Full Details"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                <span>View</span>
                              </button>
                              <button
                                onClick={() => handleDeleteQuoteRequest(q.id, q.rfq_number)}
                                className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Delete Enquiry"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                <span>Delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════ */}
          {/* 5. STORE ANALYTICS */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {activeSection === "analytics" && (
            <div className="space-y-5">
              {/* Top Sub-Tab Switcher & Mode Toggle */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-2.5 sm:p-3 rounded-2xl border border-slate-200/90 shadow-2xs">
                <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-bold text-slate-600">
                  <button
                    type="button"
                    onClick={() => setAnalyticsSubTab("monthly")}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all cursor-pointer ${
                      analyticsSubTab === "monthly"
                        ? "bg-white text-[#004f9e] shadow-2xs font-extrabold"
                        : "hover:text-slate-900"
                    }`}
                  >
                    <span>📅</span>
                    <span>Monthly Trends</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAnalyticsSubTab("overview")}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all cursor-pointer ${
                      analyticsSubTab === "overview"
                        ? "bg-white text-[#004f9e] shadow-2xs font-extrabold"
                        : "hover:text-slate-900"
                    }`}
                  >
                    <span>🏢</span>
                    <span>Lifetime & Brands</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={handleExportMonthlyAnalytics}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition-all cursor-pointer shadow-2xs"
                    title="Export all monthly metrics to Excel"
                  >
                    <svg className="h-3.5 w-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Export Excel</span>
                  </button>
                </div>
              </div>

              {/* Compact Lifetime KPI Strip */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
                <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-2xs">
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">Total Products</span>
                  <p className="mt-1 text-lg sm:text-2xl font-black text-slate-900 font-mono truncate">{products.length}</p>
                  <p className="mt-0.5 text-[11px] text-emerald-600 font-semibold truncate">{products.filter((p) => p.inStock).length} In Stock</p>
                </div>
                <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-2xs">
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">Active Orders</span>
                  <p className="mt-1 text-lg sm:text-2xl font-black text-[#004f9e] font-mono truncate">
                    {validOrders.filter((o) => (o.orderStatus || "").toLowerCase() !== "cancelled").length}
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-500 truncate">
                    {validOrders.filter((o) => (o.orderStatus || "").toLowerCase() === "cancelled").length} Cancelled
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-2xs">
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">Recognized Revenue</span>
                  <p className="mt-1 text-lg sm:text-xl xl:text-2xl font-black text-emerald-600 font-mono truncate" title={formatINR(totalSimulatedRevenue)}>
                    {formatINR(totalSimulatedRevenue)}
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-500 truncate">
                    Prepaid: <strong className="text-emerald-700">{formatINR(prepaidRevenue)}</strong>
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-2xs">
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">Inventory Valuation</span>
                  <p className="mt-1 text-lg sm:text-xl xl:text-2xl font-black text-slate-900 font-mono truncate" title={formatINR(totalCatalogValue)}>
                    {formatINR(totalCatalogValue)}
                  </p>
                  <p className="mt-0.5 text-[11px] text-amber-600 font-semibold truncate">{lowStockCount} Low stock items</p>
                </div>
              </div>

              {/* ═══════════════════════════════════════════════════════════ */}
              {/* SUB-TAB 1: MONTHLY PERFORMANCE & TRENDS */}
              {/* ═══════════════════════════════════════════════════════════ */}
              {analyticsSubTab === "monthly" && (
                <div className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 lg:p-6 shadow-2xs space-y-5">
                  {/* Monthly Header & Filter Bar */}
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between border-b border-slate-100 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-[#004f9e]">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </span>
                        <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                          Monthly Store Trajectory
                        </h3>
                        <span className="rounded-full bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                          Live Data
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Track revenue, orders, component velocity, and brand distribution per calendar month.
                      </p>
                    </div>

                    {/* Range & Metric Selectors */}
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Range */}
                      <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-[11px] font-semibold">
                        {[
                          { label: "6M", val: 6 },
                          { label: "12M", val: 12 },
                          { label: "All", val: 0 },
                        ].map((r) => (
                          <button
                            key={r.val}
                            type="button"
                            onClick={() => setAnalyticsRangeMonths(r.val)}
                            className={`rounded-md px-2.5 py-1 transition-all cursor-pointer ${
                              analyticsRangeMonths === r.val
                                ? "bg-white font-bold text-[#004f9e] shadow-2xs"
                                : "text-slate-600 hover:text-slate-900"
                            }`}
                          >
                            {r.label}
                          </button>
                        ))}
                      </div>

                      {/* Metric Switcher */}
                      <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-[11px] font-semibold">
                        {[
                          { id: "revenue", label: "₹ Revenue" },
                          { id: "orders", label: "Orders" },
                          { id: "units", label: "Units Sold" },
                        ].map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => setAnalyticsActiveMetric(m.id as any)}
                            className={`rounded-md px-2.5 py-1 transition-all cursor-pointer ${
                              analyticsActiveMetric === m.id
                                ? "bg-[#004f9e] font-bold text-white shadow-2xs"
                                : "text-slate-600 hover:text-slate-900"
                            }`}
                          >
                            {m.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 1. Visual Month Bar Chart (Laptop Optimized Height h-44 sm:h-48) */}
                  <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3.5 sm:p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          {analyticsActiveMetric === "revenue" && "Monthly Recognized Revenue"}
                          {analyticsActiveMetric === "orders" && "Active Orders per Month"}
                          {analyticsActiveMetric === "units" && "Component Units Sold per Month"}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          (Click any bar to inspect)
                        </span>
                      </div>
                      {peakMonth && (
                        <div className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 text-[11px] font-bold text-amber-800 self-start sm:self-auto">
                          <span>⭐ Peak:</span>
                          <strong className="text-slate-900">{peakMonth.label}</strong>
                          <span className="text-amber-700 font-mono">
                            ({analyticsActiveMetric === "revenue" ? formatINR(peakMonth.revenue) : analyticsActiveMetric === "orders" ? `${peakMonth.activeOrders} ord` : `${peakMonth.totalUnitsSold} pcs`})
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Bars Container */}
                    <div className="mt-3 flex h-40 sm:h-48 items-end gap-1.5 sm:gap-2.5 border-b border-slate-200 pb-1.5 overflow-x-auto pt-6">
                      {monthlyAnalyticsData.map((m) => {
                        const val =
                          analyticsActiveMetric === "revenue"
                            ? m.revenue
                            : analyticsActiveMetric === "orders"
                            ? m.activeOrders
                            : m.totalUnitsSold;
                        const pct = Math.max(Math.round((val / maxMonthlyMetricVal) * 100), val > 0 ? 12 : 4);
                        const isSelected = analyticsSelectedMonth === m.key;
                        const isPeak = peakMonth?.key === m.key && val > 0;

                        return (
                          <div
                            key={m.key}
                            onClick={() => setAnalyticsSelectedMonth(isSelected ? "all" : m.key)}
                            className="group relative flex flex-1 min-w-[42px] max-w-[72px] flex-col items-center justify-end h-full cursor-pointer select-none"
                          >
                            {/* Hover Tooltip */}
                            <div className="pointer-events-none absolute -top-12 z-20 hidden flex-col items-center group-hover:flex whitespace-nowrap">
                              <div className="rounded-lg bg-slate-900 px-2 py-1 text-[10px] font-semibold text-white shadow-lg text-center">
                                <p className="font-bold">{m.label}</p>
                                <p className="text-emerald-300 font-mono">
                                  {analyticsActiveMetric === "revenue"
                                    ? formatINR(m.revenue)
                                    : analyticsActiveMetric === "orders"
                                    ? `${m.activeOrders} Orders`
                                    : `${m.totalUnitsSold} Units`}
                                </p>
                              </div>
                              <div className="h-1.5 w-2 bg-slate-900 rotate-45 -mt-1" />
                            </div>

                            {/* Value Above Bar */}
                            <span className={`mb-1 text-[9px] sm:text-[11px] font-mono font-bold transition-all truncate max-w-full text-center ${
                              isSelected ? "text-[#004f9e] font-black scale-105" : "text-slate-600 group-hover:text-slate-900"
                            }`}>
                              {analyticsActiveMetric === "revenue"
                                ? val >= 100000
                                  ? `₹${(val / 100000).toFixed(1)}L`
                                  : val >= 1000
                                  ? `₹${(val / 1000).toFixed(0)}k`
                                  : `₹${val}`
                                : val}
                            </span>

                            {/* Bar Pill */}
                            <div
                              style={{ height: `${pct}%` }}
                              className={`w-full max-w-[44px] rounded-t-lg transition-all duration-200 relative ${
                                isSelected
                                  ? "bg-gradient-to-t from-[#004f9e] to-sky-500 shadow-md ring-2 ring-[#004f9e] ring-offset-1"
                                  : isPeak
                                  ? "bg-gradient-to-t from-amber-500 to-amber-400 hover:brightness-105"
                                  : analyticsActiveMetric === "revenue"
                                  ? "bg-gradient-to-t from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400"
                                  : "bg-gradient-to-t from-slate-700 to-slate-500 hover:from-slate-600 hover:to-slate-400"
                              }`}
                            >
                              {isPeak && (
                                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[9px]">👑</span>
                              )}
                            </div>

                            {/* Month Label */}
                            <span className={`mt-1.5 text-[10px] font-semibold text-center transition-colors truncate w-full ${
                              isSelected ? "font-bold text-[#004f9e]" : "text-slate-500 group-hover:text-slate-900"
                            }`}>
                              {m.label.split(" ")[0]}
                              <span className="text-[8px] text-slate-400 ml-0.5">'{m.year.toString().slice(-2)}</span>
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Filter Selector Chips */}
                    <div className="mt-3 flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-200/60">
                      <span className="text-[11px] font-bold text-slate-500 mr-1">Inspect Month:</span>
                      <button
                        type="button"
                        onClick={() => setAnalyticsSelectedMonth("all")}
                        className={`rounded-md px-2 py-0.5 text-[11px] font-bold transition-all cursor-pointer ${
                          analyticsSelectedMonth === "all"
                            ? "bg-[#004f9e] text-white shadow-2xs"
                            : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        All Combined
                      </button>
                      {monthlyAnalyticsData.map((m) => (
                        <button
                          key={m.key}
                          type="button"
                          onClick={() => setAnalyticsSelectedMonth(m.key)}
                          className={`rounded-md px-2 py-0.5 text-[11px] font-bold transition-all cursor-pointer ${
                            analyticsSelectedMonth === m.key
                              ? "bg-[#004f9e] text-white shadow-2xs"
                              : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 2. Deep Dive Inspector for Selected Month */}
                  {selectedMonthData && (() => {
                    const totalBrandSales =
                      (selectedMonthData.brandRevenue.Amphenol || 0) +
                      (selectedMonthData.brandRevenue.Zolex || 0) +
                      (selectedMonthData.brandRevenue.Qualitech || 0) +
                      ((selectedMonthData.brandRevenue as any).Other || 0);

                    const amphenolPct = totalBrandSales > 0 ? Math.round((selectedMonthData.brandRevenue.Amphenol / totalBrandSales) * 100) : 0;
                    const zolexPct = totalBrandSales > 0 ? Math.round((selectedMonthData.brandRevenue.Zolex / totalBrandSales) * 100) : 0;
                    const qualitechPct = totalBrandSales > 0 ? Math.round((selectedMonthData.brandRevenue.Qualitech / totalBrandSales) * 100) : 0;

                    return (
                      <div className="rounded-xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-2xs space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
                          <div className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 font-bold text-xs">
                              📊
                            </span>
                            <div>
                              <h4 className="text-sm sm:text-base font-bold text-slate-900">
                                {selectedMonthData.label} Detailed Breakdown
                              </h4>
                              <p className="text-[11px] text-slate-500">
                                Realized financial metrics, product sales volume, and brand share.
                              </p>
                            </div>
                          </div>

                          {selectedMonthData.momRevenueGrowth !== null && selectedMonthData.momRevenueGrowth !== undefined && (
                            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold self-start sm:self-auto ${
                              selectedMonthData.momRevenueGrowth >= 0
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-red-50 text-red-700 border border-red-200"
                            }`}>
                              {selectedMonthData.momRevenueGrowth >= 0 ? "▲" : "▼"} {Math.abs(selectedMonthData.momRevenueGrowth)}% MoM Revenue
                            </span>
                          )}
                        </div>

                        {/* 4 In-depth KPI Cards for the Month */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
                          <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-3">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Monthly Revenue</span>
                            <p className="mt-1 text-base sm:text-lg font-black text-emerald-600 font-mono truncate" title={formatINR(selectedMonthData.revenue)}>
                              {formatINR(selectedMonthData.revenue)}
                            </p>
                            <div className="mt-1 text-[10px] text-slate-500 space-y-0.5">
                              <p>Prepaid: <strong className="text-slate-800">{formatINR(selectedMonthData.prepaidRevenue)}</strong></p>
                              <p>COD: <strong className="text-slate-800">{formatINR(selectedMonthData.codDeliveredRevenue)}</strong></p>
                            </div>
                          </div>

                          <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-3">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Orders Processed</span>
                            <p className="mt-1 text-base sm:text-lg font-black text-[#004f9e] font-mono">
                              {selectedMonthData.activeOrders}
                            </p>
                            <div className="mt-1 text-[10px] text-slate-500 space-y-0.5">
                              <p>Delivered: <strong className="text-emerald-700">{selectedMonthData.deliveredOrders}</strong></p>
                              <p>Cancelled: <strong className="text-red-600">{selectedMonthData.cancelledOrders}</strong></p>
                            </div>
                          </div>

                          <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-3">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Average Order Value</span>
                            <p className="mt-1 text-base sm:text-lg font-black text-slate-900 font-mono truncate" title={formatINR(selectedMonthData.aov)}>
                              {formatINR(selectedMonthData.aov)}
                            </p>
                            <p className="mt-1 text-[10px] text-slate-500 truncate">
                              Per active purchase order
                            </p>
                          </div>

                          <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-3">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Units Dispatched</span>
                            <p className="mt-1 text-base sm:text-lg font-black text-indigo-600 font-mono">
                              {selectedMonthData.totalUnitsSold.toLocaleString("en-IN")} pcs
                            </p>
                            <p className="mt-1 text-[10px] text-slate-500 truncate">
                              Gross: <strong className="text-slate-800">{formatINR(selectedMonthData.grossRevenue)}</strong>
                            </p>
                          </div>
                        </div>

                        {/* Top Products & Brand Distribution (Side-by-Side on Laptop) */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 pt-1">
                          {/* Top Products */}
                          <div className="rounded-xl border border-slate-200 p-3.5 bg-white">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                                Top 5 Products in {selectedMonthData.label}
                              </h5>
                              <span className="text-[10px] font-bold text-[#004f9e]">By Revenue</span>
                            </div>

                            {selectedMonthData.topProducts.length > 0 ? (
                              <div className="divide-y divide-slate-100">
                                {selectedMonthData.topProducts.map((p, idx) => (
                                  <div key={p.sku} className="py-2 flex items-center justify-between gap-2.5 text-xs">
                                    <div className="flex items-center gap-2 min-w-0">
                                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-slate-100 text-[10px] font-bold text-slate-600">
                                        #{idx + 1}
                                      </span>
                                      <div className="min-w-0">
                                        <p className="font-bold text-slate-900 truncate text-xs">{p.name}</p>
                                        <div className="flex items-center gap-1 text-[10px] text-slate-400">
                                          <span className="font-mono text-[#004f9e] font-semibold">{p.sku}</span>
                                          <span>•</span>
                                          <span>{p.brand}</span>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                      <p className="font-bold font-mono text-emerald-700 text-xs">{formatINR(p.revenue)}</p>
                                      <p className="text-[10px] text-slate-500 font-medium">{p.quantity} pcs</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="py-6 text-center text-xs text-slate-400">
                                No product sales recorded in this period.
                              </div>
                            )}
                          </div>

                          {/* Brand Split in Selected Month (Accurate Total Brand Sales Percentage) */}
                          <div className="rounded-xl border border-slate-200 p-3.5 bg-white flex flex-col justify-between">
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                                  Brand Share ({selectedMonthData.label})
                                </h5>
                                <span className="text-[11px] font-bold text-slate-600 font-mono">
                                  Total: {formatINR(totalBrandSales)}
                                </span>
                              </div>

                              {totalBrandSales > 0 ? (
                                <div className="space-y-3 mt-2">
                                  {/* Multi-segment Progress Bar */}
                                  <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden flex">
                                    {amphenolPct > 0 && (
                                      <div
                                        style={{ width: `${amphenolPct}%` }}
                                        className="h-full bg-[#004f9e] transition-all"
                                        title={`Amphenol: ${formatINR(selectedMonthData.brandRevenue.Amphenol)} (${amphenolPct}%)`}
                                      />
                                    )}
                                    {zolexPct > 0 && (
                                      <div
                                        style={{ width: `${zolexPct}%` }}
                                        className="h-full bg-emerald-600 transition-all"
                                        title={`Zolex: ${formatINR(selectedMonthData.brandRevenue.Zolex)} (${zolexPct}%)`}
                                      />
                                    )}
                                    {qualitechPct > 0 && (
                                      <div
                                        style={{ width: `${qualitechPct}%` }}
                                        className="h-full bg-amber-500 transition-all"
                                        title={`Qualitech: ${formatINR(selectedMonthData.brandRevenue.Qualitech)} (${qualitechPct}%)`}
                                      />
                                    )}
                                  </div>

                                  <div className="grid grid-cols-3 gap-1.5 pt-1 text-center">
                                    <div className="rounded-lg bg-blue-50/70 p-2 border border-blue-100">
                                      <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-[#004f9e]">
                                        <span className="h-1.5 w-1.5 rounded-full bg-[#004f9e]" />
                                        Amphenol
                                      </div>
                                      <p className="mt-0.5 text-xs font-bold font-mono text-slate-900 truncate">
                                        {formatINR(selectedMonthData.brandRevenue.Amphenol)}
                                      </p>
                                      <p className="text-[10px] text-slate-500 font-semibold">{amphenolPct}%</p>
                                    </div>

                                    <div className="rounded-lg bg-emerald-50/70 p-2 border border-emerald-100">
                                      <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-emerald-800">
                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                                        Zolex
                                      </div>
                                      <p className="mt-0.5 text-xs font-bold font-mono text-slate-900 truncate">
                                        {formatINR(selectedMonthData.brandRevenue.Zolex)}
                                      </p>
                                      <p className="text-[10px] text-slate-500 font-semibold">{zolexPct}%</p>
                                    </div>

                                    <div className="rounded-lg bg-amber-50/70 p-2 border border-amber-100">
                                      <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-amber-800">
                                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                        Qualitech
                                      </div>
                                      <p className="mt-0.5 text-xs font-bold font-mono text-slate-900 truncate">
                                        {formatINR(selectedMonthData.brandRevenue.Qualitech)}
                                      </p>
                                      <p className="text-[10px] text-slate-500 font-semibold">{qualitechPct}%</p>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="py-6 text-center text-xs text-slate-400">
                                  No brand revenue generated in this period.
                                </div>
                              )}
                            </div>

                            {/* Status Mix */}
                            {Object.keys(selectedMonthData.statusCounts).length > 0 && (
                              <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
                                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mr-1">Status Mix:</span>
                                {Object.entries(selectedMonthData.statusCounts).map(([status, cnt]) => (
                                  <span key={status} className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-700">
                                    {status}: {cnt}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* 3. Responsive Comparison Ledger Table */}
                  <div className="rounded-xl border border-slate-200 overflow-hidden">
                    <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
                      <div>
                        <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                          Monthly Comparison Ledger
                        </h4>
                        <p className="text-[10px] text-slate-500">
                          Orders, units, recognized revenue, and month-over-month trajectory.
                        </p>
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {monthlyAnalyticsData.length} Months
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-slate-700">
                        <thead className="border-b border-slate-200 bg-slate-50/70 font-semibold text-slate-500 uppercase tracking-wider text-[10px]">
                          <tr>
                            <th className="px-3.5 py-2.5">Month</th>
                            <th className="px-3.5 py-2.5 text-center">Orders (Active/Total)</th>
                            <th className="px-3.5 py-2.5 text-center">Units Sold</th>
                            <th className="px-3.5 py-2.5 text-right">Recognized Revenue</th>
                            <th className="px-3.5 py-2.5 text-right">Gross Value</th>
                            <th className="px-3.5 py-2.5 text-right">AOV</th>
                            <th className="px-3.5 py-2.5 text-center">MoM Growth</th>
                            <th className="px-3.5 py-2.5 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                          {monthlyAnalyticsData.map((m) => {
                            const isSelected = analyticsSelectedMonth === m.key;
                            return (
                              <tr
                                key={m.key}
                                className={`transition-colors ${
                                  isSelected ? "bg-blue-50/60 font-semibold" : "hover:bg-slate-50"
                                }`}
                              >
                                <td className="px-3.5 py-2 font-bold text-slate-900 whitespace-nowrap">
                                  <div className="flex items-center gap-1.5">
                                    <span>{m.label}</span>
                                    {peakMonth?.key === m.key && m.revenue > 0 && (
                                      <span className="rounded-full bg-amber-100 text-amber-800 text-[8px] px-1.5 py-0.2 font-extrabold">
                                        PEAK
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-3.5 py-2 text-center whitespace-nowrap">
                                  <span className="font-bold text-[#004f9e]">{m.activeOrders}</span>
                                  <span className="text-slate-400 text-[10px] ml-1">/ {m.totalOrders}</span>
                                  {m.cancelledOrders > 0 && (
                                    <span className="ml-1 rounded-full bg-red-50 text-red-600 px-1 py-0.2 text-[8px] font-bold">
                                      {m.cancelledOrders} can
                                    </span>
                                  )}
                                </td>
                                <td className="px-3.5 py-2 text-center font-mono whitespace-nowrap">
                                  {m.totalUnitsSold.toLocaleString("en-IN")} pcs
                                </td>
                                <td className="px-3.5 py-2 text-right font-mono font-bold text-emerald-700 whitespace-nowrap">
                                  {formatINR(m.revenue)}
                                </td>
                                <td className="px-3.5 py-2 text-right font-mono text-slate-500 whitespace-nowrap">
                                  {formatINR(m.grossRevenue)}
                                </td>
                                <td className="px-3.5 py-2 text-right font-mono text-slate-800 whitespace-nowrap">
                                  {formatINR(m.aov)}
                                </td>
                                <td className="px-3.5 py-2 text-center whitespace-nowrap">
                                  {m.momRevenueGrowth !== null ? (
                                    <span
                                      className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[9px] font-bold ${
                                        m.momRevenueGrowth >= 0
                                          ? "bg-emerald-50 text-emerald-700"
                                          : "bg-red-50 text-red-700"
                                      }`}
                                    >
                                      {m.momRevenueGrowth >= 0 ? "▲" : "▼"} {Math.abs(m.momRevenueGrowth)}%
                                    </span>
                                  ) : (
                                    <span className="text-slate-400 text-[10px]">—</span>
                                  )}
                                </td>
                                <td className="px-3.5 py-2 text-center whitespace-nowrap">
                                  <button
                                    type="button"
                                    onClick={() => setAnalyticsSelectedMonth(m.key)}
                                    className={`rounded-md px-2 py-0.5 text-[10px] font-bold transition-all cursor-pointer ${
                                      isSelected
                                        ? "bg-[#004f9e] text-white shadow-2xs"
                                        : "border border-slate-200 text-slate-700 hover:bg-slate-100"
                                    }`}
                                  >
                                    {isSelected ? "Inspected" : "Inspect"}
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ═══════════════════════════════════════════════════════════ */}
              {/* SUB-TAB 2: LIFETIME CATALOGUE & BRAND DISTRIBUTION */}
              {/* ═══════════════════════════════════════════════════════════ */}
              {analyticsSubTab === "overview" && (
                <div className="space-y-4">
                  <div className="grid gap-3 md:grid-cols-3">
                    {[
                      {
                        brand: "Amphenol",
                        color: "border-blue-200 bg-blue-50/50 text-[#004f9e]",
                        badge: "bg-blue-100 text-blue-800",
                        products: products.filter((p) => p.brand === "Amphenol"),
                        desc: "High-Speed Connectors, Antennas, RF & Military Interconnects",
                      },
                      {
                        brand: "Zolex",
                        color: "border-emerald-200 bg-emerald-50/50 text-emerald-800",
                        badge: "bg-emerald-100 text-emerald-800",
                        products: products.filter((p) => p.brand === "Zolex"),
                        desc: "Copper Lugs, Stainless Steel Ties, Glands & Earthing Hardware",
                      },
                      {
                        brand: "Qualitech",
                        color: "border-amber-200 bg-amber-50/50 text-amber-800",
                        badge: "bg-amber-100 text-amber-800",
                        products: products.filter((p) => p.brand === "Qualitech"),
                        desc: "Custom Military & Aerospace Wire Harnesses & Cable Assemblies",
                      },
                    ].map((b) => {
                      const totalBrandInventory = b.products.reduce((acc, p) => acc + (p.price || 0) * (p.stockCount || 0), 0);
                      const inStockLines = b.products.filter((p) => p.inStock).length;
                      return (
                        <div key={b.brand} className={`rounded-2xl border p-4 sm:p-5 ${b.color} shadow-2xs flex flex-col justify-between`}>
                          <div>
                            <div className="flex items-center justify-between">
                              <h4 className="text-base sm:text-lg font-black">{b.brand}</h4>
                              <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${b.badge}`}>
                                {b.products.length} SKUs
                              </span>
                            </div>
                            <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">{b.desc}</p>
                          </div>

                          <div className="mt-4 pt-3 border-t border-slate-200/60 space-y-1.5 text-xs text-slate-800">
                            <div className="flex justify-between items-center">
                              <span className="text-slate-500">In-Stock SKUs:</span>
                              <strong>{inStockLines} / {b.products.length}</strong>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-slate-500">Brand Inventory Value:</span>
                              <strong className="font-mono text-slate-900">{formatINR(totalBrandInventory)}</strong>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Lifetime Inventory Summary Card */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-2xs">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                      Catalogue Health & Stock Valuation Breakdown
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                      <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Total Catalogue Items</span>
                        <p className="text-xl font-bold font-mono text-slate-900 mt-0.5">{products.length}</p>
                      </div>
                      <div className="rounded-xl bg-emerald-50/70 p-3 border border-emerald-100">
                        <span className="text-[10px] text-emerald-700 font-bold uppercase">Ready to Ship</span>
                        <p className="text-xl font-bold font-mono text-emerald-800 mt-0.5">{products.filter((p) => p.inStock).length}</p>
                      </div>
                      <div className="rounded-xl bg-amber-50/70 p-3 border border-amber-100">
                        <span className="text-[10px] text-amber-700 font-bold uppercase">Low Stock Alerts</span>
                        <p className="text-xl font-bold font-mono text-amber-800 mt-0.5">{lowStockCount}</p>
                      </div>
                      <div className="rounded-xl bg-blue-50/70 p-3 border border-blue-100">
                        <span className="text-[10px] text-blue-700 font-bold uppercase">Total Inventory Value</span>
                        <p className="text-xl font-bold font-mono text-[#004f9e] mt-0.5">{formatINR(totalCatalogValue)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL: ADD / EDIT PRODUCT */}
      {/* ───────────────────────────────────────────────────────────── */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm" onClick={() => setIsFormOpen(false)} />

          <div className="relative z-10 my-8 w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
              <h3 className="font-display text-lg font-bold text-slate-900">
                {editingProduct ? "Edit Product" : "Add New Component / Assembly"}
              </h3>
              <button 
                onClick={() => setIsFormOpen(false)} 
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
                title="Close"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-50/50 px-6">
              {[
                { id: "basic", label: "Basic Info" },
                { id: "pricing", label: "Pricing & Stock" },
                { id: "features", label: "Features & Specs" },
                { id: "media", label: "Image & Storage" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveFormTab(tab.id as any)}
                  className={`py-3.5 px-4 font-display text-sm font-bold transition-colors border-b-2 cursor-pointer ${
                    activeFormTab === tab.id
                      ? "border-[#004f9e] text-[#004f9e]"
                      : "border-transparent text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveProduct} className="p-6 max-h-[calc(85vh-160px)] overflow-y-auto">
              {activeFormTab === "basic" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">SKU / Part Code *</label>
                      <input
                        type="text"
                        required
                        value={formData.sku || ""}
                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-mono font-bold text-[#004f9e] focus:border-[#004f9e] focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Brand Line *</label>
                      <select
                        value={formData.brand}
                        onChange={(e) => setFormData({ ...formData, brand: e.target.value as any })}
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-800 focus:border-[#004f9e] focus:outline-hidden"
                      >
                        <option value="Amphenol">Amphenol (Distribution)</option>
                        <option value="Zolex">Zolex (Distribution)</option>
                        <option value="Qualitech">Qualitech (In-House Mfg)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Product Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name || ""}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Circular MIL-Spec Connector Series III"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:border-[#004f9e] focus:outline-hidden"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Category *</label>
                      <input
                        type="text"
                        required
                        value={formData.category || ""}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        placeholder="e.g. Connectors, Antennas, SS Cable Ties"
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-[#004f9e] focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Sub Category</label>
                      <input
                        type="text"
                        value={formData.subCategory || ""}
                        onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                        placeholder="e.g. Board to Board, Power"
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-[#004f9e] focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description</label>
                    <textarea
                      rows={3}
                      value={formData.description || ""}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-[#004f9e] focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Manufacturer Official URL (Amphenol/Zolex)</label>
                    <input
                      type="url"
                      value={formData.externalUrl || ""}
                      onChange={(e) => setFormData({ ...formData, externalUrl: e.target.value })}
                      placeholder="https://www.amphenol-cs.com/..."
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-[#004f9e] focus:outline-hidden"
                    />
                  </div>
                </div>
              )}

              {activeFormTab === "pricing" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Unit Price (₹ INR) *</label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={formData.price || 0}
                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-mono font-bold text-[#004f9e] focus:border-[#004f9e] focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Sale Price (Optional)</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.salePrice || ""}
                        onChange={(e) => setFormData({ ...formData, salePrice: e.target.value ? parseFloat(e.target.value) : undefined })}
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-mono focus:border-[#004f9e] focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Stock Count</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.stockCount || 100}
                        onChange={(e) => setFormData({ ...formData, stockCount: parseInt(e.target.value, 10) || 0 })}
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-mono focus:border-[#004f9e] focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Unit</label>
                      <input
                        type="text"
                        value={formData.unit || "pcs"}
                        onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-[#004f9e] focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Lead Time</label>
                      <input
                        type="text"
                        value={formData.leadTime || "Ships in 24-48 Hours"}
                        onChange={(e) => setFormData({ ...formData, leadTime: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-[#004f9e] focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-6 pt-3 border-t border-slate-200">
                    <label className="flex items-center gap-2.5 text-sm font-semibold text-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.inStock}
                        onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                        className="h-4 w-4 rounded text-[#004f9e] focus:ring-[#004f9e]"
                      />
                      <span>In-Stock Ready for Dispatch</span>
                    </label>
                    <label className="flex items-center gap-2.5 text-sm font-semibold text-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.featured}
                        onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                        className="h-4 w-4 rounded text-[#004f9e] focus:ring-[#004f9e]"
                      />
                      <span>Featured Component</span>
                    </label>
                  </div>
                </div>
              )}

              {activeFormTab === "features" && (
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-semibold text-slate-700">Bullet Features</label>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, features: [...(formData.features || []), ""] })}
                        className="text-sm font-bold text-[#004f9e] hover:underline cursor-pointer"
                      >
                        + Add Feature
                      </button>
                    </div>
                    <div className="space-y-2.5">
                      {(formData.features || []).map((feat, idx) => (
                        <div key={idx} className="flex gap-2">
                          <input
                            type="text"
                            value={feat}
                            onChange={(e) => {
                              const updated = [...(formData.features || [])];
                              updated[idx] = e.target.value;
                              setFormData({ ...formData, features: updated });
                            }}
                            placeholder={`Feature point ${idx + 1}`}
                            className="flex-1 rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-[#004f9e] focus:outline-hidden"
                          />
                          {(formData.features || []).length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const updated = (formData.features || []).filter((_, i) => i !== idx);
                                setFormData({ ...formData, features: updated });
                              }}
                              className="text-slate-400 hover:text-rose-600 px-2.5 py-1 rounded-lg hover:bg-rose-50 transition-colors"
                              title="Remove"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-slate-200 pt-4">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Technical Specifications</label>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {Object.entries(formData.specs || {}).map(([k, v]) => (
                        <div key={k} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm">
                          <span className="font-semibold text-slate-600">{k}</span>
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-slate-900">{v}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const newSpecs = { ...formData.specs };
                                delete newSpecs[k];
                                setFormData({ ...formData, specs: newSpecs });
                              }}
                              className="text-slate-400 hover:text-rose-600 p-1 rounded-md hover:bg-rose-50 transition-colors"
                              title="Delete spec"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-3 flex gap-2">
                      <input
                        type="text"
                        placeholder="Spec Name (e.g. Current Rating)"
                        value={newSpecKey}
                        onChange={(e) => setNewSpecKey(e.target.value)}
                        className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Value (e.g. 50A continuous)"
                        value={newSpecVal}
                        onChange={(e) => setNewSpecVal(e.target.value)}
                        className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newSpecKey.trim() && newSpecVal.trim()) {
                            setFormData({ ...formData, specs: { ...formData.specs, [newSpecKey.trim()]: newSpecVal.trim() } });
                            setNewSpecKey("");
                            setNewSpecVal("");
                          }
                        }}
                        className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-[#004f9e] transition-colors"
                      >
                        + Add Spec
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeFormTab === "media" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Product Image (Supabase Storage)</label>
                    <div className="flex items-center gap-4">
                      <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-slate-200 p-1.5 bg-white shadow-xs">
                        <ProductImage src={formData.image} alt="Preview" className="h-full w-full object-contain" />
                      </div>
                      <div className="space-y-2.5 flex-1">
                        <input
                          type="text"
                          value={formData.image || ""}
                          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                          placeholder="Image URL or upload below"
                          className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-[#004f9e] focus:outline-hidden"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-bold text-[#004f9e] hover:bg-[#004f9e] hover:text-white transition-all cursor-pointer shadow-xs"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <span>Upload to Supabase Storage...</span>
                        </button>
                        <input type="file" ref={fileInputRef} accept="image/*" onChange={handleImageFileChange} className="hidden" />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 pt-4">
                    <p className="text-sm font-semibold text-slate-600 mb-2.5">Or Choose Preset Asset:</p>
                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                      {PRESET_IMAGES.map((img, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setFormData({ ...formData, image: img.src })}
                          className={`h-14 w-full rounded-xl border p-1 overflow-hidden transition-all ${
                            formData.image === img.src ? "border-[#004f9e] ring-2 ring-[#004f9e]" : "border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <img src={img.src} alt={img.label} className="h-full w-full object-contain" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Technical Datasheet Upload Section */}
                  <div className="border-t border-slate-200 pt-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">Technical Datasheet (PDF / Spec Sheet)</h4>
                        <p className="text-xs text-slate-500">
                          Upload a technical datasheet PDF for customers to download from the website.
                        </p>
                      </div>
                      {formData.datasheetUrl && (
                        <span className="rounded-full bg-emerald-100 border border-emerald-300 px-3 py-1 text-xs font-bold text-emerald-800">
                          ✓ PDF Attached
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => datasheetInputRef.current?.click()}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#004f9e] px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-900 transition-all cursor-pointer shadow-xs"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <span>Upload Datasheet File (PDF, DOC)</span>
                      </button>
                      <input
                        type="file"
                        ref={datasheetInputRef}
                        accept=".pdf,.doc,.docx"
                        onChange={handleDatasheetFileUpload}
                        className="hidden"
                      />

                      {formData.datasheetUrl && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => downloadProductDatasheet(formData as Product)}
                            className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-bold text-[#004f9e] hover:bg-blue-100 transition-colors cursor-pointer"
                          >
                            Preview / Download PDF ↗
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, datasheetUrl: "" })}
                            className="rounded-xl border border-rose-200 bg-white px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Or enter direct Datasheet Web URL:
                      </label>
                      <input
                        type="url"
                        value={formData.datasheetUrl || ""}
                        onChange={(e) => setFormData({ ...formData, datasheetUrl: e.target.value })}
                        placeholder="https://example.com/datasheet.pdf"
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:border-[#004f9e] focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Modal Actions */}
              <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#004f9e] px-6 py-2.5 text-sm font-bold text-white hover:bg-slate-900 transition-all shadow-sm cursor-pointer"
                >
                  {editingProduct ? "Save & Sync to Supabase" : "Create & Sync to Supabase"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL: ORDER DETAILS (Exact design as requested in Screenshot 1) */}
      {/* ───────────────────────────────────────────────────────────── */}
      {viewingOrder && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs transition-opacity"
            onClick={() => setViewingOrder(null)}
          />

          {/* Modal Container */}
          <div className="relative z-10 my-auto w-full max-w-3xl max-h-[92vh] flex flex-col rounded-2xl sm:rounded-3xl bg-white shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Top Header (Sticky) */}
            <div className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-white/95 px-5 py-3.5 sm:px-7 sm:py-4.5 backdrop-blur-md shrink-0">
              <div className="min-w-0">
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#1e1b4b] tracking-tight truncate">
                  Order <span className="font-mono">#{viewingOrder.orderNumber}</span>
                </h3>
                <p className="text-[0.68rem] text-slate-400 mt-0.5">
                  Placed on {new Date(viewingOrder.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                {/* Status Pill Badge */}
                {viewingOrder.orderStatus === "Cancelled" ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-300 px-2.5 sm:px-3 py-0.5 sm:py-1 text-[0.68rem] sm:text-xs font-bold text-slate-600 uppercase tracking-wider">
                    <svg className="h-3 w-3 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <circle cx="12" cy="12" r="9" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 9l-6 6M9 9l6 6" />
                    </svg>
                    <span>CANCELLED</span>
                  </span>
                ) : viewingOrder.orderStatus === "Confirmed" ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200/80 px-2.5 sm:px-3 py-0.5 sm:py-1 text-[0.68rem] sm:text-xs font-bold text-blue-600 uppercase tracking-wider">
                    <svg className="h-3 w-3 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <circle cx="12" cy="12" r="9" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
                    </svg>
                    <span>CONFIRMED</span>
                  </span>
                ) : viewingOrder.orderStatus === "Delivered" ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200/80 px-2.5 sm:px-3 py-0.5 sm:py-1 text-[0.68rem] sm:text-xs font-bold text-emerald-600 uppercase tracking-wider">
                    <svg className="h-3 w-3 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <circle cx="12" cy="12" r="9" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
                    </svg>
                    <span>DELIVERED</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 border border-indigo-200/80 px-2.5 sm:px-3 py-0.5 sm:py-1 text-[0.68rem] sm:text-xs font-bold text-indigo-600 uppercase tracking-wider">
                    <svg className="h-3 w-3 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <circle cx="12" cy="12" r="9" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
                    </svg>
                    <span>{viewingOrder.orderStatus.toUpperCase()}</span>
                  </span>
                )}

                {/* Payment Badge */}
                <span className="inline-block rounded-full bg-[#fef3c7] px-2.5 sm:px-3 py-0.5 sm:py-1 text-[0.65rem] sm:text-[0.68rem] font-extrabold uppercase tracking-wider text-[#92400e]">
                  {viewingOrder.paymentStatus === "Paid" ? "PREPAID" : "CASH ON DELIVERY"}
                </span>

                {/* Download PDF Button */}
                <button
                  type="button"
                  onClick={() => downloadQuotationFromOrder(viewingOrder)}
                  className="inline-flex items-center gap-1 rounded-full bg-[#004f9e]/10 border border-[#004f9e]/30 px-2.5 sm:px-3 py-0.5 sm:py-1 text-[0.65rem] sm:text-[0.68rem] font-bold text-[#004f9e] hover:bg-[#004f9e] hover:text-white transition-all cursor-pointer"
                  title="Download Branded Proforma PDF Invoice"
                >
                  <svg className="h-3 w-3 sm:h-3.5 sm:w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>PDF Invoice</span>
                </button>

                {/* Close Button */}
                <button
                  onClick={() => setViewingOrder(null)}
                  className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer ml-1"
                  title="Close Modal"
                >
                  <svg className="h-4.5 w-4.5 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Scrollable Modal Body */}
            <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-7 sm:py-6 space-y-5 overscroll-contain">
              {/* Cancelled Order - Manual Refund Alert Banner */}
              {viewingOrder.orderStatus === "Cancelled" && (
                <div className="rounded-2xl bg-amber-50/90 border border-amber-200 p-3.5 sm:p-4 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 font-bold text-amber-900 text-sm">
                        <span className="text-base shrink-0">⚠️</span>
                        <span>Order Cancelled — Manual Refund Required</span>
                      </div>
                      <p className="mt-1 text-amber-800 leading-relaxed text-xs">
                        Automatic refund is <strong className="underline">NOT</strong> triggered. Inventory has been restocked. 
                        {viewingOrder.paymentStatus === "Paid" || (viewingOrder.paymentMethod || "").toLowerCase().includes("prepaid")
                          ? ` Please manually refund ${formatINR(viewingOrder.total)} via Razorpay Dashboard using Payment ID: ${viewingOrder.razorpayPaymentId || viewingOrder.paymentId || "order record"}.`
                          : " This is a COD order: Ensure no money was collected or arrange direct UPI/IMPS payout if delivered."}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await sendOrderCancellationAdminRefundAlert(viewingOrder);
                          showToast("Manual refund notification re-sent to admin email!", "success");
                        } catch {
                          showToast("Failed to send refund email", "error");
                        }
                      }}
                      className="shrink-0 self-start sm:self-center px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                      title="Send manual refund instructions to Admin Email"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span>Re-send Refund Email</span>
                    </button>
                  </div>
                </div>
              )}

              {/* 2-Column Content Layout (Responsive grid) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                {/* Left Column: Customer Info & Address */}
                <div className="space-y-4">
                  {/* Customer Info */}
                  <div>
                    <p className="text-[0.68rem] font-bold uppercase tracking-widest text-[#64748b] mb-1.5">
                      CUSTOMER INFO
                    </p>
                    <div className="rounded-2xl bg-[#f8fafc] border border-slate-100 p-3.5 sm:p-4 space-y-1">
                      <p className="font-bold text-sm text-slate-900">{viewingOrder.customer.fullName}</p>
                      <p className="text-xs text-slate-500 break-all">{viewingOrder.customer.email}</p>
                      <p className="text-xs text-slate-500">{viewingOrder.customer.phone}</p>
                      {viewingOrder.customer.companyName && (
                        <p className="text-xs text-[#004f9e] font-semibold pt-0.5">{viewingOrder.customer.companyName}</p>
                      )}
                    </div>
                  </div>

                  {/* Razorpay Transaction Details (if paid via Razorpay) */}
                  {(viewingOrder.razorpayPaymentId || viewingOrder.razorpayOrderId) && (
                    <div>
                      <p className="text-[0.68rem] font-bold uppercase tracking-widest text-[#64748b] mb-1.5 flex items-center justify-between">
                        <span>RAZORPAY SETTLEMENT</span>
                        <span className="text-[0.62rem] text-emerald-600 font-bold bg-emerald-50 border border-emerald-200/80 px-1.5 py-0.2 rounded-md">
                          VERIFIED GATEWAY
                        </span>
                      </p>
                      <div className="rounded-2xl bg-blue-50/60 border border-blue-100 p-3.5 space-y-2 text-xs">
                        {viewingOrder.razorpayPaymentId && (
                          <div className="flex flex-wrap items-center justify-between gap-1">
                            <span className="text-slate-500 text-[0.72rem]">Payment ID:</span>
                            <span className="font-mono font-bold text-[#004f9e] select-all break-all">
                              {viewingOrder.razorpayPaymentId}
                            </span>
                          </div>
                        )}
                        {viewingOrder.razorpayOrderId && (
                          <div className="flex flex-wrap items-center justify-between gap-1">
                            <span className="text-slate-500 text-[0.72rem]">Razorpay Order:</span>
                            <span className="font-mono text-slate-700 select-all break-all">
                              {viewingOrder.razorpayOrderId}
                            </span>
                          </div>
                        )}
                        <div className="pt-1.5 border-t border-blue-200/60 flex items-center justify-between text-[0.68rem] text-slate-500">
                          <span>Gateway Provider</span>
                          <span className="font-semibold text-slate-800">Razorpay India</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Shipping Address */}
                  <div>
                    <p className="text-[0.68rem] font-bold uppercase tracking-widest text-[#64748b] mb-1.5">
                      SHIPPING ADDRESS
                    </p>
                    <div className="rounded-2xl bg-[#f8fafc] border border-slate-100 p-3.5 sm:p-4">
                      <p className="text-xs text-slate-700 leading-relaxed break-words">
                        {viewingOrder.customer.address} , {viewingOrder.customer.city} , {viewingOrder.customer.state} , {viewingOrder.customer.pincode}, India
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Column: Items, Tracking ID & Link */}
                <div className="space-y-4">
                  {/* Items */}
                  <div>
                    <p className="text-[0.68rem] font-bold uppercase tracking-widest text-[#64748b] mb-1.5">
                      ITEMS ORDERED
                    </p>
                    <div className="rounded-2xl bg-[#f8fafc] border border-slate-100 p-3 max-h-36 overflow-y-auto space-y-1.5 divide-y divide-slate-100/80">
                      {viewingOrder.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs py-1.5 px-1 gap-2">
                          <div className="min-w-0 flex-1">
                            <span className="font-medium text-slate-800 block truncate" title={item.product.name}>
                              {item.product.name}
                            </span>
                            <span className="text-[10px] text-slate-400">SKU: {item.product.sku}</span>
                          </div>
                          <span className="font-bold text-slate-900 font-mono shrink-0">x{item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tracking ID Input */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[0.68rem] font-bold uppercase tracking-widest text-[#64748b]">
                        TRACKING ID
                      </span>
                      {viewingOrder.orderStatus !== "Cancelled" && (
                        <button
                          onClick={handleSaveTracking}
                          className="text-[0.65rem] font-bold text-[#004f9e] hover:underline cursor-pointer"
                        >
                          Save ID
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      disabled={viewingOrder.orderStatus === "Cancelled"}
                      value={modalTrackingId}
                      onChange={(e) => setModalTrackingId(e.target.value)}
                      onBlur={handleSaveTracking}
                      placeholder={viewingOrder.orderStatus === "Cancelled" ? "Shipment cancelled" : "e.g. SF-123456789"}
                      className={`w-full rounded-xl sm:rounded-2xl border-2 px-3.5 py-2 sm:py-2.5 text-xs sm:text-sm font-mono focus:outline-none ${
                        viewingOrder.orderStatus === "Cancelled"
                          ? "border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed"
                          : "border-sky-400 bg-white text-slate-800 focus:ring-2 focus:ring-sky-200"
                      }`}
                    />
                  </div>

                  {/* Tracking Link Input */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[0.68rem] font-bold uppercase tracking-widest text-[#64748b]">
                        TRACKING LINK
                      </span>
                      {modalTrackingLink && (
                        <a
                          href={modalTrackingLink}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[0.65rem] font-bold text-[#004f9e] hover:underline inline-flex items-center gap-0.5"
                        >
                          <span>Test Link</span>
                          <span>↗</span>
                        </a>
                      )}
                    </div>
                    <div className={`flex items-center gap-2 rounded-xl sm:rounded-2xl border px-3.5 py-2 ${
                      viewingOrder.orderStatus === "Cancelled" ? "border-slate-200 bg-slate-100 cursor-not-allowed" : "border-slate-200 bg-[#f8fafc]"
                    }`}>
                      <input
                        type="text"
                        disabled={viewingOrder.orderStatus === "Cancelled"}
                        value={modalTrackingLink}
                        onChange={(e) => setModalTrackingLink(e.target.value)}
                        onBlur={handleSaveTracking}
                        placeholder={viewingOrder.orderStatus === "Cancelled" ? "Shipment cancelled" : "https://tracking.link/..."}
                        className={`w-full bg-transparent text-xs font-mono focus:outline-none ${
                          viewingOrder.orderStatus === "Cancelled" ? "text-slate-400 cursor-not-allowed" : "text-slate-700 placeholder:text-slate-400"
                        }`}
                      />
                      {modalTrackingLink && (
                        <a
                          href={modalTrackingLink}
                          target="_blank"
                          rel="noreferrer"
                          className="text-slate-400 hover:text-[#004f9e] transition-colors shrink-0"
                          title="Open tracking link in new tab"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      )}
                    </div>
                    <p className="text-[0.62rem] text-slate-400 mt-1">
                      {viewingOrder.orderStatus === "Cancelled"
                        ? "Shipment is cancelled. Courier tracking cannot be updated."
                        : "Status changes to 'Shipped' or 'Out for Delivery' automatically notify the customer."}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Row: Status Change Pills & Total Price (Sticky Footer) */}
            <div className="sticky bottom-0 z-20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/95 px-5 py-3.5 sm:px-7 sm:py-4 backdrop-blur-md shrink-0">
              {/* Status Pills */}
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                {(() => {
                  const PROGRESSION_STAGES: OrderStatus[] = [
                    "Confirmed",
                    "Processing",
                    "Quality Check",
                    "Dispatched",
                    "Delivered",
                  ];
                  const currentNorm =
                    viewingOrder.orderStatus === "Shipped"
                      ? "Dispatched"
                      : viewingOrder.orderStatus;
                  const currentIdx = PROGRESSION_STAGES.indexOf(currentNorm as OrderStatus);
                  const isCancelled = viewingOrder.orderStatus === "Cancelled";
                  const isDelivered = currentNorm === "Delivered";

                  return [
                    { key: "Confirmed" as OrderStatus, label: "Confirmed" },
                    { key: "Processing" as OrderStatus, label: "Processing" },
                    { key: "Quality Check" as OrderStatus, label: "Quality Check" },
                    { key: "Dispatched" as OrderStatus, label: "Dispatched / Shipped" },
                    { key: "Delivered" as OrderStatus, label: "Delivered" },
                    { key: "Cancelled" as OrderStatus, label: "Cancelled" },
                  ].map((st) => {
                    const isActive =
                      viewingOrder.orderStatus === st.key ||
                      (st.key === "Dispatched" && viewingOrder.orderStatus === "Shipped");

                    if (st.key === "Cancelled") {
                      if (isCancelled) {
                        return (
                          <button
                            key={st.key}
                            disabled
                            className="rounded-full px-3 sm:px-4 py-1.5 text-[0.7rem] sm:text-xs font-semibold bg-rose-600 text-white font-bold ring-2 ring-rose-200 shadow-xs cursor-default"
                          >
                            Cancelled
                          </button>
                        );
                      }
                      if (isDelivered) {
                        return (
                          <button
                            key={st.key}
                            disabled
                            title="Delivered orders cannot be cancelled"
                            className="rounded-full px-3 sm:px-4 py-1.5 text-[0.7rem] sm:text-xs font-semibold border border-slate-200 bg-slate-100 text-slate-400 opacity-25 cursor-not-allowed pointer-events-none line-through"
                          >
                            Cancelled
                          </button>
                        );
                      }
                      return (
                        <button
                          key={st.key}
                          disabled={modalStatusSaving}
                          onClick={() => handleModalStatusChange("Cancelled")}
                          className="rounded-full px-3 sm:px-4 py-1.5 text-[0.7rem] sm:text-xs font-semibold border border-rose-200 bg-white text-rose-600 hover:bg-rose-50 hover:border-rose-300 transition-all cursor-pointer"
                        >
                          Cancel Order
                        </button>
                      );
                    }

                    // For Progression Stages:
                    const targetIdx = PROGRESSION_STAGES.indexOf(st.key);
                    const isPast = !isCancelled && currentIdx !== -1 && targetIdx < currentIdx;

                    if (isCancelled) {
                      return (
                        <button
                          key={st.key}
                          disabled
                          title="Order is cancelled"
                          className="rounded-full px-3 sm:px-4 py-1.5 text-[0.7rem] sm:text-xs font-semibold border border-slate-200 bg-slate-100 text-slate-400 opacity-25 cursor-not-allowed pointer-events-none line-through"
                        >
                          {st.label}
                        </button>
                      );
                    }

                    if (isActive) {
                      return (
                        <button
                          key={st.key}
                          disabled
                          className="rounded-full px-3 sm:px-4 py-1.5 text-[0.7rem] sm:text-xs font-semibold bg-[#004f9e] text-white shadow-xs font-bold ring-2 ring-blue-300 cursor-default"
                        >
                          {st.label}
                        </button>
                      );
                    }

                    if (isPast) {
                      // Previous stage completed: Faded out, disabled, line-through
                      return (
                        <button
                          key={st.key}
                          disabled
                          title="Previous stage completed. Status can only move forward."
                          className="rounded-full px-3 sm:px-4 py-1.5 text-[0.7rem] sm:text-xs font-semibold border border-slate-200 bg-slate-100 text-slate-400 opacity-30 cursor-not-allowed pointer-events-none line-through"
                        >
                          {st.label}
                        </button>
                      );
                    }

                    // Future stage: Forward progression allowed!
                    return (
                      <button
                        key={st.key}
                        disabled={modalStatusSaving}
                        onClick={() => handleModalStatusChange(st.key)}
                        title={`Advance order to ${st.label}`}
                        className="rounded-full px-3 sm:px-4 py-1.5 text-[0.7rem] sm:text-xs font-semibold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer"
                      >
                        {st.label}
                      </button>
                    );
                  });
                })()}

                {viewingOrder.orderStatus === "Cancelled" && (
                  <span className="inline-flex items-center gap-1 text-[0.65rem] sm:text-[0.68rem] font-bold text-rose-600 bg-rose-50 border border-rose-200/80 rounded-full px-2.5 py-0.5">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span>Status Locked</span>
                  </span>
                )}
              </div>

              {/* Total Price */}
              <div className="text-right shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60 flex sm:block items-center justify-between">
                <span className="text-[0.65rem] text-slate-400 font-bold uppercase tracking-wider block sm:mb-0.5">
                  Total Price
                </span>
                <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-mono">
                  {formatINR(viewingOrder.total)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL: DELETE CONFIRMATION */}
      {/* ───────────────────────────────────────────────────────────── */}
      {productToDelete && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm" onClick={() => setProductToDelete(null)} />
          <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h4 className="font-display text-lg font-bold text-slate-900">Delete Component?</h4>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Are you sure you want to delete <strong>{productToDelete.name}</strong> (<span className="font-mono text-xs">{productToDelete.sku}</span>) from the catalogue and Supabase database?
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={() => setProductToDelete(null)}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProduct}
                className="rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-rose-700 transition-colors shadow-sm cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL: IMPORT CSV / JSON */}
      {/* ───────────────────────────────────────────────────────────── */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm" onClick={() => setIsImportModalOpen(false)} />
          <div className="relative z-10 w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <h4 className="font-display text-lg font-bold text-slate-900">Import Product Catalogue</h4>
              <button 
                onClick={() => setIsImportModalOpen(false)} 
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                title="Close"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-slate-600 mb-3">Paste CSV / JSON data or upload a file to import products in bulk.</p>

            <div className="space-y-4">
              <textarea
                rows={6}
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder="Paste CSV text here..."
                className="w-full rounded-xl border border-slate-200 p-3.5 font-mono text-xs focus:border-[#004f9e] focus:outline-hidden"
              />

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <input
                  type="file"
                  ref={importFileInputRef}
                  accept=".csv,.json"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (evt) => setImportText(evt.target?.result as string);
                      reader.readAsText(file);
                    }
                  }}
                  className="text-sm text-slate-600"
                />

                <div className="flex gap-2.5">
                  <button
                    onClick={() => setIsImportModalOpen(false)}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleImportSubmit}
                    className="rounded-xl bg-[#004f9e] px-5 py-2 text-sm font-bold text-white hover:bg-slate-900 transition-colors shadow-xs"
                  >
                    Import Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL: BULK IMPORT EXCEL (.xlsx / .xls)                       */}
      {/* ───────────────────────────────────────────────────────────── */}
      {isExcelModalOpen && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm" onClick={() => setIsExcelModalOpen(false)} />
          <div className="relative z-10 w-full max-w-2xl rounded-2xl bg-white p-6 sm:p-7 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-display text-lg font-bold text-slate-900">Upload Products via Excel</h4>
                  <p className="text-xs text-slate-500">Bulk add or update multiple products directly into the database &amp; live catalogue</p>
                </div>
              </div>
              <button
                onClick={() => setIsExcelModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                title="Close"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Template Help Banner */}
            <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl bg-slate-50 border border-slate-200 p-3.5">
              <div>
                <p className="text-xs font-bold text-slate-800">Need the standard spreadsheet format?</p>
                <p className="text-[0.72rem] text-slate-500">Download our sample template with pre-filled columns and example products.</p>
              </div>
              <button
                type="button"
                onClick={handleDownloadExcelTemplate}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-[#004f9e] hover:bg-slate-50 transition-colors shrink-0 shadow-2xs cursor-pointer"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Download Template (.xlsx)</span>
              </button>
            </div>

            {/* File Dropzone */}
            <div className="space-y-4">
              <div
                onClick={() => excelFileInputRef.current?.click()}
                className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/60 p-6 text-center hover:border-emerald-500 hover:bg-emerald-50/30 transition-all cursor-pointer"
              >
                <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <p className="text-sm font-bold text-slate-800">
                  {excelFile ? excelFile.name : "Click to select or drop your Excel file here"}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Supports Microsoft Excel (.xlsx, .xls) and CSV files
                </p>
                {excelFile && (
                  <span className="mt-2 rounded-full bg-emerald-100 text-emerald-800 px-3 py-0.5 text-xs font-bold">
                    {(excelFile.size / 1024).toFixed(1)} KB • {excelTotalCount} rows detected
                  </span>
                )}
                <input
                  type="file"
                  ref={excelFileInputRef}
                  accept=".xlsx,.xls,.csv"
                  onChange={handleExcelFileSelect}
                  className="hidden"
                />
              </div>

              {/* Preview Table if rows loaded */}
              {excelPreviewRows.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Preview (First {excelPreviewRows.length} of {excelTotalCount} products)
                    </p>
                  </div>
                  <div className="overflow-x-auto max-h-48 rounded-xl border border-slate-200">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 font-bold text-slate-600">
                        <tr>
                          <th className="p-2">SKU</th>
                          <th className="p-2">Name</th>
                          <th className="p-2">Brand</th>
                          <th className="p-2">Price</th>
                          <th className="p-2">Stock</th>
                          <th className="p-2">Datasheet</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {excelPreviewRows.map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="p-2 font-mono font-semibold text-slate-800">
                              {row.SKU || row["Part Number"] || row["Part No"] || "Auto-generated"}
                            </td>
                            <td className="p-2 font-medium text-slate-900 max-w-xs truncate">
                              {row.Name || row["Product Name"] || row.Title || "N/A"}
                            </td>
                            <td className="p-2 text-slate-600">{row.Brand || row.Manufacturer || "Qualitech"}</td>
                            <td className="p-2 font-bold text-slate-900">₹{row.Price || row["Regular Price"] || "0"}</td>
                            <td className="p-2 text-slate-700">{row.Stock || row.Qty || "100"}</td>
                            <td className="p-2 text-slate-500 truncate max-w-[120px]">
                              {row.Datasheet || row.DatasheetURL || row["Datasheet URL"] ? "✓ PDF Link" : "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Modal Footer Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsExcelModalOpen(false);
                    setExcelFile(null);
                    setExcelPreviewRows([]);
                  }}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!excelFile || isProcessingExcel}
                  onClick={handleConfirmExcelImport}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2 text-sm font-bold text-white hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {isProcessingExcel ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      <span>Importing Products...</span>
                    </>
                  ) : (
                    <span>Confirm &amp; Import to Database</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* ═══════════════════════════════════════════════════════════ */}
      {/* RFQ DETAIL MODAL                                           */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {selectedRFQ && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setSelectedRFQ(null)}
        >
          <div
            className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-[#004f9e]/5 px-6 py-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#004f9e] mb-0.5">RFQ Enquiry</p>
                <h2 className="text-lg font-extrabold text-slate-900">#{selectedRFQ.rfq_number}</h2>
              </div>
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-[#004f9e]">
                  {selectedRFQ.status || "New Enquiry"}
                </span>
                <button
                  onClick={() => setSelectedRFQ(null)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="max-h-[75vh] overflow-y-auto px-6 py-5 space-y-5">
              {/* Date */}
              <p className="text-xs text-slate-400">
                Submitted: {new Date(selectedRFQ.created_at).toLocaleString("en-IN", { dateStyle: "long", timeStyle: "short" })}
              </p>

              {/* Client Info */}
              <div>
                <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Client Information</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                    <p className="text-[0.65rem] font-bold uppercase tracking-wider text-slate-400 mb-1">Full Name</p>
                    <p className="font-bold text-slate-900">{selectedRFQ.full_name || "-"}</p>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                    <p className="text-[0.65rem] font-bold uppercase tracking-wider text-slate-400 mb-1">Company</p>
                    <p className="font-bold text-slate-900">{selectedRFQ.company_name || "-"}</p>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                    <p className="text-[0.65rem] font-bold uppercase tracking-wider text-slate-400 mb-1">Email</p>
                    <a href={`mailto:${selectedRFQ.email}`} className="font-semibold text-[#004f9e] hover:underline break-all">{selectedRFQ.email || "-"}</a>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                    <p className="text-[0.65rem] font-bold uppercase tracking-wider text-slate-400 mb-1">Phone</p>
                    <a href={`tel:${selectedRFQ.phone}`} className="font-semibold text-[#004f9e] hover:underline">{selectedRFQ.phone || "-"}</a>
                  </div>
                </div>
              </div>

              {/* Product Info */}
              <div>
                <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Product Requirements</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                    <p className="text-[0.65rem] font-bold uppercase tracking-wider text-slate-400 mb-1">Category</p>
                    <p className="font-bold text-slate-900">{selectedRFQ.product_category || "-"}</p>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                    <p className="text-[0.65rem] font-bold uppercase tracking-wider text-slate-400 mb-1">Estimated Quantity</p>
                    <p className="font-bold text-slate-900">{selectedRFQ.estimated_qty ? `${selectedRFQ.estimated_qty} Units` : "-"}</p>
                  </div>
                </div>
              </div>

              {/* Technical Specs */}
              {selectedRFQ.technical_specs && (
                <div>
                  <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Technical Specifications</h3>
                  <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                    <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">{selectedRFQ.technical_specs}</p>
                  </div>
                </div>
              )}

              {/* Message / Notes */}
              {(selectedRFQ as any).message && (
                <div>
                  <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Additional Message</h3>
                  <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                    <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">{(selectedRFQ as any).message}</p>
                  </div>
                </div>
              )}

              {/* CAD Attachment */}
              {selectedRFQ.drawing_attachment_url && (
                <div>
                  <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">CAD Drawing / Attachment</h3>
                  <a
                    href={selectedRFQ.drawing_attachment_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-[#004f9e]/20 bg-[#004f9e]/5 px-4 py-2.5 text-sm font-bold text-[#004f9e] hover:bg-[#004f9e]/10 transition-colors"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                    View / Download CAD File
                  </a>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 bg-slate-50/80">
              <button
                onClick={() => {
                  handleDeleteQuoteRequest(selectedRFQ.id, selectedRFQ.rfq_number);
                  setSelectedRFQ(null);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete Enquiry
              </button>
              <div className="flex gap-2">
                {selectedRFQ.phone && (
                  <a
                    href={`https://wa.me/91${selectedRFQ.phone.replace(/\D/g, "").replace(/^91/, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-600 transition-colors shadow-sm"
                  >
                    WhatsApp
                  </a>
                )}
                <button
                  onClick={() => setSelectedRFQ(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

