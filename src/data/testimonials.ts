import { testimonialSchema, type Testimonial } from "@/lib/validators";

const rawTestimonials = [
  {
    id: "logistics-ai-assistant",
    quote:
      "Asauvia delivered an intelligent dispatch assistant that shaved 85% off our manual triage time. Their engineering rigor across time zones felt like having a superpower.",
    story:
      "We needed a dependable engineering partner to build an LLM-driven dispatch assistant integrated directly with our legacy fleet ERP. Asauvia didn't just write API wrappers; they engineered prompt guardrails, deterministic fallbacks, and comprehensive regression tests. Every milestone shipped ahead of schedule.",
    author: "David V.",
    role: "VP of Engineering",
    industry: "Logistics & Fleet Operations",
    location: "San Francisco, USA",
    category: "AI & Automation",
    metrics: [
      { label: "Triage Time", value: "-85%" },
      { label: "Delivery", value: "3 Weeks" },
    ],
    serviceSlug: "ai-software-development",
    serviceName: "AI Software Development",
    rating: 5,
    date: "2026-08-14",
    featured: true,
  },
  {
    id: "customs-workflow-automation",
    quote:
      "The custom automation Asauvia built processes 40,000+ cross-border declarations monthly with near-zero human intervention.",
    story:
      "Our operations team was drowning in unstructured vendor invoices and customs compliance forms. Asauvia built an automated data pipeline with human-in-the-loop review for low-confidence documents. Our error rate plummeted to under 0.1% while throughput tripled.",
    author: "Marcus L.",
    role: "Head of Operations",
    industry: "European Trade & Supply Chain",
    location: "Berlin, Germany",
    category: "Workflow Systems",
    metrics: [
      { label: "Monthly Volume", value: "40k+ docs" },
      { label: "Accuracy Rate", value: "99.9%" },
    ],
    serviceSlug: "ai-workflow-automation",
    serviceName: "AI Workflow Automation",
    rating: 5,
    date: "2026-07-28",
    featured: true,
  },
  {
    id: "clinical-saas-platform",
    quote:
      "From architecture review to production launch, Asauvia turned our clinical workflow specs into a robust, compliant SaaS product.",
    story:
      "As an early-stage healthtech founder, finding technical partners who understand data boundaries and code hygiene is rare. Asauvia documented the architecture up front, signed our NDA, and delivered clean, tested TypeScript code that passed our strict security audit on the first pass.",
    author: "Claire M.",
    role: "Founder & CEO",
    industry: "Clinical SaaS & Healthtech",
    location: "London, UK",
    category: "Product Engineering",
    metrics: [
      { label: "Security Audit", value: "100% Pass" },
      { label: "Time to Market", value: "8 Weeks" },
    ],
    serviceSlug: "product-engineering",
    serviceName: "Product Engineering",
    rating: 5,
    date: "2026-09-02",
    featured: false,
  },
  {
    id: "fintech-cloud-modernization",
    quote:
      "They migrated our monolithic AWS infrastructure to containerized Kubernetes with zero downtime and cut our monthly cloud bill by 38%.",
    story:
      "Our AWS bill was ballooning and deployment bottlenecks were slowing our engineering squads. Asauvia audited our architecture, wrote complete Terraform modules, and built automated GitHub Actions pipelines with Core Web Vitals checks. Outstanding communication and daily IST-APAC overlap.",
    author: "Kavita R.",
    role: "Chief Technology Officer",
    industry: "Fintech & Banking Infrastructure",
    location: "Singapore",
    category: "Cloud & Modernization",
    metrics: [
      { label: "Cloud Costs", value: "-38%" },
      { label: "Deploy Cadence", value: "4x Faster" },
    ],
    serviceSlug: "cloud-devops",
    serviceName: "Cloud & DevOps",
    rating: 5,
    date: "2026-06-19",
    featured: false,
  },
  {
    id: "enterprise-portal-handover",
    quote:
      "No bloated agency jargon or scope creep—just crisp execution, daily shared backlog transparency, and bulletproof code.",
    story:
      "We engaged Asauvia on a fixed-scope engagement to replace our legacy customer portal. The requirements were delivered down to the pixel and test suite, with intellectual property assigned cleanly at handoff. They are our go-to engineering partner.",
    author: "Julian H.",
    role: "Co-Founder & COO",
    industry: "Enterprise Operations",
    location: "Toronto, Canada",
    category: "Custom Software",
    metrics: [
      { label: "Test Coverage", value: "94%" },
      { label: "On-Time Milestone", value: "100%" },
    ],
    serviceSlug: "custom-software-development",
    serviceName: "Custom Software Development",
    rating: 5,
    date: "2026-05-11",
    featured: false,
  },
  {
    id: "transport-mobile-pwa",
    quote:
      "Working with Asauvia felt like having senior engineers on the adjacent desk. Their head start in IST meant updates were waiting for us every morning.",
    story:
      "Building our customer tracking portal demanded high-velocity engineering and resilient offline caching for mobile drivers. Asauvia delivered a blazing-fast Next.js and PWA stack that scored 98+ on Lighthouse and handles thousands of daily drivers seamlessly.",
    author: "Brett C.",
    role: "Director of Digital",
    industry: "Transport & Field Operations",
    location: "Sydney, Australia",
    category: "Product Engineering",
    metrics: [
      { label: "Lighthouse Score", value: "98/100" },
      { label: "Active Drivers", value: "15k+" },
    ],
    serviceSlug: "web-mobile-applications",
    serviceName: "Web & Mobile Applications",
    rating: 5,
    date: "2026-04-30",
    featured: false,
  },
  {
    id: "analytics-llm-evaluation",
    quote:
      "Their pragmatic approach to LLM engineering prevented costly hallucinations and gave us an enterprise-ready analytics tool in record time.",
    story:
      "We evaluated multiple agencies for our natural language SQL querying tool. Asauvia stood out because they focused on evaluation benchmarks, prompt sanitization, and fallback heuristics rather than just calling an API. The result is rock-solid and trusted by our clients.",
    author: "Elena R.",
    role: "Chief Product Officer",
    industry: "B2B Analytics & Intelligence",
    location: "Zurich, Switzerland",
    category: "AI & Automation",
    metrics: [
      { label: "Query Precision", value: "97.4%" },
      { label: "P95 Latency", value: "<1.2s" },
    ],
    serviceSlug: "ai-software-development",
    serviceName: "AI Software Development",
    rating: 5,
    date: "2026-08-25",
    featured: false,
  },
  {
    id: "retail-inventory-automation",
    quote:
      "Automated our inventory forecasting and supplier reconciliation across 12 warehouses. Saved us hundreds of manual spreadsheet hours each month.",
    story:
      "Asauvia's team integrated directly with our existing inventory APIs and built a streamlined web dashboard with role-based permissions. They never disrupted existing production systems during rollout and trained our team thoroughly.",
    author: "Ethan M.",
    role: "VP Operations",
    industry: "Retail & Multi-Warehouse Supply",
    location: "Chicago, USA",
    category: "Workflow Systems",
    metrics: [
      { label: "Monthly Saved", value: "120+ hrs" },
      { label: "ROI Timeframe", value: "45 Days" },
    ],
    serviceSlug: "hr-operations-systems",
    serviceName: "HR & Operations Systems",
    rating: 5,
    date: "2026-09-18",
    featured: false,
  },
];

export const testimonials: Testimonial[] = rawTestimonials.map((item) =>
  testimonialSchema.parse(item)
);

export const testimonialCategories = [
  "All",
  "AI & Automation",
  "Product Engineering",
  "Workflow Systems",
  "Custom Software",
  "Cloud & Modernization",
] as const;

export type TestimonialCategory = (typeof testimonialCategories)[number];

export default testimonials;
