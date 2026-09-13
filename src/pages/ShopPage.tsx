import { useState, useMemo, useEffect, useRef } from "react";
import {
  BRAND_CATALOGUE_TREE,
  ALL_INDUSTRIES,
  BRANDS,
  Product,
} from "@/data/products";
import { useECommerce } from "@/context/ECommerceContext";
import { formatINR, getProductDefaultPrice, getProductExternalLink } from "@/lib/ecommerceStore";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";

interface ShopPageProps {
  onNavigateHome: (sectionId?: string | undefined, isPage?: boolean | undefined) => void;
}

export function ShopPage({ onNavigateHome }: ShopPageProps) {
  const {
    products,
    addToCart,
    openQuickView,
    cartCount,
    cartTotal,
    openCart,
  } = useECommerce();

  const [selectedBrand, setSelectedBrand] = useState<string>("All Brands");
  const [selectedCategory, setSelectedCategory] = useState<string>("All Categories");
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState<number>(30000);
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc" | "sku" | "name">("featured");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Pagination states
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(24);

  // Dropdown menu toggle states
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const [brandMenuOpen, setBrandMenuOpen] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const gridTopRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setPage(1);
  }, [selectedBrand, selectedCategory, selectedSubCategory, selectedIndustry, searchQuery, inStockOnly, maxPrice, sortBy, pageSize]);

  // Filter & sort logic
  const filteredProducts = useMemo(() => {
    let result = products.filter((p) => {
      // Brand filter
      if (selectedBrand !== "All Brands" && p.brand !== selectedBrand) {
        return false;
      }
      // Category filter
      if (selectedCategory !== "All Categories" && p.category !== selectedCategory) {
        return false;
      }
      // Subcategory filter
      if (selectedSubCategory && p.subCategory !== selectedSubCategory) {
        return false;
      }
      // Industry filter
      if (selectedIndustry && !p.industries.includes(selectedIndustry)) {
        return false;
      }
      // Stock filter
      if (inStockOnly && !p.inStock) {
        return false;
      }
      // Max price filter
      const price = getProductDefaultPrice(p);
      if (price > maxPrice) {
        return false;
      }
      // Search query
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const matchesSku = p.sku.toLowerCase().includes(q);
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesDesc = p.description.toLowerCase().includes(q);
        const matchesCategory = p.category.toLowerCase().includes(q);
        const matchesSub = p.subCategory ? p.subCategory.toLowerCase().includes(q) : false;
        const matchesBrand = p.brand.toLowerCase().includes(q);
        return matchesSku || matchesName || matchesDesc || matchesCategory || matchesSub || matchesBrand;
      }
      return true;
    });

    if (sortBy === "name") {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "price-asc") {
      result = [...result].sort((a, b) => getProductDefaultPrice(a) - getProductDefaultPrice(b));
    } else if (sortBy === "price-desc") {
      result = [...result].sort((a, b) => getProductDefaultPrice(b) - getProductDefaultPrice(a));
    } else if (sortBy === "sku") {
      result = [...result].sort((a, b) => a.sku.localeCompare(b.sku));
    } else {
      result = [...result].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    return result;
  }, [products, selectedBrand, selectedCategory, selectedSubCategory, selectedIndustry, inStockOnly, maxPrice, searchQuery, sortBy]);

  // Paginated slice
  const totalPages = Math.ceil(filteredProducts.length / pageSize) || 1;
  const startIndex = (page - 1) * pageSize;
  const paginatedProducts = useMemo(() => {
    return filteredProducts.slice(startIndex, startIndex + pageSize);
  }, [filteredProducts, startIndex, pageSize]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    if (gridTopRef.current) {
      gridTopRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.scrollTo({ top: 380, behavior: "smooth" });
    }
  };

  const clearAllFilters = () => {
    setSelectedBrand("All Brands");
    setSelectedCategory("All Categories");
    setSelectedSubCategory(null);
    setSelectedIndustry(null);
    setSearchQuery("");
    setInStockOnly(false);
    setMaxPrice(30000);
  };

  const activeFiltersCount =
    (selectedBrand !== "All Brands" ? 1 : 0) +
    (selectedCategory !== "All Categories" ? 1 : 0) +
    (selectedSubCategory ? 1 : 0) +
    (selectedIndustry ? 1 : 0) +
    (inStockOnly ? 1 : 0) +
    (maxPrice < 30000 ? 1 : 0) +
    (searchQuery.trim() !== "" ? 1 : 0);

  // Available categories based on selected brand
  const availableCategories = useMemo(() => {
    if (selectedBrand === "All Brands") {
      const cats = new Set<string>();
      BRAND_CATALOGUE_TREE.forEach((b) => b.categories.forEach((c) => cats.add(c.name)));
      return Array.from(cats);
    }
    const brandTree = BRAND_CATALOGUE_TREE.find((b) => b.brand === selectedBrand);
    return brandTree ? brandTree.categories.map((c) => c.name) : [];
  }, [selectedBrand]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header onNavigate={onNavigateHome} currentPage="products" />

      {/* Hero Header */}
      <section className="relative overflow-hidden bg-gradient-to-b from-steel-light/60 via-background to-background pt-32 pb-10 sm:pt-36 sm:pb-12 border-b border-border/80">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-px w-8 bg-brand-yellow" />
                <span className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-brand-blue">
                  Online B2B Store &amp; Catalogue
                </span>
              </div>
              <h1 className="mt-3 font-display text-3xl sm:text-4xl font-extrabold text-graphite tracking-tight">
                Industrial Components &amp; Assemblies
              </h1>
              <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
                Authorized lines for Amphenol connectors &amp; antennas, Zolex copper lugs &amp; cable ties, plus Qualitech custom military &amp; OEM wire harnesses.
              </p>
            </div>

            {/* Live Store Stats Card */}
            <div className="flex items-center gap-4 rounded-2xl border border-border bg-white p-3.5 shadow-xs">
              <div className="text-center px-2">
                <span className="block font-display text-lg font-bold text-brand-blue">
                  {products.length}+
                </span>
                <span className="text-[0.62rem] font-bold uppercase text-muted-foreground">Products</span>
              </div>
              <div className="h-8 w-px bg-border" />
              <div className="text-center px-2">
                <span className="block font-display text-lg font-bold text-emerald-600">
                  {products.filter((p) => p.inStock).length}
                </span>
                <span className="text-[0.62rem] font-bold uppercase text-muted-foreground">In Stock</span>
              </div>
              <div className="h-8 w-px bg-border" />
              <div className="text-center px-2">
                <span className="block font-display text-lg font-bold text-graphite">100%</span>
                <span className="text-[0.62rem] font-bold uppercase text-muted-foreground">QC Verified</span>
              </div>
            </div>
          </div>

          {/* Search, Mobile Filter Trigger & Brand Fast Bar */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            {/* Search Input & Mobile Filter Button */}
            <div className="flex items-center gap-2 w-full sm:max-w-md">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search SKU, connector, harness, lug, pin..."
                  className="w-full rounded-xl border border-border bg-white py-2.5 pl-10 pr-4 text-xs text-graphite shadow-2xs placeholder:text-muted-foreground focus:border-brand-blue focus:outline-hidden"
                />
                <svg
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                    aria-label="Clear search"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Mobile Filters Toggle Button */}
              <button
                type="button"
                onClick={() => setMobileFilterOpen(true)}
                className="lg:hidden flex items-center justify-center gap-1.5 rounded-xl border border-border bg-white px-3.5 py-2.5 text-xs font-bold text-graphite shadow-2xs hover:border-brand-blue shrink-0 cursor-pointer"
              >
                <svg className="h-4 w-4 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                <span>Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-brand-blue text-[0.62rem] font-bold text-white">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
            </div>

            {/* Brand Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto no-scrollbar">
              {BRANDS.map((brand) => (
                <button
                  key={brand}
                  onClick={() => {
                    setSelectedBrand(brand);
                    setSelectedCategory("All Categories");
                    setSelectedSubCategory(null);
                  }}
                  className={`rounded-xl px-4 py-2 font-display text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shrink-0 ${
                    selectedBrand === brand
                      ? "bg-brand-blue text-white shadow-xs"
                      : "border border-border bg-white text-muted-foreground hover:border-brand-blue hover:text-graphite"
                  }`}
                >
                  {brand}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Catalog Section */}
      <section className="mx-auto max-w-7xl px-5 sm:px-8 py-8" ref={gridTopRef}>
        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          {/* Left Sidebar Filters (Desktop) */}
          <div className="hidden lg:block space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-display text-xs font-bold uppercase tracking-wider text-graphite">
                Filters &amp; Refinements {activeFiltersCount > 0 && `(${activeFiltersCount})`}
              </h3>
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="text-[0.68rem] font-bold text-brand-blue hover:underline cursor-pointer"
                >
                  Reset All
                </button>
              )}
            </div>

            {/* Categories */}
            <div>
              <p className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Categories
              </p>
              <div className="space-y-1">
                <button
                  onClick={() => {
                    setSelectedCategory("All Categories");
                    setSelectedSubCategory(null);
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-left transition-colors cursor-pointer ${
                    selectedCategory === "All Categories"
                      ? "bg-brand-blue/10 font-bold text-brand-blue"
                      : "text-muted-foreground hover:bg-steel-light/40 hover:text-foreground"
                  }`}
                >
                  <span>All Categories</span>
                  <span>{products.length}</span>
                </button>
                {availableCategories.map((cat) => {
                  const count = products.filter(
                    (p) => (selectedBrand === "All Brands" || p.brand === selectedBrand) && p.category === cat
                  ).length;
                  return (
                    <button
                      key={cat}
                      onClick={() => {
                        setSelectedCategory(cat);
                        setSelectedSubCategory(null);
                      }}
                      className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-left transition-colors cursor-pointer ${
                        selectedCategory === cat
                          ? "bg-brand-blue/10 font-bold text-brand-blue"
                          : "text-muted-foreground hover:bg-steel-light/40 hover:text-foreground"
                      }`}
                    >
                      <span className="line-clamp-1">{cat}</span>
                      <span className="text-[0.65rem] opacity-70">({count})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price Range Slider */}
            <div className="border-t border-border pt-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">
                  Price Limit (Max)
                </p>
                <span className="font-mono text-xs font-bold text-brand-blue">
                  {formatINR(maxPrice)}
                </span>
              </div>
              <input
                type="range"
                min="500"
                max="30000"
                step="500"
                value={maxPrice}
                onChange={(e) => setMaxPrice(parseInt(e.target.value, 10))}
                className="w-full accent-brand-blue cursor-pointer"
              />
              <div className="flex justify-between text-[0.65rem] text-muted-foreground mt-1">
                <span>₹500</span>
                <span>₹30,000+</span>
              </div>
            </div>

            {/* Stock Availability Toggle */}
            <div className="border-t border-border pt-4">
              <label className="flex items-center gap-2 text-xs font-semibold text-graphite cursor-pointer">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="rounded text-brand-blue focus:ring-brand-blue h-4 w-4"
                />
                <span>In-Stock Items Only</span>
              </label>
            </div>

            {/* Target Industry Filter */}
            <div className="border-t border-border pt-4">
              <p className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Industry Applications
              </p>
              <div className="flex flex-wrap gap-1.5">
                {ALL_INDUSTRIES.map((ind) => (
                  <button
                    key={ind}
                    onClick={() => setSelectedIndustry(selectedIndustry === ind ? null : ind)}
                    className={`rounded-lg px-2 py-1 text-[0.68rem] font-semibold transition-colors cursor-pointer border ${
                      selectedIndustry === ind
                        ? "border-brand-blue bg-brand-blue text-white"
                        : "border-border bg-white text-muted-foreground hover:border-brand-blue"
                    }`}
                  >
                    {ind}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Product Grid */}
          <div>
            {/* Top Bar with Sort & View Toggle */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border pb-4 mb-6">
              <div className="flex items-center gap-2">
                <p className="text-xs text-muted-foreground">
                  Showing <strong className="text-graphite">{filteredProducts.length}</strong> components
                </p>
                {selectedIndustry && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-brand-blue">
                    Industry: {selectedIndustry}
                    <button onClick={() => setSelectedIndustry(null)} className="hover:text-destructive">
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                {/* Sort Dropdown */}
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span>Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="rounded-lg border border-border bg-white px-2.5 py-1.5 text-xs font-semibold text-graphite focus:border-brand-blue focus:outline-hidden"
                  >
                    <option value="featured">Featured First</option>
                    <option value="price_low">Price: Low to High</option>
                    <option value="price_high">Price: High to Low</option>
                    <option value="name_asc">Name: A to Z</option>
                  </select>
                </div>

                {/* View Toggle */}
                <div className="flex items-center rounded-lg border border-border bg-white p-0.5">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`rounded-md p-1.5 transition-colors cursor-pointer ${
                      viewMode === "grid"
                        ? "bg-steel-light text-graphite font-bold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    title="Grid View"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`rounded-md p-1.5 transition-colors cursor-pointer ${
                      viewMode === "list"
                        ? "bg-steel-light text-graphite font-bold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    title="List View"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Product Listing */}
            {paginatedProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-20 rounded-2xl border border-dashed border-border bg-steel-light/10">
                <div className="h-14 w-14 flex items-center justify-center rounded-full bg-steel-light text-muted-foreground mb-3">
                  <svg className="h-6 w-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="font-display text-base font-bold text-graphite">No Matching Products Found</h3>
                <p className="mt-1 text-xs text-muted-foreground max-w-sm">
                  Try adjusting your keywords, price filter, or clear brand and industry tags to see all items.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="mt-4 rounded-xl bg-brand-blue px-5 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-graphite transition-all cursor-pointer"
                >
                  Clear All Filters
                </button>
              </div>
            ) : viewMode === "grid" ? (
              /* GRID VIEW */
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {paginatedProducts.map((product) => {
                  const price = getProductDefaultPrice(product);

                  return (
                    <div
                      key={product.id}
                      className="group relative flex flex-col justify-between rounded-2xl border border-border bg-white p-4 transition-all duration-300 hover:border-brand-blue/50 hover:shadow-md"
                    >
                      {/* Top Badges */}
                      <div>
                        <div className="relative aspect-4/3 overflow-hidden rounded-xl border border-border/60 bg-steel-light/20 p-2">
                          <img
                            src={product.image || "/logo.png"}
                            alt={product.name}
                            className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                          />
                          {/* Brand badge */}
                          <span
                            className={`absolute top-2.5 left-2.5 rounded-full px-2 py-0.5 text-[0.6rem] font-extrabold uppercase tracking-wider shadow-2xs ${
                              product.brand === "Amphenol"
                                ? "bg-blue-600 text-white"
                                : product.brand === "Zolex"
                                ? "bg-emerald-600 text-white"
                                : "bg-brand-yellow text-graphite"
                            }`}
                          >
                            {product.brand}
                          </span>

                          {/* Stock Status Pill */}
                          <span
                            className={`absolute bottom-2 left-2 rounded-md px-1.5 py-0.5 text-[0.58rem] font-bold ${
                              product.inStock
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-rose-100 text-rose-800"
                            }`}
                          >
                            {product.inStock ? "● In Stock" : "○ Out of Stock"}
                          </span>
                        </div>

                        {/* Title & SKU */}
                        <div className="mt-3">
                          <p className="font-mono text-[0.68rem] text-muted-foreground">
                            {product.sku}
                          </p>
                          <h3
                            onClick={() => openQuickView(product)}
                            className="mt-0.5 font-display text-sm font-bold text-graphite line-clamp-2 hover:text-brand-blue transition-colors cursor-pointer leading-snug"
                          >
                            {product.name}
                          </h3>
                        </div>

                        {/* Category & Lead Time */}
                        <div className="mt-2 flex items-center justify-between text-[0.68rem] text-muted-foreground">
                          <span className="line-clamp-1">{product.category}</span>
                          <span className="text-emerald-700 font-medium">{product.leadTime || "24-48h dispatch"}</span>
                        </div>
                      </div>

                      {/* Bottom Pricing & Actions */}
                      <div className="mt-4 border-t border-border/70 pt-3">
                        <div className="flex items-baseline justify-between mb-3">
                          <div>
                            <span className="text-[0.6rem] font-bold uppercase text-muted-foreground">
                              Unit Price
                            </span>
                            <p className="font-display text-base font-extrabold text-brand-blue">
                              {formatINR(price)}
                            </p>
                          </div>
                          <span className="text-[0.65rem] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-bold">
                            Volume Tier Avail.
                          </span>
                        </div>

                        {/* Manufacturer Direct Link Strip */}
                        {product.brand !== "Qualitech" && (
                          <div className="mb-2.5">
                            <a
                              href={getProductExternalLink(product).url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`flex items-center justify-between rounded-lg border px-2.5 py-1.5 text-[0.65rem] font-bold transition-colors ${getProductExternalLink(product).brandColor}`}
                              title={`View ${product.sku} on official ${product.brand} catalog`}
                            >
                              <span>{getProductExternalLink(product).badgeText}</span>
                              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => openQuickView(product)}
                            className="rounded-xl border border-border py-2 text-center text-xs font-bold text-graphite hover:border-brand-blue hover:text-brand-blue transition-colors cursor-pointer"
                          >
                            Quick View
                          </button>
                          <button
                            onClick={() => addToCart(product, 1)}
                            className="flex items-center justify-center gap-1.5 rounded-xl bg-graphite py-2 text-center text-xs font-bold uppercase tracking-wider text-white hover:bg-brand-blue transition-colors cursor-pointer shadow-2xs"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            <span>Add</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* LIST VIEW */
              <div className="space-y-3">
                {paginatedProducts.map((product) => {
                  const price = getProductDefaultPrice(product);

                  return (
                    <div
                      key={product.id}
                      className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-border bg-white p-4 transition-all hover:border-brand-blue/50 hover:shadow-xs"
                    >
                      <div
                        className="flex items-center gap-4 cursor-pointer flex-1 w-full"
                        onClick={() => openQuickView(product)}
                      >
                        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-border/80 bg-steel-light/20 p-1.5">
                          <img
                            src={product.image || "/logo.png"}
                            alt={product.name}
                            className="h-full w-full object-contain"
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="rounded-md bg-steel-light px-2 py-0.5 text-[0.62rem] font-bold uppercase tracking-wider text-graphite">
                              {product.brand}
                            </span>
                            <span className="font-mono text-xs text-muted-foreground">{product.sku}</span>
                            {product.brand !== "Qualitech" && (
                              <a
                                href={getProductExternalLink(product).url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[0.6rem] font-bold text-brand-blue hover:underline"
                              >
                                <span>{getProductExternalLink(product).badgeText}</span>
                              </a>
                            )}
                          </div>
                          <h3 className="font-display text-sm font-bold text-graphite hover:text-brand-blue transition-colors mt-0.5">
                            {product.name}
                          </h3>
                          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                            {product.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 border-border/60 pt-3 sm:pt-0">
                        <div className="text-right">
                          <span className="text-[0.62rem] font-bold uppercase text-muted-foreground">
                            Unit Price
                          </span>
                          <p className="font-display text-base font-extrabold text-brand-blue">
                            {formatINR(price)}
                          </p>
                          <span className="text-[0.65rem] text-muted-foreground">Excl. 18% GST</span>
                        </div>

                        <div className="flex items-center gap-2">
                          {product.brand !== "Qualitech" && (
                            <a
                              href={getProductExternalLink(product).url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hidden md:inline-flex items-center gap-1 rounded-xl border border-border px-3 py-2 text-xs font-bold text-muted-foreground hover:text-brand-blue hover:border-brand-blue transition-colors"
                              title={`View ${product.name} on manufacturer catalog`}
                            >
                              <span>Official</span>
                              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          )}
                          <button
                            onClick={() => openQuickView(product)}
                            className="rounded-xl border border-border px-3.5 py-2 text-xs font-bold text-graphite hover:bg-steel-light transition-colors cursor-pointer"
                          >
                            Details
                          </button>
                          <button
                            onClick={() => addToCart(product, 1)}
                            className="rounded-xl bg-brand-blue px-4 py-2 font-display text-xs font-bold uppercase tracking-wider text-white hover:bg-graphite transition-all cursor-pointer shadow-xs"
                          >
                            + Cart
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-between border-t border-border pt-6">
                <button
                  disabled={page === 1}
                  onClick={() => handlePageChange(page - 1)}
                  className="rounded-xl border border-border px-4 py-2 text-xs font-bold text-graphite disabled:opacity-30 hover:bg-steel-light transition-colors cursor-pointer"
                >
                  ← Previous
                </button>

                <div className="flex items-center gap-1.5 text-xs font-bold text-graphite">
                  <span>Page</span>
                  <span className="rounded-lg bg-brand-blue px-2.5 py-1 text-white">{page}</span>
                  <span>of {totalPages}</span>
                </div>

                <button
                  disabled={page === totalPages}
                  onClick={() => handlePageChange(page + 1)}
                  className="rounded-xl border border-border px-4 py-2 text-xs font-bold text-graphite disabled:opacity-30 hover:bg-steel-light transition-colors cursor-pointer"
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Mobile Filter Drawer Modal */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-[150] flex justify-end lg:hidden">
          <div
            className="fixed inset-0 bg-graphite-deep/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileFilterOpen(false)}
          />

          <div className="relative z-10 flex h-full w-full max-w-xs flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-border bg-steel-light/30 px-5 py-4">
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                <h3 className="font-display text-sm font-bold uppercase tracking-wider text-graphite">
                  Filter Catalog
                </h3>
              </div>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="p-1 rounded-lg hover:bg-steel-light text-muted-foreground hover:text-graphite"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Drawer Filter List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
              {/* Brand Filter */}
              <div>
                <p className="font-display text-xs font-bold uppercase tracking-wider text-graphite mb-2">
                  Brand Manufacturer
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {BRANDS.map((brand) => (
                    <button
                      key={brand}
                      onClick={() => {
                        setSelectedBrand(brand);
                        setSelectedCategory("All Categories");
                        setSelectedSubCategory(null);
                      }}
                      className={`rounded-xl py-2 px-2.5 text-center font-bold transition-all border ${
                        selectedBrand === brand
                          ? "bg-brand-blue text-white border-brand-blue shadow-2xs"
                          : "border-border bg-slate-50 text-slate-700 hover:border-brand-blue"
                      }`}
                    >
                      {brand}
                    </button>
                  ))}
                </div>
              </div>

              {/* Categories */}
              <div className="border-t border-border pt-4">
                <p className="font-display text-xs font-bold uppercase tracking-wider text-graphite mb-2">
                  Component Category
                </p>
                <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                  <button
                    onClick={() => {
                      setSelectedCategory("All Categories");
                      setSelectedSubCategory(null);
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs text-left transition-colors ${
                      selectedCategory === "All Categories"
                        ? "bg-brand-blue/10 font-bold text-brand-blue"
                        : "text-muted-foreground hover:bg-steel-light/40"
                    }`}
                  >
                    <span>All Categories</span>
                    <span>{products.length}</span>
                  </button>
                  {availableCategories.map((cat) => {
                    const count = products.filter(
                      (p) => (selectedBrand === "All Brands" || p.brand === selectedBrand) && p.category === cat
                    ).length;
                    return (
                      <button
                        key={cat}
                        onClick={() => {
                          setSelectedCategory(cat);
                          setSelectedSubCategory(null);
                        }}
                        className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs text-left transition-colors ${
                          selectedCategory === cat
                            ? "bg-brand-blue/10 font-bold text-brand-blue"
                            : "text-muted-foreground hover:bg-steel-light/40"
                        }`}
                      >
                        <span className="line-clamp-1">{cat}</span>
                        <span className="text-[0.65rem] opacity-70">({count})</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Price Range */}
              <div className="border-t border-border pt-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-display text-xs font-bold uppercase tracking-wider text-graphite">
                    Price Limit (Max)
                  </p>
                  <span className="font-mono text-xs font-bold text-brand-blue">
                    {formatINR(maxPrice)}
                  </span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="30000"
                  step="500"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(parseInt(e.target.value, 10))}
                  className="w-full accent-brand-blue cursor-pointer"
                />
              </div>

              {/* In-Stock Toggle */}
              <div className="border-t border-border pt-4">
                <label className="flex items-center gap-2 font-semibold text-graphite cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="rounded text-brand-blue focus:ring-brand-blue h-4 w-4"
                  />
                  <span>In-Stock Ready Items Only</span>
                </label>
              </div>

              {/* Target Industry */}
              <div className="border-t border-border pt-4">
                <p className="font-display text-xs font-bold uppercase tracking-wider text-graphite mb-2">
                  Industry Applications
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {ALL_INDUSTRIES.map((ind) => (
                    <button
                      key={ind}
                      onClick={() => setSelectedIndustry(selectedIndustry === ind ? null : ind)}
                      className={`rounded-lg px-2.5 py-1 text-[0.68rem] font-semibold transition-colors border ${
                        selectedIndustry === ind
                          ? "border-brand-blue bg-brand-blue text-white"
                          : "border-border bg-slate-50 text-muted-foreground hover:border-brand-blue"
                      }`}
                    >
                      {ind}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="border-t border-border bg-steel-light/20 p-4 flex gap-2.5">
              <button
                type="button"
                onClick={clearAllFilters}
                className="flex-1 rounded-xl border border-border py-2.5 text-center text-xs font-bold text-graphite hover:bg-steel-light transition-colors"
              >
                Reset All
              </button>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="flex-1 rounded-xl bg-brand-blue py-2.5 text-center font-display text-xs font-bold uppercase tracking-wider text-white hover:bg-graphite transition-all shadow-xs"
              >
                Show Results
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Cart Indicator */}
      {cartCount > 0 && (
        <aside
          aria-label="Floating cart summary"
          className="fixed bottom-6 right-6 z-40 animate-in fade-in slide-in-from-bottom-4 duration-300"
        >
          <button
            onClick={openCart}
            className="flex items-center gap-3 rounded-2xl bg-graphite-deep px-5 py-3.5 text-white shadow-2xl hover:bg-brand-blue transition-all cursor-pointer ring-2 ring-white"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-yellow text-graphite font-bold text-xs">
              {cartCount}
            </div>
            <div className="text-left">
              <span className="block text-[0.65rem] font-bold uppercase tracking-wider text-white/80">
                Procurement Cart
              </span>
              <span className="block font-mono text-sm font-bold text-white">
                {formatINR(cartTotal)}
              </span>
            </div>
            <span className="text-xs">→</span>
          </button>
        </aside>
      )}

      <Footer onNavigate={onNavigateHome} />
    </div>
  );
}

