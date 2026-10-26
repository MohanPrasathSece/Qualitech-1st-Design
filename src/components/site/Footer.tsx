import { Instagram, Facebook, Linkedin } from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  isPage?: boolean;
  external?: boolean;
}

export const FOOTER_COMPANY: NavItem[] = [
  { label: "Home", href: "#top" },
  { label: "About Us", href: "#about-page", isPage: true },
  { label: "Facilities & Infrastructure", href: "#facilities", isPage: true },
  { label: "Contact Us", href: "#contact-page", isPage: true },
];

export const FOOTER_CAPABILITIES: NavItem[] = [
  { label: "Custom Cable Assemblies", href: "#facilities", isPage: true },
  { label: "Wire Harnesses", href: "#facilities", isPage: true },
  { label: "Automated Cut & Strip", href: "#facilities", isPage: true },
  { label: "Cirris Electrical Testing", href: "#facilities", isPage: true },
  { label: "Plant Machinery Infrastructure", href: "#facilities", isPage: true },
];

export const FOOTER_INDUSTRIES = [
  "Electric Vehicles (EV)",
  "White Goods",
  "Consumer Electronics",
  "Telecommunications",
  "Power & Energy",
  "Defense",
  "Railways",
  "Industrial Automation",
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
              Distribution of Electronics Connectors<br />+ Manufacturing of Cable Assemblies
            </p>
            <div className="mt-5 space-y-3.5 text-sm sm:text-base text-steel">
              <a
                href="https://maps.google.com/?q=Qualitech+Connectronics+Plot+No.+37/B,+Phase-V,+IDA,+Cherlapally,+Hyderabad,+Telangana+500051"
                target="_blank"
                rel="noopener noreferrer"
                className="group block text-steel hover:text-background transition-colors"
                title="Open address in Google Maps"
              >
                <div className="flex items-start gap-2.5">
                  <svg className="h-5 w-5 text-brand-yellow shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <p className="font-semibold text-background group-hover:text-brand-blue-soft transition-colors text-sm sm:text-base">
                      Qualitech Connectronics Pvt. Ltd.
                    </p>
                    <p className="text-steel/90 mt-1 text-sm sm:text-base leading-relaxed group-hover:underline">
                      Plot No. 37/B, Phase-V, IDA, Cherlapally, Hyderabad, Medchal-Malkajgiri, Telangana - 500051
                    </p>
                  </div>
                </div>
              </a>

              <div className="space-y-2 pt-1">
                <p>
                  <a href="tel:+919849001484" className="transition-colors hover:text-background font-medium inline-flex items-center gap-2.5 text-sm sm:text-base">
                    <svg className="h-4.5 w-4.5 text-brand-blue-soft" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    +91 98490 01484
                  </a>
                </p>
                <p>
                  <a href="mailto:info@qualitechindia.in" className="transition-colors hover:text-background inline-flex items-center gap-2.5 text-sm sm:text-base">
                    <svg className="h-4.5 w-4.5 text-brand-blue-soft" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    info@qualitechindia.in
                  </a>
                </p>
              </div>

              {/* Social Profiles */}
              <div className="pt-2">
                <p className="font-display text-[0.68rem] font-bold uppercase tracking-[0.18em] text-background/80 mb-2.5">
                  Follow Us
                </p>
                <div className="flex flex-wrap items-center gap-2.5">
                  <a
                    href="https://www.linkedin.com/company/144969118/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-2 rounded-lg bg-white/5 border border-white/10 px-3 py-1.5 text-xs font-semibold text-steel transition-all duration-200 hover:border-[#0a66c2]/50 hover:bg-[#0a66c2]/15 hover:text-background"
                    title="Follow Qualitech on LinkedIn"
                    aria-label="Qualitech on LinkedIn"
                  >
                    <Linkedin className="h-4 w-4 text-[#0a66c2] group-hover:scale-110 transition-transform" />
                    <span>LinkedIn</span>
                  </a>
                  <a
                    href="https://www.instagram.com/qualitechindia/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-2 rounded-lg bg-white/5 border border-white/10 px-3 py-1.5 text-xs font-semibold text-steel transition-all duration-200 hover:border-pink-500/50 hover:bg-[#e1306c]/15 hover:text-background"
                    title="Follow Qualitech on Instagram"
                    aria-label="Instagram @qualitechindia"
                  >
                    <Instagram className="h-4 w-4 text-[#e1306c] group-hover:scale-110 transition-transform" />
                    <span>Instagram</span>
                  </a>
                  <a
                    href="https://www.facebook.com/profile.php?id=61594403875090"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-2 rounded-lg bg-white/5 border border-white/10 px-3 py-1.5 text-xs font-semibold text-steel transition-all duration-200 hover:border-blue-500/50 hover:bg-[#1877f2]/15 hover:text-background"
                    title="Follow Qualitech on Facebook"
                    aria-label="Qualitech on Facebook"
                  >
                    <Facebook className="h-4 w-4 text-[#1877f2] group-hover:scale-110 transition-transform" />
                    <span>Facebook</span>
                  </a>
                </div>
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

          {/* Capabilities */}
          <div>
            <h3 className="font-display text-[0.7rem] font-bold uppercase tracking-[0.2em] text-background">
              Capabilities
            </h3>
            <ul className="mt-4 sm:mt-5 space-y-2.5 sm:space-y-3">
              {FOOTER_CAPABILITIES.map((item) => (
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
                onClick={() => (onNavigate ? onNavigate("#contact-page", true) : undefined)}
                className="mt-2.5 inline-flex font-display text-[0.72rem] font-bold uppercase tracking-[0.18em] text-brand-blue-soft transition-colors duration-300 hover:text-background cursor-pointer text-left"
              >
                Discuss Your Requirement →
              </button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col gap-4 border-t border-background/10 pt-6 sm:flex-row sm:items-center sm:justify-between text-xs text-steel">
          <p>
            © {new Date().getFullYear()} Qualitech Connectronics Private Limited. All rights reserved.
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs">
            <button
              onClick={() => onNavigate?.("#privacy", true)}
              className="text-steel hover:text-background transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <span className="text-steel/40">•</span>
            <button
              onClick={() => onNavigate?.("#terms", true)}
              className="text-steel hover:text-background transition-colors cursor-pointer"
            >
              Terms of Service
            </button>
            <span className="text-steel/40">•</span>
            <button
              onClick={() => onNavigate?.("#admin", true)}
              className="text-steel/60 hover:text-brand-blue-soft transition-colors cursor-pointer"
              title="Staff / Admin Console"
            >
              Admin Portal
            </button>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://www.linkedin.com/company/144969118/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-steel hover:text-[#0a66c2] transition-colors p-1"
              aria-label="Qualitech on LinkedIn"
              title="LinkedIn"
            >
              <Linkedin className="h-4 w-4" />
            </a>
            <a
              href="https://www.instagram.com/qualitechindia/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-steel hover:text-[#e1306c] transition-colors p-1"
              aria-label="Instagram @qualitechindia"
              title="Instagram @qualitechindia"
            >
              <Instagram className="h-4 w-4" />
            </a>
            <a
              href="https://www.facebook.com/profile.php?id=61594403875090"
              target="_blank"
              rel="noopener noreferrer"
              className="text-steel hover:text-[#1877f2] transition-colors p-1"
              aria-label="Qualitech on Facebook"
              title="Facebook"
            >
              <Facebook className="h-4 w-4" />
            </a>
            <span className="text-steel/40 hidden sm:inline">•</span>
            <p className="font-display text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-steel/80">
              Est. 1995 · Hyderabad, India
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
