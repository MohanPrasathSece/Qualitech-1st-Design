export interface NavItem {
  label: string;
  href: string;
  isPage?: boolean;
  external?: boolean;
}

export const FOOTER_COMPANY: NavItem[] = [
  { label: "Home", href: "#top" },
  { label: "About Us", href: "#about-page", isPage: true },
  { label: "Products & Services", href: "#products", isPage: true },
  { label: "Contact Us", href: "#contact-page", isPage: true },
];

export const FOOTER_PRODUCTS: NavItem[] = [
  { label: "Amphenol", href: "#amphenol", isPage: true },
  { label: "Zolex", href: "#zolex", isPage: true },
  { label: "Custom Cable Assemblies", href: "#manufacturing", isPage: true },
  { label: "Wire Harnesses", href: "#manufacturing", isPage: true },
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
            <div className="mt-5 space-y-3 text-xs sm:text-sm text-steel">
              <a
                href="https://maps.google.com/?q=Qualitech+Connectronics+Plot+No.+37/B,+Phase-V,+IDA,+Cherlapally,+Hyderabad,+Telangana+500051"
                target="_blank"
                rel="noopener noreferrer"
                className="group block text-steel hover:text-background transition-colors"
                title="Open address in Google Maps"
              >
                <div className="flex items-start gap-2">
                  <svg className="h-4.5 w-4.5 text-brand-yellow shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <p className="font-semibold text-background group-hover:text-brand-blue-soft transition-colors">
                      Qualitech Connectronics Pvt. Ltd.
                    </p>
                    <p className="text-steel/90 mt-0.5 text-xs leading-relaxed group-hover:underline">
                      Plot No. 37/B, Phase-V, IDA, Cherlapally, Hyderabad, Medchal-Malkajgiri, Telangana - 500051
                    </p>
                  </div>
                </div>
              </a>

              <div className="space-y-1.5 pt-1">
                <p>
                  <a href="tel:+919849001484" className="transition-colors hover:text-background font-medium inline-flex items-center gap-2">
                    <svg className="h-4 w-4 text-brand-blue-soft" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    +91 98490 01484
                  </a>
                </p>
                <p>
                  <a href="mailto:info@qualitechindia.in" className="transition-colors hover:text-background inline-flex items-center gap-2">
                    <svg className="h-4 w-4 text-brand-blue-soft" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    info@qualitechindia.in
                  </a>
                </p>
              </div>
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
