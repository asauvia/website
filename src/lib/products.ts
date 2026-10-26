import { z } from "zod";
import raw from "@/data/products.json";

// Status labels must stay honest: "Live" only once a prospect can actually use the product.
export const PRODUCT_STATUSES = ["Completed", "Live", "Beta", "In development", "Custom build"] as const;

const productSchema = z.object({
  slug: z
    .string()
    .transform((s) => s.toLowerCase().trim())
    .refine((s) => /^[a-z0-9-]+$/.test(s), "slug must contain only letters, numbers and hyphens"),
  name: z.string().min(1).max(60),
  category: z.string().min(1).max(80),
  status: z.enum(PRODUCT_STATUSES),
  summary: z.string().min(40).max(300),
  metaDescription: z.string().min(50).max(160),
  highlights: z.array(z.string().min(1).max(160)).min(3).max(6),
  idealFor: z.string().min(1).max(160),
});

export type Product = z.infer<typeof productSchema>;

// Validated once at module load, so a malformed products.json fails the build with a clear error.
const products: Product[] = z.array(productSchema).min(1).parse(raw);

const slugs = products.map((product) => product.slug);
const duplicate = slugs.find((slug, index) => slugs.indexOf(slug) !== index);
if (duplicate) throw new Error(`products.json has a duplicate slug: "${duplicate}"`);

export function getAllProducts(): Product[] {
  return products;
}

export function getProduct(slug: string): Product | undefined {
  return products.find((product) => product.slug === slug);
}
