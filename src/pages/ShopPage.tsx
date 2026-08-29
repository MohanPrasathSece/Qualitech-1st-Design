import { useState, useMemo, useEffect } from "react";
import {
  PRODUCTS,
  CATEGORIES,
  SUBCATEGORIES,
  ALL_INDUSTRIES,
  Product,
  getProductPrice,
} from "@/data/products";
import { Footer } from "@/components/site/Footer";

interface ShopPageProps {
  onNavigateHome: (sectionId?: string) => void;
}

export function ShopPage({ onNavigateHome }: ShopPageProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All Products");
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"featured" | "name" | "price-low" | "price-high">("featured");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cartItems, setCartItems] = useState<{ product: Product; quantity: number }[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<"cart" | "checkout" | "success">("cart");
  const [addedToast, setAddedToast] = useState<string | null>(null);

  // Mobile drawer & nav states
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Form inputs for Checkout
  const [orderForm, setOrderForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    address: "",
    city: "",
    postalCode: "",
  });

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
    } else if (sortBy === "price-low") {
      result = [...result].sort((a, b) => getProductPrice(a) - getProductPrice(b));
    } else if (sortBy === "price-high") {
      result = [...result].sort((a, b) => getProductPrice(b) - getProductPrice(a));
    } else {
      result = [...result].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    return result;
  }, [selectedCategory, selectedSubCategory, selectedIndustry, inStockOnly, searchQuery, sortBy]);

  // Cart helper functions
  const addToCart = (product: Product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });

    // Show temporary feedback toast
    setAddedToast(product.name);
    setTimeout(() => setAddedToast(null), 2400);
  };

  const removeFromCart = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, quantity: qty } : item))
    );
  };

  const subtotal = useMemo(() => {
    return cartItems.reduce(
      (sum, item) => sum + getProductPrice(item.product) * item.quantity,
      0
    );
  }, [cartItems]);

  const totalItemsCount = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [cartItems]);

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutStep("success");
    setTimeout(() => {
      setCartItems([]);
      setCheckoutStep("cart");
      setIsCartOpen(false);
      setOrderForm({
        name: "",
        email: "",
        phone: "",
        company: "",
        address: "",
        city: "",
        postalCode: "",
      });
    }, 4000);
  };

  const clearAllFilters = () => {
    setSelectedCategory("All Products");
    setSelectedSubCategory(null);
    setSelectedIndustry(null);
    setInStockOnly(false);
    setSearchQuery("");
  };

  const activeFiltersCount =
    (selectedCategory !== "All Products" ? 1 : 0) +
    (selectedSubCategory ? 1 : 0) +
    (selectedIndustry ? 1 : 0) +
    (inStockOnly ? 1 : 0) +
    (searchQuery.trim() !== "" ? 1 : 0);

  return (
    <div className="min-h-screen bg-[#fafbfc] text-foreground font-sans flex flex-col w-full overflow-x-hidden">
      {/* ─── Added to Cart Toast ─── */}
      {addedToast && (
        <div className="fixed bottom-6 right-4 sm:right-6 z-50 flex items-center gap-3 rounded-2xl bg-graphite px-4 sm:px-5 py-3 text-white shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-300 max-w-[calc(100vw-2rem)]">
          <div className="flex h-6 w-6 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-full bg-green-500 text-white font-bold text-xs">
            ✓
          </div>
          <div className="text-xs min-w-0 flex-1">
            <p className="font-semibold truncate">Added to Cart</p>
            <p className="text-white/70 text-[0.7rem] truncate">{addedToast}</p>
          </div>
          <button
            onClick={() => {
              setAddedToast(null);
              setIsCartOpen(true);
            }}
            className="ml-2 shrink-0 rounded-lg bg-white/15 px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-wider text-white hover:bg-white/25 cursor-pointer"
          >
            View Cart
          </button>
        </div>
      )}

      {/* ─── Header Navigation ─── */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-white/95 backdrop-blur-md">
        <div className="flex items-center justify-between gap-3 px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger Button */}
            <button
              type="button"
              aria-label="Toggle navigation"
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="flex h-9 w-9 shrink-0 flex-col items-center justify-center gap-1.5 rounded-lg border border-border md:hidden cursor-pointer"
            >
              <span
                className={`h-px w-4 bg-foreground transition-transform duration-300 ${
                  mobileNavOpen ? "translate-y-[2.5px] rotate-45" : ""
                }`}
              />
              <span
                className={`h-px w-4 bg-foreground transition-transform duration-300 ${
                  mobileNavOpen ? "-translate-y-[2.5px] -rotate-45" : ""
                }`}
              />
            </button>

            {/* Brand Logo */}
            <button
              onClick={() => onNavigateHome()}
              className="flex items-center gap-2 cursor-pointer text-left shrink-0"
            >
              <img
                src="/logo.png"
                alt="Qualitech Connectronics"
                className="h-7 sm:h-9 w-auto shrink-0"
                width={320}
                height={80}
              />
            </button>
          </div>

          {/* Desktop Navigation */}
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
            <span className="font-display text-[0.78rem] font-bold uppercase tracking-[0.14em] text-brand-blue border-b-2 border-brand-blue pb-0.5">
              Shop
            </span>
            <button
              onClick={() => onNavigateHome("contact")}
              className="font-display text-[0.78rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
            >
              Contact Us
            </button>
          </nav>

          {/* Cart Button */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                setCheckoutStep("cart");
                setIsCartOpen(true);
              }}
              className="relative inline-flex items-center gap-2 rounded-xl bg-graphite px-3.5 sm:px-4 py-2 font-display text-[0.72rem] sm:text-xs font-bold uppercase tracking-wider text-white shadow-xs transition-all duration-200 hover:bg-brand-blue cursor-pointer"
            >
              <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span>Cart</span>
              {totalItemsCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-blue text-[0.68rem] font-black text-white">
                  {totalItemsCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Nav Menu */}
        {mobileNavOpen && (
          <div className="border-t border-border bg-white px-5 py-3 md:hidden animate-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col space-y-2">
              <button
                onClick={() => {
                  setMobileNavOpen(false);
                  onNavigateHome("top");
                }}
                className="py-2 text-left font-display text-xs font-semibold uppercase tracking-wider text-foreground hover:text-brand-blue"
              >
                Home
              </button>
              <button
                onClick={() => {
                  setMobileNavOpen(false);
                  onNavigateHome("about");
                }}
                className="py-2 text-left font-display text-xs font-semibold uppercase tracking-wider text-foreground hover:text-brand-blue"
              >
                About Us
              </button>
              <button
                onClick={() => {
                  setMobileNavOpen(false);
                  onNavigateHome("facilities");
                }}
                className="py-2 text-left font-display text-xs font-semibold uppercase tracking-wider text-foreground hover:text-brand-blue"
              >
                Facilities
              </button>
              <span className="py-2 text-left font-display text-xs font-bold uppercase tracking-wider text-brand-blue">
                Shop (Active)
              </span>
              <button
                onClick={() => {
                  setMobileNavOpen(false);
                  onNavigateHome("contact");
                }}
                className="py-2 text-left font-display text-xs font-semibold uppercase tracking-wider text-foreground hover:text-brand-blue"
              >
                Contact Us
              </button>
            </nav>
          </div>
        )}
      </header>

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

      {/* ─── FULL-SCREEN E-COMMERCE LAYOUT ─── */}
      <div className="flex-1 w-full flex flex-col lg:flex-row min-h-0">
        {/* ─── FLUSH LEFT SIDEBAR: Clean Desktop Sidebar / Mobile Modal Drawer ─── */}
        <aside className="hidden lg:block w-72 xl:w-76 shrink-0 border-r border-border/80 bg-white lg:sticky lg:top-[61px] lg:h-[calc(100vh-61px)] lg:overflow-y-auto z-30 p-5 lg:p-6 space-y-6">
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
              const count = cat === "All Products" ? PRODUCTS.length : PRODUCTS.filter((p) => p.category === cat).length;

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

                  {/* Subcategories (only active category) */}
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
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-steel-light"
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
                          selectedCategory === cat ? "bg-brand-blue text-white font-bold" : "text-graphite hover:bg-steel-light"
                        }`}
                      >
                        {cat}
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
                          selectedIndustry === ind ? "bg-graphite text-white" : "border border-border bg-white text-muted-foreground"
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

        {/* ─── MAIN EXPANSIVE PRODUCT SHOWCASE ─── */}
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
                placeholder="Search products or part numbers..."
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
                <strong className="text-graphite">{filteredProducts.length}</strong> items
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="rounded-lg border border-border bg-white px-2.5 py-1.5 text-xs font-semibold text-graphite focus:outline-none focus:ring-1 focus:ring-brand-blue cursor-pointer"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Clean, Non-overcomplicated Product Grid (Responsive: 1 col on phone -> 2 on tablet -> 3 on desktop -> 4 on wide) */}
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
                const price = getProductPrice(product);

                return (
                  <article
                    key={product.id}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-2xs transition-all duration-300 hover:-translate-y-1 hover:border-brand-blue/40 hover:shadow-md"
                  >
                    {/* Clean Product Image Container */}
                    <div
                      onClick={() => setSelectedProduct(product)}
                      className="relative h-44 sm:h-48 w-full overflow-hidden bg-steel-light/50 p-4 flex items-center justify-center cursor-pointer"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        loading="lazy"
                        className="h-full w-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
                      />
                      {product.featured && (
                        <span className="absolute left-3 top-3 rounded-full bg-brand-orange px-2.5 py-0.5 text-[0.62rem] font-bold uppercase tracking-wider text-white">
                          Featured
                        </span>
                      )}
                    </div>

                    {/* Body: Clean, Uncluttered, Modern E-commerce */}
                    <div className="flex flex-1 flex-col p-4 sm:p-5">
                      <span className="text-[0.68rem] font-semibold text-muted-foreground">
                        {product.subCategory}
                      </span>

                      <h3
                        onClick={() => setSelectedProduct(product)}
                        className="mt-1 font-display text-sm font-bold text-graphite group-hover:text-brand-blue transition-colors cursor-pointer line-clamp-2"
                        title={product.name}
                      >
                        {product.name}
                      </h3>

                      <p className="mt-1 text-[0.68rem] text-muted-foreground/80 font-mono">
                        SKU: {product.sku}
                      </p>

                      {/* Price & Add to Cart Button */}
                      <div className="mt-auto pt-4 border-t border-border/80 flex items-center justify-between gap-2 sm:gap-3">
                        <div>
                          <span className="text-[0.62rem] sm:text-[0.65rem] text-muted-foreground uppercase block font-semibold leading-none">
                            Price
                          </span>
                          <span className="font-display text-base sm:text-lg font-bold text-graphite">
                            ₹{price.toLocaleString()}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => addToCart(product)}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-graphite px-3.5 sm:px-4 py-2 sm:py-2.5 font-display text-[0.72rem] sm:text-xs font-bold uppercase tracking-wider text-white shadow-xs transition-all hover:bg-brand-blue hover:shadow-md cursor-pointer shrink-0"
                        >
                          <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                          </svg>
                          <span>Add to Cart</span>
                        </button>
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
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 sm:p-8 shadow-2xl">
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
                <span className="text-xs font-mono font-semibold text-brand-blue">
                  {selectedProduct.sku}
                </span>
                <h2 className="mt-1 font-display text-base sm:text-lg font-bold text-graphite">
                  {selectedProduct.name}
                </h2>
                <div className="mt-2.5">
                  <span className="font-display text-xl sm:text-2xl font-bold text-graphite">
                    ₹{getProductPrice(selectedProduct).toLocaleString()}
                  </span>
                  <span className="text-xs text-muted-foreground ml-2">per unit</span>
                </div>

                <p className="mt-3 text-xs leading-relaxed text-muted-foreground line-clamp-3 sm:line-clamp-none">
                  {selectedProduct.description}
                </p>

                <div className="mt-4 sm:mt-5">
                  <button
                    onClick={() => {
                      addToCart(selectedProduct);
                      setSelectedProduct(null);
                    }}
                    className="w-full rounded-xl bg-graphite py-3 font-display text-xs font-bold uppercase tracking-wider text-white hover:bg-brand-blue transition-colors cursor-pointer shadow-sm"
                  >
                    Add to Cart • ₹{getProductPrice(selectedProduct).toLocaleString()}
                  </button>
                </div>
              </div>
            </div>

            {/* Specifications list */}
            <div className="mt-5 sm:mt-6 border-t border-border pt-4 sm:pt-5">
              <h3 className="font-display text-xs font-bold uppercase tracking-wider text-graphite mb-2.5">
                Key Specifications
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
          </div>
        </div>
      )}

      {/* ─── E-COMMERCE CART & CHECKOUT DRAWER ─── */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs">
          <div className="relative flex h-full w-full max-w-md flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-border px-5 sm:px-6 py-4">
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <h3 className="font-display text-base font-bold text-graphite">
                  {checkoutStep === "cart" ? "Shopping Cart" : checkoutStep === "checkout" ? "Checkout" : "Order Complete"}
                </h3>
                <span className="rounded-full bg-steel-light px-2 py-0.5 text-xs font-bold text-graphite">
                  {totalItemsCount}
                </span>
              </div>

              <button
                onClick={() => setIsCartOpen(false)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-steel-light hover:text-foreground cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6">
              {checkoutStep === "success" ? (
                <div className="rounded-2xl border border-green-200 bg-green-50 p-6 sm:p-8 text-center my-auto">
                  <div className="mx-auto flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-green-500 text-white font-bold text-xl sm:text-2xl">
                    ✓
                  </div>
                  <h4 className="mt-4 font-display text-base sm:text-lg font-bold text-green-900">
                    Order Placed Successfully!
                  </h4>
                  <p className="mt-2 text-xs text-green-700 leading-relaxed">
                    Thank you for your order! Your confirmation and commercial invoice have been sent to your email.
                  </p>
                </div>
              ) : checkoutStep === "checkout" ? (
                /* Checkout Form */
                <form onSubmit={handleCheckoutSubmit} className="space-y-3.5 sm:space-y-4">
                  <div className="rounded-xl bg-steel-light/70 p-3 text-xs flex justify-between">
                    <span className="text-muted-foreground">Order Total ({totalItemsCount} items):</span>
                    <strong className="text-graphite font-display text-sm">₹{subtotal.toLocaleString()}</strong>
                  </div>

                  <h4 className="font-display text-xs font-bold uppercase tracking-wider text-graphite pt-1">
                    Shipping &amp; Contact Details
                  </h4>

                  <input
                    type="text"
                    required
                    placeholder="Full Name *"
                    value={orderForm.name}
                    onChange={(e) => setOrderForm({ ...orderForm, name: e.target.value })}
                    className="w-full rounded-xl border border-border px-3.5 py-2.5 text-xs sm:text-sm focus:border-brand-blue focus:outline-none"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="email"
                      required
                      placeholder="Email Address *"
                      value={orderForm.email}
                      onChange={(e) => setOrderForm({ ...orderForm, email: e.target.value })}
                      className="w-full rounded-xl border border-border px-3.5 py-2.5 text-xs sm:text-sm focus:border-brand-blue focus:outline-none"
                    />
                    <input
                      type="tel"
                      required
                      placeholder="Phone Number *"
                      value={orderForm.phone}
                      onChange={(e) => setOrderForm({ ...orderForm, phone: e.target.value })}
                      className="w-full rounded-xl border border-border px-3.5 py-2.5 text-xs sm:text-sm focus:border-brand-blue focus:outline-none"
                    />
                  </div>

                  <input
                    type="text"
                    placeholder="Company Name (Optional)"
                    value={orderForm.company}
                    onChange={(e) => setOrderForm({ ...orderForm, company: e.target.value })}
                    className="w-full rounded-xl border border-border px-3.5 py-2.5 text-xs sm:text-sm focus:border-brand-blue focus:outline-none"
                  />

                  <input
                    type="text"
                    required
                    placeholder="Delivery Address *"
                    value={orderForm.address}
                    onChange={(e) => setOrderForm({ ...orderForm, address: e.target.value })}
                    className="w-full rounded-xl border border-border px-3.5 py-2.5 text-xs sm:text-sm focus:border-brand-blue focus:outline-none"
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      placeholder="City *"
                      value={orderForm.city}
                      onChange={(e) => setOrderForm({ ...orderForm, city: e.target.value })}
                      className="w-full rounded-xl border border-border px-3.5 py-2.5 text-xs sm:text-sm focus:border-brand-blue focus:outline-none"
                    />
                    <input
                      type="text"
                      required
                      placeholder="PIN Code *"
                      value={orderForm.postalCode}
                      onChange={(e) => setOrderForm({ ...orderForm, postalCode: e.target.value })}
                      className="w-full rounded-xl border border-border px-3.5 py-2.5 text-xs sm:text-sm focus:border-brand-blue focus:outline-none"
                    />
                  </div>

                  <div className="pt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setCheckoutStep("cart")}
                      className="w-1/3 rounded-xl border border-border py-2.5 sm:py-3 text-xs font-semibold text-graphite hover:bg-steel-light cursor-pointer"
                    >
                      ← Back
                    </button>
                    <button
                      type="submit"
                      className="w-2/3 rounded-xl bg-brand-blue py-2.5 sm:py-3 font-display text-xs font-bold uppercase tracking-wider text-white hover:bg-graphite shadow-sm cursor-pointer"
                    >
                      Place Order • ₹{subtotal.toLocaleString()}
                    </button>
                  </div>
                </form>
              ) : (
                /* Cart Items List */
                <>
                  {cartItems.length === 0 ? (
                    <div className="py-16 text-center">
                      <svg className="mx-auto h-12 w-12 text-muted-foreground/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      <p className="mt-3 text-sm font-semibold text-graphite">Your cart is empty</p>
                      <p className="mt-1 text-xs text-muted-foreground">Add products from the catalog to see them here.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {cartItems.map(({ product, quantity }) => {
                        const price = getProductPrice(product);

                        return (
                          <div key={product.id} className="py-3.5 flex items-center gap-3">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="h-12 w-12 sm:h-14 sm:w-14 rounded-lg bg-steel-light object-contain p-1 shrink-0"
                            />

                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs font-bold text-graphite truncate">{product.name}</h4>
                              <p className="text-[0.68rem] text-muted-foreground font-mono">₹{price.toLocaleString()} each</p>

                              {/* Quantity controls */}
                              <div className="mt-2 flex items-center gap-2">
                                <div className="inline-flex items-center rounded-lg border border-border">
                                  <button
                                    onClick={() => updateQuantity(product.id, quantity - 1)}
                                    className="px-2 py-0.5 text-xs text-muted-foreground hover:text-graphite cursor-pointer"
                                  >
                                    -
                                  </button>
                                  <span className="px-2 text-xs font-bold text-graphite">{quantity}</span>
                                  <button
                                    onClick={() => updateQuantity(product.id, quantity + 1)}
                                    className="px-2 py-0.5 text-xs text-muted-foreground hover:text-graphite cursor-pointer"
                                  >
                                    +
                                  </button>
                                </div>

                                <button
                                  onClick={() => removeFromCart(product.id)}
                                  className="text-[0.68rem] text-destructive hover:underline cursor-pointer ml-auto"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <span className="font-display text-xs font-bold text-graphite">
                                ₹{(price * quantity).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Drawer Footer / Summary */}
            {checkoutStep === "cart" && cartItems.length > 0 && (
              <div className="border-t border-border p-5 sm:p-6 bg-[#fafbfc] space-y-3">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-graphite">₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Shipping:</span>
                  <span className="font-semibold text-green-700">Free</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-graphite border-t border-border/80 pt-2">
                  <span>Total:</span>
                  <span className="text-base text-brand-blue font-display">₹{subtotal.toLocaleString()}</span>
                </div>

                <button
                  onClick={() => setCheckoutStep("checkout")}
                  className="w-full rounded-xl bg-brand-blue py-3 font-display text-xs font-bold uppercase tracking-wider text-white hover:bg-graphite transition-colors shadow-sm cursor-pointer"
                >
                  Proceed to Checkout →
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── FULL CORPORATE FOOTER: Matching Landing Page ─── */}
      <Footer onNavigate={onNavigateHome} />
    </div>
  );
}
