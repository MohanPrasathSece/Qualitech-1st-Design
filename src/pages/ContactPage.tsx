import { useState, useEffect } from "react";
import { Instagram, Facebook, Linkedin } from "lucide-react";
import { Reveal } from "@/components/site/reveal";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { sendContactFormEmail } from "@/lib/emailService";
import { submitQuoteRequestToSupabase } from "@/lib/supabaseService";

interface ContactPageProps {
  onNavigate: (href: string, isPage?: boolean) => void;
}

export function ContactPage({ onNavigate }: ContactPageProps) {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<any>(null);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    interest: "Direct RFQ Requirement",
    message: "",
  });

  useEffect(() => {
    document.title = "Contact Qualitech Connectronics | Cable Assembly & Connector Solutions";
    const descTag = document.querySelector('meta[name="description"]');
    if (descTag) {
      descTag.setAttribute('content', 'Contact Qualitech Connectronics for custom cable assemblies, wire harnesses and electronic connectors. Get technical support, product enquiries and OEM solutions.');
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const fileInfo = attachedFile ? ` [Attached File: ${attachedFile.name} (${(attachedFile.size / 1024).toFixed(1)} KB)]` : "";
    const fullMessage = `${formData.message}${fileInfo}`;
    const dataSnapshot = { ...formData, message: fullMessage, fileName: attachedFile?.name };
    setSubmittedData(dataSnapshot);

    try {
      // 1. Save to Supabase RFQ / Contact database table (with file upload)
      const rfqResult = await submitQuoteRequestToSupabase({
        fullName: formData.name,
        email: formData.email,
        phone: formData.phone,
        companyName: formData.company,
        productCategory: formData.interest,
        technicalSpecs: fullMessage,
        estimatedQty: 100,
        drawingFile: attachedFile || undefined,
      });

      // 2. Dispatch email notification to admin sales (include attachment link if available)
      const attachmentNote = rfqResult.attachmentUrl
        ? `\n\n📎 Customer Attachment: ${rfqResult.attachmentUrl}`
        : "";
      await sendContactFormEmail({
        fullName: formData.name,
        email: formData.email,
        phone: formData.phone,
        companyName: formData.company,
        subject: `RFQ Enquiry from ${formData.name} - ${formData.company || "General OEM"}`,
        message: fullMessage + attachmentNote,
      });
    } catch (err) {
      console.warn("Contact form notification send note:", err);
    } finally {
      setIsSubmitting(false);
      setFormSubmitted(true);
      setAttachedFile(null);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col w-full overflow-x-hidden">
      <Header onNavigate={onNavigate} currentPage="contact" />

      {/* ─── Hero Banner ─── */}
      <section className="bg-graphite-deep text-white px-4 sm:px-8 pt-24 sm:pt-36 pb-12 sm:pb-20 border-b border-border/20 relative overflow-hidden w-full">
        <div className="absolute inset-0 hairline-grid opacity-25 pointer-events-none" />
        <div className="relative mx-auto max-w-7xl w-full min-w-0">
          <Reveal className="w-full min-w-0 max-w-full">
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-brand-yellow shrink-0" />
              <span className="font-display text-[0.65rem] sm:text-[0.68rem] font-bold uppercase tracking-[0.2em] text-steel">
                GET IN TOUCH
              </span>
            </div>
            <h1 className="mt-4 sm:mt-5 max-w-3xl font-display text-2xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl break-words">
              Contact Qualitech Connectronics
            </h1>
            <p className="mt-3 sm:mt-5 max-w-2xl text-[0.88rem] sm:text-[0.95rem] leading-relaxed text-steel">
              Have an enquiry about electronic connectors, Amphenol or Zolex components, or require a custom cable assembly quote? Our engineering team is ready to support your OEM requirements.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ─── Contact Form & Information ─── */}
      <section className="py-12 sm:py-20 lg:py-28 bg-white border-b border-border w-full overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-8 w-full min-w-0">
          {/* Top Row: Two Equal Size Tiles Side-by-Side */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 items-stretch w-full min-w-0">
            {/* Tile 1: Enquiry Form */}
            <Reveal className="w-full h-full flex flex-col min-w-0">
              <div className="rounded-2xl sm:rounded-3xl border border-border bg-[#fafbfc] p-6 sm:p-8 lg:p-10 shadow-sm w-full h-full flex flex-col justify-between min-w-0">
                <div>
                  <span className="text-[0.65rem] sm:text-[0.68rem] font-bold uppercase tracking-wider text-brand-blue">
                    ONLINE ENQUIRY FORM
                  </span>
                  <h2 className="mt-1.5 sm:mt-2 font-display text-xl sm:text-2xl lg:text-3xl font-bold text-graphite">
                    Request a Custom Cable Assembly &amp; Connector Quote
                  </h2>
                  <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-muted-foreground">
                    Share your cable assembly, wire harness or electronic connector requirements, including part numbers, specifications, quantities or technical drawings. Our team will review your requirement and get back to you.
                  </p>

                  {formSubmitted ? (
                    <div className="mt-6 sm:mt-8 rounded-xl sm:rounded-2xl border border-green-200 bg-green-50 p-5 sm:p-8 text-center animate-in fade-in zoom-in-95 duration-300 w-full min-w-0">
                      <div className="mx-auto flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-green-500 text-white shadow-md">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <h3 className="mt-4 font-display text-base sm:text-lg font-bold text-green-900">
                        Requirement Received!
                      </h3>
                      <p className="mt-2 text-xs text-green-700 max-w-md mx-auto">
                        Thank you for contacting Qualitech Connectronics. Your enquiry has been registered and routed to our applications engineering desk.
                      </p>

                      <div className="mt-6 flex items-center justify-center w-full">
                        <button
                          type="button"
                          onClick={() => {
                            setFormSubmitted(false);
                            setFormData({
                              name: "",
                              email: "",
                              phone: "",
                              company: "",
                              interest: "Custom Cable Assemblies",
                              message: "",
                            });
                          }}
                          className="w-full sm:w-auto rounded-xl border border-green-300 bg-white px-4 py-2.5 text-xs font-bold text-green-800 hover:bg-green-100/60 transition-colors cursor-pointer text-center"
                        >
                          Submit Another Requirement
                        </button>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="mt-6 space-y-4 w-full min-w-0">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 w-full min-w-0">
                        <div className="w-full min-w-0">
                          <label className="block text-xs font-semibold text-graphite mb-1.5">
                            Your Name *
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g. Ramesh Kumar"
                            className="w-full min-w-0 rounded-xl border border-border bg-white px-3.5 py-2.5 text-xs sm:text-sm text-graphite placeholder:text-muted-foreground/60 focus:border-brand-blue focus:outline-none"
                          />
                        </div>

                        <div className="w-full min-w-0">
                          <label className="block text-xs font-semibold text-graphite mb-1.5">
                            Email Address *
                          </label>
                          <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="ramesh@company.com"
                            className="w-full min-w-0 rounded-xl border border-border bg-white px-3.5 py-2.5 text-xs sm:text-sm text-graphite placeholder:text-muted-foreground/60 focus:border-brand-blue focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 w-full min-w-0">
                        <div className="w-full min-w-0">
                          <label className="block text-xs font-semibold text-graphite mb-1.5">
                            Phone Number *
                          </label>
                          <input
                            type="tel"
                            required
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="+91 98765 43210"
                            className="w-full min-w-0 rounded-xl border border-border bg-white px-3.5 py-2.5 text-xs sm:text-sm text-graphite placeholder:text-muted-foreground/60 focus:border-brand-blue focus:outline-none"
                          />
                        </div>

                        <div className="w-full min-w-0">
                          <label className="block text-xs font-semibold text-graphite mb-1.5">
                            Company / Organization
                          </label>
                          <input
                            type="text"
                            value={formData.company}
                            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                            placeholder="Company Name"
                            className="w-full min-w-0 rounded-xl border border-border bg-white px-3.5 py-2.5 text-xs sm:text-sm text-graphite placeholder:text-muted-foreground/60 focus:border-brand-blue focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="w-full min-w-0">
                        <label className="block text-xs font-semibold text-graphite mb-1.5">
                          Attach File (Datasheet, Technical Drawing or BOM)
                        </label>
                        <div className="relative w-full min-w-0">
                          <input
                            type="file"
                            id="rfq-file-upload"
                            onChange={handleFileChange}
                            className="hidden"
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.zip,.csv"
                          />
                          <label
                            htmlFor="rfq-file-upload"
                            className="flex items-center justify-between rounded-xl border border-dashed border-border bg-white p-3 text-xs text-muted-foreground hover:border-brand-blue hover:bg-brand-blue/5 transition-all cursor-pointer w-full min-w-0 gap-2"
                          >
                            <div className="flex items-center gap-2 min-w-0 overflow-hidden">
                              <svg className="h-5 w-5 text-brand-blue shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                              </svg>
                              {attachedFile ? (
                                <span className="font-semibold text-graphite truncate text-xs">
                                  {attachedFile.name} ({(attachedFile.size / 1024).toFixed(1)} KB)
                                </span>
                              ) : (
                                <span className="text-muted-foreground truncate text-[0.72rem] sm:text-xs">
                                  Attach drawing, BOM or spec
                                </span>
                              )}
                            </div>
                            {attachedFile ? (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setAttachedFile(null);
                                }}
                                className="text-xs font-bold text-red-500 hover:text-red-700 shrink-0"
                              >
                                Remove
                              </button>
                            ) : (
                              <span className="rounded-lg bg-steel-light px-2.5 py-1 text-[0.62rem] sm:text-[0.65rem] font-bold uppercase tracking-wider text-graphite shrink-0">
                                + Add
                              </span>
                            )}
                          </label>
                        </div>
                      </div>

                      <div className="w-full min-w-0">
                        <label className="block text-xs font-semibold text-graphite mb-1.5">
                          Message &amp; Technical Specifications
                        </label>
                        <textarea
                          rows={4}
                          required
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          placeholder="Please describe your application, required part numbers, pin count, estimated quantities, or timeline..."
                          className="w-full min-w-0 rounded-xl border border-border bg-white px-3.5 py-2.5 text-xs sm:text-sm text-graphite placeholder:text-muted-foreground/60 focus:border-brand-blue focus:outline-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full rounded-xl bg-graphite py-3.5 font-display text-xs font-bold uppercase tracking-wider text-white hover:bg-brand-blue transition-colors shadow-sm cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? (
                          <>
                            <svg className="h-4 w-4 animate-spin shrink-0" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                            </svg>
                            <span>Sending Notification...</span>
                          </>
                        ) : (
                          <span>Submit Requirement →</span>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </Reveal>

            {/* Tile 2: Corporate Office & Works (Matching Height & Proportions) */}
            <Reveal delay={120} className="w-full h-full flex flex-col min-w-0">
              <div className="rounded-2xl sm:rounded-3xl border border-border bg-[#fafbfc] p-6 sm:p-8 lg:p-10 shadow-sm w-full h-full flex flex-col justify-between min-w-0">
                <div>
                  <span className="text-[0.65rem] sm:text-[0.68rem] font-bold uppercase tracking-wider text-brand-orange">
                    CORPORATE OFFICE &amp; WORKS
                  </span>
                  <h2 className="mt-1.5 sm:mt-2 font-display text-xl sm:text-2xl lg:text-3xl font-bold text-graphite break-words">
                    Qualitech Connectronics Private Limited
                  </h2>
                  <p className="mt-1.5 text-xs sm:text-sm font-semibold text-brand-blue">
                    Cable Assembly &amp; Electronic Connector Solutions in Hyderabad
                  </p>

                  <div className="mt-6 rounded-2xl bg-white border border-border p-5 space-y-2 text-xs sm:text-sm text-muted-foreground leading-relaxed shadow-2xs">
                    <p className="font-bold text-graphite text-xs sm:text-sm uppercase tracking-wide">
                      Cherlapally Manufacturing Works &amp; HQ
                    </p>
                    <p className="text-graphite font-medium">Plot No. 37/B, Phase-V, IDA, Cherlapally,</p>
                    <p>Hyderabad, Medchal-Malkajgiri,</p>
                    <p>Telangana - 500051, India</p>
                    <p className="text-[0.72rem] text-muted-foreground pt-1 border-t border-border/60">
                      Coordinates: 17.4716° N, 78.6019° E · Phase-V Industrial Development Area
                    </p>
                  </div>

                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="rounded-2xl bg-white border border-border p-4 shadow-2xs">
                      <p className="text-[0.62rem] font-bold uppercase tracking-wider text-muted-foreground">
                        Direct Phone
                      </p>
                      <a
                        href="tel:+919849001484"
                        className="mt-1.5 block font-display text-base font-bold text-graphite hover:text-brand-blue transition-colors"
                      >
                        +91 98490 01484
                      </a>
                      <p className="text-[0.65rem] text-muted-foreground mt-0.5">Mon–Sat, 9:00 AM – 6:30 PM</p>
                    </div>

                    <div className="rounded-2xl bg-white border border-border p-4 shadow-2xs">
                      <p className="text-[0.62rem] font-bold uppercase tracking-wider text-muted-foreground">
                        Official RFQ Email
                      </p>
                      <a
                        href="mailto:info@qualitechindia.in"
                        className="mt-1.5 block font-display text-sm font-bold text-brand-blue hover:underline break-all"
                      >
                        info@qualitechindia.in
                      </a>
                      <p className="text-[0.65rem] text-muted-foreground mt-0.5">Engineering &amp; Sales Desk</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 border-t border-border pt-6">
                  <p className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground mb-3">
                    Official Verified Social Networks
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <a
                      href="https://www.linkedin.com/company/144969118/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-2.5 rounded-xl border border-sky-200/80 bg-white p-3 text-xs font-semibold text-slate-800 transition-all hover:bg-sky-50 hover:border-sky-300 hover:shadow-xs"
                      title="Connect with Qualitech on LinkedIn"
                    >
                      <Linkedin className="h-4 w-4 text-[#0a66c2] group-hover:scale-110 transition-transform shrink-0" />
                      <div className="flex flex-col text-left min-w-0">
                        <span className="leading-tight text-xs font-bold truncate">LinkedIn</span>
                        <span className="text-[0.62rem] text-slate-500 font-normal truncate">Qualitech Company</span>
                      </div>
                    </a>
                    <a
                      href="https://www.instagram.com/qualitechindia/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-2.5 rounded-xl border border-pink-200/80 bg-white p-3 text-xs font-semibold text-slate-800 transition-all hover:bg-pink-50 hover:border-pink-300 hover:shadow-xs"
                      title="Follow @qualitechindia on Instagram"
                    >
                      <Instagram className="h-4 w-4 text-[#e1306c] group-hover:scale-110 transition-transform shrink-0" />
                      <div className="flex flex-col text-left min-w-0">
                        <span className="leading-tight text-xs font-bold truncate">Instagram</span>
                        <span className="text-[0.62rem] text-slate-500 font-normal truncate">@qualitechindia</span>
                      </div>
                    </a>
                    <a
                      href="https://www.facebook.com/profile.php?id=61594403875090"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-2.5 rounded-xl border border-blue-200/80 bg-white p-3 text-xs font-semibold text-slate-800 transition-all hover:bg-blue-50 hover:border-blue-300 hover:shadow-xs"
                      title="Connect with Qualitech on Facebook"
                    >
                      <Facebook className="h-4 w-4 text-[#1877f2] group-hover:scale-110 transition-transform shrink-0" />
                      <div className="flex flex-col text-left min-w-0">
                        <span className="leading-tight text-xs font-bold truncate">Facebook</span>
                        <span className="text-[0.62rem] text-slate-500 font-normal truncate">Qualitech Profile</span>
                      </div>
                    </a>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Bottom Full-Width Horizontal Tile: Looking for Component Catalogs? */}
          <div className="mt-8 w-full">
            <Reveal delay={200} className="w-full">
              <div className="rounded-2xl sm:rounded-3xl border border-border bg-graphite-deep text-white p-6 sm:p-8 lg:p-10 w-full flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 shadow-sm">
                <div className="max-w-2xl">
                  <span className="text-[0.65rem] sm:text-[0.68rem] font-bold uppercase tracking-wider text-brand-orange">
                    COMPONENT CATALOGS &amp; PORTALS
                  </span>
                  <h2 className="mt-1 font-display text-xl sm:text-2xl font-bold text-white">
                    Looking for Component Catalogs?
                  </h2>
                  <p className="mt-2 text-xs sm:text-sm text-steel leading-relaxed">
                    Explore Qualitech's electronic connector and component solutions or visit the dedicated portals for Amphenol and Zolex products and our custom manufacturing services.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  <button
                    onClick={() => onNavigate("#amphenol", true)}
                    className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-all cursor-pointer hover:border-white/40"
                  >
                    Amphenol Page →
                  </button>
                  <button
                    onClick={() => onNavigate("#zolex", true)}
                    className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-all cursor-pointer hover:border-white/40"
                  >
                    Zolex Page →
                  </button>
                  <button
                    onClick={() => onNavigate("#manufacturing", true)}
                    className="inline-flex items-center gap-2 rounded-xl bg-brand-yellow/20 hover:bg-brand-yellow border border-brand-yellow/40 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-brand-yellow hover:text-graphite transition-all cursor-pointer"
                  >
                    Manufacturing Page →
                  </button>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ─── Short Location Section ─── */}
      <section className="py-14 sm:py-16 bg-[#fafbfc] border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-8 text-center max-w-3xl">
          <Reveal>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-graphite">
              Contact Our Cable Assembly &amp; Connector Team in Hyderabad
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Qualitech Connectronics operates from Phase-V, IDA, Cherlapally, Hyderabad, serving OEM and industrial customers with custom cable assemblies, wire harnesses and electronic connector solutions across India.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section className="py-16 sm:py-20 bg-graphite-deep text-white border-b border-border/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-8 text-center">
          <Reveal>
            <h2 className="font-display text-2xl sm:text-3xl font-bold">
              Need a Custom Cable Solution?
            </h2>
            <div className="mt-6">
              <button
                type="button"
                onClick={() => {
                  window.scrollTo({ top: 300, behavior: "smooth" });
                }}
                className="rounded-xl bg-brand-yellow px-8 py-3.5 font-display text-xs font-bold uppercase tracking-wider text-graphite-deep hover:bg-white transition-all shadow-md cursor-pointer"
              >
                Request a Custom Cable Quote →
              </button>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer onNavigate={onNavigate} />
    </div>
  );
}
