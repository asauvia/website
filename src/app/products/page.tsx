import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CTASection } from "@/components/sections/CTASection";
import { ProjectSheet } from "@/components/products/ProjectSheet";
import { JsonLd } from "@/components/seo/JsonLd";
import { pageMetadata } from "@/lib/seo";
import { pageGraph, type Crumb } from "@/lib/schema";
import { getAllProducts } from "@/lib/products";

const title = "Our Products";
const description =
  "Completed products built by Asauvia: Washora, Curato, and custom products built to order. Schedule a meeting with the sales team for pricing and details.";

export const metadata: Metadata = pageMetadata({ path: "/products", title, description });

const crumbs: Crumb[] = [
  { name: "Home", path: "/" },
  { name: "Products", path: "/products" },
];

export default function ProductsPage() {
  const products = getAllProducts();

  return (
    <>
      <JsonLd
        data={pageGraph({
          path: "/products",
          name: `${title} | Asauvia`,
          description,
          crumbs,
          type: "CollectionPage",
        })}
      />

      <PageHero
        crumbs={crumbs}
        label="Products"
        title="Our products,"
        titleMuted="built by Asauvia."
        description="Software we build for ourselves and for the market. Pricing is shared on a short call with our sales team, so you get numbers that match your needs."
      >
        <Button href="#products-grid" withArrow>
          Browse products
        </Button>
        <Button href="/services" variant="secondary">
          Client services
        </Button>
      </PageHero>

      <section id="products-grid" className="relative py-16 lg:py-24">
        <Container>
          <SectionHeading label="What we offer" title="Pick a project," titleMuted="then talk to sales." />
          <div className="mt-8">
            {products.map((product) => (
              <ProjectSheet key={product.slug} product={product} />
            ))}
          </div>
        </Container>
      </section>

      <CTASection />
    </>
  );
}
