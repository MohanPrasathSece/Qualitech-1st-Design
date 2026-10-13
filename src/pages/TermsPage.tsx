import { useEffect } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

interface TermsPageProps {
  onNavigate: (href: string, isPage?: boolean) => void;
}

export function TermsPage({ onNavigate }: TermsPageProps) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const sections = [
    {
      title: "1. Acceptance of Terms",
      content: [
        "By accessing or using the Qualitech Connectronics website and online catalogue, you agree to be bound by these Terms of Service.",
        "If you do not agree to these terms, please do not use our website or services.",
        "These terms apply to all visitors, users, and customers of our website.",
      ],
    },
    {
      title: "2. Products and Services",
      content: [
        "Qualitech Connectronics provides electronics component distribution (Amphenol, Zolex, FCI) and custom cable assembly manufacturing services.",
        "All product descriptions, specifications, and pricing are provided for informational purposes and are subject to change without notice.",
        "Stock availability shown on the website is indicative and confirmed upon order processing.",
        "We reserve the right to refuse or cancel any order at our discretion.",
      ],
    },
    {
      title: "3. Pricing and Payment",
      content: [
        "All prices listed are in Indian Rupees (INR) and are exclusive of GST unless stated otherwise.",
        "Prices are subject to change based on market conditions, manufacturer price revisions, and currency fluctuations.",
        "Payment terms for B2B orders are mutually agreed upon prior to order confirmation.",
        "For online transactions, payment must be received in full before dispatch of goods.",
      ],
    },
    {
      title: "4. Orders and Enquiries",
      content: [
        "Submitting an enquiry form does not constitute a binding order. Orders are confirmed only upon written acknowledgement from Qualitech.",
        "Custom cable assembly orders require a formal Purchase Order and may require an advance payment.",
        "Minimum order quantities (MOQ) may apply for certain products.",
        "Lead times stated are estimates and not guaranteed delivery dates.",
      ],
    },
    {
      title: "5. Shipping and Delivery",
      content: [
        "Shipping charges, if applicable, will be communicated at the time of order confirmation.",
        "Risk of loss and damage passes to the buyer upon delivery to the carrier.",
        "Qualitech is not responsible for delays caused by courier partners, customs, or force majeure events.",
        "Claims for damaged or missing goods must be raised within 48 hours of receipt.",
      ],
    },
    {
      title: "6. Returns and Refunds",
      content: [
        "Returns are accepted only for items that are defective, damaged in transit, or incorrectly supplied.",
        "Return requests must be raised within 7 days of receipt with photographic evidence.",
        "Custom-made cable assemblies and special-order items are non-returnable unless defective.",
        "Approved refunds will be processed within 7-10 business days via the original payment method.",
      ],
    },
    {
      title: "7. Intellectual Property",
      content: [
        "All content on this website, including text, graphics, logos, and product images, is the property of Qualitech Connectronics or its licensors.",
        "You may not reproduce, distribute, or use any content from this website without prior written permission.",
        "Product names and trademarks of Amphenol, Zolex, FCI, and other brands belong to their respective owners.",
      ],
    },
    {
      title: "8. Limitation of Liability",
      content: [
        "Qualitech Connectronics shall not be liable for any indirect, incidental, or consequential damages arising from the use of our products or services.",
        "Our liability in any case shall be limited to the value of the specific order in question.",
        "We do not warrant that the website will be error-free, uninterrupted, or free of viruses or other harmful components.",
      ],
    },
    {
      title: "9. Governing Law",
      content: [
        "These Terms of Service are governed by and construed in accordance with the laws of India.",
        "Any disputes arising from these terms or your use of our website shall be subject to the exclusive jurisdiction of the courts in Hyderabad, Telangana.",
      ],
    },
    {
      title: "10. Contact",
      content: [
        "For any questions regarding these Terms of Service, please contact us:",
        "Email: info@qualitechindia.in",
        "Phone: +91 98490 01484",
        "Address: Qualitech Connectronics Pvt. Ltd., Plot No. 37/B, Phase-V, IDA, Cherlapally, Hyderabad, Telangana - 500051",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header onNavigate={onNavigate} currentPage="home" />

      <section className="relative overflow-hidden bg-gradient-to-b from-graphite-deep via-graphite-deep/90 to-graphite pt-32 pb-16 sm:pt-36 sm:pb-20">
        <div className="relative mx-auto max-w-4xl px-5 sm:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-brand-yellow/20 px-4 py-1.5 mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-yellow" />
            <span className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-brand-yellow">Legal</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
            Terms of Service
          </h1>
          <p className="mt-4 text-sm text-steel sm:text-base max-w-xl mx-auto leading-relaxed">
            Please read these terms carefully before using our website or placing an order. These terms govern your relationship with Qualitech Connectronics.
          </p>
          <p className="mt-4 text-[0.72rem] text-steel/60 font-medium">
            Last Updated: October 2026
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-4xl px-5 sm:px-8 py-16 sm:py-20">
        <div className="rounded-2xl border border-brand-yellow/30 bg-brand-yellow/5 p-6 sm:p-8 mb-12">
          <p className="text-sm leading-relaxed text-graphite">
            These Terms of Service ("Terms") govern your use of the website and services provided by <strong>Qualitech Connectronics Private Limited</strong> ("Qualitech", "we", "our", or "us"). By accessing our website or placing an enquiry/order, you confirm that you have read, understood, and agree to these Terms.
          </p>
        </div>

        <div className="space-y-10">
          {sections.map((section) => (
            <div key={section.title}>
              <h2 className="font-display text-lg font-bold text-graphite sm:text-xl mb-4 flex items-center gap-3">
                <span className="h-px w-6 bg-brand-yellow shrink-0" />
                {section.title}
              </h2>
              <ul className="space-y-2.5 pl-9">
                {section.content.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed text-muted-foreground">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-brand-yellow/60 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 rounded-2xl border border-border bg-steel-light/30 p-8 text-center">
          <p className="text-sm font-semibold text-graphite">Questions about our Terms of Service?</p>
          <button
            onClick={() => onNavigate("#contact-page", true)}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-graphite px-6 py-3 font-display text-[0.72rem] font-bold uppercase tracking-[0.2em] text-white transition-all duration-300 hover:bg-brand-blue cursor-pointer"
          >
            Contact Us
          </button>
        </div>
      </main>

      <Footer onNavigate={onNavigate} />
    </div>
  );
}
