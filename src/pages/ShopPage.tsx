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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [rfqItems, setRfqItems] = useState<{ product: Product; quantity: number }[]>([]);
  const [isRfqOpen, setIsRfqOpen] = useState(false);
  const [submittedRfq, setSubmittedRfq] = useState(false);

  // Form inputs for RFQ
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    notes: "",
  });

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Filter logic
  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((p) => {
      // Category filter
      if (selectedCategory !== "All Products" && p.category !== selectedCategory) {
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
        const matchesSub = p.subCategory.toLowerCase().includes(q);
        return matchesSku || matchesName || matchesDesc || matchesSub;
      }
      return true;
    });
  }, [selectedCategory, selectedSubCategory, selectedIndustry, searchQuery]);

  // Featured highlight list
  const featuredHighlights = useMemo(() => {
    return PRODUCTS.filter((p) => p.featured);
  }, []);

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

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* ─── Shop Header / Navbar ─── */}
      <header className="sticky top-0 z-40 border-b border-border bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <button
            onClick={() => onNavigateHome()}
            className="flex items-center gap-3 cursor-pointer text-left"
          >
            <img
              src="/logo.png"
              alt="Qualitech Connectronics Private Limited"
              className="h-9 w-auto shrink-0 sm:h-11"
              width={320}
              height={80}
            />
          </button>

          {/* Simple Main Navigation */}
          <nav className="hidden items-center gap-7 lg:flex">
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

          {/* RFQ Quote List Trigger */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsRfqOpen(true)}
              className="relative inline-flex items-center gap-2 rounded-xl bg-graphite px-4 py-2.5 font-display text-[0.72rem] font-bold uppercase tracking-wider text-white shadow-sm transition-all duration-300 hover:bg-brand-blue"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span>Quote List</span>
              {rfqItems.length > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-orange text-[0.7rem] font-black text-white">
                  {rfqItems.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </button>

            <button
              onClick={() => onNavigateHome("contact")}
              className="hidden sm:inline-flex items-center gap-2 rounded-xl border border-graphite/20 px-4 py-2.5 font-display text-[0.72rem] font-bold uppercase tracking-wider text-graphite hover:border-graphite"
            >
              Direct Inquiry →
            </button>
          </div>
        </div>
      </header>

      {/* ─── Banner / Catalog Header ─── */}
      <section className="border-b border-border bg-gradient-to-b from-[#f4f7fb] to-white py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="h-px w-10 bg-brand-orange" />
                <span className="label-eyebrow">Product Catalog &amp; Technical Store</span>
              </div>
              <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-graphite sm:text-4xl lg:text-5xl">
                Authorized Interconnect Solutions
              </h1>
              <p className="mt-3 max-w-2xl text-[0.95rem] leading-relaxed text-muted-foreground">
                Browse our comprehensive catalogue of industrial-grade D-Sub, DIN 41612, IDC, custom cable
                assemblies, fiber optics, and RF antennas. Add items to your inquiry list for instant OEM pricing.
              </p>
            </div>

            {/* Live Search Input */}
            <div className="w-full max-w-md">
              <div className="relative">
                <svg
                  className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
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
                  placeholder="Search by part number (e.g. 86094648109755E1LF, DB9, DIN)..."
                  className="w-full rounded-xl border border-border bg-white py-3 pl-12 pr-4 text-sm text-graphite placeholder:text-muted-foreground/70 focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/15 shadow-xs"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground hover:text-foreground"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Featured Highlight Carousel Strip */}
          <div className="mt-10 border-t border-border/80 pt-6">
            <div className="flex items-center justify-between">
              <p className="font-display text-[0.7rem] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                Key Featured OEM Series
              </p>
              <span className="text-xs text-brand-blue font-semibold">
                {featuredHighlights.length} Highlights
              </span>
            </div>
            <div className="mt-3 flex gap-3 overflow-x-auto pb-2 scrollbar-none">
              {featuredHighlights.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedProduct(item)}
                  className="group flex w-[260px] shrink-0 items-center gap-3 rounded-xl border border-border bg-white p-2.5 text-left transition-all hover:border-brand-blue hover:shadow-xs cursor-pointer"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-14 w-14 rounded-lg object-cover bg-steel-light"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="block text-[0.62rem] font-bold uppercase tracking-wider text-brand-blue truncate">
                      {item.sku}
                    </span>
                    <h3 className="text-xs font-bold text-graphite truncate group-hover:text-brand-blue transition-colors">
                      {item.name}
                    </h3>
                    <span className="text-[0.68rem] text-muted-foreground">
                      {item.subCategory}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Main Shop Layout (Sidebar Filters + Products Grid) ─── */}
      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[280px_1fr]">
          {/* Left Sidebar Filters */}
          <aside className="space-y-8">
            {/* Category Filter */}
            <div className="rounded-2xl border border-border bg-white p-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="font-display text-xs font-bold uppercase tracking-[0.16em] text-graphite">
                  Categories
                </h3>
                {(selectedCategory !== "All Products" || selectedSubCategory) && (
                  <button
                    onClick={() => {
                      setSelectedCategory("All Products");
                      setSelectedSubCategory(null);
                    }}
                    className="text-[0.65rem] font-bold uppercase tracking-wider text-brand-blue hover:underline cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>

              <div className="mt-4 space-y-1.5">
                {CATEGORIES.map((cat) => {
                  const isActive = selectedCategory === cat;
                  const subs = cat !== "All Products" ? SUBCATEGORIES[cat] || [] : [];

                  return (
                    <div key={cat} className="space-y-1">
                      <button
                        onClick={() => {
                          setSelectedCategory(cat);
                          setSelectedSubCategory(null);
                        }}
                        className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                          isActive
                            ? "bg-brand-blue text-white"
                            : "text-muted-foreground hover:bg-steel-light hover:text-graphite"
                        }`}
                      >
                        <span>{cat}</span>
                        {cat !== "All Products" && (
                          <span className={`text-[0.68rem] ${isActive ? "text-white/80" : "text-muted-foreground/70"}`}>
                            {PRODUCTS.filter((p) => p.category === cat).length}
                          </span>
                        )}
                      </button>

                      {/* Subcategories accordion */}
                      {isActive && subs.length > 0 && (
                        <div className="ml-3 border-l-2 border-brand-blue/20 pl-2 space-y-1 py-1">
                          {subs.map((sub) => {
                            const isSubActive = selectedSubCategory === sub;
                            return (
                              <button
                                key={sub}
                                onClick={() => setSelectedSubCategory(isSubActive ? null : sub)}
                                className={`block w-full text-left rounded-md px-2.5 py-1.5 text-[0.74rem] transition-colors cursor-pointer ${
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
            </div>

            {/* Industry Filter */}
            <div className="rounded-2xl border border-border bg-white p-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="font-display text-xs font-bold uppercase tracking-[0.16em] text-graphite">
                  Industries Served
                </h3>
                {selectedIndustry && (
                  <button
                    onClick={() => setSelectedIndustry(null)}
                    className="text-[0.65rem] font-bold uppercase tracking-wider text-brand-blue hover:underline cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {ALL_INDUSTRIES.map((ind) => {
                  const active = selectedIndustry === ind;
                  return (
                    <button
                      key={ind}
                      onClick={() => setSelectedIndustry(active ? null : ind)}
                      className={`rounded-lg px-2.5 py-1 text-[0.7rem] font-semibold transition-all cursor-pointer ${
                        active
                          ? "bg-graphite text-white shadow-xs"
                          : "border border-border bg-steel-light/60 text-muted-foreground hover:border-brand-blue/40 hover:text-graphite"
                      }`}
                    >
                      {ind}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick OEM Capability Box */}
            <div className="rounded-2xl border border-brand-blue/20 bg-brand-blue/5 p-5">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-brand-blue" />
                <h4 className="font-display text-xs font-bold uppercase tracking-wider text-brand-blue">
                  Custom OEM Builds
                </h4>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Need customized pinouts, specific wire gauges, or custom length harnesses? We build exact application-specific solutions.
              </p>
              <button
                onClick={() => onNavigateHome("contact")}
                className="mt-3 block w-full rounded-xl bg-brand-blue py-2 text-center font-display text-[0.7rem] font-bold uppercase tracking-wider text-white hover:bg-graphite transition-colors cursor-pointer"
              >
                Request Custom Cable →
              </button>
            </div>
          </aside>

          {/* Right Product Grid */}
          <main>
            {/* Results bar */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4 mb-6">
              <div>
                <p className="text-sm font-semibold text-graphite">
                  Showing <span className="text-brand-blue font-bold">{filteredProducts.length}</span> Products
                  {selectedCategory !== "All Products" && <span> in <strong className="text-graphite">{selectedCategory}</strong></span>}
                  {selectedSubCategory && <span> &gt; <strong className="text-brand-blue">{selectedSubCategory}</strong></span>}
                  {selectedIndustry && <span> (Filtered for <strong>{selectedIndustry}</strong>)</span>}
                </p>
              </div>

              {(selectedCategory !== "All Products" || selectedSubCategory || selectedIndustry || searchQuery) && (
                <button
                  onClick={() => {
                    setSelectedCategory("All Products");
                    setSelectedSubCategory(null);
                    setSelectedIndustry(null);
                    setSearchQuery("");
                  }}
                  className="self-start sm:self-auto rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Reset All Filters
                </button>
              )}
            </div>

            {/* Products Listing */}
            {filteredProducts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-12 text-center">
                <svg className="mx-auto h-12 w-12 text-muted-foreground/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-4 font-display text-lg font-bold text-graphite">
                  No products matched your criteria
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Try adjusting your search terms or clearing category filters.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory("All Products");
                    setSelectedSubCategory(null);
                    setSelectedIndustry(null);
                    setSearchQuery("");
                  }}
                  className="mt-5 rounded-xl bg-graphite px-5 py-2.5 font-display text-xs font-bold uppercase tracking-wider text-white"
                >
                  View All Products
                </button>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {filteredProducts.map((product) => (
                  <article
                    key={product.id}
                    className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:border-brand-blue/50 hover:shadow-lg"
                  >
                    {/* Top image */}
                    <div className="relative h-48 w-full overflow-hidden bg-steel-light">
                      <img
                        src={product.image}
                        alt={product.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute left-3 top-3 flex flex-col gap-1.5">
                        <span className="rounded-md bg-graphite/85 px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-wider text-white backdrop-blur-xs">
                          {product.sku}
                        </span>
                      </div>
                      {product.featured && (
                        <span className="absolute right-3 top-3 rounded-md bg-brand-orange px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-wider text-white">
                          Featured
                        </span>
                      )}
                    </div>

                    {/* Card Content */}
                    <div className="flex flex-1 flex-col p-5">
                      <div className="flex items-center gap-2 text-[0.7rem] font-semibold text-brand-blue">
                        <span>{product.category}</span>
                        <span>•</span>
                        <span className="text-muted-foreground">{product.subCategory}</span>
                      </div>

                      <h3
                        onClick={() => setSelectedProduct(product)}
                        className="mt-2 font-display text-base font-bold leading-snug text-graphite group-hover:text-brand-blue transition-colors cursor-pointer"
                      >
                        {product.name}
                      </h3>

                      <p className="mt-2.5 text-[0.82rem] leading-relaxed text-muted-foreground line-clamp-2">
                        {product.description}
                      </p>

                      {/* Specs pills */}
                      <div className="mt-4 flex flex-wrap gap-1.5 border-t border-border/80 pt-3">
                        {product.specs.contacts && (
                          <span className="rounded-md bg-steel-light px-2 py-0.5 text-[0.65rem] font-medium text-graphite">
                            {product.specs.contacts}
                          </span>
                        )}
                        {product.specs.voltage && (
                          <span className="rounded-md bg-steel-light px-2 py-0.5 text-[0.65rem] font-medium text-graphite">
                            {product.specs.voltage}
                          </span>
                        )}
                        {product.specs.ipRating && (
                          <span className="rounded-md bg-green-50 text-green-700 px-2 py-0.5 text-[0.65rem] font-semibold">
                            {product.specs.ipRating}
                          </span>
                        )}
                        {product.specs.impedance && (
                          <span className="rounded-md bg-steel-light px-2 py-0.5 text-[0.65rem] font-medium text-graphite">
                            {product.specs.impedance}
                          </span>
                        )}
                      </div>

                      {/* Bottom Action buttons */}
                      <div className="mt-5 flex items-center justify-between gap-2 border-t border-border pt-4">
                        <button
                          type="button"
                          onClick={() => setSelectedProduct(product)}
                          className="text-[0.72rem] font-bold uppercase tracking-wider text-muted-foreground hover:text-brand-blue transition-colors cursor-pointer"
                        >
                          Specs &amp; Details →
                        </button>

                        <button
                          type="button"
                          onClick={() => addToRfq(product)}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-graphite px-3.5 py-2 font-display text-[0.68rem] font-bold uppercase tracking-wider text-white shadow-xs transition-all duration-300 hover:bg-brand-blue hover:shadow-md cursor-pointer"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
      </section>

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
      <footer className="bg-graphite-deep py-12 text-steel">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-white p-2 shadow-xs">
              <img src="/logo.png" alt="Qualitech" className="h-7 w-auto" />
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
