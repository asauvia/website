import { z } from "zod";

export const marketSchema = z.object({
  name: z.string(),
  justified: z.boolean(),
  note: z.string().optional(),
});
export type Market = z.infer<typeof marketSchema>;

export const companySchema = z.object({
  legalName: z.string(),
  brandName: z.string(),
  domain: z.string(),
  description: z.string().max(320),
  hqRegion: z.string(),
  hqCountry: z.string(),
  email: z.string().email(),
  // Where product meeting requests and pricing enquiries go.
  salesEmail: z.string().email(),
  markets: z.array(marketSchema),
  sameAs: z.array(z.string().url()),
});
export type Company = z.infer<typeof companySchema>;

export const navItemSchema = z.object({
  label: z.string(),
  href: z.string(),
  description: z.string().optional(),
});
export type NavItem = z.infer<typeof navItemSchema>;

export const faqSchema = z.object({
  question: z.string(),
  answer: z.string(),
});
export type Faq = z.infer<typeof faqSchema>;

/** The slice of a service the homepage list needs. */
export const serviceSchema = z.object({
  slug: z.string(),
  name: z.string(),
  outcome: z.string(),
  summary: z.string(),
  deliverables: z.array(z.string()).min(3),
});
export type Service = z.infer<typeof serviceSchema>;

/** A full service page — superset of serviceSchema. */
export const serviceDetailSchema = serviceSchema.extend({
  // Answer-first block: must make sense quoted on its own (AEO).
  answer: z.string().min(180).max(480),
  metaTitle: z.string().max(60),
  metaDescription: z.string().min(120).max(165),
  primaryKeyword: z.string(),
  problems: z.array(z.string()).min(3).max(5),
  useCases: z
    .array(z.object({ title: z.string(), description: z.string() }))
    .min(3)
    .max(6),
  stack: z.array(z.string()).min(4),
  faqs: z.array(faqSchema).min(4).max(7),
  related: z.array(z.string()).min(2).max(3),
});
export type ServiceDetail = z.infer<typeof serviceDetailSchema>;

export const principleSchema = z.object({
  title: z.string(),
  practice: z.string(),
});
export type Principle = z.infer<typeof principleSchema>;

export const processStepSchema = z.object({
  index: z.number().int().min(1),
  title: z.string(),
  description: z.string(),
});
export type ProcessStep = z.infer<typeof processStepSchema>;

export const testimonialSchema = z.object({
  id: z.string(),
  quote: z.string(),
  story: z.string(),
  author: z.string(),
  role: z.string(),
  industry: z.string(),
  location: z.string(),
  category: z.string(),
  metrics: z.array(
    z.object({
      label: z.string(),
      value: z.string(),
    })
  ).min(1).max(3),
  serviceSlug: z.string().optional(),
  serviceName: z.string().optional(),
  rating: z.number().min(1).max(5).default(5),
  date: z.string(),
  featured: z.boolean().optional(),
});
export type Testimonial = z.infer<typeof testimonialSchema>;

