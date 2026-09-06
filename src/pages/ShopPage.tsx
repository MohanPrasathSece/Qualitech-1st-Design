import { useState, useMemo, useEffect, useRef } from "react";
import {
  PRODUCTS,
  BRAND_CATALOGUE_TREE,
  ALL_INDUSTRIES,
  BRANDS,
  Product,
} from "@/data/products";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";

interface ShopPageProps {
  onNavigateHome: (sectionId?: string, isPage?: boolean) => void;
}

export function ShopPage({ onNavigateHome }: ShopPageProps) {
  const [selectedBrand, setSelectedBrand] = useState<string>("All Brands");
  const [selectedCategory, setSelectedCategory] = useState<string>("All Categories");
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"featured" | "name">("featured");

  // Pagination states
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(30);

  // Dropdown menu toggle states
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const [brandMenuOpen, setBrandMenuOpen] = useState(false);

  const gridTopRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setPage(1);
  }, [selectedBrand, selectedCategory, selectedSubCategory, selectedIndustry, searchQuery, sortBy, pageSize]);

  // Filter & sort logic
  const filteredProducts = useMemo(() => {
    let result = PRODUCTS.filter((p) => {
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
    } else {
      result = [...result].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    return result;
  }, [selectedBrand, selectedCategory, selectedSubCategory, selectedIndustry, searchQuery, sortBy]);

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
  };

  const activeFiltersCount =
    (selectedBrand !== "All Brands" ? 1 : 0) +
    (selectedCategory !== "All Categories" ? 1 : 0) +
    (selectedSubCategory ? 1 : 0) +
    (selectedIndustry ? 1 : 0) +
    (searchQuery.trim() !== "" ? 1 : 0);

  const handleProductClick = (product: Product) => {
    if (product.externalUrl) {
      window.open(product.externalUrl, "_blank", "noopener,noreferrer");
    } else {
      onNavigateHome("#contact-page", true);
    }
  };

  return (
    <div
      className="min-h-screen bg-[#fafbfc] text-foreground font-sans flex flex-col w-full overflow-x-hidden"
      onClick={() => {
        // Close dropdowns when clicking outside
        setCategoryMenuOpen(false);
        setBrandMenuOpen(false);
      }}
    >
      {/* ─── Header Navigation ─── */}
      <Header onNavigate={onNavigateHome} currentPage="products" />

      {/* ─── Page Banner ─── */}
      <div className="bg-graphite-deep text-white px-4 sm:px-8 pt-28 sm:pt-36 pb-10 sm:pb-12 border-b border-border/20 relative z-10 overflow-hidden">
        <div className="absolute inset-0 hairline-grid opacity-25 pointer-events-none" />
        <div className="relative max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-yellow" />
              <span className="font-display text-[0.68rem] font-bold uppercase tracking-[0.2em] text-steel">
                Authorized Distribution &amp; Manufacturing
              </span>
            </div>
            <h1 className="mt-3 font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
              Product Catalogue
            </h1>
            <p className="mt-3 text-xs sm:text-sm text-steel max-w-2xl leading-relaxed">
              Explore Amphenol connectors, cables, fiber optics, and antennas alongside Zolex lugs, crimp terminals, and earthing solutions. Click any product to navigate directly to the manufacturer's official portal.
            </p>
          </div>

          {/* Quick Brand Switcher Buttons */}
          <div className="flex flex-wrap gap-2 text-xs">
            <button
              onClick={() => {
                setSelectedBrand("All Brands");
                setSelectedCategory("All Categories");
                setSelectedSubCategory(null);
              }}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
                selectedBrand === "All Brands" && selectedCategory === "All Categories"
                  ? "bg-white text-graphite font-bold shadow-md"
                  : "border border-white/20 bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              <span>All Products</span>
              <span className="rounded-full bg-black/20 px-1.5 py-0.2 text-[0.65rem]">
                {PRODUCTS.length}
              </span>
            </button>
            <button
              onClick={() => {
                setSelectedBrand("Amphenol");
                setSelectedCategory("All Categories");
                setSelectedSubCategory(null);
              }}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
                selectedBrand === "Amphenol"
                  ? "bg-[#004f9e] text-white shadow-md ring-2 ring-white/30 font-bold"
                  : "border border-white/20 bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-[#009fe3]" />
              Amphenol
            </button>
            <button
              onClick={() => {
                setSelectedBrand("Zolex");
                setSelectedCategory("All Categories");
                setSelectedSubCategory(null);
              }}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
                selectedBrand === "Zolex"
                  ? "bg-brand-blue text-white shadow-md ring-2 ring-white/30 font-bold"
                  : "border border-white/20 bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-brand-blue-soft" />
              Zolex
            </button>
            <button
              onClick={() => {
                setSelectedBrand("Qualitech");
                setSelectedCategory("All Categories");
                setSelectedSubCategory(null);
              }}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
                selectedBrand === "Qualitech"
                  ? "bg-brand-yellow text-graphite font-bold shadow-md"
                  : "border border-white/20 bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-brand-yellow" />
              Qualitech Harnesses
            </button>
          </div>
        </div>
      </div>

      {/* ─── TOP DROPDOWN & FILTER CONTROL BAR (Sticky Menu) ─── */}
      <div
        id="products-grid-top"
        ref={gridTopRef}
        className="sticky top-[72px] z-30 bg-white/95 backdrop-blur-md border-b border-border shadow-xs px-4 sm:px-8 py-3.5"
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Top Dropdowns Group */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* 1. Category Menu Dropdown */}
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => {
                  setCategoryMenuOpen(!categoryMenuOpen);
                  setBrandMenuOpen(false);
                }}
                className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory !== "All Categories"
                    ? "bg-brand-blue text-white border-brand-blue shadow-xs"
                    : "border-border bg-white text-graphite hover:bg-steel-light/70"
                }`}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
                </svg>
                <span>
                  {selectedCategory === "All Categories"
                    ? "Select Category ▾"
                    : selectedCategory}
                </span>
                {selectedSubCategory && (
                  <span className="rounded bg-white/20 px-1.5 py-0.2 text-[0.62rem]">
                    {selectedSubCategory}
                  </span>
                )}
              </button>

              {/* Mega / Multi-level Dropdown Content */}
              {categoryMenuOpen && (
                <div className="absolute left-0 mt-2 w-80 sm:w-[480px] max-h-[75vh] overflow-y-auto rounded-2xl border border-border bg-white p-4 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex items-center justify-between pb-2.5 border-b border-border">
                    <span className="font-display text-xs font-bold uppercase tracking-wider text-graphite">
                      Filter by Category
                    </span>
                    <button
                      onClick={() => {
                        setSelectedCategory("All Categories");
                        setSelectedSubCategory(null);
                        setCategoryMenuOpen(false);
                      }}
                      className="text-[0.68rem] font-bold text-brand-blue hover:underline cursor-pointer"
                    >
                      Show All Categories
                    </button>
                  </div>

                  <div className="mt-3 space-y-4">
                    {BRAND_CATALOGUE_TREE.map((bTree) => (
                      <div key={bTree.brand} className="space-y-1.5">
                        <div className="flex items-center gap-2 text-xs font-extrabold text-graphite uppercase tracking-wide">
                          <span
                            className={`h-2 w-2 rounded-full ${
                              bTree.brand === "Amphenol"
                                ? "bg-[#004f9e]"
                                : bTree.brand === "Zolex"
                                ? "bg-brand-blue"
                                : "bg-brand-yellow"
                            }`}
                          />
                          <span>{bTree.brand}</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pl-4">
                          {bTree.categories.map((cat) => {
                            const isCatActive =
                              selectedCategory === cat.name && selectedBrand === bTree.brand;
                            const count = PRODUCTS.filter(
                              (p) => p.brand === bTree.brand && p.category === cat.name
                            ).length;

                            return (
                              <button
                                key={cat.name}
                                onClick={() => {
                                  setSelectedBrand(bTree.brand);
                                  setSelectedCategory(cat.name);
                                  setSelectedSubCategory(null);
                                  setCategoryMenuOpen(false);
                                }}
                                className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-left transition-colors cursor-pointer ${
                                  isCatActive
                                    ? "bg-brand-blue text-white font-bold"
                                    : "text-graphite/80 hover:bg-steel-light hover:text-graphite"
                                }`}
                              >
                                <span className="truncate">{cat.name}</span>
                                <span
                                  className={`text-[0.62rem] rounded-full px-1.5 py-0.2 ${
                                    isCatActive
                                      ? "bg-white/20 text-white"
                                      : "bg-steel-light text-muted-foreground"
                                  }`}
                                >
                                  {count}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 2. Brand Dropdown Menu */}
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => {
                  setBrandMenuOpen(!brandMenuOpen);
                  setCategoryMenuOpen(false);
                }}
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-bold transition-all cursor-pointer ${
                  selectedBrand !== "All Brands"
                    ? "bg-graphite text-white border-graphite shadow-xs"
                    : "border-border bg-white text-graphite hover:bg-steel-light/70"
                }`}
              >
                <span>Brand: {selectedBrand} ▾</span>
              </button>

              {brandMenuOpen && (
                <div className="absolute left-0 mt-2 w-48 rounded-xl border border-border bg-white p-2 shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-150 space-y-1">
                  {BRANDS.map((b) => (
                    <button
                      key={b}
                      onClick={() => {
                        setSelectedBrand(b);
                        setSelectedCategory("All Categories");
                        setSelectedSubCategory(null);
                        setBrandMenuOpen(false);
                      }}
                      className={`block w-full text-left rounded-lg px-3 py-1.5 text-xs font-semibold cursor-pointer ${
                        selectedBrand === b
                          ? "bg-graphite text-white"
                          : "text-graphite hover:bg-steel-light"
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 3. Industry Dropdown Selector */}
            <select
              value={selectedIndustry || ""}
              onChange={(e) => setSelectedIndustry(e.target.value || null)}
              className="rounded-xl border border-border bg-white px-3 py-2 text-xs font-semibold text-graphite focus:outline-none focus:ring-1 focus:ring-brand-blue cursor-pointer"
            >
              <option value="">All Industries</option>
              {ALL_INDUSTRIES.map((ind) => (
                <option key={ind} value={ind}>
                  {ind}
                </option>
              ))}
            </select>

            {/* Clear Filters Button if active */}
            {activeFiltersCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="rounded-xl border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-xs font-bold hover:bg-red-100 transition-colors cursor-pointer"
              >
                Reset ({activeFiltersCount}) ✕
              </button>
            )}
          </div>

          {/* Search Bar & Per Page / Sort Controls */}
          <div className="flex items-center gap-2.5 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <svg
                className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products or keywords..."
                className="w-full rounded-xl border border-border bg-[#fafbfc] py-1.5 pl-8 pr-8 text-xs text-graphite placeholder:text-muted-foreground/60 focus:border-brand-blue focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/15"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Per Page Selector */}
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="rounded-xl border border-border bg-white px-2.5 py-1.5 text-xs font-semibold text-graphite focus:outline-none cursor-pointer shrink-0"
              title="Items per page"
            >
              <option value={30}>30 / page</option>
              <option value={60}>60 / page</option>
              <option value={100}>100 / page</option>
              <option value={500}>All items</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-xl border border-border bg-white px-2.5 py-1.5 text-xs font-semibold text-graphite focus:outline-none cursor-pointer shrink-0"
            >
              <option value="featured">Featured</option>
              <option value="name">A–Z</option>
            </select>
          </div>
        </div>

        {/* Active Filter Badges Bar */}
        {(selectedBrand !== "All Brands" || selectedCategory !== "All Categories" || selectedSubCategory || selectedIndustry) && (
          <div className="max-w-7xl mx-auto mt-2.5 pt-2 border-t border-border/60 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-muted-foreground text-[0.72rem] font-semibold">Filtered by:</span>
            {selectedBrand !== "All Brands" && (
              <span className="inline-flex items-center gap-1 rounded-md bg-graphite text-white px-2.5 py-0.5 text-[0.68rem] font-bold">
                Brand: {selectedBrand}
                <button onClick={() => setSelectedBrand("All Brands")} className="hover:text-red-300 ml-1 cursor-pointer">✕</button>
              </span>
            )}
            {selectedCategory !== "All Categories" && (
              <span className="inline-flex items-center gap-1 rounded-md bg-brand-blue text-white px-2.5 py-0.5 text-[0.68rem] font-bold">
                Category: {selectedCategory}
                <button onClick={() => setSelectedCategory("All Categories")} className="hover:text-red-300 ml-1 cursor-pointer">✕</button>
              </span>
            )}
            {selectedSubCategory && (
              <span className="inline-flex items-center gap-1 rounded-md bg-brand-blue/15 text-brand-blue border border-brand-blue/30 px-2.5 py-0.5 text-[0.68rem] font-bold">
                Sub: {selectedSubCategory}
                <button onClick={() => setSelectedSubCategory(null)} className="hover:text-red-600 ml-1 cursor-pointer">✕</button>
              </span>
            )}
            {selectedIndustry && (
              <span className="inline-flex items-center gap-1 rounded-md bg-steel-light text-graphite px-2.5 py-0.5 text-[0.68rem] font-bold">
                Industry: {selectedIndustry}
                <button onClick={() => setSelectedIndustry(null)} className="hover:text-red-600 ml-1 cursor-pointer">✕</button>
              </span>
            )}
            <span className="text-muted-foreground text-[0.72rem] ml-auto">
              Showing <strong>{startIndex + 1}–{Math.min(startIndex + pageSize, filteredProducts.length)}</strong> of <strong>{filteredProducts.length}</strong> items
            </span>
          </div>
        )}
      </div>

      {/* ─── FULL-WIDTH PRODUCT DIRECTORY GRID ─── */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 flex flex-col justify-between">
        {filteredProducts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-white p-12 text-center my-12">
            <h3 className="font-display text-base font-bold text-graphite">No products found</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Try adjusting your search terms or clearing your category filters.
            </p>
            <button
              onClick={clearAllFilters}
              className="mt-4 rounded-xl bg-graphite px-5 py-2.5 text-xs font-bold text-white hover:bg-brand-blue cursor-pointer transition-colors"
            >
              Show All Products
            </button>
          </div>
        ) : (
          <div>
            {/* Top result counter when no active filter tags bar */}
            {selectedBrand === "All Brands" && selectedCategory === "All Categories" && !selectedSubCategory && !selectedIndustry && (
              <div className="mb-4 flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  Showing <strong>{startIndex + 1}–{Math.min(startIndex + pageSize, filteredProducts.length)}</strong> of <strong>{filteredProducts.length}</strong> products
                </span>
                <span>
                  Page <strong>{page}</strong> of <strong>{totalPages}</strong>
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
              {paginatedProducts.map((product) => {
                const isAmphenol = product.brand === "Amphenol";
                const isZolex = product.brand === "Zolex";

                return (
                  <div
                    key={product.id}
                    onClick={() => handleProductClick(product)}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-2xs transition-all duration-300 hover:-translate-y-1.5 hover:border-brand-blue/50 hover:shadow-lg cursor-pointer"
                  >
                    {/* Product Image Box */}
                    <div className="relative h-48 w-full overflow-hidden bg-steel-light/40 p-5 flex items-center justify-center border-b border-border/60">
                      <img
                        src={product.image}
                        alt={product.name}
                        loading="lazy"
                        className="h-full w-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
                      />

                      {/* Brand Pill */}
                      <span
                        className={`absolute left-3.5 top-3.5 rounded-full px-2.5 py-0.5 text-[0.62rem] font-extrabold uppercase tracking-wider shadow-2xs ${
                          isAmphenol
                            ? "bg-[#004f9e] text-white"
                            : isZolex
                            ? "bg-brand-blue text-white"
                            : "bg-brand-yellow text-graphite"
                        }`}
                      >
                        {product.brand}
                      </span>

                      {product.featured && (
                        <span className="absolute right-3.5 top-3.5 rounded-full bg-graphite/85 text-white px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider">
                          Featured
                        </span>
                      )}
                    </div>

                    {/* Product Content */}
                    <div className="flex flex-1 flex-col p-4 sm:p-5">
                      {/* Category Label */}
                      <div className="flex items-center gap-1.5 text-[0.68rem] font-semibold text-muted-foreground mb-1">
                        <span className="text-brand-blue font-bold truncate">{product.category}</span>
                        {product.subCategory && (
                          <>
                            <span>·</span>
                            <span className="truncate">{product.subCategory}</span>
                          </>
                        )}
                      </div>

                      {/* Title */}
                      <h3
                        className="font-display text-sm font-bold text-graphite group-hover:text-brand-blue transition-colors line-clamp-2"
                        title={product.name}
                      >
                        {product.name}
                      </h3>

                      {/* Short Description */}
                      <p className="mt-2 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>

                      {/* Direct External Action CTA Button */}
                      <div className="mt-auto pt-4 border-t border-border/80">
                        {product.externalUrl ? (
                          <div
                            className={`w-full inline-flex items-center justify-center gap-1.5 rounded-xl px-3.5 py-2.5 font-display text-[0.72rem] sm:text-xs font-bold uppercase tracking-wider text-white shadow-xs transition-all group-hover:bg-graphite ${
                              isAmphenol ? "bg-[#004f9e]" : "bg-brand-blue"
                            }`}
                          >
                            <span>View on {product.brand}</span>
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </div>
                        ) : (
                          <div
                            className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-graphite px-3.5 py-2.5 font-display text-[0.72rem] sm:text-xs font-bold uppercase tracking-wider text-white shadow-xs transition-all group-hover:bg-brand-blue"
                          >
                            <span>Enquire with Qualitech</span>
                            <span>→</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ─── PAGINATION BAR ─── */}
            {totalPages > 1 && (
              <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-muted-foreground">
                  Showing <strong>{startIndex + 1}</strong> to <strong>{Math.min(startIndex + pageSize, filteredProducts.length)}</strong> of <strong>{filteredProducts.length}</strong> products
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Previous Page Button */}
                  <button
                    type="button"
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className="inline-flex items-center gap-1 rounded-xl border border-border bg-white px-3 py-2 text-xs font-bold text-graphite transition-all hover:bg-steel-light disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-2xs"
                  >
                    <span>←</span>
                    <span className="hidden sm:inline">Previous</span>
                  </button>

                  {/* Page Numbers */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                      // Show first, last, and pages around current page
                      if (
                        pageNum === 1 ||
                        pageNum === totalPages ||
                        (pageNum >= page - 1 && pageNum <= page + 1)
                      ) {
                        const isActive = page === pageNum;
                        return (
                          <button
                            key={pageNum}
                            type="button"
                            onClick={() => handlePageChange(pageNum)}
                            className={`min-w-9 h-9 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              isActive
                                ? "bg-brand-blue text-white shadow-sm font-black"
                                : "border border-border bg-white text-graphite hover:bg-steel-light"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      }
                      // Render ellipsis
                      if (pageNum === page - 2 || pageNum === page + 2) {
                        return (
                          <span key={pageNum} className="px-1 text-xs text-muted-foreground font-bold">
                            ...
                          </span>
                        );
                      }
                      return null;
                    })}
                  </div>

                  {/* Next Page Button */}
                  <button
                    type="button"
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                    className="inline-flex items-center gap-1 rounded-xl border border-border bg-white px-3 py-2 text-xs font-bold text-graphite transition-all hover:bg-steel-light disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-2xs"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ─── Footer ─── */}
      <Footer onNavigate={onNavigateHome} />
    </div>
  );
}
