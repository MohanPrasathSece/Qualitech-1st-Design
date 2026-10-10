import { useEffect } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

interface PrivacyPolicyPageProps {
  onNavigate: (href: string, isPage?: boolean) => void;
}

export function PrivacyPolicyPage({ onNavigate }: PrivacyPolicyPageProps) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const sections = [
    {
      title: "1. Information We Collect",
      content: [
        "Personal identification information (name, email address, phone number, company name) when you fill out our contact or enquiry forms.",
        "Order and transaction information when you place an enquiry or purchase through our online catalogue.",
        "Usage data such as pages visited, time spent, browser type, and IP address — collected automatically via standard web analytics.",
        "Cookies and similar tracking technologies to improve your browsing experience and remember preferences.",
      ],
    },
    {
      title: "2. How We Use Your Information",
      content: [
        "To respond to your product enquiries and provide quotations for electronics components or cable assembly services.",
        "To process orders, send order confirmations, and provide after-sales support.",
        "To send transactional emails and updates related to your requests (not marketing, unless you opt in).",
        "To improve our website, product catalogue, and services based on how visitors use them.",
        "To comply with applicable legal obligations under Indian law.",
      ],
    },
    {
      title: "3. Cookies",
      content: [
        "We use cookies to enhance functionality and provide a better browsing experience. Cookies are small text files stored on your device.",
        "Essential cookies are required for the website to function (e.g., cart state, session management). You cannot opt out of these.",
        "Analytics cookies (e.g., Google Analytics) help us understand traffic and improve content. These can be disabled in your browser settings.",
        "You may clear or block cookies in your browser at any time; however, some features may not work correctly.",
      ],
    },
    {
      title: "4. Sharing of Information",
      content: [
        "We do not sell, trade, or rent your personal information to third parties.",
        "We may share information with trusted service providers (e.g., email delivery, payment processors) solely to fulfill your requests under strict confidentiality.",
        "We may disclose information when required by law, court order, or regulatory authority in India.",
        "In the event of a merger or acquisition, your information may be transferred subject to the same privacy protections.",
      ],
    },
    {
      title: "5. Data Security",
      content: [
        "We implement appropriate technical and organisational security measures to protect your personal information.",
        "All data transmissions are protected using industry-standard SSL/TLS encryption.",
        "Access to personal data is restricted to authorised personnel only, on a need-to-know basis.",
        "Despite our best efforts, no method of transmission over the internet is 100% secure.",
      ],
    },
    {
      title: "6. Data Retention",
      content: [
        "We retain personal data only as long as necessary to fulfil the purposes outlined in this policy, or as required by applicable law.",
        "Enquiry and order records are typically retained for 7 years for accounting and legal compliance.",
        "You may request deletion of your data at any time by contacting us, unless we are legally required to retain it.",
      ],
    },
    {
      title: "7. Your Rights",
      content: [
        "Right to Access: You may request a copy of the personal data we hold about you.",
        "Right to Correction: You may request correction of inaccurate or incomplete data.",
        "Right to Deletion: You may request deletion of your personal data (subject to legal obligations).",
        "Right to Withdraw Consent: Where processing is based on consent, you may withdraw it at any time.",
        "To exercise any of these rights, please contact us at info@qualitechindia.in.",
      ],
    },
    {
      title: "8. Contact Us",
      content: [
        "If you have any questions, concerns, or requests regarding this Privacy Policy, please reach out to us:",
        "Email: info@qualitechindia.in",
        "Phone: +91 98490 01484",
        "Address: Qualitech Connectronics Pvt. Ltd., Plot No. 37/B, Phase-V, IDA, Cherlapally, Hyderabad, Telangana - 500051",
      ],
    },
    {
      title: "9. Changes to This Policy",
      content: [
        "We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements.",
        "The updated policy will be published on this page with a revised 'Last Updated' date.",
        "Continued use of our website after changes constitutes acceptance of the updated policy.",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header onNavigate={onNavigate} currentPage="home" />

      <section className="relative overflow-hidden bg-gradient-to-b from-graphite-deep via-graphite-deep/90 to-graphite pt-32 pb-16 sm:pt-36 sm:pb-20">
        <div className="relative mx-auto max-w-4xl px-5 sm:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-brand-blue/20 px-4 py-1.5 mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-blue-soft" />
            <span className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-brand-blue-soft">Legal</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
            Privacy Policy
          </h1>
          <p className="mt-4 text-sm text-steel sm:text-base max-w-xl mx-auto leading-relaxed">
            Qualitech Connectronics is committed to protecting your privacy. This policy explains how we collect, use, and safeguard your information.
          </p>
          <p className="mt-4 text-[0.72rem] text-steel/60 font-medium">
            Last Updated: October 2026
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-4xl px-5 sm:px-8 py-16 sm:py-20">
        <div className="rounded-2xl border border-brand-blue/20 bg-brand-blue/5 p-6 sm:p-8 mb-12">
          <p className="text-sm leading-relaxed text-graphite">
            This Privacy Policy applies to the website of <strong>Qualitech Connectronics Private Limited</strong> ("Qualitech", "we", "our", or "us"). By using our website, you agree to the collection and use of information in accordance with this policy.
          </p>
        </div>

        <div className="space-y-10">
          {sections.map((section) => (
            <div key={section.title}>
              <h2 className="font-display text-lg font-bold text-graphite sm:text-xl mb-4 flex items-center gap-3">
                <span className="h-px w-6 bg-brand-blue shrink-0" />
                {section.title}
              </h2>
              <ul className="space-y-2.5 pl-9">
                {section.content.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed text-muted-foreground">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-brand-blue/50 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 rounded-2xl border border-border bg-steel-light/30 p-8 text-center">
          <p className="text-sm font-semibold text-graphite">Have questions about our Privacy Policy?</p>
          <a
            href="mailto:info@qualitechindia.in"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-graphite px-6 py-3 font-display text-[0.72rem] font-bold uppercase tracking-[0.2em] text-white transition-all duration-300 hover:bg-brand-blue"
          >
            Contact Us
          </a>
        </div>
      </main>

      <Footer onNavigate={onNavigate} />
    </div>
  );
}
