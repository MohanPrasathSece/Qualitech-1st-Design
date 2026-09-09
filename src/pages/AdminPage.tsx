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
} from "@/lib/productsStore";

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
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<string>("All");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedStock, setSelectedStock] = useState<string>("All");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  // Modals & State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importJsonText, setImportJsonText] = useState("");
  const [toastMessage, setToastMessage] = useState<{ title: string; type: "success" | "error" | "info" } | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Product>>({
    sku: "",
    name: "",
    brand: "Qualitech",
    category: "Custom Cable Assemblies",
    subCategory: "",
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

  const [activeFormTab, setActiveFormTab] = useState<"basic" | "features" | "specs" | "media">("basic");
  const [newSpecKey, setNewSpecKey] = useState("");
  const [newSpecVal, setNewSpecVal] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Stats calculation
  const stats = useMemo(() => {
    const total = products.length;
    const amphenolCount = products.filter((p) => p.brand === "Amphenol").length;
    const zolexCount = products.filter((p) => p.brand === "Zolex").length;
    const qualitechCount = products.filter((p) => p.brand === "Qualitech").length;
    const inStockCount = products.filter((p) => p.inStock).length;
    const featuredCount = products.filter((p) => p.featured).length;
    return { total, amphenolCount, zolexCount, qualitechCount, inStockCount, featuredCount };
  }, [products]);

  // Categories based on selected brand in filter
  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    products.forEach((p) => {
      if (selectedBrand === "All" || p.brand === selectedBrand) {
        if (p.category) cats.add(p.category);
      }
    });
    return Array.from(cats);
  }, [products, selectedBrand]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (selectedBrand !== "All" && p.brand !== selectedBrand) return false;
      if (selectedCategory !== "All" && p.category !== selectedCategory) return false;
      if (selectedStock === "in-stock" && !p.inStock) return false;
      if (selectedStock === "out-of-stock" && p.inStock) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchSku = p.sku?.toLowerCase().includes(q);
        const matchName = p.name?.toLowerCase().includes(q);
        const matchCat = p.category?.toLowerCase().includes(q);
        const matchSub = p.subCategory?.toLowerCase().includes(q);
        const matchDesc = p.description?.toLowerCase().includes(q);
        return matchSku || matchName || matchCat || matchSub || matchDesc;
      }
      return true;
    });
  }, [products, selectedBrand, selectedCategory, selectedStock, searchQuery]);

  // Paginated products
  const totalPages = Math.ceil(filteredProducts.length / pageSize) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, currentPage, pageSize]);

  // Handle open Add Modal
  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      sku: `QT-${Date.now().toString().slice(-4)}`,
      name: "",
      brand: "Qualitech",
      category: "Custom Cable Assemblies",
      subCategory: "Wire Harnesses",
      description: "",
      features: ["100% Electrically continuity tested", "High reliability OEM grade build"],
      specs: { Manufacturer: "Qualitech Connectronics", Standards: "IPC/WHMA-A-620" },
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

  // Handle open Edit Modal
  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      ...product,
      features: product.features && product.features.length > 0 ? [...product.features] : [""],
      specs: product.specs ? { ...product.specs } : {},
      industries: product.industries ? [...product.industries] : [],
    });
    setActiveFormTab("basic");
    setIsFormOpen(true);
  };

  // Handle Save (Add or Update)
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.sku) {
      showToast("Please provide both Product Name and SKU", "error");
      return;
    }

    const cleanFeatures = (formData.features || []).filter((f) => f && f.trim().length > 0);

    const productPayload: Product = {
      id: editingProduct ? editingProduct.id : `prod-${Date.now()}`,
      sku: formData.sku?.trim() || `SKU-${Date.now()}`,
      name: formData.name.trim(),
      brand: (formData.brand as "Amphenol" | "Zolex" | "Qualitech") || "Qualitech",
      category: formData.category?.trim() || "General",
      subCategory: formData.subCategory?.trim() || undefined,
      description: formData.description?.trim() || "",
      features: cleanFeatures.length > 0 ? cleanFeatures : ["High reliability industrial standard"],
      specs: formData.specs || {},
      industries: formData.industries && formData.industries.length > 0 ? formData.industries : ["Industrial Automation"],
      inStock: formData.inStock ?? true,
      featured: formData.featured ?? false,
      image: formData.image || p1,
      externalUrl: formData.externalUrl?.trim() || undefined,
      isEnquiry: formData.isEnquiry ?? false,
    };

    if (editingProduct) {
      const updated = updateStoredProduct(editingProduct.id, productPayload);
      setProducts(updated);
      showToast(`Updated product "${productPayload.name}" successfully!`);
    } else {
      const updated = addStoredProduct(productPayload);
      setProducts(updated);
      showToast(`Added new product "${productPayload.name}" successfully!`);
    }

    setIsFormOpen(false);
  };

  // Handle Delete
  const handleConfirmDelete = () => {
    if (!productToDelete) return;
    const updated = deleteStoredProduct(productToDelete.id);
    setProducts(updated);
    showToast(`Deleted product "${productToDelete.name}" (${productToDelete.sku})`, "info");
    setProductToDelete(null);
  };

  // Handle Duplicate
  const handleDuplicateProduct = (product: Product) => {
    const clone: Product = {
      ...product,
      id: `prod-${Date.now()}`,
      sku: `${product.sku}-COPY`,
      name: `${product.name} (Copy)`,
    };
    const updated = addStoredProduct(clone);
    setProducts(updated);
    showToast(`Duplicated product as "${clone.name}"!`);
  };

  // Handle Stock Toggle
  const handleToggleStock = (product: Product) => {
    const updated = updateStoredProduct(product.id, { inStock: !product.inStock });
    setProducts(updated);
    showToast(`Marked ${product.sku} as ${!product.inStock ? "In Stock" : "Out of Stock"}`);
  };

  // Handle Export
  const handleExportJson = () => {
    const dataStr = exportProductsToJson();
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `qualitech-products-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    showToast("Exported catalogue to JSON!");
  };

  const handleExportCsv = () => {
    const dataStr = exportProductsToCsv();
    const blob = new Blob([dataStr], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `qualitech-products-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    showToast("Exported catalogue to CSV!");
  };

  // Handle Reset to Default
  const handleResetDefaults = () => {
    if (window.confirm("Are you sure you want to reset all products to the original factory catalogue? Any custom added products will be lost.")) {
      const resetList = resetStoredProductsToDefault();
      setProducts(resetList);
      showToast("Reset database to original catalogue defaults!", "info");
    }
  };

  // Handle JSON Import
  const handleImportJson = () => {
    if (!importJsonText.trim()) {
      showToast("Please paste JSON text or select a file", "error");
      return;
    }
    const res = importProductsFromJson(importJsonText);
    if (res.success) {
      setProducts(getStoredProducts());
      setIsImportModalOpen(false);
      setImportJsonText("");
      showToast(`Successfully imported ${res.count} products!`);
    } else {
      showToast(res.error || "Failed to import JSON", "error");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setImportJsonText(text);
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] text-[#1e293b] flex flex-col font-sans">
      {/* ─── Toast Notification ─── */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 rounded-2xl px-5 py-3.5 shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 ${
            toastMessage.type === "success"
              ? "bg-[#0f172a] text-white border border-green-500/40"
              : toastMessage.type === "error"
              ? "bg-red-950 text-red-100 border border-red-500"
              : "bg-[#1e293b] text-white border border-blue-400/40"
          }`}
        >
          <span
            className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
              toastMessage.type === "success"
                ? "bg-green-500 text-white"
                : toastMessage.type === "error"
                ? "bg-red-500 text-white"
                : "bg-blue-500 text-white"
            }`}
          >
            {toastMessage.type === "success" ? "✓" : toastMessage.type === "error" ? "✕" : "i"}
          </span>
          <span className="text-xs sm:text-sm font-semibold">{toastMessage.title}</span>
        </div>
      )}

      {/* ─── Top Admin Bar ─── */}
      <header className="sticky top-0 z-40 border-b border-[#e2e8f0] bg-white shadow-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-8">
          <div className="flex items-center gap-3.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#004f9e] text-white font-extrabold text-lg shadow-sm">
              Q
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-sm font-bold text-[#0f172a] tracking-tight">
                  Qualitech Connectronics
                </span>
                <span className="rounded-md bg-[#004f9e]/10 px-2 py-0.5 text-[0.62rem] font-bold text-[#004f9e] uppercase tracking-wider">
                  Admin Portal
                </span>
              </div>
              <p className="text-[0.7rem] text-[#64748b]">Endpoint: <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[#0f172a]">#/admin</code></p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => onNavigateHome("#top")}
              className="flex items-center gap-1.5 rounded-xl border border-[#cbd5e1] bg-white px-3.5 py-2 text-xs font-semibold text-[#334155] transition hover:bg-[#f1f5f9] cursor-pointer"
            >
              <span>←</span>
              <span className="hidden sm:inline">Back to</span> Website
            </button>

            <button
              onClick={handleOpenAddModal}
              className="flex items-center gap-2 rounded-xl bg-[#004f9e] px-4 py-2 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-[#003870] shadow-sm cursor-pointer"
            >
              <span className="text-base font-bold leading-none">+</span>
              <span>Add Product</span>
            </button>
          </div>
        </div>
      </header>

      {/* ─── Main Content Body ─── */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-8 sm:py-8">
        {/* ─── Stats KPI Row ─── */}
        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-6">
          <div className="rounded-2xl border border-white bg-white p-4 shadow-xs">
            <p className="text-[0.68rem] font-bold uppercase tracking-wider text-[#64748b]">Total Items</p>
            <p className="mt-1 font-display text-2xl font-bold text-[#0f172a]">{stats.total}</p>
          </div>

          <div className="rounded-2xl border border-white bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <p className="text-[0.68rem] font-bold uppercase tracking-wider text-[#64748b]">Amphenol</p>
              <span className="h-2 w-2 rounded-full bg-[#004f9e]" />
            </div>
            <p className="mt-1 font-display text-2xl font-bold text-[#004f9e]">{stats.amphenolCount}</p>
          </div>

          <div className="rounded-2xl border border-white bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <p className="text-[0.68rem] font-bold uppercase tracking-wider text-[#64748b]">Zolex</p>
              <span className="h-2 w-2 rounded-full bg-[#0284c7]" />
            </div>
            <p className="mt-1 font-display text-2xl font-bold text-[#0284c7]">{stats.zolexCount}</p>
          </div>

          <div className="rounded-2xl border border-white bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <p className="text-[0.68rem] font-bold uppercase tracking-wider text-[#64748b]">Qualitech</p>
              <span className="h-2 w-2 rounded-full bg-[#d97706]" />
            </div>
            <p className="mt-1 font-display text-2xl font-bold text-[#d97706]">{stats.qualitechCount}</p>
          </div>

          <div className="rounded-2xl border border-white bg-white p-4 shadow-xs">
            <p className="text-[0.68rem] font-bold uppercase tracking-wider text-[#64748b]">In Stock</p>
            <p className="mt-1 font-display text-2xl font-bold text-green-600">{stats.inStockCount}</p>
          </div>

          <div className="rounded-2xl border border-white bg-white p-4 shadow-xs">
            <p className="text-[0.68rem] font-bold uppercase tracking-wider text-[#64748b]">Featured</p>
            <p className="mt-1 font-display text-2xl font-bold text-purple-600">{stats.featuredCount}</p>
          </div>
        </div>

        {/* ─── Product Management Container ─── */}
        <div className="mt-6 rounded-3xl border border-[#e2e8f0] bg-white p-5 sm:p-6 shadow-sm">
          {/* Header & Controls */}
          <div className="flex flex-col gap-4 border-b border-[#f1f5f9] pb-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="font-display text-xl font-bold text-[#0f172a]">Catalogue Inventory</h2>
              <p className="text-xs text-[#64748b]">
                Manage, add, edit, or remove products in real-time. Changes persist in local storage.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleExportJson}
                className="rounded-xl border border-[#cbd5e1] bg-white px-3 py-1.5 text-xs font-semibold text-[#475569] hover:bg-[#f8fafc] cursor-pointer"
                title="Export whole catalogue to JSON"
              >
                Export JSON
              </button>
              <button
                onClick={handleExportCsv}
                className="rounded-xl border border-[#cbd5e1] bg-white px-3 py-1.5 text-xs font-semibold text-[#475569] hover:bg-[#f8fafc] cursor-pointer"
                title="Export catalogue to CSV"
              >
                Export CSV
              </button>
              <button
                onClick={() => setIsImportModalOpen(true)}
                className="rounded-xl border border-[#cbd5e1] bg-white px-3 py-1.5 text-xs font-semibold text-[#475569] hover:bg-[#f8fafc] cursor-pointer"
                title="Import JSON data"
              >
                Import Data
              </button>
              <button
                onClick={handleResetDefaults}
                className="rounded-xl border border-red-200 bg-red-50/70 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 cursor-pointer"
                title="Reset database to seed defaults"
              >
                Reset Defaults
              </button>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr_auto] items-center">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by SKU, Name, Spec..."
                className="w-full rounded-xl border border-[#cbd5e1] bg-[#f8fafc] px-3.5 py-2.5 pl-9 text-xs text-[#0f172a] placeholder:text-[#94a3b8] focus:border-[#004f9e] focus:bg-white focus:outline-none"
              />
              <svg
                className="absolute left-3 top-3 h-4 w-4 text-[#94a3b8]"
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
              onChange={(e) => {
                setSelectedBrand(e.target.value);
                setSelectedCategory("All");
                setCurrentPage(1);
              }}
              className="rounded-xl border border-[#cbd5e1] bg-[#f8fafc] px-3 py-2.5 text-xs font-medium text-[#334155] focus:border-[#004f9e] focus:bg-white focus:outline-none cursor-pointer"
            >
              <option value="All">All Brands (All)</option>
              <option value="Amphenol">Amphenol</option>
              <option value="Zolex">Zolex</option>
              <option value="Qualitech">Qualitech Harnesses</option>
            </select>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-xl border border-[#cbd5e1] bg-[#f8fafc] px-3 py-2.5 text-xs font-medium text-[#334155] focus:border-[#004f9e] focus:bg-white focus:outline-none cursor-pointer"
            >
              <option value="All">All Categories ({availableCategories.length})</option>
              {availableCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* Stock Filter */}
            <select
              value={selectedStock}
              onChange={(e) => {
                setSelectedStock(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-xl border border-[#cbd5e1] bg-[#f8fafc] px-3 py-2.5 text-xs font-medium text-[#334155] focus:border-[#004f9e] focus:bg-white focus:outline-none cursor-pointer"
            >
              <option value="All">All Stock Statuses</option>
              <option value="in-stock">In Stock Only</option>
              <option value="out-of-stock">Out of Stock</option>
            </select>

            {/* View Mode */}
            <div className="flex items-center gap-1 rounded-xl border border-[#cbd5e1] bg-[#f8fafc] p-1">
              <button
                onClick={() => setViewMode("table")}
                className={`rounded-lg px-2.5 py-1.5 text-xs font-bold cursor-pointer ${
                  viewMode === "table" ? "bg-white text-[#004f9e] shadow-xs" : "text-[#64748b]"
                }`}
                title="Table View"
              >
                Table
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`rounded-lg px-2.5 py-1.5 text-xs font-bold cursor-pointer ${
                  viewMode === "grid" ? "bg-white text-[#004f9e] shadow-xs" : "text-[#64748b]"
                }`}
                title="Card Grid View"
              >
                Grid
              </button>
            </div>
          </div>

          {/* Active result count */}
          <div className="mt-4 flex items-center justify-between text-xs text-[#64748b]">
            <p>
              Showing <span className="font-bold text-[#0f172a]">{paginatedProducts.length}</span> of{" "}
              <span className="font-bold text-[#0f172a]">{filteredProducts.length}</span> filtered items
            </p>
            {filteredProducts.length !== products.length && (
              <button
                onClick={() => {
                  setSelectedBrand("All");
                  setSelectedCategory("All");
                  setSelectedStock("All");
                  setSearchQuery("");
                }}
                className="text-xs font-bold text-[#004f9e] hover:underline cursor-pointer"
              >
                Clear all filters
              </button>
            )}
          </div>

          {/* ─── Table View ─── */}
          {viewMode === "table" && (
            <div className="mt-4 overflow-x-auto rounded-2xl border border-[#e2e8f0]">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#e2e8f0] bg-[#f8fafc] text-[0.68rem] font-bold uppercase tracking-wider text-[#64748b]">
                    <th className="px-4 py-3.5">Product</th>
                    <th className="px-4 py-3.5">Brand</th>
                    <th className="px-4 py-3.5">Category</th>
                    <th className="px-4 py-3.5">Key Specs</th>
                    <th className="px-4 py-3.5 text-center">Status</th>
                    <th className="px-4 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f1f5f9]">
                  {paginatedProducts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-sm text-[#94a3b8]">
                        No products match the selected criteria.
                      </td>
                    </tr>
                  ) : (
                    paginatedProducts.map((prod) => (
                      <tr key={prod.id} className="hover:bg-[#f8fafc]/80 transition-colors">
                        {/* Product info */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-[#e2e8f0] bg-slate-50">
                              <img
                                src={prod.image || p1}
                                alt={prod.name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="max-w-xs sm:max-w-sm">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-[0.68rem] font-bold text-[#475569] bg-slate-100 px-1.5 py-0.5 rounded">
                                  {prod.sku}
                                </span>
                                {prod.featured && (
                                  <span className="rounded bg-purple-100 px-1.5 py-0.5 text-[0.6rem] font-bold text-purple-700">
                                    ★ Featured
                                  </span>
                                )}
                              </div>
                              <p className="mt-0.5 font-display text-xs font-bold text-[#0f172a] line-clamp-1">
                                {prod.name}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Brand */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`inline-block rounded-full px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider ${
                              prod.brand === "Amphenol"
                                ? "bg-[#004f9e]/10 text-[#004f9e]"
                                : prod.brand === "Zolex"
                                ? "bg-[#0284c7]/10 text-[#0284c7]"
                                : "bg-[#d97706]/10 text-[#d97706]"
                            }`}
                          >
                            {prod.brand}
                          </span>
                        </td>

                        {/* Category */}
                        <td className="px-4 py-3 text-[#475569] whitespace-nowrap">
                          <p className="font-semibold text-[#1e293b]">{prod.category}</p>
                          {prod.subCategory && (
                            <p className="text-[0.68rem] text-[#64748b]">{prod.subCategory}</p>
                          )}
                        </td>

                        {/* Specs */}
                        <td className="px-4 py-3 max-w-xs text-[#64748b]">
                          {prod.specs ? (
                            <div className="flex flex-wrap gap-1">
                              {Object.entries(prod.specs).slice(0, 2).map(([k, v]) => (
                                <span key={k} className="rounded bg-slate-100 px-1.5 py-0.5 text-[0.65rem] text-[#334155]">
                                  <strong className="font-semibold">{k}:</strong> {v}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span>-</span>
                          )}
                        </td>

                        {/* Status Toggle */}
                        <td className="px-4 py-3 text-center whitespace-nowrap">
                          <button
                            onClick={() => handleToggleStock(prod)}
                            className={`rounded-full px-2.5 py-1 text-[0.65rem] font-bold transition cursor-pointer ${
                              prod.inStock
                                ? "bg-green-100 text-green-800 hover:bg-green-200"
                                : "bg-red-100 text-red-800 hover:bg-red-200"
                            }`}
                            title="Click to toggle stock status"
                          >
                            {prod.inStock ? "● In Stock" : "○ Out of Stock"}
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEditModal(prod)}
                              className="rounded-lg border border-[#cbd5e1] p-1.5 text-[#334155] hover:bg-[#004f9e] hover:text-white hover:border-[#004f9e] transition cursor-pointer"
                              title="Edit Product"
                            >
                              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>

                            <button
                              onClick={() => handleDuplicateProduct(prod)}
                              className="rounded-lg border border-[#cbd5e1] p-1.5 text-[#334155] hover:bg-slate-100 transition cursor-pointer"
                              title="Duplicate Product"
                            >
                              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </button>

                            <button
                              onClick={() => setProductToDelete(prod)}
                              className="rounded-lg border border-red-200 p-1.5 text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 transition cursor-pointer"
                              title="Delete Product"
                            >
                              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* ─── Grid View ─── */}
          {viewMode === "grid" && (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {paginatedProducts.map((prod) => (
                <div
                  key={prod.id}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white p-4 shadow-xs transition hover:shadow-md"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[0.65rem] font-bold text-[#475569] bg-slate-100 px-2 py-0.5 rounded">
                        {prod.sku}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[0.62rem] font-bold uppercase ${
                          prod.brand === "Amphenol"
                            ? "bg-[#004f9e]/10 text-[#004f9e]"
                            : prod.brand === "Zolex"
                            ? "bg-[#0284c7]/10 text-[#0284c7]"
                            : "bg-[#d97706]/10 text-[#d97706]"
                        }`}
                      >
                        {prod.brand}
                      </span>
                    </div>

                    <div className="mt-3 flex gap-3">
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-[#e2e8f0] bg-slate-50">
                        <img src={prod.image || p1} alt={prod.name} className="h-full w-full object-cover" />
                      </div>
                      <div>
                        <h3 className="font-display text-xs font-bold text-[#0f172a] line-clamp-2">{prod.name}</h3>
                        <p className="mt-1 text-[0.7rem] text-[#64748b]">{prod.category}</p>
                      </div>
                    </div>

                    <p className="mt-3 text-[0.72rem] text-[#64748b] line-clamp-2 leading-relaxed">
                      {prod.description}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-[#f1f5f9] pt-3">
                    <button
                      onClick={() => handleToggleStock(prod)}
                      className={`text-[0.65rem] font-bold ${
                        prod.inStock ? "text-green-600" : "text-red-500"
                      } cursor-pointer`}
                    >
                      {prod.inStock ? "● In Stock" : "○ Out of Stock"}
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEditModal(prod)}
                        className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-[#0f172a] hover:bg-[#004f9e] hover:text-white transition cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setProductToDelete(prod)}
                        className="rounded-lg bg-red-50 px-2.5 py-1 text-xs font-bold text-red-600 hover:bg-red-600 hover:text-white transition cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ─── Pagination Controls ─── */}
          <div className="mt-6 flex flex-col gap-3 border-t border-[#f1f5f9] pt-4 sm:flex-row sm:items-center sm:justify-between text-xs text-[#64748b]">
            <div className="flex items-center gap-2">
              <span>Per page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="rounded-lg border border-[#cbd5e1] bg-white px-2 py-1 text-xs font-semibold text-[#334155] cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={30}>30</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 self-center">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="rounded-lg border border-[#cbd5e1] px-3 py-1 font-semibold text-[#334155] disabled:opacity-40 hover:bg-[#f8fafc] cursor-pointer"
              >
                Previous
              </button>
              <span className="px-2 font-medium">
                Page <strong className="text-[#0f172a]">{currentPage}</strong> of {totalPages}
              </span>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="rounded-lg border border-[#cbd5e1] px-3 py-1 font-semibold text-[#334155] disabled:opacity-40 hover:bg-[#f8fafc] cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* ─── Add / Edit Product Modal ─── */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl rounded-3xl bg-white p-6 shadow-2xl sm:p-8 my-8 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-4">
              <div>
                <h3 className="font-display text-xl font-bold text-[#0f172a]">
                  {editingProduct ? "Edit Product" : "Add New Catalogue Item"}
                </h3>
                <p className="text-xs text-[#64748b]">
                  {editingProduct ? `Updating SKU: ${editingProduct.sku}` : "Enter technical details, features, and brand category."}
                </p>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                className="rounded-xl border border-[#cbd5e1] p-2 text-[#64748b] hover:bg-slate-100 hover:text-black cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex gap-2 border-b border-[#f1f5f9] pt-3 pb-2 text-xs font-bold">
              {[
                { id: "basic", label: "1. Core Information" },
                { id: "features", label: "2. Key Features" },
                { id: "specs", label: "3. Technical Specs" },
                { id: "media", label: "4. Industries & Media" },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveFormTab(t.id as any)}
                  className={`rounded-lg px-3 py-1.5 transition cursor-pointer ${
                    activeFormTab === t.id
                      ? "bg-[#004f9e] text-white shadow-xs"
                      : "text-[#64748b] hover:bg-slate-100"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Form Fields */}
            <form onSubmit={handleSaveProduct} className="mt-4 flex-1 overflow-y-auto pr-1 space-y-4">
              {/* TAB 1: BASIC INFO */}
              {activeFormTab === "basic" && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-bold text-[#334155] mb-1">
                        SKU / Part Number *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.sku}
                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                        placeholder="e.g. AMP-PWR-1001"
                        className="w-full rounded-xl border border-[#cbd5e1] px-3.5 py-2 text-xs font-mono text-[#0f172a] focus:border-[#004f9e] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#334155] mb-1">
                        Brand Portfolio *
                      </label>
                      <select
                        value={formData.brand}
                        onChange={(e) => setFormData({ ...formData, brand: e.target.value as any })}
                        className="w-full rounded-xl border border-[#cbd5e1] px-3.5 py-2 text-xs font-semibold text-[#0f172a] focus:border-[#004f9e] focus:outline-none"
                      >
                        <option value="Amphenol">Amphenol (Official Distribution)</option>
                        <option value="Zolex">Zolex (Zeeta Electrical)</option>
                        <option value="Qualitech">Qualitech (Cable Harness Manufacturing)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#334155] mb-1">
                      Product Name / Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. High-Power Busbar Connector 150A"
                      className="w-full rounded-xl border border-[#cbd5e1] px-3.5 py-2 text-xs font-semibold text-[#0f172a] focus:border-[#004f9e] focus:outline-none"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-bold text-[#334155] mb-1">
                        Category *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        placeholder="e.g. Connectors, Cable Glands, Harnesses"
                        className="w-full rounded-xl border border-[#cbd5e1] px-3.5 py-2 text-xs text-[#0f172a] focus:border-[#004f9e] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#334155] mb-1">
                        Subcategory / Series
                      </label>
                      <input
                        type="text"
                        value={formData.subCategory || ""}
                        onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                        placeholder="e.g. Power Connectors, Heavy Duty Lugs"
                        className="w-full rounded-xl border border-[#cbd5e1] px-3.5 py-2 text-xs text-[#0f172a] focus:border-[#004f9e] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#334155] mb-1">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      value={formData.description || ""}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="High-level engineering overview of the component, operating parameters, and compatibility."
                      className="w-full rounded-xl border border-[#cbd5e1] px-3.5 py-2 text-xs text-[#0f172a] focus:border-[#004f9e] focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-6 border-t border-[#f1f5f9] pt-3">
                    <label className="flex items-center gap-2 text-xs font-semibold text-[#334155] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.inStock ?? true}
                        onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                        className="h-4 w-4 rounded border-gray-300 text-[#004f9e] focus:ring-[#004f9e]"
                      />
                      <span>In Stock / Ready for Dispatch</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs font-semibold text-[#334155] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.featured ?? false}
                        onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                        className="h-4 w-4 rounded border-gray-300 text-[#004f9e] focus:ring-[#004f9e]"
                      />
                      <span>Feature on Showcase</span>
                    </label>
                  </div>
                </div>
              )}

              {/* TAB 2: FEATURES */}
              {activeFormTab === "features" && (
                <div className="space-y-3 animate-in fade-in duration-150">
                  <p className="text-xs text-[#64748b]">
                    Add highlight bullet points that appear on the product specification card.
                  </p>

                  {(formData.features || []).map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[0.65rem] font-bold text-[#64748b]">
                        {idx + 1}
                      </span>
                      <input
                        type="text"
                        value={feat}
                        onChange={(e) => {
                          const updated = [...(formData.features || [])];
                          updated[idx] = e.target.value;
                          setFormData({ ...formData, features: updated });
                        }}
                        placeholder="e.g. 100% automated continuity & hipot testing"
                        className="flex-1 rounded-xl border border-[#cbd5e1] px-3.5 py-2 text-xs text-[#0f172a] focus:border-[#004f9e] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = (formData.features || []).filter((_, i) => i !== idx);
                          setFormData({ ...formData, features: updated });
                        }}
                        className="rounded-lg p-2 text-red-500 hover:bg-red-50 cursor-pointer"
                        title="Remove feature"
                      >
                        ✕
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, features: [...(formData.features || []), ""] })}
                    className="mt-2 inline-flex items-center gap-1.5 rounded-xl border border-dashed border-[#004f9e] px-4 py-2 text-xs font-bold text-[#004f9e] hover:bg-[#004f9e]/5 cursor-pointer"
                  >
                    + Add Another Feature Bullet
                  </button>
                </div>
              )}

              {/* TAB 3: SPECS */}
              {activeFormTab === "specs" && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <p className="text-xs text-[#64748b]">
                    Add key-value engineering attributes (e.g. Voltage, Current, Pitch, Material, Testing).
                  </p>

                  <div className="rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] p-3 space-y-2">
                    {Object.entries(formData.specs || {}).map(([key, val]) => (
                      <div key={key} className="flex items-center justify-between gap-3 bg-white p-2 rounded-xl border border-[#e2e8f0]">
                        <div className="flex-1 grid grid-cols-2 gap-2 text-xs">
                          <span className="font-bold text-[#334155]">{key}</span>
                          <span className="text-[#64748b]">{val}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = { ...formData.specs };
                            delete updated[key];
                            setFormData({ ...formData, specs: updated });
                          }}
                          className="text-red-500 hover:text-red-700 font-bold px-2 py-1 text-xs cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={newSpecKey}
                      onChange={(e) => setNewSpecKey(e.target.value)}
                      placeholder="Property (e.g. Pitch)"
                      className="w-1/3 rounded-xl border border-[#cbd5e1] px-3 py-2 text-xs text-[#0f172a] focus:border-[#004f9e] focus:outline-none"
                    />
                    <input
                      type="text"
                      value={newSpecVal}
                      onChange={(e) => setNewSpecVal(e.target.value)}
                      placeholder="Value (e.g. 2.54mm)"
                      className="flex-1 rounded-xl border border-[#cbd5e1] px-3 py-2 text-xs text-[#0f172a] focus:border-[#004f9e] focus:outline-none"
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
                      className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-bold text-white hover:bg-black cursor-pointer"
                    >
                      Add Spec
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 4: MEDIA & INDUSTRIES */}
              {activeFormTab === "media" && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div>
                    <label className="block text-xs font-bold text-[#334155] mb-1">
                      Datasheet / External Official Link
                    </label>
                    <input
                      type="url"
                      value={formData.externalUrl || ""}
                      onChange={(e) => setFormData({ ...formData, externalUrl: e.target.value })}
                      placeholder="https://www.amphenol-cs.com/..."
                      className="w-full rounded-xl border border-[#cbd5e1] px-3.5 py-2 text-xs text-[#0f172a] focus:border-[#004f9e] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#334155] mb-2">
                      Select Thumbnail Preset
                    </label>
                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                      {PRESET_IMAGES.map((img) => (
                        <button
                          key={img.label}
                          type="button"
                          onClick={() => setFormData({ ...formData, image: img.src })}
                          className={`relative overflow-hidden rounded-xl border-2 p-0.5 transition cursor-pointer ${
                            formData.image === img.src ? "border-[#004f9e] ring-2 ring-[#004f9e]/30" : "border-transparent hover:border-[#cbd5e1]"
                          }`}
                        >
                          <img src={img.src} alt={img.label} className="h-12 w-full object-cover rounded-lg" />
                          <span className="block text-[0.55rem] text-center font-bold truncate mt-0.5 text-[#64748b]">
                            {img.label.split(" ")[0]}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#334155] mb-2">
                      Target Industries
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {ALL_INDUSTRIES.map((ind) => {
                        const isChecked = (formData.industries || []).includes(ind);
                        return (
                          <label
                            key={ind}
                            className={`flex items-center gap-2 rounded-xl border p-2.5 text-xs font-medium transition cursor-pointer ${
                              isChecked
                                ? "border-[#004f9e] bg-[#004f9e]/5 text-[#004f9e] font-bold"
                                : "border-[#e2e8f0] bg-white text-[#475569] hover:bg-[#f8fafc]"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                const current = formData.industries || [];
                                const updated = e.target.checked
                                  ? [...current, ind]
                                  : current.filter((x) => x !== ind);
                                setFormData({ ...formData, industries: updated });
                              }}
                              className="h-3.5 w-3.5 text-[#004f9e]"
                            />
                            <span>{ind}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Modal Footer Buttons */}
              <div className="flex items-center justify-end gap-3 border-t border-[#e2e8f0] pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="rounded-xl border border-[#cbd5e1] px-5 py-2.5 text-xs font-bold text-[#475569] hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#004f9e] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#003870] shadow-sm cursor-pointer"
                >
                  {editingProduct ? "Save Changes" : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Delete Confirmation Modal ─── */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600 font-bold text-xl">
              ✕
            </div>
            <h3 className="mt-4 font-display text-lg font-bold text-[#0f172a]">
              Delete Product Confirmation
            </h3>
            <p className="mt-2 text-xs text-[#64748b] leading-relaxed">
              Are you sure you want to permanently delete{" "}
              <strong className="text-[#0f172a]">"{productToDelete.name}"</strong> (SKU:{" "}
              <code className="bg-slate-100 px-1 py-0.5 rounded text-[#0f172a] font-mono">{productToDelete.sku}</code>)?
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setProductToDelete(null)}
                className="rounded-xl border border-[#cbd5e1] px-4 py-2 text-xs font-bold text-[#475569] hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="rounded-xl bg-red-600 px-5 py-2 text-xs font-bold text-white hover:bg-red-700 shadow-sm cursor-pointer"
              >
                Yes, Delete Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Import JSON Modal ─── */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
            <h3 className="font-display text-lg font-bold text-[#0f172a]">Import Product Database</h3>
            <p className="mt-1 text-xs text-[#64748b]">
              Paste a JSON array of products or upload a exported catalogue backup file.
            </p>

            <div className="mt-4">
              <input
                type="file"
                ref={fileInputRef}
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full rounded-xl border border-dashed border-[#004f9e] py-3 text-xs font-bold text-[#004f9e] hover:bg-[#004f9e]/5 cursor-pointer"
              >
                📂 Choose JSON File from Computer
              </button>
            </div>

            <textarea
              rows={6}
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              placeholder='[ { "sku": "...", "name": "...", "brand": "Amphenol" } ]'
              className="mt-3 w-full rounded-xl border border-[#cbd5e1] p-3 text-xs font-mono text-[#0f172a] focus:border-[#004f9e] focus:outline-none"
            />

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="rounded-xl border border-[#cbd5e1] px-4 py-2 text-xs font-bold text-[#475569] hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleImportJson}
                className="rounded-xl bg-[#004f9e] px-5 py-2 text-xs font-bold text-white hover:bg-[#003870] shadow-sm cursor-pointer"
              >
                Import Catalogue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
