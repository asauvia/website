import { testimonialSchema, type Testimonial } from "@/lib/validators";

const rawTestimonials = [
  {
    id: "dreamland-technology-dreamops",
    quote:
      "Asauvia engineered Dreamops with automated workflows, real-time observability, and rock-solid stability. Shipped ahead of schedule with flawless execution.",
    story:
      "For Dreamland Technology, we needed an engineering partner capable of building Dreamops into a seamless, high-performance operational platform. Asauvia designed the architecture, built robust automation pipelines, and handed over clean, tested code with complete IP ownership. Their responsiveness and engineering rigor in Delhi made them an invaluable partner.",
    author: "Ashutosh Kumar Verma",
    role: "Owner",
    industry: "Dreamland Technology",
    location: "Delhi, India",
    category: "Cloud & Modernization",
    metrics: [
      { label: "Platform", value: "Dreamops" },
      { label: "Deployment Cycle", value: "3x Faster" },
    ],
    serviceSlug: "cloud-devops",
    serviceName: "Cloud & DevOps",
    rating: 5,
    date: "2026-08-14",
    featured: true,
  },
  {
    id: "fintech-kyc-workflow-automation",
    quote:
      "The automated verification workflow Asauvia deployed processes 50,000+ merchant onboardings monthly with a 99.4% instant verification rate.",
    story:
      "Our merchant acquisition was stalling due to multi-step document verification and PAN/GST validation queues. Asauvia designed and deployed an automated document parsing and validation pipeline with automated OCR, fraud heuristics, and human-in-the-loop escalation. Our merchant turnaround dropped from 48 hours to under 4 minutes.",
    author: "Ananya M.",
    role: "Head of Operations & Compliance",
    industry: "Fintech & Digital Lending",
    location: "Mumbai, India",
    category: "Workflow Systems",
    metrics: [
      { label: "Monthly Verification", value: "50k+ Docs" },
      { label: "Turnaround Time", value: "<4 mins" },
    ],
    serviceSlug: "ai-workflow-automation",
    serviceName: "AI Workflow Automation",
    rating: 5,
    date: "2026-07-28",
    featured: true,
  },
  {
    id: "d2c-multi-warehouse-inventory",
    quote:
      "Replaced four disjointed inventory spreadsheets with an integrated real-time dispatch dashboard. Saved over 140 operational hours every month.",
    story:
      "Managing inventory reconciliation across our Amazon, Blinkit, and Shopify channels was causing frequent stockouts and return spikes. Asauvia developed a unified inventory sync pipeline and operational dashboard tailored to our supply chain workflow. Rock-solid uptime and zero overselling during festive sales.",
    author: "Rohan K.",
    role: "Chief Technology Officer",
    industry: "D2C Brands & Omnichannel Retail",
    location: "Gurugram, India",
    category: "Workflow Systems",
    metrics: [
      { label: "Monthly Saved", value: "140+ hrs" },
      { label: "Stockout Reduction", value: "76%" },
    ],
    serviceSlug: "hr-operations-systems",
    serviceName: "HR & Operations Systems",
    rating: 5,
    date: "2026-09-18",
    featured: false,
  },
  {
    id: "clinical-healthtech-ehr-platform",
    quote:
      "Asauvia transformed our clinical workflow protocols into an ABDM-compliant telemedicine and electronic health record application in just 7 weeks.",
    story:
      "Building a compliant healthtech application requires meticulous data segregation, role-based controls, and clean API design. Asauvia provided senior engineering talent from day one, implemented comprehensive automated test suites, and helped us sail through external security audits on the first attempt.",
    author: "Dr. Priya S.",
    role: "Founder & CEO",
    industry: "Healthtech & Telemedicine SaaS",
    location: "Hyderabad, India",
    category: "Product Engineering",
    metrics: [
      { label: "Audit Clearance", value: "100% Pass" },
      { label: "Time to Launch", value: "7 Weeks" },
    ],
    serviceSlug: "product-engineering",
    serviceName: "Product Engineering",
    rating: 5,
    date: "2026-09-02",
    featured: false,
  },
  {
    id: "logistics-fleet-telematics-app",
    quote:
      "Their offline-first mobile app handles intermittent network coverage across 22 national freight corridors without losing a single telemetry packet.",
    story:
      "Our long-haul fleet drivers operate across national highways with spotty connectivity. Asauvia engineered a high-performance PWA with SQLite client caching, background sync, and instant live GPS telemetry. Drivers love the simplicity, and our operational tracking accuracy reached 99.8%.",
    author: "Rajesh S.",
    role: "Director of Digital Systems",
    industry: "Supply Chain & Long-Haul Logistics",
    location: "Pune, India",
    category: "Product Engineering",
    metrics: [
      { label: "Fleet Coverage", value: "12,000+ trucks" },
      { label: "Data Reliability", value: "99.8%" },
    ],
    serviceSlug: "web-mobile-applications",
    serviceName: "Web & Mobile App Development",
    rating: 5,
    date: "2026-04-30",
    featured: false,
  },
  {
    id: "cloud-finops-kubernetes-modernization",
    quote:
      "Migrated our monolithic core banking microservices to containerized AWS EKS with zero customer downtime and reduced our monthly cloud bill by 38%.",
    story:
      "Our infrastructure costs were escalating ahead of audit deadlines. Asauvia audited our architecture, wrote complete Terraform modules, hardened security groups, and built automated GitHub Actions pipelines with Core Web Vitals checks. Outstanding engineering communication and deep cloud expertise.",
    author: "Kavita R.",
    role: "Chief Technology Officer",
    industry: "Fintech & Banking Infrastructure",
    location: "Mumbai, India",
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
    id: "enterprise-b2b-procurement-portal",
    quote:
      "Clean sprint execution, transparent Jira backlogs, and zero technical debt. Asauvia delivered our vendor portal two weeks ahead of schedule.",
    story:
      "We hired Asauvia to engineer our B2B quotation and purchase order portal connecting 400+ industrial component vendors. Their daily standups, clean TypeScript code, and clear documentation made handover completely effortless. The platform processed ₹18 Cr in transactions in its first quarter.",
    author: "Amit P.",
    role: "Co-Founder & COO",
    industry: "Industrial Supply & B2B Procurement",
    location: "Chennai, India",
    category: "Custom Software",
    metrics: [
      { label: "Quarterly GMV", value: "₹18 Cr+" },
      { label: "Milestone Delivery", value: "Ahead by 2 wks" },
    ],
    serviceSlug: "custom-software-development",
    serviceName: "Custom Software Development",
    rating: 5,
    date: "2026-05-11",
    featured: false,
  },
  {
    id: "b2b-saas-nlq-analytics",
    quote:
      "Asauvia's pragmatic approach to LLM prompt evaluation and caching prevented costly hallucinations and gave us an enterprise-grade SQL copilot.",
    story:
      "We evaluated three external development partners for our natural language database querying assistant. Asauvia stood out because they prioritized benchmarking, deterministic schema validation, and latency optimization over naive API wrappers. Our enterprise customers now generate custom reports in seconds.",
    author: "Neha V.",
    role: "VP of Product",
    industry: "Enterprise SaaS & Business Intelligence",
    location: "Noida, India",
    category: "AI & Automation",
    metrics: [
      { label: "Query Accuracy", value: "98.1%" },
      { label: "P95 Latency", value: "<1.1s" },
    ],
    serviceSlug: "ai-software-development",
    serviceName: "AI Software Development",
    rating: 5,
    date: "2026-08-25",
    featured: false,
  },
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
    featured: false,
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
    featured: false,
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
    serviceName: "Web & Mobile App Development",
    rating: 5,
    date: "2026-04-30",
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
