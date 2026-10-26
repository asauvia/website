import type { BreadcrumbList, FAQPage, Organization, Service, WebPage, WebSite } from "schema-dts";
import company from "@/data/company";
import { serviceCatalog } from "@/data/service-catalog";
import type { Faq, Testimonial } from "./validators";

export const SITE_URL = `https://${company.domain}`;
const ORG_ID = `${SITE_URL}/#organization`;

// Name variants the company itself already uses publicly (the live site's
// meta author and footer) — helps search engines and LLMs resolve them to one entity.
export const ALTERNATE_NAMES = ["ASAUViA", "Asauvia Technologies", "ASAUViA Systems"];

export function organizationSchema() {
  return {
    "@type": "Organization",
    "@id": ORG_ID,
    name: company.brandName,
    legalName: company.legalName,
    alternateName: ALTERNATE_NAMES,
    url: SITE_URL,
    description: company.description,
    email: company.email,
    location: {
      "@type": "Place",
      address: { "@type": "PostalAddress", addressRegion: company.hqRegion, addressCountry: company.hqCountry },
    },
    slogan: "Build smarter systems. Ship what matters.",
    knowsAbout: [
      ...serviceCatalog.map((s) => s.name),
      "Large language models",
      "Retrieval-augmented generation",
      "AI agents",
      "Business process automation",
      "Legacy software modernization",
      "Technical SEO",
    ],
    areaServed: { "@type": "Place", name: "Worldwide" },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "sales",
      email: company.email,
      url: `${SITE_URL}/contact`,
      availableLanguage: ["English"],
      areaServed: "Worldwide",
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Software development services",
      itemListElement: serviceCatalog.map((s) => ({
        "@type": "Offer",
        itemOffered: { "@id": `${SITE_URL}/services/${s.slug}#service`, "@type": "Service", name: s.name },
      })),
    },
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/logo.png`,
      width: "600",
      height: "527",
    },
    address: {
      "@type": "PostalAddress",
      addressRegion: company.hqRegion,
      addressCountry: company.hqCountry,
    },
    sameAs: company.sameAs,
  } satisfies Organization;
}

export function webSiteSchema() {
  return {
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: company.brandName,
    alternateName: ALTERNATE_NAMES,
    description: company.description,
    inLanguage: "en",
    publisher: { "@id": ORG_ID },
  } satisfies WebSite;
}

export type PageType = "WebPage" | "AboutPage" | "ContactPage" | "CollectionPage" | "FAQPage";

export function webPageSchema({
  path,
  name,
  description,
  type = "WebPage",
  mainEntityId,
}: {
  path: string;
  name: string;
  description: string;
  type?: PageType;
  /** @id of the thing this page is primarily about, e.g. a Service node. */
  mainEntityId?: string;
}) {
  const url = `${SITE_URL}${path}`;
  return {
    "@type": type,
    "@id": `${url}#webpage`,
    url,
    name,
    description,
    inLanguage: "en",
    isPartOf: { "@id": `${SITE_URL}/#website` },
    about: { "@id": ORG_ID },
    publisher: { "@id": ORG_ID },
    ...(path === "/" ? {} : { breadcrumb: { "@id": `${url}#breadcrumb` } }),
    ...(mainEntityId ? { mainEntity: { "@id": mainEntityId } } : {}),
  } satisfies WebPage;
}

export function faqPageSchema(faqs: Faq[]) {
  return {
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  } satisfies FAQPage;
}

export type Crumb = { name: string; path: string };

export function breadcrumbSchema(crumbs: Crumb[]) {
  const last = crumbs[crumbs.length - 1]?.path ?? "/";
  return {
    "@type": "BreadcrumbList",
    "@id": `${SITE_URL}${last}#breadcrumb`,
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: `${SITE_URL}${crumb.path}`,
    })),
  } satisfies BreadcrumbList;
}

export function serviceSchema({
  path,
  name,
  description,
  serviceType,
}: {
  path: string;
  name: string;
  description: string;
  serviceType: string;
}) {
  return {
    "@type": "Service",
    "@id": `${SITE_URL}${path}#service`,
    name,
    description,
    serviceType,
    url: `${SITE_URL}${path}`,
    provider: { "@id": ORG_ID },
    areaServed: { "@type": "Place", name: "Worldwide" },
  } satisfies Service;
}

export function testimonialsSchema(items: Testimonial[]) {
  return {
    "@type": "ItemList",
    name: "Client Testimonials & Reviews",
    description: "Verified client reviews and testimonials for Asauvia software and AI engineering services.",
    numberOfItems: items.length,
    itemListElement: items.map((t, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Review",
        itemReviewed: {
          "@id": ORG_ID,
        },
        reviewRating: {
          "@type": "Rating",
          ratingValue: t.rating,
          bestRating: 5,
          worstRating: 1,
        },
        author: {
          "@type": "Person",
          name: t.author,
          jobTitle: `${t.role}, ${t.industry}`,
        },
        reviewBody: t.story,
        datePublished: t.date,
      },
    })),
  };
}


/**
 * Standard JSON-LD graph for an inner page: Organization + WebPage +
 * BreadcrumbList, plus anything page-specific (FAQPage, Service, …).
 */
export function pageGraph({
  path,
  name,
  description,
  crumbs,
  extra = [],
  type,
  mainEntityId,
}: {
  path: string;
  name: string;
  description: string;
  crumbs: Crumb[];
  extra?: Record<string, unknown>[];
  type?: PageType;
  mainEntityId?: string;
}) {
  return graph([
    organizationSchema(),
    webSiteSchema(),
    webPageSchema({ path, name, description, type, mainEntityId }),
    breadcrumbSchema(crumbs),
    ...extra,
  ]);
}

export function graph(items: Record<string, unknown>[]) {
  return {
    "@context": "https://schema.org",
    "@graph": items,
  };
}
