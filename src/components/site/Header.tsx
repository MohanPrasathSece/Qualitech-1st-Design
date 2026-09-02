import { useEffect, useState, useRef } from "react";

export interface NavChild {
  label: string;
  href: string;
  external?: boolean;
  isPage?: boolean;
  description?: string;
  badge?: string;
}

export interface NavMainOption {
  id: "distribution" | "manufacturing";
  label: string;
  badge: string;
  badgeColor: string;
  description: string;
  children: NavChild[];
}

export interface NavItem {
  label: string;
  href: string;
  isPage?: boolean;
  dropdown?: boolean;
}

export const NAV: NavItem[] = [
  { label: "Home", href: "#top" },
  { label: "About Us", href: "#about-page", isPage: true },
  { label: "Products & Services", href: "#products", isPage: true, dropdown: true },
  { label: "Manufacturing", href: "#manufacturing", isPage: true },
  { label: "Contact Us", href: "#contact-page", isPage: true },
];

export const DROPDOWN_VERTICALS: NavMainOption[] = [
  {
    id: "distribution",
    label: "Distribution",
    badge: "Authorized",
    badgeColor: "bg-brand-blue text-white",
    description: "Distribution of Electronic Components",
    children: [
      {
        label: "Amphenol",
        href: "#amphenol",
        isPage: true,
        description: "Connectors, Antennas, RF & Fiber Solutions",
        badge: "Official Line",
      },
      {
        label: "Zolex",
        href: "#zolex",
        isPage: true,
        description: "Industrial Components & Interconnects",
        badge: "Official Line",
      },
    ],
  },
  {
    id: "manufacturing",
    label: "Manufacturing",
    badge: "In-House",
    badgeColor: "bg-brand-yellow text-graphite",
    description: "Manufacturing of Cable Assemblies",
    children: [
      {
        label: "Cable Assemblies & Harnesses",
        href: "#manufacturing",
        isPage: true,
        description: "Custom Wire Harnesses & OEM Capabilities",
        badge: "100% Tested",
      },
    ],
  },
];

export interface HeaderProps {
  onNavigate: (href: string, isPage?: boolean) => void;
  currentPage?: string;
}

export function Header({ onNavigate, currentPage = "home" }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [productsDropdown, setProductsDropdown] = useState(false);
  const [activeMainOption, setActiveMainOption] = useState<"distribution" | "manufacturing">("distribution");
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false);
  const [mobileDistOpen, setMobileDistOpen] = useState(true);
  const [mobileMfgOpen, setMobileMfgOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  const handleMouseEnterContainer = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setProductsDropdown(true);
  };

  const handleMouseLeaveContainer = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setProductsDropdown(false);
    }, 150);
  };

  const isProductsActive =
    currentPage === "products" ||
    currentPage === "amphenol" ||
    currentPage === "zolex" ||
    currentPage === "manufacturing";

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
            if (item.dropdown) {
              return (
                <div
                  key={item.label}
                  className="relative"
                  ref={dropdownRef}
                  onMouseEnter={handleMouseEnterContainer}
                  onMouseLeave={handleMouseLeaveContainer}
                >
                  <button
                    onClick={() => setProductsDropdown((v) => !v)}
                    className={`font-display text-[0.78rem] font-semibold uppercase tracking-[0.14em] transition-colors duration-300 hover:text-foreground cursor-pointer inline-flex items-center gap-1.5 ${
                      isProductsActive
                        ? "text-brand-blue font-bold border-b-2 border-brand-blue pb-0.5"
                        : "text-muted-foreground"
                    }`}
                  >
                    {item.label}
                    <svg
                      className={`h-3 w-3 transition-transform duration-200 ${
                        productsDropdown ? "rotate-180" : ""
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Desktop Dropdown with Hover Sub-menus */}
                  {productsDropdown && (
                    <div className="absolute left-1/2 top-full mt-3 -translate-x-1/2 w-[560px] overflow-hidden rounded-2xl border border-border bg-background shadow-[var(--shadow-panel)] animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                      <div className="grid grid-cols-[240px_1fr] divide-x divide-border">
                        {/* Left Column: 2 Main Options (Distribution & Manufacturing) with equal highlighting */}
                        <div className="p-3 bg-steel-light/30 flex flex-col gap-2">
                          <div className="px-3 pt-1 pb-1">
                            <p className="text-[0.6rem] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                              Select Business Vertical
                            </p>
                          </div>

                          {DROPDOWN_VERTICALS.map((vertical) => {
                            const isSelected = activeMainOption === vertical.id;
                            return (
                              <button
                                key={vertical.id}
                                onMouseEnter={() => setActiveMainOption(vertical.id)}
                                onClick={() => setActiveMainOption(vertical.id)}
                                className={`group flex flex-col text-left rounded-xl p-3 transition-all cursor-pointer border ${
                                  isSelected
                                    ? vertical.id === "distribution"
                                      ? "bg-white border-brand-blue shadow-xs"
                                      : "bg-white border-brand-yellow shadow-xs"
                                    : "bg-white/60 border-transparent hover:bg-white hover:border-border"
                                }`}
                              >
                                <div className="flex items-center justify-between w-full">
                                  <span
                                    className={`inline-block rounded-full px-2 py-0.5 text-[0.58rem] font-extrabold uppercase tracking-wider ${vertical.badgeColor}`}
                                  >
                                    {vertical.badge}
                                  </span>
                                  <svg
                                    className={`h-3.5 w-3.5 transition-transform duration-200 ${
                                      isSelected
                                        ? "translate-x-1 text-brand-blue"
                                        : "text-muted-foreground group-hover:translate-x-0.5"
                                    }`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2.5}
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                  </svg>
                                </div>
                                <span className="mt-2 font-display text-sm font-bold text-graphite">
                                  {vertical.label}
                                </span>
                                <span className="mt-0.5 text-[0.68rem] text-muted-foreground leading-snug">
                                  {vertical.description}
                                </span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Right Column: Subpages revealed on hover */}
                        <div className="p-3.5 bg-background flex flex-col justify-between">
                          <div>
                            <div className="px-2 pt-1 pb-2 flex items-center justify-between border-b border-border/70">
                              <p className="text-[0.62rem] font-bold uppercase tracking-[0.2em] text-brand-blue">
                                {activeMainOption === "distribution"
                                  ? "Distribution Subpages"
                                  : "Manufacturing Subpages"}
                              </p>
                              <span className="text-[0.6rem] text-muted-foreground">
                                {activeMainOption === "distribution" ? "2 Portals" : "Capabilities"}
                              </span>
                            </div>

                            <div className="mt-2.5 flex flex-col gap-2">
                              {DROPDOWN_VERTICALS.find(
                                (v) => v.id === activeMainOption
                              )?.children.map((sub) => (
                                <button
                                  key={sub.label}
                                  onClick={() => {
                                    setProductsDropdown(false);
                                    onNavigate(sub.href, sub.isPage);
                                  }}
                                  className="group flex flex-col text-left rounded-xl p-3 border border-border/60 bg-steel-light/20 transition-all hover:border-brand-blue hover:bg-white hover:shadow-xs cursor-pointer"
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <span
                                        className={`h-2 w-2 rounded-full ${
                                          sub.label === "Amphenol"
                                            ? "bg-[#004f9e]"
                                            : sub.label === "Zolex"
                                            ? "bg-brand-blue"
                                            : "bg-brand-yellow"
                                        }`}
                                      />
                                      <span className="font-display text-sm font-bold text-graphite group-hover:text-brand-blue transition-colors">
                                        {sub.label}
                                      </span>
                                    </div>
                                    <span className="text-[0.68rem] font-bold text-brand-blue opacity-0 group-hover:opacity-100 transition-opacity">
                                      View Page →
                                    </span>
                                  </div>
                                  <p className="mt-1 text-[0.72rem] text-muted-foreground pl-4">
                                    {sub.description}
                                  </p>
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="mt-4 pt-3 border-t border-border/70">
                            <button
                              onClick={() => {
                                setProductsDropdown(false);
                                onNavigate("#products", true);
                              }}
                              className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-graphite/5 px-3 py-2 text-center text-[0.7rem] font-bold uppercase tracking-wider text-brand-blue transition-colors hover:bg-brand-blue hover:text-white cursor-pointer"
                            >
                              <span>View Full Catalogue</span>
                              <span>→</span>
                            </button>
                          </div>
                        </div>
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
            className={`h-px w-5 bg-foreground transition-transform duration-300 ${
              open ? "translate-y-[3px] rotate-45" : ""
            }`}
          />
          <span
            className={`h-px w-5 bg-foreground transition-transform duration-300 ${
              open ? "-translate-y-[3px] -rotate-45" : ""
            }`}
          />
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`overflow-hidden rounded-b-2xl border-t border-border bg-background transition-[max-height] duration-500 lg:hidden ${
          open ? "max-h-[680px]" : "max-h-0"
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

          {/* Expandable Products & Services (Nested Distribution & Manufacturing) */}
          <div className="border-b border-border/70 py-1">
            <button
              onClick={() => setMobileProductsOpen((v) => !v)}
              className="flex w-full items-center justify-between py-2.5 text-left font-display text-sm font-semibold uppercase tracking-[0.14em] text-foreground cursor-pointer"
            >
              <span>Products &amp; Services</span>
              <svg
                className={`h-3.5 w-3.5 transition-transform duration-200 ${
                  mobileProductsOpen ? "rotate-180" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {mobileProductsOpen && (
              <div className="pb-3 pl-3 space-y-3">
                {/* Distribution Accordion */}
                <div className="rounded-xl border border-border bg-steel-light/30 p-2.5">
                  <button
                    onClick={() => setMobileDistOpen((v) => !v)}
                    className="flex w-full items-center justify-between text-left font-display text-xs font-bold uppercase tracking-wider text-graphite cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <span className="rounded-full bg-brand-blue px-2 py-0.5 text-[0.55rem] font-bold text-white uppercase">
                        Distribution
                      </span>
                      <span>Electronic Components</span>
                    </span>
                    <svg
                      className={`h-3 w-3 transition-transform ${mobileDistOpen ? "rotate-180" : ""}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {mobileDistOpen && (
                    <div className="mt-2 space-y-1.5 pl-2 border-l border-brand-blue/30 ml-1">
                      <button
                        onClick={() => {
                          setOpen(false);
                          setMobileProductsOpen(false);
                          onNavigate("#amphenol", true);
                        }}
                        className="block w-full py-1.5 text-left text-[0.8rem] font-medium text-foreground hover:text-brand-blue"
                      >
                        • Amphenol Page (Connectors &amp; Antennas)
                      </button>
                      <button
                        onClick={() => {
                          setOpen(false);
                          setMobileProductsOpen(false);
                          onNavigate("#zolex", true);
                        }}
                        className="block w-full py-1.5 text-left text-[0.8rem] font-medium text-foreground hover:text-brand-blue"
                      >
                        • Zolex Page (Industrial Components)
                      </button>
                    </div>
                  )}
                </div>

                {/* Manufacturing Accordion */}
                <div className="rounded-xl border border-border bg-steel-light/30 p-2.5">
                  <button
                    onClick={() => setMobileMfgOpen((v) => !v)}
                    className="flex w-full items-center justify-between text-left font-display text-xs font-bold uppercase tracking-wider text-graphite cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <span className="rounded-full bg-brand-yellow px-2 py-0.5 text-[0.55rem] font-bold text-graphite uppercase">
                        Manufacturing
                      </span>
                      <span>Cable Assemblies</span>
                    </span>
                    <svg
                      className={`h-3 w-3 transition-transform ${mobileMfgOpen ? "rotate-180" : ""}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {mobileMfgOpen && (
                    <div className="mt-2 space-y-1.5 pl-2 border-l border-brand-yellow/50 ml-1">
                      <button
                        onClick={() => {
                          setOpen(false);
                          setMobileProductsOpen(false);
                          onNavigate("#manufacturing", true);
                        }}
                        className="block w-full py-1.5 text-left text-[0.8rem] font-medium text-foreground hover:text-brand-blue"
                      >
                        • Custom Cable Assemblies &amp; Wire Harnesses
                      </button>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    setOpen(false);
                    setMobileProductsOpen(false);
                    onNavigate("#products", true);
                  }}
                  className="block w-full py-1.5 text-left text-[0.8rem] font-bold text-brand-blue pl-2"
                >
                  View Full Catalogue →
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

