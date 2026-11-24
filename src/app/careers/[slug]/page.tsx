import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/ui/PageHero";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { JsonLd } from "@/components/seo/JsonLd";
import { ApplicationForm } from "@/components/forms/ApplicationForm";
import { CTASection } from "@/components/sections/CTASection";
import { pageGraph, type Crumb } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";
import { getRole, openRoles } from "@/data/careers";

export const dynamicParams = false;

export function generateStaticParams() {
  return openRoles.map((role) => ({ slug: role.slug }));
}

export async function generateMetadata({ params }: PageProps<"/careers/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const role = getRole(slug);
  if (!role) return {};
  const description = `${role.title} at Asauvia. ${role.summary}`;
  return pageMetadata({
    path: `/careers/${role.slug}`,
    title: `${role.title} | Careers at Asauvia`,
    description,
    absoluteTitle: true,
  });
}

const linkClass =
  "text-foreground underline underline-offset-4 hover:no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground";

function Checklist({ heading, items }: { heading: string; items: string[] }) {
  return (
    <div>
      <h2 className="mb-6 font-display text-2xl tracking-tight">{heading}</h2>
      <ul className="border-t border-foreground/10">
        {items.map((item, index) => (
          <li key={item} className="border-b border-foreground/10 py-5 leading-relaxed">
            <Reveal delay={index * 60}>{item}</Reveal>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default async function RolePage({ params }: PageProps<"/careers/[slug]">) {
  const { slug } = await params;
  const role = getRole(slug);
  if (!role) notFound();

  const path = `/careers/${role.slug}`;
  const crumbs: Crumb[] = [
    { name: "Home", path: "/" },
    { name: "Careers", path: "/careers" },
    { name: role.title, path },
  ];

  return (
    <>
      <JsonLd
        data={pageGraph({
          path,
          name: `${role.title} | Careers at Asauvia`,
          description: role.summary,
          crumbs,
        })}
      />
      <PageHero
        crumbs={crumbs}
        label={`${role.team} · ${role.type}`}
        title={role.title}
        description={role.summary}
      >
        <Link
          href="#apply"
          className="group inline-flex h-14 items-center justify-center whitespace-nowrap rounded-full bg-foreground px-8 text-base font-medium text-background transition-colors hover:bg-foreground/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
        >
          Apply for this role
          <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
        <span className="text-sm text-muted-foreground">{role.location}</span>
      </PageHero>

      <section className="relative py-24 lg:py-32">
        <Container>
          <div className="grid gap-16 lg:grid-cols-2 lg:gap-24">
            <Checklist heading="What you will do" items={role.responsibilities} />
            <Checklist heading="What we are looking for" items={role.requirements} />
          </div>
          {role.niceToHave?.length ? (
            <div className="mt-16 lg:w-1/2 lg:pr-12">
              <Checklist heading="Nice to have" items={role.niceToHave} />
            </div>
          ) : null}
          <p className="mt-16 max-w-2xl leading-relaxed text-muted-foreground">
            Not quite a match? Browse{" "}
            <Link href="/careers" className={linkClass}>
              all open roles
            </Link>{" "}
            or send a general application.
          </p>
        </Container>
      </section>

      <section id="apply" className="relative scroll-mt-24 border-t border-foreground/10 py-24 lg:py-32">
        <Container>
          <div className="grid gap-16 lg:grid-cols-[1fr_1.5fr] lg:gap-24">
            <div>
              <h2 className="mb-4 font-display text-3xl tracking-tight lg:text-4xl">Apply for {role.title}</h2>
              <p className="leading-relaxed text-muted-foreground">
                Attach your CV and tell us about the work that best matches this role.
              </p>
            </div>
            <ApplicationForm defaultRole={role.slug} />
          </div>
        </Container>
      </section>

      <CTASection />
    </>
  );
}
