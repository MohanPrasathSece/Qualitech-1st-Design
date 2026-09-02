import { useState, useEffect } from "react";
import { Reveal } from "@/components/site/reveal";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

interface ContactPageProps {
  onNavigate: (href: string, isPage?: boolean) => void;
}

export function ContactPage({ onNavigate }: ContactPageProps) {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    interest: "Custom Cable Assemblies",
    message: "",
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    setTimeout(() => {
      setFormSubmitted(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        company: "",
        interest: "Custom Cable Assemblies",
        message: "",
      });
    }, 4500);
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col w-full overflow-x-hidden">
      <Header onNavigate={onNavigate} currentPage="contact" />

      {/* ─── Hero Banner ─── */}
      <section className="bg-graphite-deep text-white px-5 sm:px-8 pt-28 sm:pt-36 pb-16 sm:pb-20 border-b border-border/20 relative overflow-hidden">
        <div className="absolute inset-0 hairline-grid opacity-25 pointer-events-none" />
        <div className="relative mx-auto max-w-7xl">
          <Reveal>
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-brand-yellow" />
              <span className="font-display text-[0.68rem] font-bold uppercase tracking-[0.22em] text-steel">
                Get In Touch
              </span>
            </div>
            <h1 className="mt-5 max-w-3xl font-display text-3xl font-bold leading-[1.15] text-white sm:text-4xl lg:text-5xl">
              Contact Qualitech Connectronics
            </h1>
            <p className="mt-5 max-w-2xl text-[0.95rem] leading-relaxed text-steel">
              Have an enquiry regarding Amphenol or Zolex components, or require a custom cable assembly quote? Our engineering team is ready to assist you.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ─── Contact Form & Information ─── */}
      <section className="py-20 lg:py-28 bg-white border-b border-border">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-14 lg:grid-cols-[1.1fr_0.9fr] items-start">
            {/* Form */}
            <Reveal>
              <div className="rounded-3xl border border-border bg-[#fafbfc] p-6 sm:p-10 shadow-sm">
                <span className="text-[0.68rem] font-bold uppercase tracking-wider text-brand-blue">
                  Online Enquiry Form
                </span>
                <h2 className="mt-2 font-display text-2xl font-bold text-graphite sm:text-3xl">
                  Send Us Your Requirement
                </h2>
                <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
                  Fill in your details and project requirements. We typically respond within 1 business day.
                </p>

                {formSubmitted ? (
                  <div className="mt-8 rounded-2xl border border-green-200 bg-green-50 p-8 text-center animate-in fade-in zoom-in-95 duration-300">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-500 text-white font-bold text-xl">
                      ✓
                    </div>
                    <h3 className="mt-4 font-display text-lg font-bold text-green-900">
                      Enquiry Received!
                    </h3>
                    <p className="mt-2 text-xs text-green-700 max-w-md mx-auto">
                      Thank you for contacting Qualitech Connectronics. Our engineering sales team will reach out to you shortly.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-semibold text-graphite mb-1.5">
                          Your Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="e.g. Ramesh Kumar"
                          className="w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-xs sm:text-sm text-graphite placeholder:text-muted-foreground/60 focus:border-brand-blue focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-graphite mb-1.5">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="ramesh@company.com"
                          className="w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-xs sm:text-sm text-graphite placeholder:text-muted-foreground/60 focus:border-brand-blue focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-semibold text-graphite mb-1.5">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+91 98765 43210"
                          className="w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-xs sm:text-sm text-graphite placeholder:text-muted-foreground/60 focus:border-brand-blue focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-graphite mb-1.5">
                          Company / Organization
                        </label>
                        <input
                          type="text"
                          value={formData.company}
                          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                          placeholder="Company Name"
                          className="w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-xs sm:text-sm text-graphite placeholder:text-muted-foreground/60 focus:border-brand-blue focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-graphite mb-1.5">
                        Product / Service Requirement *
                      </label>
                      <select
                        value={formData.interest}
                        onChange={(e) => setFormData({ ...formData, interest: e.target.value })}
                        className="w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-xs sm:text-sm text-graphite focus:border-brand-blue focus:outline-none"
                      >
                        <option value="Custom Cable Assemblies">Manufacturing — Custom Cable Assemblies</option>
                        <option value="Wire Harnesses">Manufacturing — Wire Harnesses</option>
                        <option value="Amphenol Distribution">Distribution — Amphenol Components</option>
                        <option value="Zolex Distribution">Distribution — Zolex Components</option>
                        <option value="OEM Turnkey Solution">Turnkey OEM Project Enquiry</option>
                        <option value="General Enquiry">General / Other Enquiries</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-graphite mb-1.5">
                        Message &amp; Technical Specifications
                      </label>
                      <textarea
                        rows={4}
                        required
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Please describe your application, required part numbers, pin count, estimated quantities, or timeline..."
                        className="w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-xs sm:text-sm text-graphite placeholder:text-muted-foreground/60 focus:border-brand-blue focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full rounded-xl bg-graphite py-3.5 font-display text-xs font-bold uppercase tracking-wider text-white hover:bg-brand-blue transition-colors shadow-sm cursor-pointer"
                    >
                      Submit Requirement →
                    </button>
                  </form>
                )}
              </div>
            </Reveal>

            {/* Direct Contact Details */}
            <div className="space-y-6">
              <Reveal delay={120}>
                <div className="rounded-3xl border border-border bg-[#fafbfc] p-6 sm:p-8">
                  <span className="text-[0.68rem] font-bold uppercase tracking-wider text-brand-orange">
                    Corporate Office &amp; Works
                  </span>
                  <h3 className="mt-2 font-display text-xl font-bold text-graphite">
                    Qualitech Connectronics Private Limited
                  </h3>
                  <div className="mt-4 space-y-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    <p className="font-semibold text-graphite">Manufacturing Unit:</p>
                    <p>Plot No. 37/B, Phase-V, IDA, Cherlapally,</p>
                    <p>Hyderabad, Medchal-Malkajgiri,</p>
                    <p>Telangana – 500051, India</p>
                  </div>

                  <div className="mt-6 border-t border-border pt-6 space-y-4">
                    <div>
                      <p className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">
                        Direct Phone
                      </p>
                      <a
                        href="tel:+914027140004"
                        className="mt-1 block font-display text-lg font-bold text-graphite hover:text-brand-blue transition-colors"
                      >
                        +91-40-27140004
                      </a>
                    </div>

                    <div>
                      <p className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">
                        Official Email
                      </p>
                      <a
                        href="mailto:info@qualitechindia.in"
                        className="mt-1 block font-display text-base font-bold text-brand-blue hover:underline"
                      >
                        info@qualitechindia.in
                      </a>
                    </div>
                  </div>
                </div>
              </Reveal>

              <Reveal delay={200}>
                <div className="rounded-3xl border border-border bg-graphite-deep text-white p-6 sm:p-8">
                  <h4 className="font-display text-base font-bold text-white">
                    Looking for Component Catalogs?
                  </h4>
                  <p className="mt-2 text-xs text-steel leading-relaxed">
                    Check our dedicated product sections or visit the official portals for Amphenol and Zolex.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={() => onNavigate("#amphenol", true)}
                      className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/20 transition-colors cursor-pointer"
                    >
                      Amphenol Page →
                    </button>
                    <button
                      onClick={() => onNavigate("#zolex", true)}
                      className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/20 transition-colors cursor-pointer"
                    >
                      Zolex Page →
                    </button>
                    <button
                      onClick={() => onNavigate("#manufacturing", true)}
                      className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/20 transition-colors cursor-pointer"
                    >
                      Manufacturing Page →
                    </button>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <Footer onNavigate={onNavigate} />
    </div>
  );
}
