import { useState } from "react";
import { Reveal } from "@/components/site/reveal";
import { BLOG_POSTS, BlogPost } from "@/data/blogs";
import { Calendar, Clock, BookOpen, X, ArrowRight, CheckCircle2 } from "lucide-react";

interface BlogSectionProps {
  onNavigate?: (href: string, isPage?: boolean) => void;
}

export function BlogSection({ onNavigate }: BlogSectionProps) {
  const [selectedArticle, setSelectedArticle] = useState<BlogPost | null>(null);

  const handleOpenArticle = (post: BlogPost) => {
    setSelectedArticle(post);
  };

  const handleCloseArticle = () => {
    setSelectedArticle(null);
  };

  return (
    <section id="blog" className="border-t border-border bg-[#fafbfc] py-20 lg:py-28 relative">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        {/* Header */}
        <Reveal>
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-brand-orange" />
            <span className="label-eyebrow">Technical Articles &amp; Insights</span>
          </div>
          <div className="mt-4 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div className="max-w-2xl">
              <h2 className="font-display text-3xl font-bold leading-tight text-graphite sm:text-4xl lg:text-[2.6rem]">
                Latest Insights in Electronic Connectivity &amp; Cable Manufacturing
              </h2>
              <p className="mt-3.5 text-[0.95rem] leading-relaxed text-muted-foreground">
                Engineering guides, technical considerations, and industry best practices from Qualitech Connectronics' manufacturing and distribution teams in India.
              </p>
            </div>
            <div className="shrink-0">
              <button
                type="button"
                onClick={() => onNavigate?.("#contact-page", true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-brand-blue/10 border border-brand-blue/30 px-4 py-2 font-display text-[0.7rem] font-bold uppercase tracking-wider text-brand-blue hover:bg-brand-blue hover:text-white transition-all cursor-pointer shadow-2xs"
              >
                Request Technical Discussion →
              </button>
            </div>
          </div>
        </Reveal>

        {/* Blog Posts Grid */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {BLOG_POSTS.map((post, idx) => (
            <Reveal key={post.id} delay={idx * 100} className="h-full">
              <article className="group flex h-full flex-col justify-between rounded-2xl border border-border bg-white p-6 shadow-2xs transition-all duration-300 hover:-translate-y-1 hover:border-brand-blue/40 hover:shadow-md">
                <div>
                  <div className="flex items-center justify-between text-[0.68rem] text-muted-foreground">
                    <span className="rounded-full bg-steel-light/70 px-2.5 py-0.5 font-bold uppercase tracking-wider text-brand-blue">
                      {post.category}
                    </span>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{post.readTime}</span>
                    </div>
                  </div>

                  <h3 className="mt-4 font-display text-base font-bold text-graphite line-clamp-2 leading-snug group-hover:text-brand-blue transition-colors">
                    {post.title}
                  </h3>

                  <p className="mt-2.5 text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>

                <div className="mt-6 border-t border-border/60 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[0.68rem] text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {post.date}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleOpenArticle(post)}
                      className="inline-flex items-center gap-1 font-display text-xs font-bold text-brand-blue hover:text-graphite transition-colors cursor-pointer"
                    >
                      <span>Read Article</span>
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>

      {/* Article Detail Reader Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-graphite-deep/75 backdrop-blur-sm transition-opacity"
            onClick={handleCloseArticle}
          />

          {/* Modal Card */}
          <div className="relative z-10 my-8 w-full max-w-3xl overflow-hidden rounded-2xl sm:rounded-3xl bg-white shadow-2xl border border-border animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Top Bar */}
            <div className="flex items-center justify-between border-b border-border bg-[#fafbfc] px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-brand-blue/10 px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-brand-blue">
                  {selectedArticle.category}
                </span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {selectedArticle.readTime}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCloseArticle}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-graphite hover:bg-steel-light transition-colors cursor-pointer"
                aria-label="Close article modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="max-h-[75vh] overflow-y-auto p-6 sm:p-10 space-y-8">
              <div>
                <p className="text-xs font-semibold text-brand-orange uppercase tracking-wider">
                  Qualitech Technical Article · {selectedArticle.date}
                </p>
                <h1 className="mt-2 font-display text-2xl sm:text-3xl font-bold text-graphite leading-tight">
                  {selectedArticle.title}
                </h1>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed border-l-2 border-brand-yellow pl-4 italic">
                  {selectedArticle.excerpt}
                </p>
                <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground pt-3 border-t border-border/50">
                  <div className="h-8 w-8 rounded-full bg-brand-blue/10 flex items-center justify-center font-bold text-brand-blue">
                    Q
                  </div>
                  <div>
                    <p className="font-semibold text-graphite">{selectedArticle.author.name}</p>
                    <p className="text-[0.68rem]">{selectedArticle.author.role}</p>
                  </div>
                </div>
              </div>

              {/* Sections */}
              <div className="space-y-6">
                {selectedArticle.sections.map((section, sIdx) => (
                  <div key={sIdx} className="space-y-3">
                    <h2 className="font-display text-lg font-bold text-graphite">
                      {section.heading}
                    </h2>
                    {section.paragraphs.map((p, pIdx) => (
                      <p key={pIdx} className="text-sm leading-relaxed text-muted-foreground">
                        {p}
                      </p>
                    ))}
                    {section.highlights && (
                      <div className="rounded-xl bg-steel-light/30 border border-border p-4 space-y-2 mt-3">
                        <p className="text-xs font-bold uppercase tracking-wider text-graphite">Key Technical Highlights:</p>
                        {section.highlights.map((h, hIdx) => (
                          <div key={hIdx} className="flex items-start gap-2 text-xs text-graphite">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{h}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Target Keywords / Topics */}
              <div className="border-t border-border pt-4">
                <p className="text-xs font-semibold text-muted-foreground mb-2">Related Topics &amp; Keywords:</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedArticle.keywords.map((kw) => (
                    <span
                      key={kw}
                      className="rounded-md bg-steel-light/60 px-2.5 py-1 text-[0.68rem] font-medium text-graphite"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>

              {/* Next Steps CTA */}
              <div className="rounded-2xl bg-graphite-deep text-white p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="font-display text-base font-bold text-white">Need Technical Support for Your Project?</h3>
                  <p className="text-xs text-steel mt-1">Discuss requirements with our Hyderabad engineering and applications team.</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      handleCloseArticle();
                      onNavigate?.("#contact-page", true);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-brand-yellow/20 border border-brand-yellow/50 px-4 py-2 font-display text-[0.68rem] font-bold uppercase tracking-wider text-brand-yellow hover:bg-brand-yellow hover:text-graphite transition-all cursor-pointer"
                  >
                    Request a Quote →
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleCloseArticle();
                      onNavigate?.("#products", true);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 border border-white/20 px-4 py-2 font-display text-[0.68rem] font-bold uppercase tracking-wider text-white hover:bg-white/20 transition-all cursor-pointer"
                  >
                    Explore Products →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
