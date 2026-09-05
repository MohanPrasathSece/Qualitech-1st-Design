import { useState, useMemo, useEffect } from "react";
import {
  PRODUCTS,
  CATEGORIES,
  SUBCATEGORIES,
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
  const [selectedCategory, setSelectedCategory] = useState<string>("All Products");
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string>("All Brands");
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"featured" | "name">("featured");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Mobile filter drawer state
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Filter & sort logic
  const filteredProducts = useMemo(() => {
    let result = PRODUCTS.filter((p) => {
      if (selectedCategory !== "All Products" && p.category !== selectedCategory) {
        return false;
      }
      if (selectedSubCategory && p.subCategory !== selectedSubCategory) {
        return false;
      }
      if (selectedBrand !== "All Brands" && p.brand !== selectedBrand) {
        return false;
      }
      if (selectedIndustry && !p.industries.includes(selectedIndustry)) {
        return false;
      }
      if (inStockOnly && !p.inStock) {
        return false;
      }
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const matchesSku = p.sku.toLowerCase().includes(q);
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesDesc = p.description.toLowerCase().includes(q);
        const matchesSub = p.subCategory.toLowerCase().includes(q);
        const matchesBrand = p.brand.toLowerCase().includes(q);
        return matchesSku || matchesName || matchesDesc || matchesSub || matchesBrand;
      }
      return true;
    });

    if (sortBy === "name") {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    } else {
      result = [...result].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    return result;
  }, [selectedCategory, selectedSubCategory, selectedBrand, selectedIndustry, inStockOnly, searchQuery, sortBy]);

  const clearAllFilters = () => {
    setSelectedCategory("All Products");
    setSelectedSubCategory(null);
    setSelectedBrand("All Brands");
    setSelectedIndustry(null);
    setInStockOnly(false);
    setSearchQuery("");
  };

  const activeFiltersCount =
    (selectedCategory !== "All Products" ? 1 : 0) +
    (selectedSubCategory ? 1 : 0) +
    (selectedBrand !== "All Brands" ? 1 : 0) +
    (selectedIndustry ? 1 : 0) +
    (inStockOnly ? 1 : 0) +
    (searchQuery.trim() !== "" ? 1 : 0);

  const handleProductAction = (product: Product) => {
    if (product.externalUrl) {
      window.open(product.externalUrl, "_blank", "noopener,noreferrer");
    } else {
      onNavigateHome("#contact-page", true);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafbfc] text-foreground font-sans flex flex-col w-full overflow-x-hidden">
      {/* ─── Exact Same Header Navigation as Home ─── */}
      <Header onNavigate={onNavigateHome} currentPage="products" />

      {/* ─── Page Banner (Rich Navy Blue Theme properly padded below fixed header) ─── */}
      <div className="bg-graphite-deep text-white px-4 sm:px-8 pt-28 sm:pt-36 pb-12 sm:pb-16 border-b border-border/20 relative z-10 overflow-hidden">
        <div className="absolute inset-0 hairline-grid opacity-25 pointer-events-none" />
        <div className="relative max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-yellow" />
              <span className="font-display text-[0.68rem] font-bold uppercase tracking-[0.2em] text-steel">
                Distribution &amp; Manufacturing
              </span>
            </div>
            <h1 className="mt-3 font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
              Products &amp; Services
            </h1>
            <p className="mt-3 text-xs sm:text-sm text-steel max-w-2xl leading-relaxed">
              Explore our authorized distribution lines for Amphenol and Zolex, alongside custom-engineered cable assembly manufacturing. Click on any Amphenol product to view detailed specifications on the official Amphenol portal.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            <button
              onClick={() => {
                setSelectedCategory("Electronics Components");
                setSelectedBrand("Amphenol");
                setSelectedSubCategory(null);
              }}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
                selectedCategory === "Electronics Components" && selectedBrand === "Amphenol"
                  ? "bg-[#004f9e] text-white shadow-md ring-2 ring-white/20"
                  : "border border-white/20 bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-[#009fe3]" />
              Amphenol Distribution
            </button>
            <button
              onClick={() => {
                setSelectedCategory("Electronics Components");
                setSelectedBrand("Zolex");
                setSelectedSubCategory(null);
              }}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
                selectedCategory === "Electronics Components" && selectedBrand === "Zolex"
                  ? "bg-brand-blue text-white shadow-md ring-2 ring-white/20"
                  : "border border-white/20 bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-brand-blue-soft" />
              Zolex Distribution
            </button>
            <button
              onClick={() => {
                setSelectedCategory("Cable Assemblies");
                setSelectedBrand("Qualitech");
                setSelectedSubCategory(null);
              }}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
                selectedCategory === "Cable Assemblies" && selectedBrand === "Qualitech"
                  ? "bg-brand-yellow text-graphite font-bold shadow-md"
                  : "border border-white/20 bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-brand-yellow" />
              Cable Assembly Manufacturing
            </button>
          </div>
        </div>
      </div>

      {/* ─── MOBILE CATEGORY PILL STRIP (Horizontal scroll for phones) ─── */}
      <div className="lg:hidden w-full border-b border-border bg-white px-4 py-2.5 overflow-x-auto scrollbar-none flex items-center gap-2">
        <button
          onClick={() => setMobileFilterOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-full border border-graphite/30 bg-graphite/5 px-3 py-1.5 text-xs font-semibold text-graphite shrink-0 cursor-pointer"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <span>Filters</span>
          {activeFiltersCount > 0 && (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-brand-blue text-[0.6rem] font-bold text-white">
              {activeFiltersCount}
            </span>
          )}
        </button>

        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setSelectedSubCategory(null);
              }}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium shrink-0 transition-colors cursor-pointer ${
                isActive
                  ? "bg-brand-blue text-white font-semibold shadow-2xs"
                  : "border border-border bg-steel-light/50 text-muted-foreground hover:text-graphite"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* ─── FULL-SCREEN CATALOGUE LAYOUT ─── */}
      <div className="flex-1 w-full flex flex-col lg:flex-row min-h-0">
        {/* ─── FLUSH LEFT SIDEBAR: Desktop Sidebar ─── */}
        <aside className="hidden lg:block w-72 xl:w-76 shrink-0 border-r border-border/80 bg-white lg:sticky lg:top-[74px] lg:h-[calc(100vh-74px)] lg:overflow-y-auto z-30 p-5 lg:p-6 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <h2 className="font-display text-xs font-bold uppercase tracking-[0.16em] text-graphite">
              Categories
            </h2>
            {activeFiltersCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-[0.68rem] font-semibold text-brand-blue hover:underline cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>

          {/* Categories List */}
          <div className="space-y-1">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat;
              const subs = cat !== "All Products" ? SUBCATEGORIES[cat] || [] : [];
              const count =
                cat === "All Products"
                  ? PRODUCTS.length
                  : PRODUCTS.filter((p) => p.category === cat).length;

              return (
                <div key={cat} className="space-y-0.5">
                  <button
                    onClick={() => {
                      setSelectedCategory(cat);
                      setSelectedSubCategory(null);
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                      isActive
                        ? "bg-brand-blue text-white font-bold"
                        : "text-graphite/80 hover:bg-steel-light hover:text-graphite"
                    }`}
                  >
                    <span>{cat}</span>
                    <span
                      className={`text-[0.65rem] rounded-full px-2 py-0.5 ${
                        isActive ? "bg-white/20 text-white" : "bg-steel-light text-muted-foreground"
                      }`}
                    >
                      {count}
                    </span>
                  </button>

                  {/* Subcategories */}
                  {isActive && subs.length > 0 && (
                    <div className="ml-3 border-l-2 border-brand-blue/30 pl-2.5 py-1 space-y-0.5">
                      {subs.map((sub) => {
                        const isSubActive = selectedSubCategory === sub;
                        return (
                          <button
                            key={sub}
                            onClick={() => setSelectedSubCategory(isSubActive ? null : sub)}
                            className={`block w-full text-left rounded-lg px-2.5 py-1.5 text-[0.74rem] transition-colors cursor-pointer ${
                              isSubActive
                                ? "bg-brand-blue/10 font-bold text-brand-blue"
                                : "text-muted-foreground hover:text-graphite"
                            }`}
                          >
                            {sub}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Brand Filter */}
          <div className="border-t border-border/80 pt-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
              Brand / Manufacturer
            </h3>
            <div className="space-y-1">
              {BRANDS.map((brand) => {
                const isActive = selectedBrand === brand;
                const count =
                  brand === "All Brands"
                    ? PRODUCTS.length
                    : PRODUCTS.filter((p) => p.brand === brand).length;

                return (
                  <button
                    key={brand}
                    onClick={() => setSelectedBrand(brand)}
                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-colors cursor-pointer ${
                      isActive
                        ? "bg-graphite text-white font-bold"
                        : "text-graphite hover:bg-steel-light"
                    }`}
                  >
                    <span>{brand}</span>
                    <span className="text-[0.65rem] opacity-70">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* In-Stock Filter */}
          <div className="border-t border-border/80 pt-4">
            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-graphite">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="h-4 w-4 rounded border-border text-brand-blue focus:ring-brand-blue cursor-pointer"
              />
              <span>In Stock Items Only</span>
            </label>
          </div>

          {/* Industry Filter (Minimal Chips) */}
          <div className="border-t border-border/80 pt-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
              Industry Filter
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {ALL_INDUSTRIES.map((ind) => {
                const active = selectedIndustry === ind;
                return (
                  <button
                    key={ind}
                    onClick={() => setSelectedIndustry(active ? null : ind)}
                    className={`rounded-lg px-2.5 py-1 text-[0.68rem] font-semibold transition-all cursor-pointer ${
                      active
                        ? "bg-graphite text-white"
                        : "border border-border bg-white text-muted-foreground hover:text-graphite hover:border-brand-blue/40"
                    }`}
                  >
                    {ind}
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* ─── MOBILE FILTER MODAL DRAWER ─── */}
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden bg-black/50 backdrop-blur-xs">
            <div className="relative flex h-full w-4/5 max-w-sm flex-col bg-white p-5 overflow-y-auto shadow-2xl animate-in slide-in-from-left duration-300">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <h3 className="font-display text-sm font-bold text-graphite">Filters</h3>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-steel-light cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Mobile filter categories */}
              <div className="py-4 space-y-4">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                    Categories
                  </h4>
                  <div className="space-y-1">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => {
                          setSelectedCategory(cat);
                          setSelectedSubCategory(null);
                          setMobileFilterOpen(false);
                        }}
                        className={`block w-full text-left rounded-lg px-3 py-2 text-xs font-medium ${
                          selectedCategory === cat
                            ? "bg-brand-blue text-white font-bold"
                            : "text-graphite hover:bg-steel-light"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-border pt-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                    Brand
                  </h4>
                  <div className="space-y-1">
                    {BRANDS.map((brand) => (
                      <button
                        key={brand}
                        onClick={() => {
                          setSelectedBrand(brand);
                          setMobileFilterOpen(false);
                        }}
                        className={`block w-full text-left rounded-lg px-3 py-1.5 text-xs ${
                          selectedBrand === brand ? "bg-graphite text-white font-bold" : "text-graphite"
                        }`}
                      >
                        {brand}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-border pt-4">
                  <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-graphite">
                    <input
                      type="checkbox"
                      checked={inStockOnly}
                      onChange={(e) => setInStockOnly(e.target.checked)}
                      className="h-4 w-4 rounded text-brand-blue"
                    />
                    <span>In Stock Only</span>
                  </label>
                </div>

                <div className="border-t border-border pt-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                    Industry
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {ALL_INDUSTRIES.map((ind) => (
                      <button
                        key={ind}
                        onClick={() => {
                          setSelectedIndustry(selectedIndustry === ind ? null : ind);
                          setMobileFilterOpen(false);
                        }}
                        className={`rounded-lg px-2.5 py-1 text-[0.68rem] font-medium ${
                          selectedIndustry === ind
                            ? "bg-graphite text-white"
                            : "border border-border bg-white text-muted-foreground"
                        }`}
                      >
                        {ind}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  clearAllFilters();
                  setMobileFilterOpen(false);
                }}
                className="mt-auto w-full rounded-xl border border-border py-2.5 text-xs font-bold text-graphite"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        )}

        {/* ─── MAIN PRODUCT SHOWCASE ─── */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 flex flex-col">
          {/* Search & Sort Bar */}
          <div className="bg-white rounded-2xl border border-border p-3.5 sm:p-4 shadow-2xs mb-6 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            <div className="relative w-full sm:max-w-md">
              <svg
                className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
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
                placeholder="Search components, part series or keywords..."
                className="w-full rounded-xl border border-border bg-[#fafbfc] py-2 pl-10 pr-8 text-xs sm:text-sm text-graphite placeholder:text-muted-foreground/60 focus:border-brand-blue focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/15"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3 text-xs">
              <span className="text-muted-foreground">
                <strong className="text-graphite">{filteredProducts.length}</strong> items found
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="rounded-lg border border-border bg-white px-2.5 py-1.5 text-xs font-semibold text-graphite focus:outline-none focus:ring-1 focus:ring-brand-blue cursor-pointer"
              >
                <option value="featured">Featured First</option>
                <option value="name">Name (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Product Grid */}
          {filteredProducts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-white p-8 sm:p-12 text-center my-auto">
              <h3 className="font-display text-base font-bold text-graphite">No products found</h3>
              <p className="mt-1 text-xs text-muted-foreground">Try clearing your filters or search terms.</p>
              <button
                onClick={clearAllFilters}
                className="mt-4 rounded-xl bg-graphite px-4 py-2 text-xs font-bold text-white hover:bg-brand-blue cursor-pointer"
              >
                View All
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {filteredProducts.map((product) => {
                const isAmphenol = product.brand === "Amphenol";

                return (
                  <article
                    key={product.id}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-2xs transition-all duration-300 hover:-translate-y-1 hover:border-brand-blue/40 hover:shadow-md"
                  >
                    {/* Image Container */}
                    <div
                      onClick={() => {
                        if (product.externalUrl) {
                          window.open(product.externalUrl, "_blank", "noopener,noreferrer");
                        } else {
                          setSelectedProduct(product);
                        }
                      }}
                      className="relative h-44 sm:h-48 w-full overflow-hidden bg-steel-light/50 p-4 flex items-center justify-center cursor-pointer"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        loading="lazy"
                        className="h-full w-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
                      />

                      {/* Brand Pill */}
                      <span
                        className={`absolute left-3 top-3 rounded-full px-2.5 py-0.5 text-[0.62rem] font-extrabold uppercase tracking-wider shadow-2xs ${
                          isAmphenol
                            ? "bg-[#004f9e] text-white"
                            : product.brand === "Zolex"
                            ? "bg-brand-blue text-white"
                            : "bg-brand-yellow text-graphite"
                        }`}
                      >
                        {product.brand}
                      </span>

                      {product.featured && (
                        <span className="absolute right-3 top-3 rounded-full bg-graphite/80 text-white px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider">
                          Featured
                        </span>
                      )}

                      {/* Quick Specs popup trigger button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProduct(product);
                        }}
                        className="absolute bottom-2 right-2 rounded-lg bg-white/90 backdrop-blur-xs px-2.5 py-1 text-[0.62rem] font-bold text-graphite opacity-0 group-hover:opacity-100 transition-opacity shadow-xs hover:bg-white cursor-pointer"
                        title="View Specs & Details"
                      >
                        Quick Specs
                      </button>
                    </div>

                    {/* Body */}
                    <div className="flex flex-1 flex-col p-4 sm:p-5">
                      <span className="text-[0.68rem] font-semibold text-muted-foreground">
                        {product.subCategory}
                      </span>

                      <h3
                        onClick={() => {
                          if (product.externalUrl) {
                            window.open(product.externalUrl, "_blank", "noopener,noreferrer");
                          } else {
                            setSelectedProduct(product);
                          }
                        }}
                        className="mt-1 font-display text-sm font-bold text-graphite group-hover:text-brand-blue transition-colors cursor-pointer line-clamp-2"
                        title={product.name}
                      >
                        {product.name}
                      </h3>

                      <p className="mt-2 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>

                      {/* Action CTA Bar */}
                      <div className="mt-auto pt-4 border-t border-border/80 flex items-center justify-between gap-2">
                        {product.externalUrl ? (
                          <a
                            href={product.externalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`w-full inline-flex items-center justify-center gap-1.5 rounded-xl px-3.5 py-2 sm:py-2.5 font-display text-[0.72rem] sm:text-xs font-bold uppercase tracking-wider text-white shadow-xs transition-all hover:bg-graphite cursor-pointer ${
                              product.brand === "Amphenol" ? "bg-[#004f9e]" : "bg-brand-blue"
                            }`}
                          >
                            <span>View on {product.brand}</span>
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleProductAction(product)}
                            className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-graphite px-3.5 py-2 sm:py-2.5 font-display text-[0.72rem] sm:text-xs font-bold uppercase tracking-wider text-white shadow-xs transition-all hover:bg-brand-blue cursor-pointer"
                          >
                            <span>Discuss Requirement</span>
                            <span>→</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* ─── Product Detail Modal ─── */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground hover:bg-steel-light hover:text-foreground cursor-pointer"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="grid gap-6 sm:grid-cols-2 items-center">
              <div className="h-48 sm:h-56 overflow-hidden rounded-xl border border-border bg-steel-light/50 p-4 flex items-center justify-center">
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  className="h-full w-full object-contain mix-blend-multiply"
                />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[0.62rem] font-bold uppercase tracking-wider ${
                      selectedProduct.brand === "Amphenol"
                        ? "bg-[#004f9e] text-white"
                        : selectedProduct.brand === "Zolex"
                        ? "bg-brand-blue text-white"
                        : "bg-brand-yellow text-graphite"
                    }`}
                  >
                    {selectedProduct.brand}
                  </span>
                  <span className="text-xs font-mono font-semibold text-muted-foreground">
                    {selectedProduct.sku}
                  </span>
                </div>

                <h2 className="mt-2 font-display text-base sm:text-lg font-bold text-graphite">
                  {selectedProduct.name}
                </h2>

                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                  {selectedProduct.description}
                </p>

                <div className="mt-5">
                  {selectedProduct.externalUrl ? (
                    <a
                      href={selectedProduct.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-full inline-flex items-center justify-center gap-2 rounded-xl py-3 font-display text-xs font-bold uppercase tracking-wider text-white hover:bg-graphite transition-colors shadow-sm ${
                        selectedProduct.brand === "Amphenol" ? "bg-[#004f9e]" : "bg-brand-blue"
                      }`}
                    >
                      <span>View on {selectedProduct.brand} Official Site</span>
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedProduct(null);
                        onNavigateHome("#contact-page", true);
                      }}
                      className="w-full rounded-xl bg-graphite py-3 font-display text-xs font-bold uppercase tracking-wider text-white hover:bg-brand-blue transition-colors cursor-pointer shadow-sm"
                    >
                      Enquire with Qualitech →
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Features */}
            {selectedProduct.features && selectedProduct.features.length > 0 && (
              <div className="mt-5 sm:mt-6 border-t border-border pt-4">
                <h3 className="font-display text-xs font-bold uppercase tracking-wider text-graphite mb-2">
                  Key Highlights
                </h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {selectedProduct.features.map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-muted-foreground">
                      <span className="h-1.5 w-1.5 rounded-full bg-brand-blue shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Specifications list */}
            {selectedProduct.specs && Object.keys(selectedProduct.specs).length > 0 && (
              <div className="mt-4 border-t border-border pt-4">
                <h3 className="font-display text-xs font-bold uppercase tracking-wider text-graphite mb-2.5">
                  Specifications &amp; Applications
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {Object.entries(selectedProduct.specs).map(([k, v]) => (
                    <div key={k} className="flex justify-between rounded-lg bg-steel-light/60 px-3 py-1.5">
                      <span className="capitalize text-muted-foreground">{k}:</span>
                      <span className="font-semibold text-graphite">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── FULL CORPORATE FOOTER ─── */}
      <Footer onNavigate={onNavigateHome} />
    </div>
  );
}
