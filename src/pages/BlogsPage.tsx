import { useEffect } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Reveal } from "@/components/site/reveal";
import { BookOpen, ArrowRight, Mail } from "lucide-react";

interface BlogsPageProps {
  onNavigate: (href: string, isPage?: boolean) => void;
}

export function BlogsPage({ onNavigate }: BlogsPageProps) {
  useEffect(() => {
    document.title = "Technical Blogs & Industry Insights | Qualitech Connectronics";
    const descTag = document.querySelector('meta[name="description"]');
    if (descTag) {
      descTag.setAttribute(
        "content",
        "Technical articles, application notes, and industry insights on electronic connectors and custom cable assembly manufacturing from Qualitech Connectronics."
      );
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      <Header onNavigate={onNavigate} currentPage="blogs" />

      <main className="pt-28 sm:pt-36 pb-24 flex-1 flex flex-col justify-center items-center">
        <div className="mx-auto max-w-4xl px-5 sm:px-8 w-full flex flex-col items-center">
          {/* Centered Hero Heading */}
          <Reveal className="w-full flex flex-col items-center text-center">
            <div className="flex items-center justify-center gap-3">
              <span className="h-px w-10 bg-brand-orange" />
              <span className="label-eyebrow">Technical Articles &amp; Insights</span>
              <span className="h-px w-10 bg-brand-orange" />
            </div>
            <h1 className="mt-4 font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-graphite tracking-tight leading-tight max-w-3xl">
              Qualitech Engineering Insights &amp; Industry Articles
            </h1>
            <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Technical resources, application guides, and engineering best practices in electronic connector distribution, custom cable assembly, and wire harness manufacturing.
            </p>
          </Reveal>

          {/* Centered Placeholder Card */}
          <div className="mt-12 w-full max-w-2xl mx-auto">
            <Reveal delay={120} className="w-full">
              <div className="rounded-3xl border border-border bg-white p-8 sm:p-12 shadow-sm text-center flex flex-col items-center w-full">
                <div className="h-16 w-16 rounded-2xl bg-brand-blue/10 flex items-center justify-center text-brand-blue mb-6 shadow-2xs">
                  <BookOpen className="h-8 w-8" />
                </div>

                <span className="text-[0.68rem] font-bold uppercase tracking-wider text-brand-blue">
                  KNOWLEDGE BASE &amp; ARTICLES
                </span>
                <h2 className="mt-2 font-display text-2xl sm:text-3xl font-bold text-graphite">
                  Technical Articles Coming Soon
                </h2>
                <p className="mt-3.5 max-w-xl text-sm text-muted-foreground leading-relaxed mx-auto">
                  Our applications engineering and manufacturing team is currently curating in-depth technical whitepapers, connector selection guides, and wire harness engineering standards. New articles will be published shortly.
                </p>

                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => onNavigate("#products", true)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-graphite px-6 py-3.5 font-display text-xs font-bold uppercase tracking-wider text-white hover:bg-brand-blue transition-colors cursor-pointer shadow-sm"
                  >
                    Explore Products Catalogue <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate("#contact-page", true)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-steel-light/30 px-6 py-3.5 font-display text-xs font-bold uppercase tracking-wider text-graphite hover:bg-steel-light hover:border-graphite/40 transition-colors cursor-pointer"
                  >
                    <Mail className="h-3.5 w-3.5 text-brand-blue" />
                    Request Technical Discussion
                  </button>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </main>

      <Footer onNavigate={onNavigate} />
    </div>
  );
}
