export interface NavItem {
  label: string;
  href: string;
  isPage?: boolean;
  external?: boolean;
}

export const FOOTER_COMPANY: NavItem[] = [
  { label: "Home", href: "#top" },
  { label: "About Us", href: "#about" },
  { label: "Products", href: "#products", isPage: true },
  { label: "Contact Us", href: "#contact" },
];

export const FOOTER_PRODUCTS: NavItem[] = [
  { label: "Amphenol", href: "https://www.amphenol-cs.com/product-series/gnss.html", external: true },
  { label: "Zolex", href: "https://zolex.in/product/", external: true },
  { label: "Custom Cable Assemblies", href: "#products", isPage: true },
  { label: "Wire Harnesses", href: "#products", isPage: true },
];

export const FOOTER_INDUSTRIES = [
  "Telecommunications",
  "Power & Energy",
  "Defense",
  "Railways",
  "Industrial Automation",
  "Automotive",
];

export interface FooterProps {
  onNavigate?: (href: string, isPage?: boolean) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="w-full bg-graphite-deep text-steel">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-16">
        {/* Top area */}
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand + Address */}
          <div className="sm:col-span-2">
            <div className="inline-block rounded-xl bg-white p-2.5 shadow-md">
              <img
                src="/logo.png"
                alt="Qualitech Connectronics Private Limited"
                loading="lazy"
                width={280}
                height={70}
                className="h-8 w-auto"
              />
            </div>
            <p className="mt-4 font-display text-base sm:text-lg font-bold text-background leading-snug">
              Distribution of Electronics Components<br />+ Manufacturing of Cable Assemblies
            </p>
            <div className="mt-5 space-y-1.5 text-xs sm:text-sm text-steel">
              <p className="font-medium text-background/90">Qualitech Connectronics Private Limited</p>
              <p>Plot No. 37/B, Phase-V, IDA, Cherlapally,</p>
              <p>Hyderabad, Medchal-Malkajgiri,</p>
              <p>Telangana – 500051</p>
              <p className="mt-3">
                <a href="tel:+914027140004" className="transition-colors hover:text-background font-medium">
                  +91-40-27140004
                </a>
              </p>
              {/* TODO: Add Gopi Sir's contact number once provided by client */}
              <p className="mt-1.5">
                <a href="mailto:info@qualitechindia.in" className="transition-colors hover:text-background">
                  info@qualitechindia.in
                </a>
              </p>
            </div>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-display text-[0.7rem] font-bold uppercase tracking-[0.2em] text-background">
              Company
            </h3>
            <ul className="mt-4 sm:mt-5 space-y-2.5 sm:space-y-3">
              {FOOTER_COMPANY.map((item) => (
                <li key={item.label}>
                  <button
                    onClick={() => (onNavigate ? onNavigate(item.href, item.isPage) : undefined)}
                    className="text-xs sm:text-sm text-steel transition-colors duration-300 hover:text-background cursor-pointer text-left"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Products */}
          <div>
            <h3 className="font-display text-[0.7rem] font-bold uppercase tracking-[0.2em] text-background">
              Products & Services
            </h3>
            <ul className="mt-4 sm:mt-5 space-y-2.5 sm:space-y-3">
              <li className="text-[0.62rem] font-bold uppercase tracking-wider text-steel/60 mt-1">
                Electronics Components
              </li>
              {FOOTER_PRODUCTS.filter(p => p.label === "Amphenol" || p.label === "Zolex").map((item) => (
                <li key={item.label}>
                  {item.external ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs sm:text-sm text-steel transition-colors duration-300 hover:text-background inline-flex items-center gap-1"
                    >
                      {item.label}
                      <svg className="h-3 w-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  ) : (
                    <button
                      onClick={() => (onNavigate ? onNavigate(item.href, item.isPage) : undefined)}
                      className="text-xs sm:text-sm text-steel transition-colors duration-300 hover:text-background cursor-pointer text-left"
                    >
                      {item.label}
                    </button>
                  )}
                </li>
              ))}
              <li className="text-[0.62rem] font-bold uppercase tracking-wider text-steel/60 mt-3 pt-2 border-t border-background/10">
                Cable Assemblies
              </li>
              {FOOTER_PRODUCTS.filter(p => p.label !== "Amphenol" && p.label !== "Zolex").map((item) => (
                <li key={item.label}>
                  <button
                    onClick={() => (onNavigate ? onNavigate(item.href, item.isPage) : undefined)}
                    className="text-xs sm:text-sm text-steel transition-colors duration-300 hover:text-background cursor-pointer text-left"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Industries + CTA */}
          <div>
            <h3 className="font-display text-[0.7rem] font-bold uppercase tracking-[0.2em] text-background">
              Industries
            </h3>
            <ul className="mt-4 sm:mt-5 space-y-2.5 sm:space-y-3">
              {FOOTER_INDUSTRIES.map((item) => (
                <li key={item} className="text-xs sm:text-sm text-steel">
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-6 sm:mt-8 border-t border-background/10 pt-5">
              <p className="text-xs sm:text-sm font-medium text-steel">Need a custom cable solution?</p>
              <button
                onClick={() => (onNavigate ? onNavigate("#contact") : undefined)}
                className="mt-2.5 inline-flex font-display text-[0.72rem] font-bold uppercase tracking-[0.18em] text-brand-blue-soft transition-colors duration-300 hover:text-background cursor-pointer text-left"
              >
                Discuss Your Requirement →
              </button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col gap-3 border-t border-background/10 pt-6 sm:flex-row sm:items-center sm:justify-between text-xs text-steel">
          <p>
            © {new Date().getFullYear()} Qualitech Connectronics Private Limited. All rights reserved.
          </p>
          <p className="font-display text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-steel/80">
            Est. 1995 · Hyderabad, India
          </p>
        </div>
      </div>
    </footer>
  );
}
