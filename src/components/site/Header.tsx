import { useEffect, useState, useRef } from "react";

export interface NavChild {
  label: string;
  href: string;
  external?: boolean;
  isPage?: boolean;
}

export interface NavItem {
  label: string;
  href: string;
  isPage?: boolean;
  children?: NavChild[];
}

export const NAV: NavItem[] = [
  { label: "Home", href: "#top" },
  { label: "About Us", href: "#about-page", isPage: true },
  {
    label: "Products & Services",
    href: "#products",
    isPage: true,
    children: [
      { label: "Amphenol (Components & Antennas)", href: "#amphenol", isPage: true },
      { label: "Zolex (Official Portal)", href: "https://zolex.in/product/", external: true },
      { label: "Manufacturing (Cable Assemblies)", href: "#manufacturing", isPage: true },
    ],
  },
  { label: "Manufacturing", href: "#manufacturing", isPage: true },
  { label: "Contact Us", href: "#contact-page", isPage: true },
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
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 border-b border-border bg-white/95 backdrop-blur-md ${
        scrolled ? "shadow-sm" : "shadow-xs"
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
                    className={`font-display text-[0.78rem] font-semibold uppercase tracking-[0.14em] transition-colors duration-300 hover:text-foreground cursor-pointer inline-flex items-center gap-1.5 ${
                      item.isPage && (currentPage === "products" || currentPage === "amphenol" || currentPage === "manufacturing")
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
                    <div className="absolute left-1/2 top-full mt-3 -translate-x-1/2 w-80 overflow-hidden rounded-2xl border border-border bg-background shadow-[var(--shadow-panel)] animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="p-3">
                        <div className="px-3 py-1.5 flex items-center justify-between">
                          <p className="text-[0.62rem] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                            Distribution of Components
                          </p>
                          <span className="text-[0.6rem] text-brand-blue font-semibold uppercase">Authorized</span>
                        </div>

                        {/* Amphenol Page Link */}
                        <button
                          onClick={() => {
                            setProductsDropdown(false);
                            onNavigate("#amphenol", true);
                          }}
                          className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-medium text-graphite transition-colors hover:bg-steel-light cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-[#004f9e]" />
                            <span className="font-semibold">Amphenol Page</span>
                          </div>
                          <span className="text-[0.68rem] text-brand-blue font-bold">Details →</span>
                        </button>

                        {/* Zolex External Link */}
                        <a
                          href="https://zolex.in/product/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-graphite transition-colors hover:bg-steel-light"
                          onClick={() => setProductsDropdown(false)}
                        >
                          <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-brand-blue" />
                            <span className="font-semibold">Zolex Products</span>
                          </div>
                          <svg className="h-3.5 w-3.5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>

                        <div className="mx-3 my-2 border-t border-border" />

                        <div className="px-3 py-1.5 flex items-center justify-between">
                          <p className="text-[0.62rem] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                            Manufacturing — Qualitech
                          </p>
                          <span className="text-[0.6rem] text-brand-yellow font-semibold uppercase">In-House</span>
                        </div>

                        {/* Manufacturing Page Link */}
                        <button
                          onClick={() => {
                            setProductsDropdown(false);
                            onNavigate("#manufacturing", true);
                          }}
                          className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-medium text-graphite transition-colors hover:bg-steel-light cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-brand-yellow" />
                            <span className="font-semibold">Manufacturing Capabilities</span>
                          </div>
                          <span className="text-[0.68rem] text-brand-yellow font-bold">Details →</span>
                        </button>

                        <div className="mx-3 my-2 border-t border-border" />

                        <button
                          onClick={() => {
                            setProductsDropdown(false);
                            onNavigate("#products", true);
                          }}
                          className="flex w-full items-center justify-center gap-2 rounded-xl bg-graphite/5 px-3 py-2.5 text-center text-[0.72rem] font-bold uppercase tracking-wider text-brand-blue transition-colors hover:bg-brand-blue hover:text-white cursor-pointer"
                        >
                          View Full Products & Services Catalogue →
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            }

            const isActive =
              (item.href === "#top" && currentPage === "home") ||
              (item.href === "#about-page" && currentPage === "about") ||
              (item.href === "#manufacturing" && currentPage === "manufacturing") ||
              (item.href === "#contact-page" && currentPage === "contact");

            return (
              <button
                key={item.label}
                onClick={() => onNavigate(item.href, item.isPage)}
                className={`font-display text-[0.78rem] font-semibold uppercase tracking-[0.14em] transition-colors duration-300 hover:text-foreground cursor-pointer ${
                  isActive
                    ? "text-brand-blue font-bold border-b-2 border-brand-blue pb-0.5"
                    : "text-muted-foreground"
                }`}
              >
                {item.label}
              </button>
            );
          })}
          <button
            onClick={() => onNavigate("#contact-page", true)}
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
          open ? "max-h-[560px]" : "max-h-0"
        }`}
      >
        <nav className="flex flex-col px-5 py-2 sm:px-8">
          <button
            onClick={() => {
              setOpen(false);
              onNavigate("#top");
            }}
            className="border-b border-border/70 py-3 text-left font-display text-sm font-semibold uppercase tracking-[0.14em] text-foreground"
          >
            Home
          </button>
          <button
            onClick={() => {
              setOpen(false);
              onNavigate("#about-page", true);
            }}
            className="border-b border-border/70 py-3 text-left font-display text-sm font-semibold uppercase tracking-[0.14em] text-foreground"
          >
            About Us
          </button>

          {/* Expandable Products & Services */}
          <div>
            <button
              onClick={() => setMobileProductsOpen((v) => !v)}
              className="flex w-full items-center justify-between border-b border-border/70 py-3 text-left font-display text-sm font-semibold uppercase tracking-[0.14em] text-foreground cursor-pointer"
            >
              <span>Products &amp; Services</span>
              <svg className={`h-3.5 w-3.5 transition-transform duration-200 ${mobileProductsOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {mobileProductsOpen && (
              <div className="border-b border-border/70 pb-2 pl-4">
                <button
                  onClick={() => {
                    setOpen(false);
                    setMobileProductsOpen(false);
                    onNavigate("#amphenol", true);
                  }}
                  className="block w-full py-2 text-left text-[0.82rem] font-medium text-foreground hover:text-brand-blue"
                >
                  Amphenol Page (Connectors &amp; Antennas)
                </button>
                <a
                  href="https://zolex.in/product/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 py-2 text-[0.82rem] font-medium text-foreground hover:text-brand-blue"
                  onClick={() => { setOpen(false); setMobileProductsOpen(false); }}
                >
                  <span>Zolex (Official Portal)</span>
                  <svg className="h-3 w-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
                <button
                  onClick={() => {
                    setOpen(false);
                    setMobileProductsOpen(false);
                    onNavigate("#manufacturing", true);
                  }}
                  className="block w-full py-2 text-left text-[0.82rem] font-medium text-foreground hover:text-brand-blue"
                >
                  Manufacturing (Cable Assemblies)
                </button>
                <button
                  onClick={() => {
                    setOpen(false);
                    setMobileProductsOpen(false);
                    onNavigate("#products", true);
                  }}
                  className="block w-full py-2 text-left text-[0.82rem] font-bold text-brand-blue"
                >
                  Full Products Catalogue →
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              setOpen(false);
              onNavigate("#manufacturing", true);
            }}
            className="border-b border-border/70 py-3 text-left font-display text-sm font-semibold uppercase tracking-[0.14em] text-foreground"
          >
            Manufacturing
          </button>

          <button
            onClick={() => {
              setOpen(false);
              onNavigate("#contact-page", true);
            }}
            className="border-b border-border/70 py-3 text-left font-display text-sm font-semibold uppercase tracking-[0.14em] text-foreground"
          >
            Contact Us
          </button>
        </nav>
      </div>
    </header>
  );
}
