import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageHero } from "@/components/ui/PageHero";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { JsonLd } from "@/components/seo/JsonLd";
import { ApplicationForm } from "@/components/forms/ApplicationForm";
import { CTASection } from "@/components/sections/CTASection";
import { pageGraph, type Crumb } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";
import { openRoles } from "@/data/careers";
import company from "@/data/company";

const path = "/careers";
const title = "Careers at Asauvia: Build AI and Software Products";
const description =
  "Join Asauvia. We build AI, automation and software for growing companies from India, working with teams across the US, UK, Europe and Australia. See open roles and apply.";

const crumbs: Crumb[] = [
  { name: "Home", path: "/" },
  { name: "Careers", path },
];

export const metadata: Metadata = pageMetadata({ path, title, description, absoluteTitle: true });

const linkClass =
  "text-foreground underline underline-offset-4 hover:no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground";

export default function CareersPage() {
  return (
    <>
      <JsonLd
        data={pageGraph({
          path,
          name: title,
          description,
          crumbs,
          type: "CollectionPage",
        })}
      />
      <PageHero
        crumbs={crumbs}
        label="Careers"
        title="Build software that"
        titleMuted="changes how companies run."
        description="We are a small team delivering AI, automation and custom software for growing companies. If you like shipping real systems and explaining them clearly, we would like to hear from you."
      />

      <section className="relative py-24 lg:py-32">
        <Container>
          <SectionHeading label="Open roles" title="Where we are hiring" />

          {openRoles.length > 0 ? (
            <ul className="mt-12 border-t border-foreground/10">
              {openRoles.map((role, index) => (
                <li key={role.slug} className="border-b border-foreground/10">
                  <Reveal delay={index * 80}>
                    <Link
                      href={`/careers/${role.slug}`}
                      className="group grid gap-4 py-8 transition-colors md:grid-cols-[1fr_auto] md:items-center md:gap-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
                    >
                      <div>
                        <p className="mb-2 font-mono text-sm text-muted-foreground">{role.team}</p>
                        <h3 className="font-display text-3xl tracking-tight group-hover:underline group-hover:underline-offset-4 lg:text-4xl">
                          {role.title}
                        </h3>
                        <p className="mt-3 max-w-2xl leading-relaxed text-muted-foreground">{role.summary}</p>
                      </div>
                      <div className="flex items-center gap-6 text-sm text-muted-foreground md:flex-col md:items-end md:gap-2">
                        <span>{role.location}</span>
                        <span>{role.type}</span>
                        <span className="inline-flex items-center gap-1 text-foreground">
                          View role
                          <ArrowUpRight
                            aria-hidden="true"
                            className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                          />
                        </span>
                      </div>
                    </Link>
                  </Reveal>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-12 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              No roles are open at the moment. You can still send us a general application below and we will
              keep it on file.
            </p>
          )}
        </Container>
      </section>

      <section id="apply" className="relative scroll-mt-24 border-t border-foreground/10 py-24 lg:py-32">
        <Container>
          <div className="grid gap-16 lg:grid-cols-[1fr_1.5fr] lg:gap-24">
            <div>
              <h2 className="mb-4 font-display text-3xl tracking-tight lg:text-4xl">Apply to Asauvia</h2>
              <p className="mb-6 leading-relaxed text-muted-foreground">
                Pick the role you are applying for, or choose a general application. Attach your CV and tell us
                a little about the work you do best.
              </p>
              <p className="leading-relaxed text-muted-foreground">
                Prefer email? Send your CV to{" "}
                <a href={`mailto:${company.email}`} className={linkClass}>
                  {company.email}
                </a>
                .
              </p>
            </div>
            <ApplicationForm />
          </div>
        </Container>
      </section>

      <CTASection />
    </>
  );
}
