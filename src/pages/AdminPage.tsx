import React, { useState, useMemo, useEffect, useRef } from "react";
import { Product, BRAND_CATALOGUE_TREE, ALL_INDUSTRIES } from "@/data/products";
import {
  getStoredProducts,
  addStoredProduct,
  updateStoredProduct,
  deleteStoredProduct,
  resetStoredProductsToDefault,
  exportProductsToJson,
  exportProductsToCsv,
  importProductsFromJson,
  importProductsFromCsv,
} from "@/lib/productsStore";
import { useECommerce } from "@/context/ECommerceContext";
import { formatINR, Order, OrderStatus, getProductDefaultPrice, getProductExternalLink } from "@/lib/ecommerceStore";
import { downloadQuotationFromOrder } from "@/lib/pdfQuotationService";
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

type AdminSection = "overview" | "products" | "orders" | "tracking" | "quotes" | "analytics";

export function AdminPage({ onNavigateHome }: AdminPageProps) {
  const {
    orders,
    updateOrderStatus,
    updateOrderDetails,
    deleteOrders,
    run30DayCleanup,
    exportOrdersCsv,
    checkAndTriggerLowStockAlerts,
  } = useECommerce();

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
  }, []);

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

  // Valid, Completed Orders (Excludes Incomplete/Abandoned Checkouts)
  const validOrders = useMemo(() => {
    return orders.filter(
      (o) =>
        o.orderStatus !== "Payment Incomplete" &&
        o.orderStatus !== "Payment Failed" &&
        o.paymentStatus !== "Failed" &&
        o.paymentStatus !== "Incomplete"
    );
  }, [orders]);

  const totalSimulatedRevenue = useMemo(() => {
    return validOrders.reduce((sum, ord) => sum + ord.total, 0);
  }, [validOrders]);

  const totalCatalogValue = useMemo(() => {
    return products.reduce((sum, p) => sum + getProductDefaultPrice(p) * (p.stockCount || 100), 0);
  }, [products]);

  const lowStockCount = useMemo(() => {
    return products.filter((p) => (p.stockCount || 100) <= (p.lowStockThreshold || 15)).length;
  }, [products]);

  // Filtered Orders (Supports Time Filter, Status Filter & Full text search)
  const filteredOrders = useMemo(() => {
    return orders.filter((ord) => {
      // By default in "All", only show valid confirmed/paid orders
      if (orderStatusFilter === "All") {
        if (
          ord.orderStatus === "Payment Incomplete" ||
          ord.orderStatus === "Payment Failed" ||
          ord.paymentStatus === "Failed" ||
          ord.paymentStatus === "Incomplete"
        ) {
          return false;
        }
      } else if (ord.orderStatus !== orderStatusFilter) {
        return false;
      }

      // Time Range Filter
      if (orderTimeFilter !== "All Time") {
        const ordTime = new Date(ord.createdAt).getTime();
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
    });
  }, [orders, orderStatusFilter, orderTimeFilter, orderSearch]);

  // Order Handlers
  const handleOpenOrderModal = (ord: Order) => {
    setViewingOrder(ord);
    setModalTrackingId(ord.trackingNumber || "");
    setModalTrackingLink(ord.trackingLink || "");
  };

  const handleModalStatusChange = async (newStatus: OrderStatus) => {
    if (!viewingOrder) return;

    // Rule: Once Shipped or Delivered, cannot go back to Confirmed
    if (newStatus === "Confirmed" && (viewingOrder.orderStatus === "Shipped" || viewingOrder.orderStatus === "Dispatched" || viewingOrder.orderStatus === "Delivered")) {
      showToast("Order has already been shipped and cannot revert to Confirmed status.", "error");
      return;
    }

    // Rule: Once Delivered, cannot go back to Shipped
    if (newStatus === "Shipped" && viewingOrder.orderStatus === "Delivered") {
      showToast("Order has already been delivered and cannot revert to Shipped status.", "error");
      return;
    }

    setModalStatusSaving(true);
    try {
      const updated = updateOrderDetails(
        viewingOrder.id,
        {
          orderStatus: newStatus,
          trackingNumber: modalTrackingId.trim() || viewingOrder.trackingNumber,
          trackingLink: modalTrackingLink.trim() || viewingOrder.trackingLink,
        },
        true // dispatches status update email
      );
      if (updated) {
        setViewingOrder(updated);
      }
      showToast(`Order #${viewingOrder.orderNumber} updated to ${newStatus} & notification emailed to ${viewingOrder.customer.email}!`, "success");
    } catch (err) {
      showToast("Failed to update status", "error");
    } finally {
      setModalStatusSaving(false);
    }
  };

  const handleSaveTracking = () => {
    if (!viewingOrder) return;
    const updated = updateOrderDetails(
      viewingOrder.id,
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

  // Filtered Tracking Shipments
  const trackingOrders = useMemo(() => {
    if (trackingFilter === "All") return validOrders;
    return validOrders.filter((o) => o.orderStatus === trackingFilter);
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

  const handleToggleStock = (prod: Product) => {
    const prodId = prod.id || prod.sku;
    const updated = updateStoredProduct(prodId, { inStock: !prod.inStock });
    setProducts(updated);
    const updatedProd = updated.find((p) => (p.id || p.sku) === prodId);
    if (updatedProd) saveProductToSupabase(updatedProd).catch(console.warn);
    showToast(`${prod.name} is now ${!prod.inStock ? "In Stock" : "Out of Stock"}.`, "info");
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

  const handleResetDefaults = () => {
    if (confirm("Reset catalogue to default items? Any custom products added will be replaced with defaults.")) {
      const defs = resetStoredProductsToDefault();
      setProducts(defs);
      showToast("Catalogue reset to default items.", "info");
    }
  };

  const handleDeleteQuoteRequest = async (id: string, rfqNum: string) => {
    if (confirm(`Are you sure you want to delete RFQ Enquiry #${rfqNum}?`)) {
      await deleteQuoteRequestFromSupabase(id);
      setQuoteRequests((prev) => prev.filter((q) => q.id !== id && q.rfq_number !== id));
      showToast(`RFQ #${rfqNum} deleted.`, "info");
    }
  };

  // Nav Items definition with clean SVG icons
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
      count: products.length,
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
      count: validOrders.length,
      badgeColor: "bg-emerald-100 text-emerald-800",
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
      count: validOrders.filter((o) => o.orderStatus !== "Delivered" && o.orderStatus !== "Cancelled").length,
    },
    {
      id: "quotes",
      label: "Custom RFQ Enquiries",
      icon: (
        <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      ),
      count: quoteRequests.length,
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
          <div className="flex h-16 items-center justify-between px-4 border-b border-slate-100">
            <button
              onClick={() => onNavigateHome("#top")}
              className="flex items-center gap-3 overflow-hidden text-left cursor-pointer"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#004f9e] text-white font-bold text-base shadow-sm">
                QT
              </div>
              {sidebarOpen && (
                <div className="min-w-0 flex-1">
                  <h1 className="text-sm font-bold uppercase tracking-wider text-slate-900 truncate">
                    Qualitech Ops
                  </h1>
                  <p className="text-xs text-slate-500 font-medium truncate">B2B Core v2.4</p>
                </div>
              )}
            </button>

            <button
              onClick={() => setSidebarOpen((v) => !v)}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
              title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              <svg className={`h-4 w-4 transition-transform ${sidebarOpen ? "" : "rotate-180"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
          </div>

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
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={isActive ? "text-white" : "text-slate-400"}>
                      {item.icon}
                    </span>
                    {sidebarOpen && <span className="truncate">{item.label}</span>}
                  </div>
                  {sidebarOpen && typeof item.count === "number" && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-bold ${
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
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/90 bg-white/95 px-6 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight capitalize">
              {activeSection === "overview" && "Executive Dashboard & Operations"}
              {activeSection === "products" && "Product Catalogue & Inventory (167+ Items)"}
              {activeSection === "orders" && "Customer Orders & Invoices"}
              {activeSection === "tracking" && "Shipment & Courier Logistics"}
              {activeSection === "quotes" && "Custom RFQ Quotation Requests"}
              {activeSection === "analytics" && "Store Analytics & Metrics"}
            </h2>
          </div>

          <div className="flex items-center gap-3">
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
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
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
                    onClick={handleExportCsv}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Export CSV
                  </button>
                </div>
              </div>

              {/* Products Table */}
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-slate-200 bg-slate-50/90 font-bold uppercase tracking-wider text-xs text-slate-500">
                    <tr>
                      <th className="py-3.5 px-4">Product &amp; SKU</th>
                      <th className="py-3.5 px-4">Brand</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4 text-right">Unit Price</th>
                      <th className="py-3.5 px-4 text-center">Stock Count</th>
                      <th className="py-3.5 px-4 text-center">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedProducts.map((p) => {
                      const price = getProductDefaultPrice(p);
                      const extLink = getProductExternalLink(p);

                      return (
                        <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 p-1">
                                <img src={p.image || "/logo.png"} alt={p.name} className="h-full w-full object-contain" />
                              </div>
                              <div className="max-w-xs">
                                <p className="font-bold text-slate-900 line-clamp-1">{p.name}</p>
                                <p className="font-mono text-xs text-slate-400">{p.sku}</p>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span
                              className={`rounded-md px-2.5 py-1 text-xs font-bold uppercase tracking-wider ${
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

                          <td className="py-3.5 px-4 text-slate-600 font-medium">
                            <p className="line-clamp-1">{p.category}</p>
                            {p.subCategory && (
                              <p className="text-xs text-slate-400 line-clamp-1">{p.subCategory}</p>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                            {formatINR(price)}
                          </td>

                          <td className="py-3.5 px-4 text-center font-mono font-semibold text-slate-700">
                            {p.stockCount || 100} {p.unit || "pcs"}
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            <button
                              onClick={() => handleToggleStock(p)}
                              className={`rounded-full px-3 py-1 text-xs font-bold cursor-pointer transition-all ${
                                p.inStock
                                  ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                                  : "bg-rose-100 text-rose-800 hover:bg-rose-200"
                              }`}
                            >
                              {p.inStock ? "In Stock" : "Out of Stock"}
                            </button>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {p.brand !== "Qualitech" && (
                                <a
                                  href={extLink.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:text-[#004f9e] hover:border-[#004f9e] transition-colors"
                                  title={`View on official ${p.brand} catalog`}
                                >
                                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                  </svg>
                                </a>
                              )}
                              <button
                                onClick={() => handleOpenEditForm(p)}
                                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-[#004f9e] hover:text-[#004f9e] transition-colors cursor-pointer"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDuplicateProduct(p)}
                                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
                                title="Duplicate product"
                              >
                                Copy
                              </button>
                              <button
                                onClick={() => setProductToDelete(p)}
                                className="rounded-lg border border-slate-200 p-2 text-slate-400 hover:text-rose-600 hover:border-rose-300 transition-colors cursor-pointer"
                                title="Delete product"
                              >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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

                        return (
                          <tr key={ord.id} className="hover:bg-slate-50/70 transition-colors">
                            {/* Order ID */}
                            <td className="py-4 px-5 font-mono text-sm font-semibold text-slate-700">
                              #{ord.orderNumber}
                            </td>

                            {/* Customer */}
                            <td className="py-4 px-5">
                              <p className="font-bold text-slate-900 text-sm">{ord.customer.fullName}</p>
                              <p className="text-xs text-slate-400 font-normal">{ord.customer.email}</p>
                            </td>

                            {/* Status Pill */}
                            <td className="py-4 px-5">
                              {statusLower === "cancelled" ? (
                                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-500">
                                  <svg className="h-4 w-4 text-rose-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <circle cx="12" cy="12" r="9" stroke="currentColor" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 9l-6 6M9 9l6 6" />
                                  </svg>
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
                                  ord.paymentStatus === "Paid" || ord.paymentMethod.includes("Razorpay") || ord.paymentMethod.includes("UPI")
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                                    : "bg-amber-100/80 text-amber-800"
                                }`}
                              >
                                {ord.paymentStatus === "Paid" ? "PREPAID" : ord.paymentMethod.toUpperCase()}
                              </span>
                            </td>

                            {/* Total Amount */}
                            <td className="py-4 px-5 font-bold text-slate-900 text-sm">
                              {formatINR(ord.total)}
                            </td>

                            {/* Date & Time */}
                            <td className="py-4 px-5 text-xs text-slate-600">
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
          {/* 3. SHIPMENT TRACKING & LOGISTICS */}
          {/* ═════════════════════════════════════════════════════════════════ */}
          {activeSection === "tracking" && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Live Courier &amp; Shipment Tracking Manager
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Real-time AWB tracking numbers, dispatch status, and carrier milestones.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {["All", "Confirmed", "Processing", "Dispatched", "Delivered"].map((st) => (
                    <button
                      key={st}
                      onClick={() => setTrackingFilter(st)}
                      className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                        trackingFilter === st
                          ? "bg-[#004f9e] text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
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
                    const currentIdx = statusSteps.indexOf(ord.orderStatus);

                    return (
                      <div key={ord.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
                        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                          <div>
                            <span className="font-mono text-sm font-bold text-[#004f9e]">#{ord.orderNumber}</span>
                            <p className="text-sm font-bold text-slate-900 mt-0.5">{ord.customer.fullName}</p>
                            <p className="text-xs text-slate-500">{ord.customer.city}, {ord.customer.state}</p>
                          </div>

                          <div className="text-right">
                            <span className="inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-[#004f9e] border border-blue-200">
                              {ord.shippingMethod.name}
                            </span>
                            <p className="font-mono text-xs font-bold text-slate-600 mt-1">
                              AWB: {ord.trackingNumber}
                            </p>
                          </div>
                        </div>

                        {/* Progress Stepper Bar */}
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

                        <div className="flex items-center justify-between pt-2">
                          <span className="text-xs text-slate-500 font-medium">
                            Est. Delivery: <strong>{ord.estimatedDelivery}</strong>
                          </span>
                          <button
                            onClick={() => setViewingOrder(ord)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-[#004f9e] hover:text-white transition-colors cursor-pointer"
                          >
                            <span>Update AWB</span>
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
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Products</span>
                  <p className="mt-2 text-3xl font-extrabold text-slate-900">{products.length}</p>
                  <p className="mt-1 text-xs text-emerald-600 font-semibold">{products.filter((p) => p.inStock).length} In Stock</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Orders</span>
                  <p className="mt-2 text-3xl font-extrabold text-[#004f9e]">{orders.length}</p>
                  <p className="mt-1 text-xs text-slate-500">Live Customer Purchases</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Order Revenue</span>
                  <p className="mt-2 text-3xl font-extrabold text-emerald-600">{formatINR(totalSimulatedRevenue)}</p>
                  <p className="mt-1 text-xs text-slate-500">Calculated from confirmed orders</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Inventory Valuation</span>
                  <p className="mt-2 text-3xl font-extrabold text-slate-900">{formatINR(totalCatalogValue)}</p>
                  <p className="mt-1 text-xs text-amber-600 font-semibold">{lowStockCount} Low stock items</p>
                </div>
              </div>

              {/* Brand Distribution Breakdown */}
              <div className="grid gap-4 md:grid-cols-3">
                {[
                  {
                    brand: "Amphenol",
                    color: "border-blue-200 bg-blue-50/50 text-[#004f9e]",
                    products: products.filter((p) => p.brand === "Amphenol"),
                    desc: "High-Speed Connectors, Antennas, RF & Military Interconnects",
                  },
                  {
                    brand: "Zolex",
                    color: "border-emerald-200 bg-emerald-50/50 text-emerald-800",
                    products: products.filter((p) => p.brand === "Zolex"),
                    desc: "Copper Lugs, Stainless Steel Ties, Glands & Earthing",
                  },
                  {
                    brand: "Qualitech",
                    color: "border-amber-200 bg-amber-50/50 text-amber-800",
                    products: products.filter((p) => p.brand === "Qualitech"),
                    desc: "Custom Military & Aerospace Wire Harness Assemblies",
                  },
                ].map((b) => (
                  <div key={b.brand} className={`rounded-2xl border p-6 ${b.color}`}>
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-bold">{b.brand}</h4>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-bold shadow-xs">
                        {b.products.length} Products
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-slate-600 leading-relaxed">{b.desc}</p>
                    <div className="mt-4 pt-3 border-t border-slate-200/60 text-xs text-slate-800 flex justify-between items-center">
                      <span>In-Stock Lines:</span>
                      <strong>{b.products.filter((p) => p.inStock).length}</strong>
                    </div>
                  </div>
                ))}
              </div>
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
                        <img src={formData.image || "/logo.png"} alt="Preview" className="h-full w-full object-contain" />
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
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity" onClick={() => setViewingOrder(null)} />

          <div className="relative z-10 my-8 w-full max-w-2xl overflow-hidden rounded-3xl bg-white p-7 sm:p-9 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Top Header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#1e1b4b] tracking-tight">
                  Order <span className="font-mono">#{viewingOrder.orderNumber}</span>
                </h3>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* Status Pill Badge */}
                {viewingOrder.orderStatus === "Cancelled" ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 border border-rose-200/80 px-3.5 py-1 text-xs font-bold text-rose-600 uppercase tracking-wider">
                    <svg className="h-3.5 w-3.5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <circle cx="12" cy="12" r="9" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 9l-6 6M9 9l6 6" />
                    </svg>
                    <span>CANCELLED</span>
                  </span>
                ) : viewingOrder.orderStatus === "Confirmed" ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200/80 px-3.5 py-1 text-xs font-bold text-blue-600 uppercase tracking-wider">
                    <svg className="h-3.5 w-3.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <circle cx="12" cy="12" r="9" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
                    </svg>
                    <span>CONFIRMED</span>
                  </span>
                ) : viewingOrder.orderStatus === "Delivered" ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 px-3.5 py-1 text-xs font-bold text-emerald-600 uppercase tracking-wider">
                    <svg className="h-3.5 w-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <circle cx="12" cy="12" r="9" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
                    </svg>
                    <span>DELIVERED</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 px-3.5 py-1 text-xs font-bold text-indigo-600 uppercase tracking-wider">
                    <svg className="h-3.5 w-3.5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <circle cx="12" cy="12" r="9" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
                    </svg>
                    <span>{viewingOrder.orderStatus.toUpperCase()}</span>
                  </span>
                )}

                {/* Payment Badge */}
                <span className="inline-block rounded-full bg-[#fef3c7] px-3.5 py-1 text-[0.68rem] font-extrabold uppercase tracking-wider text-[#92400e]">
                  {viewingOrder.paymentStatus === "Paid" ? "PREPAID" : "CASH ON DELIVERY"}
                </span>

                {/* Download PDF Button */}
                <button
                  type="button"
                  onClick={() => downloadQuotationFromOrder(viewingOrder)}
                  className="flex items-center gap-1.5 rounded-full bg-[#004f9e]/10 border border-[#004f9e]/30 px-3 py-1 text-[0.68rem] font-bold text-[#004f9e] hover:bg-[#004f9e] hover:text-white transition-all cursor-pointer"
                  title="Download Branded Proforma PDF Invoice"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>PDF Invoice</span>
                </button>

                {/* Close Button */}
                <button
                  onClick={() => setViewingOrder(null)}
                  className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors ml-1 cursor-pointer"
                  title="Close"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* 2-Column Content Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
              {/* Left Column: Customer Info & Address */}
              <div className="space-y-4">
                {/* Customer Info */}
                <div>
                  <p className="text-[0.68rem] font-bold uppercase tracking-widest text-[#64748b] mb-1.5">
                    CUSTOMER INFO
                  </p>
                  <div className="rounded-2xl bg-[#f8fafc] border border-slate-100 p-4 space-y-1">
                    <p className="font-bold text-sm text-slate-900">{viewingOrder.customer.fullName}</p>
                    <p className="text-xs text-slate-500">{viewingOrder.customer.email}</p>
                    <p className="text-xs text-slate-500">{viewingOrder.customer.phone}</p>
                    {viewingOrder.customer.companyName && (
                      <p className="text-xs text-[#004f9e] font-semibold pt-0.5">{viewingOrder.customer.companyName}</p>
                    )}
                  </div>
                </div>

                {/* Shipping Address */}
                <div>
                  <p className="text-[0.68rem] font-bold uppercase tracking-widest text-[#64748b] mb-1.5">
                    SHIPPING ADDRESS
                  </p>
                  <div className="rounded-2xl bg-[#f8fafc] border border-slate-100 p-4">
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {viewingOrder.customer.address} , {viewingOrder.customer.city} , {viewingOrder.customer.state} , {viewingOrder.customer.pincode}, India
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column: Items, Tracking ID & Link */}
              <div className="space-y-3">
                {/* Items */}
                <div>
                  <p className="text-[0.68rem] font-bold uppercase tracking-widest text-[#64748b] text-right md:text-right mb-1.5">
                    ITEMS
                  </p>
                  <div className="rounded-2xl bg-[#f8fafc] border border-slate-100 p-3 max-h-32 overflow-y-auto space-y-1.5">
                    {viewingOrder.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs py-1 px-1">
                        <div className="max-w-[180px] truncate">
                          <span className="font-medium text-slate-800">{item.product.name}</span>
                        </div>
                        <span className="font-bold text-slate-900 font-mono">x{item.quantity}</span>
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
                    <button
                      onClick={handleSaveTracking}
                      className="text-[0.65rem] font-bold text-[#004f9e] hover:underline cursor-pointer"
                    >
                      Save ID
                    </button>
                  </div>
                  <input
                    type="text"
                    value={modalTrackingId}
                    onChange={(e) => setModalTrackingId(e.target.value)}
                    onBlur={handleSaveTracking}
                    placeholder="e.g. SF-123456789"
                    className="w-full rounded-2xl border-2 border-sky-400 bg-white px-4 py-2.5 text-sm text-slate-800 text-right focus:outline-none focus:ring-2 focus:ring-sky-200 font-mono"
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
                  <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-[#f8fafc] px-3.5 py-2">
                    <input
                      type="text"
                      value={modalTrackingLink}
                      onChange={(e) => setModalTrackingLink(e.target.value)}
                      onBlur={handleSaveTracking}
                      placeholder="https://tracking.link/..."
                      className="w-full bg-transparent text-xs text-slate-700 text-right focus:outline-none placeholder:text-slate-400 font-mono"
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
                  <p className="text-[0.62rem] text-slate-400 text-right mt-1">
                    Status changes to 'Shipped' or 'Out for Delivery' automatically notify the customer.
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Row: Status Change Pills & Total Price */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-5 border-t border-slate-100">
              {/* Status Pills */}
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { key: "Confirmed" as OrderStatus, label: "Confirmed" },
                  { key: "Shipped" as OrderStatus, label: "Shipped" },
                  { key: "Delivered" as OrderStatus, label: "Delivered" },
                  { key: "Cancelled" as OrderStatus, label: "Cancelled" },
                ].map((st) => {
                  const isActive = viewingOrder.orderStatus === st.key;
                  // Once shipped or delivered, cannot go back to confirmed!
                  const isConfirmedDisabled =
                    st.key === "Confirmed" &&
                    (viewingOrder.orderStatus === "Shipped" ||
                      viewingOrder.orderStatus === "Dispatched" ||
                      viewingOrder.orderStatus === "Delivered");
                  // Once delivered, cannot go back to shipped
                  const isShippedDisabled =
                    st.key === "Shipped" && viewingOrder.orderStatus === "Delivered";
                  const isDisabled = modalStatusSaving || isConfirmedDisabled || isShippedDisabled;

                  return (
                    <button
                      key={st.key}
                      disabled={isDisabled}
                      onClick={() => handleModalStatusChange(st.key)}
                      title={
                        isConfirmedDisabled
                          ? "Order has already been shipped and cannot revert to Confirmed"
                          : isShippedDisabled
                          ? "Order has already been delivered and cannot revert to Shipped"
                          : undefined
                      }
                      className={`rounded-full px-4 sm:px-5 py-2 text-xs font-semibold transition-all ${
                        isDisabled && !isActive
                          ? "border border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed opacity-50 select-none"
                          : isActive
                          ? "bg-[#94a3b8] text-white shadow-xs font-bold ring-1 ring-slate-400 cursor-default"
                          : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300 cursor-pointer"
                      }`}
                    >
                      {st.label}
                    </button>
                  );
                })}
              </div>

              {/* Total Price */}
              <div className="text-right sm:text-right w-full sm:w-auto">
                <span className="text-[0.68rem] text-slate-400 font-medium block">
                  Total Price
                </span>
                <span className="text-2xl font-black text-slate-900 tracking-tight">
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

