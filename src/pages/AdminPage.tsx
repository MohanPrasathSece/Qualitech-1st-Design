import { useState, useMemo, useEffect, useRef } from "react";
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
import { formatINR, Order, OrderStatus, getProductDefaultPrice } from "@/lib/ecommerceStore";

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

export function AdminPage({ onNavigateHome }: AdminPageProps) {
  const { orders, updateOrderStatus } = useECommerce();

  // Active Admin Tab
  const [adminTab, setAdminTab] = useState<"products" | "orders" | "analytics">("products");

  // Products State
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<string>("All");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedStock, setSelectedStock] = useState<string>("All");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Orders Filter State
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("All");
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);

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

  // Form Data State
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

  // Load products on mount
  useEffect(() => {
    setProducts(getStoredProducts());
  }, []);

  const showToast = (title: string, type: "success" | "error" | "info" = "success") => {
    setToastMessage({ title, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
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

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((ord) => {
      if (orderStatusFilter !== "All" && ord.orderStatus !== orderStatusFilter) return false;
      if (orderSearch.trim()) {
        const q = orderSearch.toLowerCase();
        return (
          ord.orderNumber.toLowerCase().includes(q) ||
          ord.customer.fullName.toLowerCase().includes(q) ||
          (ord.customer.companyName && ord.customer.companyName.toLowerCase().includes(q)) ||
          ord.trackingNumber.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [orders, orderStatusFilter, orderSearch]);

  // Analytics Metrics
  const totalCatalogValue = useMemo(() => {
    return products.reduce((acc, p) => acc + (getProductDefaultPrice(p) * (p.stockCount || 50)), 0);
  }, [products]);

  const totalSimulatedRevenue = useMemo(() => {
    return orders.reduce((acc, ord) => acc + ord.total, 0);
  }, [orders]);

  const lowStockCount = useMemo(() => {
    return products.filter((p) => (p.stockCount || 100) <= (p.lowStockThreshold || 15)).length;
  }, [products]);

  // Form Handlers
  const handleOpenAddForm = () => {
    setEditingProduct(null);
    const randomSkuNum = Math.floor(1000 + Math.random() * 9000);
    setFormData({
      sku: `QT-${randomSkuNum}`,
      name: "",
      brand: "Qualitech",
      category: "Custom Wire Harnesses",
      subCategory: "",
      price: 2850,
      salePrice: undefined,
      stockCount: 150,
      unit: "pcs",
      leadTime: "Ships in 24-48 Hours",
      description: "",
      features: ["Precision point-to-point industrial wiring", "100% electrical continuity & hipot verified"],
      specs: { Manufacturer: "Qualitech Connectronics Pvt Ltd", Standards: "IPC/WHMA-A-620 Class 3" },
      industries: ["Telecommunications", "Industrial Automation"],
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
      specs: { ...prod.specs },
      industries: [...prod.industries],
    });
    setActiveFormTab("basic");
    setIsFormOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      showToast("Please enter a product name.", "error");
      return;
    }

    const cleanFeatures = (formData.features || []).filter((f) => f.trim() !== "");

    if (editingProduct) {
      const updated = updateStoredProduct(editingProduct.id, {
        ...formData,
        features: cleanFeatures,
      });
      setProducts(updated);
      showToast(`Product "${formData.name}" updated successfully!`, "success");
    } else {
      const updated = addStoredProduct({
        ...formData,
        features: cleanFeatures,
      });
      setProducts(updated);
      showToast(`Product "${formData.name}" added to catalogue!`, "success");
    }
    setIsFormOpen(false);
  };

  const handleDeleteProduct = () => {
    if (!productToDelete) return;
    const updated = deleteStoredProduct(productToDelete.id);
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
    showToast(`Duplicated product as "${duplicate.name}".`, "success");
  };

  const handleToggleStock = (prod: Product) => {
    const updated = updateStoredProduct(prod.id, { inStock: !prod.inStock });
    setProducts(updated);
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      setImportText(content);
      if (file.name.endsWith(".csv")) {
        setImportFormat("csv");
      } else if (file.name.endsWith(".json")) {
        setImportFormat("json");
      }
    };
    reader.readAsText(file);
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const dataUrl = evt.target?.result as string;
      setFormData((prev) => ({ ...prev, image: dataUrl }));
      showToast("Custom product image loaded successfully!", "info");
    };
    reader.readAsDataURL(file);
  };

  const handleResetDefaults = () => {
    if (confirm("Reset catalogue to default items? Any custom products added will be replaced with defaults.")) {
      const defs = resetStoredProductsToDefault();
      setProducts(defs);
      showToast("Catalogue reset to default items.", "info");
    }
  };

  return (
    <div className="min-h-screen bg-steel-light/20 text-foreground">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-[200] flex items-center gap-3 rounded-2xl px-5 py-3.5 shadow-2xl text-xs font-bold transition-all animate-in slide-in-from-bottom-5 duration-300 ${
            toastMessage.type === "success"
              ? "bg-emerald-600 text-white"
              : toastMessage.type === "error"
              ? "bg-rose-600 text-white"
              : "bg-graphite text-white"
          }`}
        >
          <span>
            {toastMessage.type === "success" ? "✓" : toastMessage.type === "error" ? "⚠" : "ℹ"}
          </span>
          <span>{toastMessage.title}</span>
        </div>
      )}

      {/* Top Admin Navigation Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-white/95 backdrop-blur-md shadow-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 sm:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigateHome("#top")}
              className="flex items-center cursor-pointer"
            >
              <img src="/logo.png" alt="Qualitech" className="h-8 w-auto" />
            </button>
            <div className="h-5 w-px bg-border" />
            <span className="rounded-lg bg-brand-blue/10 px-2.5 py-1 text-xs font-bold text-brand-blue uppercase tracking-wider">
              Management Portal
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigateHome("#products", true)}
              className="rounded-xl border border-border px-4 py-2 text-xs font-bold text-graphite hover:bg-steel-light transition-colors cursor-pointer"
            >
              View Live Storefront →
            </button>
          </div>
        </div>

        {/* Tab Navigation Strip */}
        <div className="border-t border-border/80 bg-steel-light/30 px-5 sm:px-8">
          <div className="mx-auto flex max-w-7xl gap-8">
            {[
              { id: "products", label: "Product Management", icon: "📦", count: products.length },
              { id: "orders", label: "Customer Orders", icon: "📑", count: orders.length },
              { id: "analytics", label: "Store Analytics", icon: "📊" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setAdminTab(tab.id as any)}
                className={`flex items-center gap-2 py-3.5 font-display text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
                  adminTab === tab.id
                    ? "border-brand-blue text-brand-blue"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[0.65rem] ${
                      adminTab === tab.id
                        ? "bg-brand-blue text-white"
                        : "bg-steel-light text-muted-foreground"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        {/* ═════════════════════════════════════════════════════════════════ */}
        {/* TAB 1: PRODUCT MANAGEMENT */}
        {/* ═════════════════════════════════════════════════════════════════ */}
        {adminTab === "products" && (
          <div className="space-y-6">
            {/* Top Toolbar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-border bg-white p-4 shadow-xs">
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Search Bar */}
                <div className="relative min-w-[240px]">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by SKU, name, brand..."
                    className="w-full rounded-xl border border-border bg-steel-light/20 py-2 pl-9 pr-3 text-xs text-graphite focus:border-brand-blue focus:bg-white focus:outline-hidden"
                  />
                  <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>

                {/* Brand Filter */}
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="rounded-xl border border-border bg-steel-light/20 px-3 py-2 text-xs font-semibold text-graphite focus:border-brand-blue focus:outline-hidden"
                >
                  <option value="All">All Brands</option>
                  <option value="Amphenol">Amphenol</option>
                  <option value="Zolex">Zolex</option>
                  <option value="Qualitech">Qualitech</option>
                </select>

                {/* Stock Filter */}
                <select
                  value={selectedStock}
                  onChange={(e) => setSelectedStock(e.target.value)}
                  className="rounded-xl border border-border bg-steel-light/20 px-3 py-2 text-xs font-semibold text-graphite focus:border-brand-blue focus:outline-hidden"
                >
                  <option value="All">All Stock Levels</option>
                  <option value="InStock">In Stock Only</option>
                  <option value="LowStock">Low Stock (≤15)</option>
                  <option value="OutOfStock">Out of Stock</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setIsImportModalOpen(true)}
                  className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-bold text-graphite hover:bg-steel-light transition-colors cursor-pointer"
                >
                  <span>📥</span>
                  <span>Import CSV / JSON</span>
                </button>

                <button
                  onClick={handleExportCsv}
                  className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-bold text-graphite hover:bg-steel-light transition-colors cursor-pointer"
                >
                  <span>📤</span>
                  <span>Export CSV</span>
                </button>

                <button
                  onClick={handleResetDefaults}
                  className="rounded-xl border border-border px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-destructive hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Reset to default seed catalogue"
                >
                  Reset Defaults
                </button>

                <button
                  onClick={handleOpenAddForm}
                  className="flex items-center gap-2 rounded-xl bg-brand-blue px-4 py-2 font-display text-xs font-bold uppercase tracking-wider text-white hover:bg-graphite transition-all shadow-xs cursor-pointer"
                >
                  <span>+</span>
                  <span>Add Product</span>
                </button>
              </div>
            </div>

            {/* Products Table View */}
            <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border bg-steel-light/40 font-bold uppercase tracking-wider text-[0.65rem] text-muted-foreground">
                  <tr>
                    <th className="p-3.5">Product</th>
                    <th className="p-3.5">Brand</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5 text-right">Unit Price</th>
                    <th className="p-3.5 text-center">Stock</th>
                    <th className="p-3.5 text-center">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {paginatedProducts.map((prod) => {
                    const price = getProductDefaultPrice(prod);
                    const isLowStock = (prod.stockCount || 100) <= (prod.lowStockThreshold || 15);

                    return (
                      <tr key={prod.id} className="hover:bg-steel-light/20 transition-colors">
                        {/* Product info */}
                        <td className="p-3.5">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-border/80 bg-steel-light/30 p-1">
                              <img
                                src={prod.image || "/logo.png"}
                                alt={prod.name}
                                className="h-full w-full object-contain"
                              />
                            </div>
                            <div>
                              <p className="font-mono text-[0.68rem] text-muted-foreground">{prod.sku}</p>
                              <p className="font-display font-bold text-graphite line-clamp-1 max-w-xs">
                                {prod.name}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Brand */}
                        <td className="p-3.5">
                          <span
                            className={`rounded-md px-2 py-0.5 text-[0.62rem] font-bold uppercase tracking-wider ${
                              prod.brand === "Amphenol"
                                ? "bg-blue-100 text-brand-blue"
                                : prod.brand === "Zolex"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {prod.brand}
                          </span>
                        </td>

                        {/* Category */}
                        <td className="p-3.5 text-muted-foreground">
                          <p className="line-clamp-1 max-w-[160px] font-medium">{prod.category}</p>
                        </td>

                        {/* Price */}
                        <td className="p-3.5 text-right">
                          <span className="font-display font-bold text-brand-blue">
                            {formatINR(price)}
                          </span>
                        </td>

                        {/* Stock Count */}
                        <td className="p-3.5 text-center">
                          <span
                            className={`font-mono font-bold ${
                              !prod.inStock
                                ? "text-rose-600"
                                : isLowStock
                                ? "text-amber-600"
                                : "text-emerald-700"
                            }`}
                          >
                            {prod.stockCount || 100} {prod.unit || "pcs"}
                          </span>
                        </td>

                        {/* Status Toggle */}
                        <td className="p-3.5 text-center">
                          <button
                            onClick={() => handleToggleStock(prod)}
                            className={`rounded-full px-2.5 py-0.5 text-[0.62rem] font-bold cursor-pointer transition-colors ${
                              prod.inStock
                                ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                                : "bg-rose-100 text-rose-800 hover:bg-rose-200"
                            }`}
                          >
                            {prod.inStock ? "● In Stock" : "○ Out of Stock"}
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEditForm(prod)}
                              className="rounded-lg border border-border px-2.5 py-1 text-xs font-semibold text-graphite hover:border-brand-blue hover:text-brand-blue transition-colors cursor-pointer"
                              title="Edit Product"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDuplicateProduct(prod)}
                              className="rounded-lg border border-border p-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                              title="Duplicate Product"
                            >
                              📋
                            </button>
                            <button
                              onClick={() => setProductToDelete(prod)}
                              className="rounded-lg border border-border p-1 text-muted-foreground hover:text-destructive hover:border-destructive transition-colors cursor-pointer"
                              title="Delete Product"
                            >
                              🗑
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-border bg-steel-light/10 p-4 text-xs font-semibold">
                  <span className="text-muted-foreground">
                    Showing {(currentPage - 1) * pageSize + 1} to{" "}
                    {Math.min(currentPage * pageSize, filteredProducts.length)} of{" "}
                    {filteredProducts.length} items
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => p - 1)}
                      className="rounded-lg border border-border px-3 py-1.5 disabled:opacity-30 hover:bg-white transition-colors"
                    >
                      ← Prev
                    </button>
                    <span className="font-mono">
                      {currentPage} / {totalPages}
                    </span>
                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((p) => p + 1)}
                      className="rounded-lg border border-border px-3 py-1.5 disabled:opacity-30 hover:bg-white transition-colors"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════ */}
        {/* TAB 2: ORDER MANAGEMENT */}
        {/* ═════════════════════════════════════════════════════════════════ */}
        {adminTab === "orders" && (
          <div className="space-y-6">
            {/* Orders Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-border bg-white p-4 shadow-xs">
              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <input
                  type="text"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  placeholder="Search order #, customer, company..."
                  className="rounded-xl border border-border bg-steel-light/20 px-3.5 py-2 text-xs text-graphite focus:border-brand-blue focus:bg-white focus:outline-hidden"
                />

                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="rounded-xl border border-border bg-steel-light/20 px-3 py-2 text-xs font-semibold text-graphite focus:border-brand-blue focus:outline-hidden"
                >
                  <option value="All">All Statuses</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Processing">Processing</option>
                  <option value="Quality Check">Quality Check</option>
                  <option value="Dispatched">Dispatched</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <span className="text-xs text-muted-foreground font-semibold">
                Total Orders: <strong className="text-graphite">{filteredOrders.length}</strong>
              </span>
            </div>

            {/* Orders Table */}
            <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border bg-steel-light/40 font-bold uppercase tracking-wider text-[0.65rem] text-muted-foreground">
                  <tr>
                    <th className="p-3.5">Order Number</th>
                    <th className="p-3.5">Date</th>
                    <th className="p-3.5">Consignee</th>
                    <th className="p-3.5">Items</th>
                    <th className="p-3.5 text-right">Amount</th>
                    <th className="p-3.5">Payment</th>
                    <th className="p-3.5 text-center">Fulfillment Status</th>
                    <th className="p-3.5 text-right">Invoice</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-steel-light/20 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-brand-blue">
                        #{ord.orderNumber}
                      </td>
                      <td className="p-3.5 text-muted-foreground">
                        {new Date(ord.createdAt).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="p-3.5">
                        <p className="font-bold text-graphite">{ord.customer.fullName}</p>
                        {ord.customer.companyName && (
                          <p className="text-[0.68rem] text-muted-foreground line-clamp-1">
                            {ord.customer.companyName}
                          </p>
                        )}
                      </td>
                      <td className="p-3.5">
                        <span className="font-bold text-graphite">{ord.items.length} items</span>
                      </td>
                      <td className="p-3.5 text-right font-bold text-graphite">
                        {formatINR(ord.total)}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`rounded-md px-2 py-0.5 text-[0.62rem] font-bold ${
                            ord.paymentStatus === "Paid"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-blue-100 text-brand-blue"
                          }`}
                        >
                          {ord.paymentStatus}
                        </span>
                      </td>
                      {/* Status Selector */}
                      <td className="p-3.5 text-center">
                        <select
                          value={ord.orderStatus}
                          onChange={(e) =>
                            updateOrderStatus(ord.id, e.target.value as OrderStatus)
                          }
                          className={`rounded-lg border px-2 py-1 text-xs font-bold focus:outline-hidden cursor-pointer ${
                            ord.orderStatus === "Delivered"
                              ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                              : ord.orderStatus === "Dispatched"
                              ? "border-blue-300 bg-blue-50 text-brand-blue"
                              : "border-amber-300 bg-amber-50 text-amber-800"
                          }`}
                        >
                          <option value="Confirmed">Confirmed</option>
                          <option value="Processing">Processing</option>
                          <option value="Quality Check">Quality Check</option>
                          <option value="Dispatched">Dispatched</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => setViewingOrder(ord)}
                          className="rounded-lg border border-border px-2.5 py-1 text-xs font-semibold text-graphite hover:border-brand-blue hover:text-brand-blue transition-colors cursor-pointer"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════ */}
        {/* TAB 3: STORE ANALYTICS & INVENTORY OVERVIEW */}
        {/* ═════════════════════════════════════════════════════════════════ */}
        {adminTab === "analytics" && (
          <div className="space-y-6">
            {/* KPI Cards Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-border bg-white p-5 shadow-xs">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Active Products
                </span>
                <p className="mt-2 font-display text-2xl font-extrabold text-graphite">
                  {products.length}
                </p>
                <p className="mt-1 text-xs text-emerald-600 font-semibold">
                  {products.filter((p) => p.inStock).length} In Stock
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-white p-5 shadow-xs">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Simulated Orders
                </span>
                <p className="mt-2 font-display text-2xl font-extrabold text-brand-blue">
                  {orders.length}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">B2B &amp; Direct Procurement</p>
              </div>

              <div className="rounded-2xl border border-border bg-white p-5 shadow-xs">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Simulated Revenue
                </span>
                <p className="mt-2 font-display text-2xl font-extrabold text-emerald-600">
                  {formatINR(totalSimulatedRevenue)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">Across all placed orders</p>
              </div>

              <div className="rounded-2xl border border-border bg-white p-5 shadow-xs">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Estimated Inventory Value
                </span>
                <p className="mt-2 font-display text-2xl font-extrabold text-graphite">
                  {formatINR(totalCatalogValue)}
                </p>
                <p className="mt-1 text-xs text-amber-600 font-semibold">
                  {lowStockCount} Low stock alerts
                </p>
              </div>
            </div>

            {/* Brand Distribution Breakdown */}
            <div className="grid gap-6 md:grid-cols-3">
              {[
                {
                  brand: "Amphenol",
                  color: "border-blue-200 bg-blue-50/40 text-brand-blue",
                  products: products.filter((p) => p.brand === "Amphenol"),
                  desc: "Connectors, Antennas, RF & Fiber Solutions",
                },
                {
                  brand: "Zolex",
                  color: "border-emerald-200 bg-emerald-50/40 text-emerald-800",
                  products: products.filter((p) => p.brand === "Zolex"),
                  desc: "Industrial Lugs, Glands & SS Cable Ties",
                },
                {
                  brand: "Qualitech",
                  color: "border-amber-200 bg-amber-50/40 text-amber-800",
                  products: products.filter((p) => p.brand === "Qualitech"),
                  desc: "Custom Military & Industrial Wire Harnesses",
                },
              ].map((b) => (
                <div key={b.brand} className={`rounded-2xl border p-5 ${b.color}`}>
                  <div className="flex items-center justify-between">
                    <h4 className="font-display text-base font-bold">{b.brand}</h4>
                    <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-bold shadow-2xs">
                      {b.products.length} Products
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{b.desc}</p>
                  <div className="mt-4 pt-3 border-t border-border/50 text-xs text-graphite">
                    <span>In-Stock Items: </span>
                    <strong>{b.products.filter((p) => p.inStock).length}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ═════════════════════════════════════════════════════════════════ */}
      {/* MODAL: ADD / EDIT PRODUCT */}
      {/* ═════════════════════════════════════════════════════════════════ */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div
            className="fixed inset-0 bg-graphite-deep/75 backdrop-blur-sm"
            onClick={() => setIsFormOpen(false)}
          />

          <div className="relative z-10 my-8 w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl border border-border">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border bg-steel-light/30 px-6 py-4">
              <h3 className="font-display text-base font-bold text-graphite">
                {editingProduct ? "Edit Product" : "Add New Component / Harness"}
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="text-muted-foreground hover:text-foreground text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Form Tabs */}
            <div className="border-b border-border bg-steel-light/10 px-6">
              <div className="flex gap-4">
                {[
                  { id: "basic", label: "1. Info & Brand" },
                  { id: "pricing", label: "2. Pricing & Stock" },
                  { id: "features", label: "3. Features & Specs" },
                  { id: "media", label: "4. Image & Media" },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setActiveFormTab(t.id as any)}
                    className={`py-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                      activeFormTab === t.id
                        ? "border-brand-blue text-brand-blue"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSaveProduct} className="max-h-[calc(85vh-160px)] overflow-y-auto p-6 space-y-4">
              {activeFormTab === "basic" && (
                <div className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold text-graphite mb-1">
                        SKU / Part Number *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.sku || ""}
                        onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                        className="w-full rounded-xl border border-border px-3.5 py-2 text-xs font-mono uppercase focus:border-brand-blue focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-graphite mb-1">Brand *</label>
                      <select
                        value={formData.brand}
                        onChange={(e) =>
                          setFormData({ ...formData, brand: e.target.value as Product["brand"] })
                        }
                        className="w-full rounded-xl border border-border px-3 py-2 text-xs font-semibold focus:border-brand-blue focus:outline-hidden"
                      >
                        <option value="Qualitech">Qualitech (Manufacturing)</option>
                        <option value="Amphenol">Amphenol (Distribution)</option>
                        <option value="Zolex">Zolex (Distribution)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-graphite mb-1">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name || ""}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Circular MIL-Spec Connector Series III"
                      className="w-full rounded-xl border border-border px-3.5 py-2 text-xs font-bold text-graphite focus:border-brand-blue focus:outline-hidden"
                    />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold text-graphite mb-1">Category *</label>
                      <input
                        type="text"
                        required
                        value={formData.category || ""}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        placeholder="e.g. Connectors"
                        className="w-full rounded-xl border border-border px-3.5 py-2 text-xs focus:border-brand-blue focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-graphite mb-1">Subcategory</label>
                      <input
                        type="text"
                        value={formData.subCategory || ""}
                        onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                        placeholder="e.g. Board to Board"
                        className="w-full rounded-xl border border-border px-3.5 py-2 text-xs focus:border-brand-blue focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-graphite mb-1">Description</label>
                    <textarea
                      rows={3}
                      value={formData.description || ""}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full rounded-xl border border-border px-3.5 py-2 text-xs focus:border-brand-blue focus:outline-hidden"
                    />
                  </div>

                  {/* Industry Tags */}
                  <div>
                    <label className="block text-xs font-semibold text-graphite mb-1.5">
                      Target Industries
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {ALL_INDUSTRIES.map((ind) => {
                        const isChecked = (formData.industries || []).includes(ind);
                        return (
                          <button
                            key={ind}
                            type="button"
                            onClick={() => {
                              const curr = formData.industries || [];
                              setFormData({
                                ...formData,
                                industries: isChecked
                                  ? curr.filter((i) => i !== ind)
                                  : [...curr, ind],
                              });
                            }}
                            className={`rounded-lg px-2.5 py-1 text-xs font-medium border transition-colors cursor-pointer ${
                              isChecked
                                ? "border-brand-blue bg-brand-blue text-white"
                                : "border-border bg-steel-light/30 text-muted-foreground"
                            }`}
                          >
                            {ind}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {activeFormTab === "pricing" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-graphite mb-1">
                        Regular Price (₹ INR) *
                      </label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={formData.price || 0}
                        onChange={(e) =>
                          setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })
                        }
                        className="w-full rounded-xl border border-border px-3.5 py-2 text-xs font-mono font-bold text-brand-blue focus:border-brand-blue focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-graphite mb-1">
                        Sale / Discounted Price (Optional)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.salePrice || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            salePrice: e.target.value ? parseFloat(e.target.value) : undefined,
                          })
                        }
                        className="w-full rounded-xl border border-border px-3.5 py-2 text-xs font-mono focus:border-brand-blue focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-graphite mb-1">Stock Count</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.stockCount || 100}
                        onChange={(e) =>
                          setFormData({ ...formData, stockCount: parseInt(e.target.value, 10) || 0 })
                        }
                        className="w-full rounded-xl border border-border px-3 py-2 text-xs font-mono focus:border-brand-blue focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-graphite mb-1">Unit</label>
                      <input
                        type="text"
                        value={formData.unit || "pcs"}
                        onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                        placeholder="e.g. pcs, meter, set"
                        className="w-full rounded-xl border border-border px-3 py-2 text-xs focus:border-brand-blue focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-graphite mb-1">Lead Time</label>
                      <input
                        type="text"
                        value={formData.leadTime || "Ships in 24-48h"}
                        onChange={(e) => setFormData({ ...formData, leadTime: e.target.value })}
                        className="w-full rounded-xl border border-border px-3 py-2 text-xs focus:border-brand-blue focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-6 pt-3 border-t border-border">
                    <label className="flex items-center gap-2 text-xs font-semibold text-graphite cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.inStock}
                        onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                        className="h-4 w-4 rounded text-brand-blue"
                      />
                      <span>In-Stock for Immediate Dispatch</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs font-semibold text-graphite cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.featured}
                        onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                        className="h-4 w-4 rounded text-brand-blue"
                      />
                      <span>Featured Product (★)</span>
                    </label>
                  </div>
                </div>
              )}

              {activeFormTab === "features" && (
                <div className="space-y-4">
                  {/* Features List */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-semibold text-graphite">Key Bullet Features</label>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            features: [...(formData.features || []), ""],
                          })
                        }
                        className="text-xs font-bold text-brand-blue hover:underline"
                      >
                        + Add Feature
                      </button>
                    </div>
                    <div className="space-y-2">
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
                            className="flex-1 rounded-xl border border-border px-3 py-2 text-xs focus:border-brand-blue focus:outline-hidden"
                          />
                          {(formData.features || []).length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const updated = (formData.features || []).filter((_, i) => i !== idx);
                                setFormData({ ...formData, features: updated });
                              }}
                              className="text-muted-foreground hover:text-destructive px-2 text-xs"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Technical Specs Map */}
                  <div className="border-t border-border pt-3">
                    <label className="block text-xs font-semibold text-graphite mb-2">
                      Technical Specifications (Key-Value)
                    </label>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {Object.entries(formData.specs || {}).map(([k, v]) => (
                        <div key={k} className="flex items-center justify-between rounded-lg border border-border bg-steel-light/20 px-3 py-1.5 text-xs">
                          <span className="font-semibold text-muted-foreground">{k}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-graphite">{v}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const newSpecs = { ...formData.specs };
                                delete newSpecs[k];
                                setFormData({ ...formData, specs: newSpecs });
                              }}
                              className="text-muted-foreground hover:text-destructive text-xs"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-2 flex gap-2">
                      <input
                        type="text"
                        placeholder="Spec Name (e.g. Voltage Rating)"
                        value={newSpecKey}
                        onChange={(e) => setNewSpecKey(e.target.value)}
                        className="flex-1 rounded-lg border border-border px-2.5 py-1.5 text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Value (e.g. 1000V DC)"
                        value={newSpecVal}
                        onChange={(e) => setNewSpecVal(e.target.value)}
                        className="flex-1 rounded-lg border border-border px-2.5 py-1.5 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newSpecKey.trim() && newSpecVal.trim()) {
                            setFormData({
                              ...formData,
                              specs: { ...formData.specs, [newSpecKey.trim()]: newSpecVal.trim() },
                            });
                            setNewSpecKey("");
                            setNewSpecVal("");
                          }
                        }}
                        className="rounded-lg bg-graphite px-3 py-1.5 text-xs font-bold text-white hover:bg-brand-blue"
                      >
                        Add Spec
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeFormTab === "media" && (
                <div className="space-y-4">
                  {/* Image Preview & Selection */}
                  <div>
                    <label className="block text-xs font-semibold text-graphite mb-2">Product Image</label>
                    <div className="flex items-center gap-4">
                      <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-border p-1 bg-white">
                        <img
                          src={formData.image || "/logo.png"}
                          alt="Preview"
                          className="h-full w-full object-contain"
                        />
                      </div>
                      <div className="space-y-2 flex-1">
                        <input
                          type="text"
                          value={formData.image || ""}
                          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                          placeholder="Image URL or select preset below"
                          className="w-full rounded-xl border border-border px-3 py-2 text-xs focus:border-brand-blue focus:outline-hidden"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="rounded-lg border border-border bg-steel-light/30 px-3 py-1.5 text-xs font-semibold text-graphite hover:bg-steel-light cursor-pointer"
                        >
                          Upload Image File from Device...
                        </button>
                        <input
                          type="file"
                          ref={fileInputRef}
                          accept="image/*"
                          onChange={handleImageFileChange}
                          className="hidden"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Preset Image Library */}
                  <div className="border-t border-border pt-3">
                    <p className="text-xs font-semibold text-muted-foreground mb-2">
                      Choose from Presets:
                    </p>
                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                      {PRESET_IMAGES.map((img, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setFormData({ ...formData, image: img.src })}
                          className={`aspect-square rounded-lg border p-1 transition-all ${
                            formData.image === img.src
                              ? "border-brand-blue ring-2 ring-brand-blue bg-blue-50"
                              : "border-border hover:bg-steel-light"
                          }`}
                        >
                          <img src={img.src} alt={img.label} className="h-full w-full object-contain" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Footer */}
              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="rounded-xl border border-border px-4 py-2.5 text-xs font-bold text-graphite hover:bg-steel-light"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-brand-blue px-6 py-2.5 font-display text-xs font-bold uppercase tracking-wider text-white hover:bg-graphite shadow-sm"
                >
                  {editingProduct ? "Save Changes" : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════ */}
      {/* MODAL: IMPORT CSV / JSON */}
      {/* ═════════════════════════════════════════════════════════════════ */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div
            className="fixed inset-0 bg-graphite-deep/75 backdrop-blur-sm"
            onClick={() => setIsImportModalOpen(false)}
          />

          <div className="relative z-10 my-8 w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl border border-border">
            <div className="flex items-center justify-between border-b border-border bg-steel-light/30 px-6 py-4">
              <h3 className="font-display text-base font-bold text-graphite">
                Import Products (WooCommerce CSV / Custom JSON)
              </h3>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setImportFormat("csv")}
                    className={`rounded-lg px-3 py-1 text-xs font-bold ${
                      importFormat === "csv" ? "bg-brand-blue text-white" : "bg-steel-light text-muted-foreground"
                    }`}
                  >
                    CSV Format
                  </button>
                  <button
                    type="button"
                    onClick={() => setImportFormat("json")}
                    className={`rounded-lg px-3 py-1 text-xs font-bold ${
                      importFormat === "json" ? "bg-brand-blue text-white" : "bg-steel-light text-muted-foreground"
                    }`}
                  >
                    JSON Format
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => importFileInputRef.current?.click()}
                  className="rounded-lg border border-border px-3 py-1 text-xs font-semibold text-graphite hover:bg-steel-light cursor-pointer"
                >
                  Upload File (.csv / .json)
                </button>
                <input
                  type="file"
                  ref={importFileInputRef}
                  accept=".csv,.json,text/csv,application/json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              <textarea
                rows={10}
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder={
                  importFormat === "csv"
                    ? 'Paste CSV content here (e.g. WooCommerce product export format: ID,Type,SKU,Name,Regular price...)'
                    : 'Paste JSON array of products here [ { "sku": "...", "name": "...", "brand": "..." } ]'
                }
                className="w-full rounded-xl border border-border p-3 font-mono text-xs focus:border-brand-blue focus:outline-hidden"
              />

              <div className="flex justify-end gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="rounded-xl border border-border px-4 py-2 text-xs font-bold text-graphite"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleImportSubmit}
                  className="rounded-xl bg-brand-blue px-6 py-2 font-display text-xs font-bold uppercase tracking-wider text-white hover:bg-graphite shadow-sm cursor-pointer"
                >
                  Import Catalogue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════ */}
      {/* MODAL: VIEW ORDER INVOICE DETAILS */}
      {/* ═════════════════════════════════════════════════════════════════ */}
      {viewingOrder && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div
            className="fixed inset-0 bg-graphite-deep/75 backdrop-blur-sm"
            onClick={() => setViewingOrder(null)}
          />

          <div className="relative z-10 my-8 w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl border border-border">
            <div className="flex items-center justify-between border-b border-border bg-steel-light/30 px-6 py-4">
              <div>
                <h3 className="font-display text-base font-bold text-graphite">
                  Order Invoice #{viewingOrder.orderNumber}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Placed on {new Date(viewingOrder.createdAt).toLocaleString("en-IN")}
                </p>
              </div>
              <button
                onClick={() => setViewingOrder(null)}
                className="text-muted-foreground hover:text-foreground text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="max-h-[calc(80vh-140px)] overflow-y-auto p-6 space-y-4">
              <div className="grid gap-3 sm:grid-cols-2 text-xs">
                <div className="rounded-xl border border-border p-3.5 space-y-1">
                  <span className="text-[0.65rem] font-bold uppercase text-muted-foreground">Consignee</span>
                  <p className="font-bold text-graphite">{viewingOrder.customer.fullName}</p>
                  {viewingOrder.customer.companyName && (
                    <p className="text-brand-blue font-semibold">{viewingOrder.customer.companyName}</p>
                  )}
                  {viewingOrder.customer.gstin && (
                    <p className="font-mono text-muted-foreground">GST: {viewingOrder.customer.gstin}</p>
                  )}
                  <p className="text-muted-foreground">
                    {viewingOrder.customer.address}, {viewingOrder.customer.city}
                  </p>
                  <p className="text-muted-foreground">Phone: {viewingOrder.customer.phone}</p>
                </div>

                <div className="rounded-xl border border-border p-3.5 space-y-1">
                  <span className="text-[0.65rem] font-bold uppercase text-muted-foreground">Fulfillment</span>
                  <p className="font-bold text-graphite">{viewingOrder.shippingMethod.name}</p>
                  <p className="font-mono text-brand-blue text-[0.7rem]">Trk: {viewingOrder.trackingNumber}</p>
                  <p className="text-muted-foreground">Payment: {viewingOrder.paymentMethod}</p>
                  <span className="inline-block rounded-md bg-emerald-100 px-2 py-0.5 text-[0.65rem] font-bold text-emerald-800">
                    Status: {viewingOrder.orderStatus}
                  </span>
                </div>
              </div>

              {/* Items */}
              <div className="rounded-xl border border-border overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-steel-light/30 border-b border-border font-bold">
                    <tr>
                      <th className="p-2.5">Item</th>
                      <th className="p-2.5 text-center">Qty</th>
                      <th className="p-2.5 text-right">Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {viewingOrder.items.map((it) => (
                      <tr key={it.product.id}>
                        <td className="p-2.5 font-semibold text-graphite">
                          [{it.product.sku}] {it.product.name}
                        </td>
                        <td className="p-2.5 text-center font-bold">{it.quantity}</td>
                        <td className="p-2.5 text-right font-bold text-brand-blue">
                          {formatINR(it.unitPrice * it.quantity)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="rounded-xl border border-border bg-steel-light/20 p-3.5 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatINR(viewingOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST (18%):</span>
                  <span>{formatINR(viewingOrder.tax)}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-graphite border-t border-border pt-1">
                  <span>Total:</span>
                  <span className="text-brand-blue font-extrabold">{formatINR(viewingOrder.total)}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end p-4 border-t border-border bg-steel-light/20">
              <button
                onClick={() => window.print()}
                className="rounded-xl bg-brand-blue px-5 py-2 text-xs font-bold text-white hover:bg-graphite transition-colors"
              >
                Print Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════ */}
      {/* MODAL: DELETE PRODUCT CONFIRMATION */}
      {/* ═════════════════════════════════════════════════════════════════ */}
      {productToDelete && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-graphite-deep/75 backdrop-blur-sm"
            onClick={() => setProductToDelete(null)}
          />

          <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-border space-y-4">
            <h3 className="font-display text-base font-bold text-graphite">Delete Product</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to remove <strong className="text-graphite">{productToDelete.name}</strong> ({productToDelete.sku}) from the catalogue?
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setProductToDelete(null)}
                className="rounded-xl border border-border px-4 py-2 text-xs font-bold text-graphite"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProduct}
                className="rounded-xl bg-destructive px-5 py-2 font-display text-xs font-bold uppercase tracking-wider text-white hover:bg-destructive/90 shadow-sm"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
