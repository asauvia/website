import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PageHero } from "@/components/ui/PageHero";
import { Button } from "@/components/ui/Button";
import { FAQList } from "@/components/ui/FAQList";
import { CTASection } from "@/components/sections/CTASection";
import { JsonLd } from "@/components/seo/JsonLd";
import { pageGraph, faqPageSchema, testimonialsSchema, type Crumb } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";
import type { Faq } from "@/lib/validators";
import testimonials from "@/data/testimonials";
import { TestimonialsView } from "@/components/testimonials/TestimonialsView";

const PATH = "/testimonials";
const TITLE = "Client Reviews & Testimonials | Asauvia Software & AI Engineering";
const DESCRIPTION =
  "Verified client feedback, project outcomes, and testimonials for Asauvia. Read how founders and engineering leaders scale with our AI software and engineering teams.";

export const metadata: Metadata = pageMetadata({
  path: PATH,
  title: TITLE,
  description: DESCRIPTION,
  absoluteTitle: true,
});

const crumbs: Crumb[] = [
  { name: "Home", path: "/" },
  { name: "Testimonials", path: PATH },
];

const testimonialFaqs: Faq[] = [
  {
    question: "Can we speak with a past client reference before signing?",
    answer:
      "Yes. For qualified projects and upon mutual NDA, we are happy to introduce you to past client leaders who have agreed to speak about our working cadence, communication across time zones, and engineering delivery.",
  },
  {
    question: "How do you maintain confidentiality for proprietary systems?",
    answer:
      "Every engagement begins with a mutual non-disclosure agreement (NDA) before any proprietary code or business logic is shared. We work inside client-managed repositories and cloud environments wherever possible, and remove access immediately upon handover.",
  },
  {
    question: "How does working with an IST engineering team work for Western clients?",
    answer:
      "Our team works India Standard Time (IST), which runs ahead of business hours in North America and Europe and overlaps directly with Asia-Pacific. We establish a daily overlap window for live standups and use visible, async backlog tracking so work started during our day is waiting for you when your day begins.",
  },
  {
    question: "Who owns the code and intellectual property produced?",
    answer:
      "All intellectual property in the work product, repositories, documentation, and infrastructure configurations is assigned to you on delivery or payment.",
  },
];

const linkClass =
  "text-foreground underline underline-offset-4 hover:no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground";

export default function TestimonialsPage() {
  const schema = pageGraph({
    path: PATH,
    name: TITLE,
    description: DESCRIPTION,
    crumbs,
    type: "CollectionPage",
    extra: [
      testimonialsSchema(testimonials),
      faqPageSchema(testimonialFaqs),
    ],
  });

  return (
    <>
      <JsonLd data={schema} />

      <PageHero
        crumbs={crumbs}
        label="Client Testimonials"
        title="What our clients say,"
        titleMuted="from first sprint to shipped."
        description="Verified feedback and tangible outcomes from engineering leaders, startup founders, and operational executives who rely on Asauvia for AI systems, SaaS engineering, and workflow automation."
      >
        <Button href="/contact" withArrow>
          Start with a scoping call
        </Button>
        <Button href="/how-we-work" variant="secondary">
          How we work
        </Button>
      </PageHero>

      <section className="relative py-20 lg:py-28">
        <Container>
          <TestimonialsView initialTestimonials={testimonials} />
        </Container>
      </section>

      {/* Frequently Asked Questions regarding partnerships and client feedback */}
      <section className="relative border-t border-foreground/10 py-24 lg:py-32 bg-foreground/[0.01]">
        <Container>
          <div className="grid gap-16 lg:grid-cols-[1fr_1.3fr] lg:gap-24">
            <div>
              <SectionHeading
                label="Trust & Reference Questions"
                title="Questions about our references,"
                titleMuted="confidentiality & engagement."
                description="Everything you need to know about vetting Asauvia as your engineering partner."
              />
              <div className="mt-8 flex flex-col items-start gap-3 text-sm">
                <Link href="/how-we-work" className={linkClass}>
                  Explore our 6-stage development process
                </Link>
                <Link href="/security" className={linkClass}>
                  Read our confidentiality and security practices
                </Link>
                <Link href="/services" className={linkClass}>
                  Review our complete service catalog
                </Link>
              </div>
            </div>
            <FAQList faqs={testimonialFaqs} />
          </div>
        </Container>
      </section>

      <CTASection />
    </>
  );
}
