import { useState, useMemo, useEffect } from "react";
import {
  PRODUCTS,
  CATEGORIES,
  SUBCATEGORIES,
  ALL_INDUSTRIES,
  Product,
} from "@/data/products";

interface ShopPageProps {
  onNavigateHome: (sectionId?: string) => void;
}

export function ShopPage({ onNavigateHome }: ShopPageProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All Products");
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"featured" | "name" | "sku">("featured");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [rfqItems, setRfqItems] = useState<{ product: Product; quantity: number }[]>([]);
  const [isRfqOpen, setIsRfqOpen] = useState(false);
  const [submittedRfq, setSubmittedRfq] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Form inputs for RFQ
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    notes: "",
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Filter logic
  const filteredProducts = useMemo(() => {
    let result = PRODUCTS.filter((p) => {
      if (selectedCategory !== "All Products" && p.category !== selectedCategory) {
        return false;
      }
      if (selectedSubCategory && p.subCategory !== selectedSubCategory) {
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
        return matchesSku || matchesName || matchesDesc || matchesSub;
      }
      return true;
    });

    if (sortBy === "name") {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "sku") {
      result = [...result].sort((a, b) => a.sku.localeCompare(b.sku));
    } else {
      result = [...result].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    return result;
  }, [selectedCategory, selectedSubCategory, selectedIndustry, inStockOnly, searchQuery, sortBy]);

  const addToRfq = (product: Product) => {
    setRfqItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setIsRfqOpen(true);
  };

  const removeFromRfq = (productId: string) => {
    setRfqItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, qty: number) => {
    if (qty <= 0) {
      removeFromRfq(productId);
      return;
    }
    setRfqItems((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, quantity: qty } : item))
    );
  };

  const handleRfqSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedRfq(true);
    setTimeout(() => {
      setSubmittedRfq(false);
      setRfqItems([]);
      setIsRfqOpen(false);
      setFormData({ name: "", company: "", email: "", phone: "", notes: "" });
    }, 3000);
  };

  const clearAllFilters = () => {
    setSelectedCategory("All Products");
    setSelectedSubCategory(null);
    setSelectedIndustry(null);
    setInStockOnly(false);
    setSearchQuery("");
  };

  const hasActiveFilters =
    selectedCategory !== "All Products" ||
    selectedSubCategory !== null ||
    selectedIndustry !== null ||
    inStockOnly ||
    searchQuery.trim() !== "";

  return (
    <div className="min-h-screen bg-[#fafbfc] text-foreground font-sans flex flex-col">
      {/* ─── Full-width Header / Topbar ─── */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-white/95 backdrop-blur-md">
        <div className="flex items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 py-3.5">
          {/* Brand Logo on far left */}
          <button
            onClick={() => onNavigateHome()}
            className="flex items-center gap-3 cursor-pointer text-left shrink-0"
          >
            <img
              src="/logo.png"
              alt="Qualitech Connectronics"
              className="h-8 sm:h-9 w-auto shrink-0"
              width={320}
              height={80}
            />
          </button>

          {/* Simple Main Navigation */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            <button
              onClick={() => onNavigateHome("top")}
              className="font-display text-[0.78rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
            >
              Home
            </button>
            <button
              onClick={() => onNavigateHome("about")}
              className="font-display text-[0.78rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
            >
              About Us
            </button>
            <button
              onClick={() => onNavigateHome("facilities")}
              className="font-display text-[0.78rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
            >
              Facilities
            </button>
            <span className="font-display text-[0.78rem] font-bold uppercase tracking-[0.14em] text-brand-blue border-b-2 border-brand-blue pb-1">
              Shop
            </span>
            <button
              onClick={() => onNavigateHome("contact")}
              className="font-display text-[0.78rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
            >
              Contact Us
            </button>
          </nav>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            {/* Mobile filter toggle */}
            <button
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="lg:hidden inline-flex items-center gap-1.5 rounded-xl border border-border bg-white px-3 py-2 text-xs font-semibold text-graphite shadow-2xs"
            >
              <svg className="h-4 w-4 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span>Filters</span>
            </button>

            {/* RFQ Quote Cart */}
            <button
              onClick={() => setIsRfqOpen(true)}
              className="relative inline-flex items-center gap-2 rounded-xl bg-graphite px-4 py-2 font-display text-[0.72rem] font-bold uppercase tracking-wider text-white shadow-xs transition-all duration-200 hover:bg-brand-blue cursor-pointer"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span className="hidden sm:inline">RFQ Cart</span>
              {rfqItems.length > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-orange text-[0.68rem] font-black text-white">
                  {rfqItems.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </button>

            <button
              onClick={() => onNavigateHome("contact")}
              className="hidden xl:inline-flex items-center gap-1.5 rounded-xl border border-graphite/20 px-3.5 py-2 font-display text-[0.72rem] font-bold uppercase tracking-wider text-graphite hover:border-graphite"
            >
              Direct RFQ →
            </button>
          </div>
        </div>
      </header>

      {/* ─── FULL-SCREEN E-COMMERCE SECTION: Flush Left Sidebar + Wide Product Grid ─── */}
      <div className="flex-1 w-full flex flex-col lg:flex-row">
        {/* ─── LEFT SIDEBAR: Moved fully to the left edge ─── */}
        <aside
          className={`${
            mobileFilterOpen ? "block" : "hidden"
          } lg:block w-full lg:w-72 xl:w-80 shrink-0 border-r border-border/80 bg-white lg:sticky lg:top-[61px] lg:h-[calc(100vh-61px)] lg:overflow-y-auto z-30`}
        >
          <div className="p-5 lg:p-6 space-y-6">
            {/* Sidebar Title & Reset */}
            <div className="flex items-center justify-between pb-3 border-b border-border/70">
              <div className="flex items-center gap-2">
                <span className="h-3 w-1 bg-brand-blue rounded-full" />
                <h2 className="font-display text-xs font-bold uppercase tracking-[0.16em] text-graphite">
                  Product Filters
                </h2>
              </div>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="text-[0.68rem] font-bold uppercase tracking-wider text-brand-blue hover:underline cursor-pointer"
                >
                  Reset All
                </button>
              )}
            </div>

            {/* Categories Accordion */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                Categories
              </h3>
              <div className="space-y-1">
                {CATEGORIES.map((cat) => {
                  const isActive = selectedCategory === cat;
                  const subs = cat !== "All Products" ? SUBCATEGORIES[cat] || [] : [];
                  const count = cat === "All Products" ? PRODUCTS.length : PRODUCTS.filter((p) => p.category === cat).length;

                  return (
                    <div key={cat} className="space-y-0.5">
                      <button
                        onClick={() => {
                          setSelectedCategory(cat);
                          setSelectedSubCategory(null);
                        }}
                        className={`group flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all cursor-pointer ${
                          isActive
                            ? "bg-brand-blue text-white shadow-2xs"
                            : "text-graphite/80 hover:bg-steel-light hover:text-graphite"
                        }`}
                      >
                        <span className="truncate">{cat}</span>
                        <span
                          className={`text-[0.68rem] rounded-full px-2 py-0.5 font-medium ${
                            isActive ? "bg-white/20 text-white" : "bg-steel-light text-muted-foreground"
                          }`}
                        >
                          {count}
                        </span>
                      </button>

                      {/* Nested Subcategories */}
                      {isActive && subs.length > 0 && (
                        <div className="ml-3 border-l-2 border-brand-blue/30 pl-2.5 py-1 space-y-1">
                          {subs.map((sub) => {
                            const isSubActive = selectedSubCategory === sub;
                            const subCount = PRODUCTS.filter((p) => p.subCategory === sub).length;

                            return (
                              <button
                                key={sub}
                                onClick={() => setSelectedSubCategory(isSubActive ? null : sub)}
                                className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-[0.73rem] transition-colors cursor-pointer ${
                                  isSubActive
                                    ? "bg-brand-blue/10 font-bold text-brand-blue"
                                    : "text-muted-foreground hover:text-graphite hover:bg-steel-light/50"
                                }`}
                              >
                                <span className="truncate">{sub}</span>
                                {subCount > 0 && (
                                  <span className="text-[0.65rem] text-muted-foreground/60">
                                    {subCount}
                                  </span>
                                )}
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

            {/* In-Stock Filter Toggle */}
            <div className="border-t border-border/70 pt-4">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs font-semibold text-graphite">In Stock Only</span>
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="h-4 w-4 rounded text-brand-blue focus:ring-brand-blue cursor-pointer"
                />
              </label>
            </div>

            {/* Industries Served Chips */}
            <div className="border-t border-border/70 pt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Industry
                </h3>
                {selectedIndustry && (
                  <button
                    onClick={() => setSelectedIndustry(null)}
                    className="text-[0.65rem] font-bold text-brand-blue hover:underline cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {ALL_INDUSTRIES.map((ind) => {
                  const active = selectedIndustry === ind;
                  return (
                    <button
                      key={ind}
                      onClick={() => setSelectedIndustry(active ? null : ind)}
                      className={`rounded-lg px-2.5 py-1 text-[0.68rem] font-semibold transition-all cursor-pointer ${
                        active
                          ? "bg-graphite text-white shadow-2xs"
                          : "border border-border bg-white text-muted-foreground hover:border-brand-blue/40 hover:text-graphite"
                      }`}
                    >
                      {ind}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* OEM Custom Capability Box */}
            <div className="rounded-2xl border border-brand-blue/25 bg-gradient-to-br from-brand-blue/5 via-white to-brand-blue/10 p-4">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-brand-blue" />
                <h4 className="font-display text-[0.72rem] font-bold uppercase tracking-wider text-brand-blue">
                  Custom Cable Harness
                </h4>
              </div>
              <p className="mt-2 text-[0.76rem] leading-relaxed text-muted-foreground">
                Need application-specific wire gauges, overmolding, or pinout drawings? Qualitech builds turnkey assemblies with 100% electrical testing.
              </p>
              <button
                onClick={() => onNavigateHome("contact")}
                className="mt-3.5 block w-full rounded-xl bg-brand-blue py-2 text-center font-display text-[0.68rem] font-bold uppercase tracking-wider text-white hover:bg-graphite transition-colors cursor-pointer shadow-2xs"
              >
                Inquire Custom Solution →
              </button>
            </div>
          </div>
        </aside>

        {/* ─── MAIN CONTENT AREA: Expands full width across the remaining screen ─── */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 flex flex-col">
          {/* Top Search & Filter Bar */}
          <div className="bg-white rounded-2xl border border-border p-4 shadow-2xs mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-xl">
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
                  placeholder="Search by part number, series, SKU (e.g. 86094648109755E1LF, D-Sub, DIN, M12)..."
                  className="w-full rounded-xl border border-border/80 bg-[#fbfcfd] py-2.5 pl-10 pr-9 text-xs sm:text-sm text-graphite placeholder:text-muted-foreground/60 focus:border-brand-blue focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/15"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground hover:text-foreground"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Sort & Count Controls */}
              <div className="flex items-center justify-between md:justify-end gap-3 shrink-0">
                <span className="text-xs font-semibold text-muted-foreground">
                  <strong className="text-graphite">{filteredProducts.length}</strong> items
                </span>

                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span>Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="rounded-lg border border-border bg-white px-2.5 py-1.5 text-xs font-semibold text-graphite focus:outline-none focus:ring-1 focus:ring-brand-blue"
                  >
                    <option value="featured">Featured First</option>
                    <option value="name">Name (A-Z)</option>
                    <option value="sku">Part Number / SKU</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Active filter badges strip */}
            {hasActiveFilters && (
              <div className="mt-3 pt-3 border-t border-border/60 flex flex-wrap items-center gap-2">
                <span className="text-[0.68rem] font-bold uppercase tracking-wider text-muted-foreground">
                  Active Filters:
                </span>
                {selectedCategory !== "All Products" && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-brand-blue/10 px-2.5 py-0.5 text-xs font-semibold text-brand-blue">
                    {selectedCategory}
                    <button
                      onClick={() => setSelectedCategory("All Products")}
                      className="hover:text-graphite cursor-pointer"
                    >
                      ✕
                    </button>
                  </span>
                )}
                {selectedSubCategory && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-brand-blue/10 px-2.5 py-0.5 text-xs font-semibold text-brand-blue">
                    {selectedSubCategory}
                    <button
                      onClick={() => setSelectedSubCategory(null)}
                      className="hover:text-graphite cursor-pointer"
                    >
                      ✕
                    </button>
                  </span>
                )}
                {selectedIndustry && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-graphite/10 px-2.5 py-0.5 text-xs font-semibold text-graphite">
                    Industry: {selectedIndustry}
                    <button
                      onClick={() => setSelectedIndustry(null)}
                      className="hover:text-destructive cursor-pointer"
                    >
                      ✕
                    </button>
                  </span>
                )}
                {inStockOnly && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-green-100 text-green-800 px-2.5 py-0.5 text-xs font-semibold">
                    In Stock Only
                    <button onClick={() => setInStockOnly(false)} className="hover:text-destructive cursor-pointer">
                      ✕
                    </button>
                  </span>
                )}
                {searchQuery && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 text-amber-900 px-2.5 py-0.5 text-xs font-semibold">
                    Search: "{searchQuery}"
                    <button onClick={() => setSearchQuery("")} className="hover:text-destructive cursor-pointer">
                      ✕
                    </button>
                  </span>
                )}
                <button
                  onClick={clearAllFilters}
                  className="text-xs font-semibold text-brand-blue hover:underline ml-auto cursor-pointer"
                >
                  Clear All
                </button>
              </div>
            )}
          </div>

          {/* Full-width Product Grid (Responsive: 1col -> 2col -> 3col -> 4col -> 5col on wide screens) */}
          {filteredProducts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-white p-12 text-center my-auto">
              <svg className="mx-auto h-12 w-12 text-muted-foreground/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-4 font-display text-lg font-bold text-graphite">
                No matching products found
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Try searching for other part numbers or reset the category filters.
              </p>
              <button
                onClick={clearAllFilters}
                className="mt-5 rounded-xl bg-graphite px-5 py-2.5 font-display text-xs font-bold uppercase tracking-wider text-white hover:bg-brand-blue"
              >
                Reset Filters &amp; View All
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
              {filteredProducts.map((product) => (
                <article
                  key={product.id}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-2xs transition-all duration-300 hover:-translate-y-1 hover:border-brand-blue/50 hover:shadow-md"
                >
                  {/* Image container */}
                  <div className="relative h-44 w-full overflow-hidden bg-steel-light/70">
                    <img
                      src={product.image}
                      alt={product.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    {/* Part SKU badge */}
                    <span className="absolute left-3 top-3 rounded-md bg-graphite/90 px-2 py-0.5 text-[0.62rem] font-bold uppercase tracking-wider text-white backdrop-blur-xs">
                      {product.sku}
                    </span>

                    {/* Featured / In Stock pill */}
                    {product.featured ? (
                      <span className="absolute right-3 top-3 rounded-md bg-brand-orange px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider text-white">
                        Featured
                      </span>
                    ) : (
                      <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2 py-0.5 text-[0.6rem] font-semibold text-green-700 backdrop-blur-xs">
                        ● In Stock
                      </span>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="flex flex-1 flex-col p-4">
                    {/* Category breadcrumb */}
                    <div className="text-[0.68rem] font-semibold text-brand-blue truncate">
                      {product.category} &gt; {product.subCategory}
                    </div>

                    {/* Title */}
                    <h3
                      onClick={() => setSelectedProduct(product)}
                      className="mt-1.5 font-display text-sm font-bold leading-snug text-graphite group-hover:text-brand-blue transition-colors cursor-pointer line-clamp-2"
                      title={product.name}
                    >
                      {product.name}
                    </h3>

                    {/* Description */}
                    <p className="mt-1.5 text-[0.76rem] leading-relaxed text-muted-foreground line-clamp-2">
                      {product.description}
                    </p>

                    {/* Key Specs Pills */}
                    <div className="mt-3 flex flex-wrap gap-1 border-t border-border/60 pt-2.5">
                      {product.specs.contacts && (
                        <span className="rounded bg-steel-light px-1.5 py-0.5 text-[0.62rem] font-medium text-graphite">
                          {product.specs.contacts}
                        </span>
                      )}
                      {product.specs.voltage && (
                        <span className="rounded bg-steel-light px-1.5 py-0.5 text-[0.62rem] font-medium text-graphite">
                          {product.specs.voltage}
                        </span>
                      )}
                      {product.specs.ipRating && (
                        <span className="rounded bg-green-50 text-green-700 px-1.5 py-0.5 text-[0.62rem] font-semibold">
                          {product.specs.ipRating}
                        </span>
                      )}
                      {product.specs.impedance && (
                        <span className="rounded bg-steel-light px-1.5 py-0.5 text-[0.62rem] font-medium text-graphite">
                          {product.specs.impedance}
                        </span>
                      )}
                    </div>

                    {/* Bottom CTA row */}
                    <div className="mt-auto pt-3 border-t border-border/70 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedProduct(product)}
                        className="text-[0.68rem] font-bold uppercase tracking-wider text-muted-foreground hover:text-brand-blue transition-colors cursor-pointer"
                      >
                        Specs →
                      </button>

                      <button
                        type="button"
                        onClick={() => addToRfq(product)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-graphite px-3 py-1.5 font-display text-[0.65rem] font-bold uppercase tracking-wider text-white shadow-2xs transition-all hover:bg-brand-blue hover:shadow-xs cursor-pointer"
                      >
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        Add to Quote
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* ─── Product Detail Modal ─── */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 sm:p-8 shadow-2xl">
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute right-5 top-5 rounded-full p-2 text-muted-foreground hover:bg-steel-light hover:text-foreground cursor-pointer"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="grid gap-8 sm:grid-cols-2">
              <div className="overflow-hidden rounded-xl border border-border bg-steel-light">
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  className="h-64 w-full object-cover"
                />
              </div>

              <div>
                <span className="rounded-md bg-brand-blue/10 px-2.5 py-1 text-xs font-bold text-brand-blue uppercase tracking-wider">
                  {selectedProduct.sku}
                </span>
                <h2 className="mt-3 font-display text-xl font-bold text-graphite sm:text-2xl">
                  {selectedProduct.name}
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  {selectedProduct.category} &gt; {selectedProduct.subCategory}
                </p>

                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  {selectedProduct.description}
                </p>

                <div className="mt-6">
                  <button
                    onClick={() => {
                      addToRfq(selectedProduct);
                      setSelectedProduct(null);
                    }}
                    className="w-full rounded-xl bg-graphite py-3.5 font-display text-xs font-bold uppercase tracking-wider text-white hover:bg-brand-blue transition-colors cursor-pointer"
                  >
                    Add to Quote Inquiry
                  </button>
                </div>
              </div>
            </div>

            {/* Features & Specs in modal */}
            <div className="mt-8 grid gap-6 border-t border-border pt-6 sm:grid-cols-2">
              <div>
                <h3 className="font-display text-xs font-bold uppercase tracking-wider text-graphite">
                  Key Technical Features
                </h3>
                <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
                  {selectedProduct.features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <svg className="h-4 w-4 shrink-0 text-brand-blue mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-display text-xs font-bold uppercase tracking-wider text-graphite">
                  Electrical &amp; Mechanical Specs
                </h3>
                <div className="mt-3 divide-y divide-border text-xs">
                  {Object.entries(selectedProduct.specs).map(([key, val]) => (
                    <div key={key} className="flex justify-between py-1.5">
                      <span className="capitalize text-muted-foreground">{key.replace(/([A-Z])/g, " $1")}:</span>
                      <span className="font-semibold text-graphite">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── RFQ Slide-out Drawer ─── */}
      {isRfqOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs">
          <div className="relative flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-6 py-5">
              <div>
                <h3 className="font-display text-base font-bold text-graphite">
                  Request for Quote (RFQ)
                </h3>
                <p className="text-xs text-muted-foreground">
                  {rfqItems.length} products selected for OEM quotation
                </p>
              </div>
              <button
                onClick={() => setIsRfqOpen(false)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-steel-light hover:text-foreground cursor-pointer"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {submittedRfq ? (
                <div className="rounded-2xl border border-green-200 bg-green-50 p-8 text-center">
                  <svg className="mx-auto h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <h4 className="mt-3 font-display text-base font-bold text-green-800">
                    Inquiry Submitted Successfully!
                  </h4>
                  <p className="mt-2 text-xs text-green-700 leading-relaxed">
                    Our engineering and sales team will review your specifications and contact you within 24 hours.
                  </p>
                </div>
              ) : (
                <>
                  {rfqItems.length === 0 ? (
                    <div className="py-12 text-center">
                      <p className="text-sm text-muted-foreground">
                        Your RFQ list is currently empty.
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground/80">
                        Click "Add to Quote" on any product card to begin.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {rfqItems.map(({ product, quantity }) => (
                        <div
                          key={product.id}
                          className="flex items-center justify-between gap-3 rounded-xl border border-border p-3"
                        >
                          <div className="min-w-0 flex-1">
                            <span className="text-[0.62rem] font-bold text-brand-blue uppercase">
                              {product.sku}
                            </span>
                            <h4 className="text-xs font-bold text-graphite truncate">{product.name}</h4>
                          </div>

                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="1"
                              value={quantity}
                              onChange={(e) => updateQuantity(product.id, parseInt(e.target.value) || 1)}
                              className="w-14 rounded-lg border border-border px-2 py-1 text-center text-xs font-semibold"
                            />
                            <button
                              onClick={() => removeFromRfq(product.id)}
                              className="text-xs text-muted-foreground hover:text-destructive cursor-pointer p-1"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Submission Form */}
                  {rfqItems.length > 0 && (
                    <form onSubmit={handleRfqSubmit} className="space-y-3 border-t border-border pt-6">
                      <h4 className="font-display text-xs font-bold uppercase tracking-wider text-graphite">
                        Your Contact Information
                      </h4>
                      <div>
                        <input
                          type="text"
                          required
                          placeholder="Your Name *"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full rounded-xl border border-border px-3.5 py-2 text-xs focus:border-brand-blue focus:outline-none"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          required
                          placeholder="Company / OEM Name *"
                          value={formData.company}
                          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                          className="w-full rounded-xl border border-border px-3.5 py-2 text-xs focus:border-brand-blue focus:outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="email"
                          required
                          placeholder="Work Email *"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full rounded-xl border border-border px-3.5 py-2 text-xs focus:border-brand-blue focus:outline-none"
                        />
                        <input
                          type="tel"
                          required
                          placeholder="Phone Number *"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full rounded-xl border border-border px-3.5 py-2 text-xs focus:border-brand-blue focus:outline-none"
                        />
                      </div>
                      <div>
                        <textarea
                          rows={3}
                          placeholder="Project details, target volume, specific pinout requirements..."
                          value={formData.notes}
                          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                          className="w-full rounded-xl border border-border px-3.5 py-2 text-xs focus:border-brand-blue focus:outline-none resize-none"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full rounded-xl bg-brand-blue py-3 font-display text-xs font-bold uppercase tracking-wider text-white hover:bg-graphite transition-colors shadow-sm cursor-pointer"
                      >
                        Submit Request for Quote →
                      </button>
                    </form>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── Simple Footer ─── */}
      <footer className="w-full border-t border-border bg-graphite-deep py-6 text-steel mt-auto">
        <div className="px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-white p-1.5 shadow-2xs">
              <img src="/logo.png" alt="Qualitech" className="h-6 w-auto" />
            </div>
            <p className="text-xs text-steel">
              Precision Connections. Engineered for Performance.
            </p>
          </div>
          <p className="text-xs text-steel/80">
            © {new Date().getFullYear()} Qualitech Connectronics Private Limited. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
