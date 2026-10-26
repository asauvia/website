import company from "@/data/company";
import services from "@/data/services";
import processSteps from "@/data/process";
import principles from "@/data/principles";
import faqGroups from "@/data/faq-page";
import homeFaqs from "@/data/faqs";
import type { Faq } from "@/lib/validators";
import { getAllProducts } from "@/lib/products";
import testimonials from "@/data/testimonials";
import { SITE_URL, ALTERNATE_NAMES } from "@/lib/schema";

export const dynamic = "force-static";


function homeFaqAnswer(question: string) {
  const faq = homeFaqs.find((item) => item.question === question);
  if (!faq) throw new Error(`Homepage FAQ not found: ${question}`);
  return faq.answer;
}

function faqLines(faqs: Faq[]) {
  return faqs.flatMap((faq) => [`#### ${faq.question}`, "", faq.answer, ""]);
}

export async function GET() {
  const serviceName = (slug: string) => services.find((s) => s.slug === slug)?.name ?? slug;

  const lines = [
    `# ${company.brandName}`,
    "",
    `> ${company.description}`,
    "",
    `Canonical site: ${SITE_URL}. This file mirrors the content of the website in plain markdown. A shorter index is at ${SITE_URL}/llms.txt.`,
    "",
    "## About Asauvia",
    "",
    `- Name: ${company.brandName} (also written ${ALTERNATE_NAMES.join(", ")})`,
    `- Website: ${SITE_URL}`,
    "- Type: service-based AI-driven software development and product engineering company. It builds software for startups and enterprises, and also builds its own products (see Products).",
    `- Headquarters: ${company.hqRegion}, ${company.hqCountry}`,
    "- Working hours: India Standard Time (IST), working with international clients across time zones",
    `- Email: ${company.email}`,
    `- Contact form: ${SITE_URL}/contact`,
    ...company.sameAs.map((url) => `- LinkedIn: ${url}`),
    "",
    "## Products",
    "",
    ...getAllProducts().flatMap((p) => [
      `### ${p.name}`,
      "",
      `URL: ${SITE_URL}/products/${p.slug}`,
      "",
      `Category: ${p.category}. Status: ${p.status}.`,
      "",
      p.summary,
      "",
      "What it does:",
      "",
      ...p.highlights.map((h) => `- ${h}`),
      "",
      `Ideal for: ${p.idealFor}. Pricing is shared on a meeting with the sales team at ${company.salesEmail}.`,
      "",
    ]),
    "## Services",
    "",
    ...services.map((s) => `- [${s.name}](${SITE_URL}/services/${s.slug}): ${s.outcome}`),
    "",
    ...services.flatMap((s) => [
      `### ${s.name}`,
      "",
      `URL: ${SITE_URL}/services/${s.slug}`,
      "",
      `Outcome: ${s.outcome}`,
      "",
      s.answer,
      "",
      "Problems it solves:",
      "",
      ...s.problems.map((p) => `- ${p}`),
      "",
      "What Asauvia delivers:",
      "",
      ...s.deliverables.map((d) => `- ${d}`),
      "",
      "Use cases:",
      "",
      ...s.useCases.map((u) => `- ${u.title}: ${u.description}`),
      "",
      `Technology: ${s.stack.join(", ")}`,
      "",
      `Related services: ${s.related.map((slug) => `[${serviceName(slug)}](${SITE_URL}/services/${slug})`).join(", ")}`,
      "",
      `#### Frequently asked questions about ${s.name}`,
      "",
      ...faqLines(s.faqs),
    ]),
    "## How Asauvia works",
    "",
    `More detail: ${SITE_URL}/how-we-work`,
    "",
    "### Delivery process",
    "",
    ...processSteps.map((step) => `${step.index}. ${step.title}: ${step.description}`),
    "",
    "### Engagement models",
    "",
    homeFaqAnswer("What engagement models do you offer?"),
    "",
    "### What drives cost",
    "",
    homeFaqAnswer("What drives the cost of a project?"),
    "",
    "### Working across time zones",
    "",
    homeFaqAnswer("How does working across time zones actually work?"),
    "",
    "### How to start a project",
    "",
    homeFaqAnswer("How do we get started?"),
    "",
    "## Principles",
    "",
    ...principles.map((p) => `- ${p.title}: ${p.practice}`),
    "",
    "## Client Testimonials & Reviews",
    "",
    `Source: ${SITE_URL}/testimonials`,
    "",
    ...testimonials.flatMap((t) => [
      `### ${t.author} (${t.role}, ${t.industry} - ${t.location})`,
      `Category: ${t.category}. Service: ${t.serviceName || "Engineering"}.`,
      `Quote: "${t.quote}"`,
      t.story,
      "",
    ]),
    "## Frequently asked questions",
    "",
    `Source: ${SITE_URL}/faq`,
    "",
    ...faqGroups.flatMap((group) => [`### ${group.title}`, "", ...faqLines(group.faqs)]),
    "## Contact",
    "",
    `- Email: ${company.email}`,
    `- Contact form: ${SITE_URL}/contact`,
    `- Headquarters: ${company.hqRegion}, ${company.hqCountry} (India Standard Time)`,
    ...company.sameAs.map((url) => `- LinkedIn: ${url}`),
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
