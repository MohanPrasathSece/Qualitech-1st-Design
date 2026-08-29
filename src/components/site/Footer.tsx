export interface NavItem {
  label: string;
  href: string;
  isPage?: boolean;
}

export const FOOTER_COMPANY: NavItem[] = [
  { label: "Home", href: "#top" },
  { label: "About Us", href: "#about" },
  { label: "Facilities", href: "#facilities" },
  { label: "Shop", href: "#products", isPage: true },
  { label: "Contact Us", href: "#contact" },
];

export const FOOTER_PRODUCTS = [
  "DSUB Connectors",
  "DSUB Accessories",
  "DIN (EURO)",
  "IDC (FRC)",
  "HARTING DIN (EURO)",
  "Cable Assemblies",
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
              Precision Connections.<br />Engineered for Performance.
            </p>
            <div className="mt-5 space-y-1.5 text-xs sm:text-sm text-steel">
              <p>LIG B-279, Dr. A S Rao Nagar,</p>
              <p>ECIL Post, Hyderabad – 500 062</p>
              <p className="mt-3">
                <a href="tel:+914027140004" className="transition-colors hover:text-background font-medium">
                  +91-40-27140004
                </a>
              </p>
              <p>
                <span className="text-steel/60">+91-40-27140005 (Fax)</span>
              </p>
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
              Products
            </h3>
            <ul className="mt-4 sm:mt-5 space-y-2.5 sm:space-y-3">
              {FOOTER_PRODUCTS.map((item) => (
                <li key={item} className="text-xs sm:text-sm text-steel">
                  {item}
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
                Request a Quote →
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
