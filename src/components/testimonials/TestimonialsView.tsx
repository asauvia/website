"use client";

import { useId, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  CheckCircle2,
  Quote,
  Search,
  Sparkles,
  Star,
  MapPin,
  X,
} from "lucide-react";
import type { Testimonial } from "@/lib/validators";
import { testimonialCategories, type TestimonialCategory } from "@/data/testimonials";

interface TestimonialsViewProps {
  initialTestimonials: Testimonial[];
}

export function TestimonialsView({ initialTestimonials }: TestimonialsViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<TestimonialCategory>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedStories, setExpandedStories] = useState<Record<string, boolean>>({});
  const searchInputId = useId();

  const toggleStory = (id: string) => {
    setExpandedStories((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredTestimonials = useMemo(() => {
    return initialTestimonials.filter((item) => {
      const matchesCategory =
        selectedCategory === "All" || item.category === selectedCategory;

      const query = searchQuery.trim().toLowerCase();
      if (!query) return matchesCategory;

      const matchesSearch =
        item.author.toLowerCase().includes(query) ||
        item.industry.toLowerCase().includes(query) ||
        item.role.toLowerCase().includes(query) ||
        item.quote.toLowerCase().includes(query) ||
        item.story.toLowerCase().includes(query) ||
        item.location.toLowerCase().includes(query) ||
        (item.serviceName && item.serviceName.toLowerCase().includes(query));

      return matchesCategory && matchesSearch;
    });
  }, [initialTestimonials, selectedCategory, searchQuery]);

  // Featured testimonial for spotlight
  const featuredItem = useMemo(() => {
    if (selectedCategory !== "All" && searchQuery) return null;
    return (
      filteredTestimonials.find((t) => t.featured) ||
      filteredTestimonials[0] ||
      null
    );
  }, [filteredTestimonials, selectedCategory, searchQuery]);

  return (
    <div className="space-y-16 lg:space-y-24">
      {/* Trust & Delivery Metrics Banner */}
      <section
        aria-label="Verified delivery metrics"
        className="rounded-2xl border border-foreground/10 bg-foreground/[0.02] p-8 lg:p-10"
      >
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:gap-12">
          <div className="space-y-2">
            <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Milestone Reliability
            </span>
            <div className="font-display text-3xl font-semibold tracking-tight lg:text-4xl">
              98%
            </div>
            <p className="text-sm text-muted-foreground">
              Delivered within agreed scope & milestones.
            </p>
          </div>

          <div className="space-y-2">
            <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              IP & Code Ownership
            </span>
            <div className="font-display text-3xl font-semibold tracking-tight lg:text-4xl">
              100%
            </div>
            <p className="text-sm text-muted-foreground">
              Assigned directly to you upon delivery.
            </p>
          </div>

          <div className="space-y-2">
            <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Time to Production
            </span>
            <div className="font-display text-3xl font-semibold tracking-tight lg:text-4xl">
              4–8 wks
            </div>
            <p className="text-sm text-muted-foreground">
              Average delivery from discovery to live deployment.
            </p>
          </div>

          <div className="space-y-2">
            <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Time Zone Advantage
            </span>
            <div className="font-display text-3xl font-semibold tracking-tight lg:text-4xl text-signal">
              +Ahead
            </div>
            <p className="text-sm text-muted-foreground">
              IST daytime overlap gives western teams overnight head starts.
            </p>
          </div>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        {/* Category Pills */}
        <div
          role="tablist"
          aria-label="Filter testimonials by domain"
          className="flex flex-wrap items-center gap-2"
        >
          {testimonialCategories.map((category) => {
            const isSelected = selectedCategory === category;
            const count =
              category === "All"
                ? initialTestimonials.length
                : initialTestimonials.filter((t) => t.category === category).length;

            return (
              <button
                key={category}
                type="button"
                role="tab"
                id={`tab-${category.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
                aria-selected={isSelected}
                onClick={() => setSelectedCategory(category)}
                className={`group inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "bg-foreground text-background shadow-sm"
                    : "border border-foreground/10 bg-background text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                }`}
              >
                <span>{category}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono ${
                    isSelected
                      ? "bg-background/20 text-background"
                      : "bg-foreground/5 text-muted-foreground group-hover:text-foreground"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72 lg:w-80">
          <label htmlFor={searchInputId} className="sr-only">
            Search testimonials
          </label>
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            id={searchInputId}
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by role, domain, or outcome..."
            className="h-10 w-full rounded-full border border-foreground/10 bg-background pl-10 pr-9 text-xs placeholder:text-muted-foreground/70 focus:border-foreground focus:outline-none transition-colors"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </div>

      {/* Featured Spotlight (only shown on 'All' with no search) */}
      {featuredItem && selectedCategory === "All" && !searchQuery ? (
        <article
          id="featured-testimonial"
          className="relative overflow-hidden rounded-3xl border border-foreground/10 bg-gradient-to-br from-foreground/[0.03] to-transparent p-8 md:p-12 lg:p-14"
        >
          <div className="pointer-events-none absolute right-8 top-8 opacity-10">
            <Quote className="h-32 w-32" />
          </div>

          <div className="relative z-10 flex flex-col justify-between gap-10 lg:flex-row lg:items-start lg:gap-16">
            <div className="max-w-3xl space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-foreground/15 bg-background px-3 py-1 font-mono text-[11px] font-medium text-foreground">
                  <Sparkles className="h-3 w-3 text-signal" />
                  Featured Client Story
                </span>
                <span className="font-mono text-xs text-muted-foreground">
                  {featuredItem.category}
                </span>
              </div>

              <blockquote className="font-display text-2xl font-medium leading-snug tracking-tight sm:text-3xl lg:text-4xl">
                “{featuredItem.quote}”
              </blockquote>

              <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
                {featuredItem.story}
              </p>

              {/* Tangible Metrics */}
              <div className="flex flex-wrap items-center gap-6 pt-2">
                {featuredItem.metrics.map((metric) => (
                  <div
                    key={metric.label}
                    className="flex items-center gap-3 rounded-xl border border-foreground/10 bg-background px-4 py-2.5"
                  >
                    <span className="font-display text-xl font-semibold tracking-tight text-foreground">
                      {metric.value}
                    </span>
                    <span className="font-mono text-xs text-muted-foreground">
                      {metric.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Author Profile Card */}
            <div className="shrink-0 rounded-2xl border border-foreground/10 bg-background p-6 shadow-sm lg:w-72">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-foreground text-sm font-semibold text-background">
                  {featuredItem.author
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div>
                  <h4 className="font-medium text-foreground leading-tight">
                    {featuredItem.author}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {featuredItem.role}
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-2 border-t border-foreground/10 pt-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">
                    {featuredItem.industry}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-foreground/60" />
                  <span>{featuredItem.location}</span>
                </div>
                <div className="flex items-center gap-2 text-signal">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span className="font-medium">Verified Client Engagement</span>
                </div>
              </div>

              {featuredItem.serviceSlug && (
                <div className="mt-5 border-t border-foreground/10 pt-4">
                  <Link
                    href={`/services/${featuredItem.serviceSlug}`}
                    className="group inline-flex items-center gap-1.5 text-xs font-medium text-foreground underline underline-offset-4 hover:no-underline"
                  >
                    <span>Built with {featuredItem.serviceName}</span>
                    <ArrowUpRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </article>
      ) : null}

      {/* Testimonials Grid */}
      <section aria-label="Client testimonials list" className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="font-mono text-xs text-muted-foreground">
            Showing {filteredTestimonials.length} of {initialTestimonials.length}{" "}
            verified feedback items
          </p>
          {searchQuery ? (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="text-xs text-muted-foreground hover:text-foreground underline"
            >
              Reset search
            </button>
          ) : null}
        </div>

        {filteredTestimonials.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-foreground/20 p-12 text-center">
            <Quote className="mx-auto h-8 w-8 text-muted-foreground/50 mb-3" />
            <h3 className="font-display text-xl font-medium">
              No matching client stories found
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Try adjusting your search terms or selecting another category.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory("All");
                setSearchQuery("");
              }}
              className="mt-6 inline-flex rounded-full border border-foreground/20 px-4 py-2 text-xs font-medium hover:bg-foreground/5"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredTestimonials.map((item) => {
              const isExpanded = !!expandedStories[item.id];
              return (
                <article
                  key={item.id}
                  id={`testimonial-${item.id}`}
                  className="flex flex-col justify-between rounded-2xl border border-foreground/10 bg-background p-6 lg:p-8 transition-all duration-200 hover:border-foreground/30 hover:shadow-sm"
                >
                  <div className="space-y-4">
                    {/* Header tags: Category & Stars */}
                    <div className="flex items-center justify-between gap-2 border-b border-foreground/10 pb-4">
                      <span className="font-mono text-[11px] text-muted-foreground">
                        {item.category}
                      </span>
                      <div
                        className="flex items-center gap-1 text-signal"
                        aria-label={`Rating: ${item.rating} out of 5 stars`}
                      >
                        {[...Array(item.rating)].map((_, i) => (
                          <Star
                            key={i}
                            className="h-3.5 w-3.5 fill-current"
                            aria-hidden="true"
                          />
                        ))}
                      </div>
                    </div>

                    {/* Main Quote */}
                    <blockquote className="font-display text-lg font-medium leading-snug tracking-tight text-foreground">
                      “{item.quote}”
                    </blockquote>

                    {/* Detailed Case Description (Accordion / Collapsible) */}
                    <div className="space-y-2">
                      <p
                        className={`text-sm leading-relaxed text-muted-foreground transition-all duration-300 ${
                          isExpanded ? "line-clamp-none" : "line-clamp-3"
                        }`}
                      >
                        {item.story}
                      </p>
                      <button
                        type="button"
                        onClick={() => toggleStory(item.id)}
                        className="font-mono text-[11px] text-foreground/80 hover:text-foreground underline underline-offset-2 cursor-pointer"
                      >
                        {isExpanded ? "Show less" : "Read full engagement details"}
                      </button>
                    </div>

                    {/* Metrics Pills */}
                    {item.metrics && item.metrics.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {item.metrics.map((metric) => (
                          <span
                            key={metric.label}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-foreground/10 bg-foreground/[0.02] px-2.5 py-1 font-mono text-[11px]"
                          >
                            <span className="font-semibold text-foreground">
                              {metric.value}
                            </span>
                            <span className="text-muted-foreground">
                              {metric.label}
                            </span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Author / Client Details */}
                  <div className="mt-8 border-t border-foreground/10 pt-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-foreground/5 font-mono text-xs font-semibold text-foreground border border-foreground/10">
                          {item.author
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-foreground leading-snug">
                            {item.author}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {item.role} · {item.industry}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-muted-foreground/70" />
                        {item.location}
                      </span>
                      {item.serviceSlug && (
                        <Link
                          href={`/services/${item.serviceSlug}`}
                          className="group inline-flex items-center gap-1 font-medium text-foreground hover:underline"
                        >
                          <span>{item.serviceName}</span>
                          <ArrowUpRight className="h-3 w-3 opacity-60 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Engagement Guarantee Strip */}
      <section
        aria-label="How we guarantee delivery quality"
        className="rounded-3xl border border-foreground/10 bg-foreground/[0.015] p-8 md:p-12"
      >
        <div className="grid gap-8 lg:grid-cols-3 lg:gap-12">
          <div className="space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-foreground/10 bg-background font-mono text-sm font-semibold">
              01
            </div>
            <h3 className="font-display text-xl font-medium tracking-tight">
              NDA Before Scoping
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              We sign mutual confidentiality agreements before any confidential
              code, architecture or product specifications are shared.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-foreground/10 bg-background font-mono text-sm font-semibold">
              02
            </div>
            <h3 className="font-display text-xl font-medium tracking-tight">
              Shared Backlog & Cadence
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              You get direct visibility into tasks, pull requests, and weekly demos.
              No surprises or opaque handoffs.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-foreground/10 bg-background font-mono text-sm font-semibold">
              03
            </div>
            <h3 className="font-display text-xl font-medium tracking-tight">
              Clean Handover & Full IP
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              All repository commits, infrastructure scripts, and documentation
              are fully transferred and owned by your organization.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
