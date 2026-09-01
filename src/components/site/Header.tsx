import { useEffect, useState, useRef } from "react";

export interface NavChild {
  label: string;
  href: string;
  external?: boolean;
}

export interface NavItem {
  label: string;
  href: string;
  isPage?: boolean;
  children?: NavChild[];
}

export const NAV: NavItem[] = [
  { label: "Home", href: "#top" },
  { label: "About Us", href: "#about" },
  {
    label: "Products",
    href: "#products",
    isPage: true,
    children: [
      { label: "Amphenol", href: "https://www.amphenol-cs.com/product-series/gnss.html", external: true },
      { label: "Zolex", href: "https://zolex.in/product/", external: true },
      { label: "Custom Cable Assemblies", href: "#products" },
      { label: "Wire Harnesses", href: "#products" },
    ],
  },
  { label: "Contact Us", href: "#contact" },
];

export interface HeaderProps {
  onNavigate: (href: string, isPage?: boolean) => void;
  currentPage?: string;
}

export function Header({ onNavigate, currentPage = "home" }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [productsDropdown, setProductsDropdown] = useState(false);
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProductsDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "border-b border-border bg-background/90 backdrop-blur-md"
          : "border-b border-transparent bg-background/40 backdrop-blur-sm"
      }`}
    >
      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-4 sm:px-8 lg:py-5">
        <button
          onClick={() => onNavigate("#top")}
          className="flex min-w-0 items-center cursor-pointer text-left"
        >
          <img
            src="/logo.png"
            alt="Qualitech Connectronics Private Limited"
            className="h-8 w-auto shrink-0 sm:h-10"
            width={320}
            height={80}
          />
        </button>

        <nav className="hidden items-center gap-7 lg:flex">
          {NAV.map((item) => {
            if (item.children) {
              return (
                <div key={item.label} className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setProductsDropdown((v) => !v)}
                    className={`font-display text-[0.78rem] font-semibold uppercase tracking-[0.14em] transition-colors duration-300 hover:text-foreground cursor-pointer inline-flex items-center gap-1 ${
                      item.isPage && currentPage === "products"
                        ? "text-brand-blue font-bold border-b-2 border-brand-blue pb-0.5"
                        : "text-muted-foreground"
                    }`}
                  >
                    {item.label}
                    <svg className={`h-3 w-3 transition-transform duration-200 ${productsDropdown ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Desktop Dropdown */}
                  {productsDropdown && (
                    <div className="absolute left-1/2 top-full mt-3 -translate-x-1/2 w-72 overflow-hidden rounded-2xl border border-border bg-background shadow-[var(--shadow-panel)] animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="p-2">
                        <p className="px-3 py-1.5 text-[0.6rem] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                          Electronics Components
                        </p>
                        {item.children.filter(c => c.label === "Amphenol" || c.label === "Zolex").map((child) => (
                          child.external ? (
                            <a
                              key={child.label}
                              href={child.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-graphite transition-colors hover:bg-steel-light"
                              onClick={() => setProductsDropdown(false)}
                            >
                              <span>{child.label}</span>
                              <svg className="h-3.5 w-3.5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          ) : (
                            <button
                              key={child.label}
                              onClick={() => {
                                setProductsDropdown(false);
                                onNavigate(child.href, true);
                              }}
                              className="flex w-full items-center rounded-xl px-3 py-2.5 text-left text-sm font-medium text-graphite transition-colors hover:bg-steel-light cursor-pointer"
                            >
                              {child.label}
                            </button>
                          )
                        ))}

                        <div className="mx-3 my-1.5 border-t border-border" />

                        <p className="px-3 py-1.5 text-[0.6rem] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                          Cable Assemblies
                        </p>
                        {item.children.filter(c => c.label !== "Amphenol" && c.label !== "Zolex").map((child) => (
                          <button
                            key={child.label}
                            onClick={() => {
                              setProductsDropdown(false);
                              onNavigate(child.href, true);
                            }}
                            className="flex w-full items-center rounded-xl px-3 py-2.5 text-left text-sm font-medium text-graphite transition-colors hover:bg-steel-light cursor-pointer"
                          >
                            {child.label}
                          </button>
                        ))}

                        <div className="mx-3 my-1.5 border-t border-border" />

                        <button
                          onClick={() => {
                            setProductsDropdown(false);
                            onNavigate("#products", true);
                          }}
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-[0.72rem] font-bold uppercase tracking-wider text-brand-blue transition-colors hover:bg-brand-blue/5 cursor-pointer"
                        >
                          View All Products & Services →
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            }

            return (
              <button
                key={item.label}
                onClick={() => onNavigate(item.href, item.isPage)}
                className={`font-display text-[0.78rem] font-semibold uppercase tracking-[0.14em] transition-colors duration-300 hover:text-foreground cursor-pointer ${
                  item.isPage && currentPage === "products"
                    ? "text-brand-blue font-bold border-b-2 border-brand-blue pb-0.5"
                    : "text-muted-foreground"
                }`}
              >
                {item.label}
              </button>
            );
          })}
          <button
            onClick={() => onNavigate("#contact")}
            className="group inline-flex items-center gap-2 rounded-xl border border-graphite px-5 py-2.5 font-display text-[0.72rem] font-bold uppercase tracking-[0.18em] text-graphite transition-colors duration-300 hover:bg-graphite hover:text-background cursor-pointer"
          >
            Request a Quote
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </button>
        </nav>

        <button
          type="button"
          aria-label="Toggle navigation"
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 shrink-0 flex-col items-center justify-center gap-1.5 rounded-lg border border-border lg:hidden cursor-pointer"
        >
          <span
            className={`h-px w-5 bg-foreground transition-transform duration-300 ${open ? "translate-y-[3px] rotate-45" : ""}`}
          />
          <span
            className={`h-px w-5 bg-foreground transition-transform duration-300 ${open ? "-translate-y-[3px] -rotate-45" : ""}`}
          />
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`overflow-hidden rounded-b-2xl border-t border-border bg-background transition-[max-height] duration-500 lg:hidden ${
          open ? "max-h-[500px]" : "max-h-0"
        }`}
      >
        <nav className="flex flex-col px-5 py-2 sm:px-8">
          {NAV.map((item) => {
            if (item.children) {
              return (
                <div key={item.label}>
                  <button
                    onClick={() => setMobileProductsOpen((v) => !v)}
                    className="flex w-full items-center justify-between border-b border-border/70 py-3.5 text-left font-display text-sm font-semibold uppercase tracking-[0.14em] text-foreground cursor-pointer"
                  >
                    {item.label}
                    <svg className={`h-3.5 w-3.5 transition-transform duration-200 ${mobileProductsOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {mobileProductsOpen && (
                    <div className="border-b border-border/70 pb-2 pl-4">
                      <p className="py-1.5 text-[0.6rem] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                        Electronics Components
                      </p>
                      {item.children.filter(c => c.label === "Amphenol" || c.label === "Zolex").map((child) => (
                        child.external ? (
                          <a
                            key={child.label}
                            href={child.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 py-2 text-[0.82rem] text-muted-foreground hover:text-foreground"
                            onClick={() => { setOpen(false); setMobileProductsOpen(false); }}
                          >
                            {child.label}
                            <svg className="h-3 w-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        ) : (
                          <button
                            key={child.label}
                            onClick={() => {
                              setOpen(false);
                              setMobileProductsOpen(false);
                              onNavigate(child.href, true);
                            }}
                            className="block w-full py-2 text-left text-[0.82rem] text-muted-foreground hover:text-foreground cursor-pointer"
                          >
                            {child.label}
                          </button>
                        )
                      ))}
                      <p className="py-1.5 mt-1 text-[0.6rem] font-bold uppercase tracking-[0.2em] text-muted-foreground border-t border-border/50">
                        Cable Assemblies
                      </p>
                      {item.children.filter(c => c.label !== "Amphenol" && c.label !== "Zolex").map((child) => (
                        <button
                          key={child.label}
                          onClick={() => {
                            setOpen(false);
                            setMobileProductsOpen(false);
                            onNavigate(child.href, true);
                          }}
                          className="block w-full py-2 text-left text-[0.82rem] text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          {child.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <button
                key={item.label}
                onClick={() => {
                  setOpen(false);
                  onNavigate(item.href, item.isPage);
                }}
                className="border-b border-border/70 py-3.5 text-left font-display text-sm font-semibold uppercase tracking-[0.14em] text-foreground cursor-pointer"
              >
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
