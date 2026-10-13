import { useState, useMemo, useEffect, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import {
  BRAND_CATALOGUE_TREE,
  ALL_INDUSTRIES,
  BRANDS,
  Product,
} from "@/data/products";
import { useECommerce } from "@/context/ECommerceContext";
import { formatINR, getProductDefaultPrice } from "@/lib/ecommerceStore";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { ProductImage } from "@/components/common/ProductImage";

interface ShopPageProps {
  onNavigateHome: (sectionId?: string | undefined, isPage?: boolean | undefined) => void;
  initialBrand?: string | undefined;
  currentPage?: string | undefined;
}

export function ShopPage({
  onNavigateHome,
  initialBrand = "All Brands",
  currentPage,
}: ShopPageProps) {
  const {
    products,
    addToCart,
    openQuickView,
    cartCount,
    cartTotal,
    openCart,
  } = useECommerce();

  const [selectedBrand, setSelectedBrand] = useState<string>(initialBrand);
  const [selectedCategory, setSelectedCategory] = useState<string>("All Categories");
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState<number>(50000);
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc" | "sku" | "name">("featured");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    if (initialBrand) {
      setSelectedBrand(initialBrand);
    }
  }, [initialBrand]);

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
    try {
      const hash = window.location.hash;
      const qIdx = hash.indexOf("?");
      if (qIdx !== -1) {
        const params = new URLSearchParams(hash.slice(qIdx + 1));
        const skuParam = params.get("sku");
        if (skuParam && products.length > 0) {
          const match = products.find((p) => p.sku.toLowerCase() === skuParam.toLowerCase());
          if (match) {
            openQuickView(match);
          } else {
            setSearchQuery(skuParam);
          }
        }
      }
    } catch (_) {}
  }, [products]);

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
      if (selectedIndustry && !p.industries?.includes(selectedIndustry)) {
        return false;
      }
      // Stock filter
      if (inStockOnly && (!p.inStock || (p.stockCount !== undefined && p.stockCount <= 0))) {
        return false;
      }
      // Max price filter (50000 acts as 'Any Price' to allow components up to ₹85,000)
      const price = getProductDefaultPrice(p);
      if (maxPrice < 50000 && price > maxPrice) {
        return false;
      }
      // Search query with multi-token matching across all fields
      if (searchQuery.trim() !== "") {
        const terms = searchQuery.toLowerCase().trim().split(/\s+/).filter(Boolean);
        const searchable = `${p.sku || ""} ${p.name || ""} ${p.description || ""} ${p.category || ""} ${p.subCategory || ""} ${p.brand || ""} ${(p.industries || []).join(" ")}`.toLowerCase();
        const matchesAll = terms.every((t) => searchable.includes(t));
        if (!matchesAll) return false;
      }
      return true;
    });

    const brandRank = (brand: string) => {
      if (brand === "Qualitech") return 1;
      if (brand === "Amphenol") return 2;
      if (brand === "Zolex") return 3;
      return 4;
    };

    if (sortBy === "name") {
      result = [...result].sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    } else if (sortBy === "price-asc") {
      result = [...result].sort((a, b) => getProductDefaultPrice(a) - getProductDefaultPrice(b));
    } else if (sortBy === "price-desc") {
      result = [...result].sort((a, b) => getProductDefaultPrice(b) - getProductDefaultPrice(a));
    } else if (sortBy === "sku") {
      result = [...result].sort((a, b) => (a.sku || "").localeCompare(b.sku || ""));
    } else {
      result = [...result].sort((a, b) => {
        const rankDiff = brandRank(a.brand) - brandRank(b.brand);
        if (rankDiff !== 0) return rankDiff;
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      });
    }

    return result;
  }, [products, selectedBrand, selectedCategory, selectedSubCategory, selectedIndustry, inStockOnly, maxPrice, searchQuery, sortBy]);

  // Paginated slice
  const totalPages = Math.ceil(filteredProducts.length / pageSize) || 1;
  const startIndex = (page - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredProducts.length);
  const paginatedProducts = useMemo(() => {
    return filteredProducts.slice(startIndex, startIndex + pageSize);
  }, [filteredProducts, startIndex, pageSize]);

  // Generate numbered pagination items with smart ellipses
  const paginationItems = useMemo<(number | string)[]>(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (page <= 4) {
      return [1, 2, 3, 4, 5, "...", totalPages];
    }
    if (page >= totalPages - 3) {
      return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, "...", page - 1, page, page + 1, "...", totalPages];
  }, [page, totalPages]);

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
    setMaxPrice(50000);
  };

  const activeFiltersCount =
    (selectedBrand !== "All Brands" ? 1 : 0) +
    (selectedCategory !== "All Categories" ? 1 : 0) +
    (selectedSubCategory ? 1 : 0) +
    (selectedIndustry ? 1 : 0) +
    (inStockOnly ? 1 : 0) +
    (maxPrice < 50000 ? 1 : 0) +
    (searchQuery.trim() !== "" ? 1 : 0);

  // Available categories based on selected brand and active product dataset
  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    products.forEach((p) => {
      if ((selectedBrand === "All Brands" || p.brand === selectedBrand) && p.category) {
        cats.add(p.category);
      }
    });
    if (selectedBrand === "All Brands") {
      BRAND_CATALOGUE_TREE.forEach((b) => b.categories.forEach((c) => cats.add(c.name)));
    } else {
      const brandTree = BRAND_CATALOGUE_TREE.find((b) => b.brand === selectedBrand);
      if (brandTree) {
        brandTree.categories.forEach((c) => cats.add(c.name));
      }
    }
    return Array.from(cats).filter(Boolean);
  }, [selectedBrand, products]);

  // Available subcategories when a category is selected
  const availableSubCategories = useMemo(() => {
    if (selectedCategory === "All Categories") return [];
    const subs = new Set<string>();
    products.forEach((p) => {
      if ((selectedBrand === "All Brands" || p.brand === selectedBrand) && p.category === selectedCategory && p.subCategory) {
        subs.add(p.subCategory);
      }
    });
    BRAND_CATALOGUE_TREE.forEach((b) => {
      if (selectedBrand === "All Brands" || b.brand === selectedBrand) {
        const catItem = b.categories.find((c) => c.name === selectedCategory);
        if (catItem?.subCategories) {
          catItem.subCategories.forEach((sc) => subs.add(sc));
        }
      }
    });
    return Array.from(subs).filter(Boolean);
  }, [selectedBrand, selectedCategory, products]);

  const headerCurrentPage =
    currentPage ||
    (selectedBrand === "Amphenol"
      ? "amphenol"
      : selectedBrand === "Zolex"
      ? "zolex"
      : selectedBrand === "Qualitech"
      ? "qualitech"
      : "products");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header onNavigate={onNavigateHome} currentPage={headerCurrentPage} />

      {/* Hero Header */}
      <section className="relative overflow-hidden bg-gradient-to-b from-steel-light/60 via-background to-background pt-32 pb-10 sm:pt-36 sm:pb-12 border-b border-border/80">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-px w-8 bg-brand-yellow" />
                <span className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-brand-blue">
                  Online B2B Store &amp; Catalogue
                </span>
              </div>
              <h1 className="mt-3 font-display text-3xl sm:text-4xl font-extrabold text-graphite tracking-tight">
                {selectedBrand === "Amphenol"
                  ? "Amphenol Product Catalogue"
                  : selectedBrand === "Zolex"
                  ? "Zolex Product Catalogue"
                  : selectedBrand === "Qualitech"
                  ? "Qualitech Product Catalogue (401 Products)"
                  : "Industrial Components & Assemblies"}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
                {selectedBrand === "Amphenol"
                  ? "Official line for High Precision GNSS Antennas, Circular MIL-Spec, Industrial M12/SPE, RADSOK Power, RF & Fiber Solutions."
                  : selectedBrand === "Zolex"
                  ? "High-Conductivity Copper Tube Lugs, Bimetallic Lugs, Crimp Terminals, Bootlace Ferrules, SS Cable Ties & Glands."
                  : selectedBrand === "Qualitech"
                  ? "401+ Genuine Qualitech products including precision electronics stock, custom wire harnesses, and turnkey cable assemblies."
                  : "Authorized lines for Amphenol connectors & antennas, Zolex copper lugs & cable ties, plus Qualitech custom military & OEM wire harnesses."}
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
      <section className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-8" ref={gridTopRef}>
        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
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
                  const isSelected = selectedCategory === cat;

                  return (
                    <div key={cat} className="space-y-1">
                      <button
                        onClick={() => {
                          if (isSelected) {
                            setSelectedCategory("All Categories");
                            setSelectedSubCategory(null);
                          } else {
                            setSelectedCategory(cat);
                            setSelectedSubCategory(null);
                          }
                        }}
                        className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-left transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-brand-blue/10 font-bold text-brand-blue"
                            : "text-muted-foreground hover:bg-steel-light/40 hover:text-foreground"
                        }`}
                      >
                        <span className="line-clamp-1">{cat}</span>
                        <span className="text-[0.65rem] opacity-70">({count})</span>
                      </button>

                      {/* Nested Subcategories when this category is selected */}
                      {isSelected && availableSubCategories.length > 0 && (
                        <div className="ml-3 pl-2 border-l border-brand-blue/30 space-y-1 py-1">
                          <button
                            onClick={() => setSelectedSubCategory(null)}
                            className={`flex w-full items-center justify-between rounded-md px-2 py-1 text-[0.68rem] text-left transition-colors cursor-pointer ${
                              selectedSubCategory === null
                                ? "font-bold text-brand-blue bg-blue-50/70"
                                : "text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            <span>All {cat}</span>
                          </button>
                          {availableSubCategories.map((sub) => {
                            const subCount = products.filter(
                              (p) =>
                                (selectedBrand === "All Brands" || p.brand === selectedBrand) &&
                                p.category === cat &&
                                p.subCategory === sub
                            ).length;
                            const isSubSelected = selectedSubCategory === sub;
                            return (
                              <button
                                key={sub}
                                onClick={() => setSelectedSubCategory(isSubSelected ? null : sub)}
                                className={`flex w-full items-center justify-between rounded-md px-2 py-1 text-[0.68rem] text-left transition-colors cursor-pointer ${
                                  isSubSelected
                                    ? "font-bold text-brand-blue bg-blue-50/70"
                                    : "text-muted-foreground hover:text-foreground"
                                }`}
                              >
                                <span className="line-clamp-1">{sub}</span>
                                {subCount > 0 && <span className="text-[0.6rem] opacity-70">({subCount})</span>}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
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
                  {maxPrice >= 50000 ? "Any Price (₹50k+)" : formatINR(maxPrice)}
                </span>
              </div>
              <input
                type="range"
                min="500"
                max="50000"
                step="500"
                value={maxPrice}
                onChange={(e) => setMaxPrice(parseInt(e.target.value, 10))}
                className="w-full accent-brand-blue cursor-pointer"
              />
              <div className="flex justify-between text-[0.65rem] text-muted-foreground mt-1">
                <span>₹500</span>
                <span>Any (₹50,000+)</span>
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
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border pb-4 mb-3">
              <div className="flex items-center gap-2">
                <p className="text-xs text-muted-foreground">
                  Showing <strong className="text-graphite">{filteredProducts.length}</strong> components
                </p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                {/* Sort Dropdown */}
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span>Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="rounded-lg border border-border bg-white px-2.5 py-1.5 text-xs font-semibold text-graphite focus:border-brand-blue focus:outline-hidden cursor-pointer"
                  >
                    <option value="featured">Featured First</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="name">Name: A to Z</option>
                    <option value="sku">Part / SKU Number</option>
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

            {/* Active Filters Pill Bar */}
            {activeFiltersCount > 0 && (
              <div className="mb-5 flex flex-wrap items-center gap-2 rounded-xl bg-steel-light/30 border border-border/80 p-2.5">
                <span className="text-[0.68rem] font-bold uppercase tracking-wider text-muted-foreground mr-1">
                  Active Filters:
                </span>

                {selectedBrand !== "All Brands" && (
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-graphite border border-border shadow-2xs">
                    Brand: <strong className="text-brand-blue">{selectedBrand}</strong>
                    <button
                      onClick={() => {
                        setSelectedBrand("All Brands");
                        setSelectedCategory("All Categories");
                        setSelectedSubCategory(null);
                      }}
                      className="text-muted-foreground hover:text-destructive cursor-pointer"
                      title="Clear brand"
                    >
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                )}

                {selectedCategory !== "All Categories" && (
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-graphite border border-border shadow-2xs">
                    Category: <strong className="text-brand-blue">{selectedCategory}</strong>
                    <button
                      onClick={() => {
                        setSelectedCategory("All Categories");
                        setSelectedSubCategory(null);
                      }}
                      className="text-muted-foreground hover:text-destructive cursor-pointer"
                      title="Clear category"
                    >
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                )}

                {selectedSubCategory && (
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-graphite border border-border shadow-2xs">
                    Sub: <strong className="text-brand-blue">{selectedSubCategory}</strong>
                    <button
                      onClick={() => setSelectedSubCategory(null)}
                      className="text-muted-foreground hover:text-destructive cursor-pointer"
                      title="Clear subcategory"
                    >
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                )}

                {selectedIndustry && (
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-graphite border border-border shadow-2xs">
                    Industry: <strong className="text-brand-blue">{selectedIndustry}</strong>
                    <button
                      onClick={() => setSelectedIndustry(null)}
                      className="text-muted-foreground hover:text-destructive cursor-pointer"
                      title="Clear industry"
                    >
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                )}

                {inStockOnly && (
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 border border-emerald-200 shadow-2xs">
                    ● In Stock Only
                    <button
                      onClick={() => setInStockOnly(false)}
                      className="text-emerald-600 hover:text-destructive cursor-pointer"
                      title="Clear stock filter"
                    >
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                )}

                {maxPrice < 50000 && (
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-graphite border border-border shadow-2xs">
                    Price: &le; <strong className="text-brand-blue">{formatINR(maxPrice)}</strong>
                    <button
                      onClick={() => setMaxPrice(50000)}
                      className="text-muted-foreground hover:text-destructive cursor-pointer"
                      title="Clear price filter"
                    >
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                )}

                {searchQuery.trim() !== "" && (
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-brand-blue border border-blue-200 shadow-2xs">
                    Search: "{searchQuery}"
                    <button
                      onClick={() => setSearchQuery("")}
                      className="text-brand-blue hover:text-destructive cursor-pointer"
                      title="Clear search"
                    >
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                )}

                <button
                  onClick={clearAllFilters}
                  className="ml-auto text-[0.7rem] font-bold text-destructive hover:underline cursor-pointer px-2 py-1"
                >
                  Clear All
                </button>
              </div>
            )}

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
              <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
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
                          <ProductImage
                            src={product.image}
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
                          {product.sku && product.sku !== product.name && (
                            <p className="font-mono text-[0.68rem] text-muted-foreground">
                              {product.sku}
                            </p>
                          )}
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
                          {product.tieredPricing && product.tieredPricing.length > 0 && (
                            <span className="text-[0.65rem] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-bold">
                              Volume Tier Avail.
                            </span>
                          )}
                        </div>



                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => openQuickView(product)}
                            className="rounded-xl border border-border py-2 text-center text-xs font-bold text-graphite hover:border-brand-blue hover:text-brand-blue transition-colors cursor-pointer"
                          >
                            Quick View
                          </button>
                          {(!product.inStock || (product.stockCount !== undefined && product.stockCount <= 0)) ? (
                            <button
                              disabled
                              className="flex items-center justify-center rounded-xl bg-slate-200 py-2 text-center text-xs font-bold uppercase tracking-wider text-slate-400 cursor-not-allowed"
                            >
                              <span>Out of Stock</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => addToCart(product, 1)}
                              className="flex items-center justify-center gap-1.5 rounded-xl bg-graphite py-2 text-center text-xs font-bold uppercase tracking-wider text-white hover:bg-brand-blue transition-colors cursor-pointer shadow-2xs"
                            >
                              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                              </svg>
                              <span>Add</span>
                            </button>
                          )}
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
                          <ProductImage
                            src={product.image}
                            alt={product.name}
                            className="h-full w-full object-contain"
                            showText={false}
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="rounded-md bg-steel-light px-2 py-0.5 text-[0.62rem] font-bold uppercase tracking-wider text-graphite">
                              {product.brand}
                            </span>
                            {product.sku && product.sku !== product.name && (
                              <span className="font-mono text-xs text-muted-foreground">{product.sku}</span>
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

                          <button
                            onClick={() => openQuickView(product)}
                            className="rounded-xl border border-border px-3.5 py-2 text-xs font-bold text-graphite hover:bg-steel-light transition-colors cursor-pointer"
                          >
                            Details
                          </button>
                          {(!product.inStock || (product.stockCount !== undefined && product.stockCount <= 0)) ? (
                            <button
                              disabled
                              className="rounded-xl bg-slate-200 px-4 py-2 font-display text-xs font-bold uppercase tracking-wider text-slate-400 cursor-not-allowed"
                            >
                              Out of Stock
                            </button>
                          ) : (
                            <button
                              onClick={() => addToCart(product, 1)}
                              className="rounded-xl bg-brand-blue px-4 py-2 font-display text-xs font-bold uppercase tracking-wider text-white hover:bg-graphite transition-all cursor-pointer shadow-xs"
                            >
                              + Cart
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Numbered Pagination & Page Size Controls */}
            {filteredProducts.length > 0 && (
              <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-border pt-6 pb-2">
                {/* Products Count & Per Page Selector */}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-xs text-graphite-light order-2 md:order-1">
                  <span>
                    Showing{" "}
                    <strong className="text-graphite font-semibold">
                      {filteredProducts.length === 0 ? 0 : startIndex + 1}
                    </strong>
                    {" "}-{" "}
                    <strong className="text-graphite font-semibold">{endIndex}</strong>
                    {" "}of{" "}
                    <strong className="text-graphite font-semibold">{filteredProducts.length}</strong>
                    {" "}products
                  </span>

                  <div className="h-3.5 w-px bg-border hidden sm:block" />

                  <div className="flex items-center gap-1.5">
                    <span className="text-muted-foreground">Show:</span>
                    <select
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(Number(e.target.value));
                        setPage(1);
                      }}
                      className="rounded-lg border border-border bg-white px-2 py-1 text-xs font-semibold text-graphite focus:border-brand-blue focus:outline-hidden cursor-pointer shadow-2xs"
                      title="Products per page"
                    >
                      <option value={12}>12 / page</option>
                      <option value={24}>24 / page</option>
                      <option value={48}>48 / page</option>
                      <option value={96}>96 / page</option>
                    </select>
                  </div>
                </div>

                {/* Numbered Pagination Buttons */}
                {totalPages > 1 && (
                  <nav
                    role="navigation"
                    aria-label="Pagination Navigation"
                    className="flex flex-wrap items-center justify-center gap-1 sm:gap-1.5 order-1 md:order-2 pr-0 sm:pr-8"
                  >
                    {/* First Page */}
                    <button
                      disabled={page === 1}
                      onClick={() => handlePageChange(1)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-white text-graphite disabled:opacity-30 disabled:cursor-not-allowed hover:bg-steel-light hover:text-brand-blue hover:border-brand-blue/30 transition-all cursor-pointer shadow-2xs"
                      title="First Page"
                      aria-label="Go to first page"
                    >
                      <ChevronsLeft className="h-4 w-4" />
                    </button>

                    {/* Previous Page */}
                    <button
                      disabled={page === 1}
                      onClick={() => handlePageChange(page - 1)}
                      className="inline-flex h-9 items-center gap-1 px-2.5 rounded-lg border border-border bg-white text-xs font-semibold text-graphite disabled:opacity-30 disabled:cursor-not-allowed hover:bg-steel-light hover:text-brand-blue hover:border-brand-blue/30 transition-all cursor-pointer shadow-2xs"
                      title="Previous Page"
                      aria-label="Go to previous page"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span className="hidden sm:inline">Prev</span>
                    </button>

                    {/* Numbered Page Buttons */}
                    <div className="flex items-center gap-1">
                      {paginationItems.map((item, idx) => {
                        if (typeof item === "number") {
                          const isActive = item === page;
                          return (
                            <button
                              key={`page-${item}`}
                              onClick={() => handlePageChange(item)}
                              aria-current={isActive ? "page" : undefined}
                              className={`inline-flex h-9 min-w-9 px-2.5 items-center justify-center rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                isActive
                                  ? "bg-brand-blue text-white shadow-sm ring-2 ring-brand-blue/25 scale-105"
                                  : "border border-border bg-white text-graphite hover:border-brand-blue/40 hover:text-brand-blue hover:bg-brand-blue/5 shadow-2xs"
                              }`}
                            >
                              {item}
                            </button>
                          );
                        }

                        // Ellipsis - allows quick jump!
                        const isLeftEllipsis = idx === 1;
                        const jumpTarget = isLeftEllipsis ? Math.max(1, page - 4) : Math.min(totalPages, page + 4);

                        return (
                          <button
                            key={`ellipsis-${idx}`}
                            onClick={() => handlePageChange(jumpTarget)}
                            title={`Jump ${isLeftEllipsis ? "backward" : "forward"} 4 pages (to page ${jumpTarget})`}
                            className="inline-flex h-9 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-brand-blue hover:bg-steel-light text-xs font-bold transition-colors cursor-pointer group"
                            aria-label={`Jump ${isLeftEllipsis ? "backward" : "forward"} to page ${jumpTarget}`}
                          >
                            <span className="group-hover:hidden">...</span>
                            <span className="hidden group-hover:inline text-[10px] font-mono">
                              {isLeftEllipsis ? "««" : "»»"}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Next Page */}
                    <button
                      disabled={page === totalPages}
                      onClick={() => handlePageChange(page + 1)}
                      className="inline-flex h-9 items-center gap-1 px-2.5 rounded-lg border border-border bg-white text-xs font-semibold text-graphite disabled:opacity-30 disabled:cursor-not-allowed hover:bg-steel-light hover:text-brand-blue hover:border-brand-blue/30 transition-all cursor-pointer shadow-2xs"
                      title="Next Page"
                      aria-label="Go to next page"
                    >
                      <span className="hidden sm:inline">Next</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>

                    {/* Last Page */}
                    <button
                      disabled={page === totalPages}
                      onClick={() => handlePageChange(totalPages)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-white text-graphite disabled:opacity-30 disabled:cursor-not-allowed hover:bg-steel-light hover:text-brand-blue hover:border-brand-blue/30 transition-all cursor-pointer shadow-2xs"
                      title="Last Page"
                      aria-label="Go to last page"
                    >
                      <ChevronsRight className="h-4 w-4" />
                    </button>
                  </nav>
                )}
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

              {/* Sort By for Mobile */}
              <div>
                <p className="font-display text-xs font-bold uppercase tracking-wider text-graphite mb-2">
                  Sort Products
                </p>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full rounded-xl border border-border bg-white px-3 py-2 text-xs font-semibold text-graphite focus:border-brand-blue focus:outline-hidden"
                >
                  <option value="featured">Featured First</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name">Name: A to Z</option>
                  <option value="sku">Part / SKU Number</option>
                </select>
              </div>

              {/* Categories */}
              <div className="border-t border-border pt-4">
                <p className="font-display text-xs font-bold uppercase tracking-wider text-graphite mb-2">
                  Component Category
                </p>
                <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
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
                    const isSelected = selectedCategory === cat;

                    return (
                      <div key={cat} className="space-y-1">
                        <button
                          onClick={() => {
                            if (isSelected) {
                              setSelectedCategory("All Categories");
                              setSelectedSubCategory(null);
                            } else {
                              setSelectedCategory(cat);
                              setSelectedSubCategory(null);
                            }
                          }}
                          className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs text-left transition-colors ${
                            isSelected
                              ? "bg-brand-blue/10 font-bold text-brand-blue"
                              : "text-muted-foreground hover:bg-steel-light/40"
                          }`}
                        >
                          <span className="line-clamp-1">{cat}</span>
                          <span className="text-[0.65rem] opacity-70">({count})</span>
                        </button>

                        {/* Mobile Subcategories */}
                        {isSelected && availableSubCategories.length > 0 && (
                          <div className="ml-3 pl-2 border-l border-brand-blue/30 space-y-1 py-1">
                            {availableSubCategories.map((sub) => {
                              const isSubSelected = selectedSubCategory === sub;
                              return (
                                <button
                                  key={sub}
                                  onClick={() => setSelectedSubCategory(isSubSelected ? null : sub)}
                                  className={`flex w-full items-center justify-between rounded-md px-2 py-1 text-[0.68rem] text-left transition-colors ${
                                    isSubSelected
                                      ? "font-bold text-brand-blue bg-blue-50/70"
                                      : "text-muted-foreground hover:text-foreground"
                                  }`}
                                >
                                  <span className="line-clamp-1">{sub}</span>
                                  {isSubSelected && <span className="text-[0.6rem] text-brand-blue">✓</span>}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
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
                    {maxPrice >= 50000 ? "Any Price (₹50k+)" : formatINR(maxPrice)}
                  </span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="50000"
                  step="500"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(parseInt(e.target.value, 10))}
                  className="w-full accent-brand-blue cursor-pointer"
                />
                <div className="flex justify-between text-[0.65rem] text-muted-foreground mt-1">
                  <span>₹500</span>
                  <span>Any (₹50,000+)</span>
                </div>
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

