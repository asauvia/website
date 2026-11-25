/**
 * Open roles shown on /careers and /careers/[slug].
 *
 * Only roles with `open: true` appear on the site (listing, role page, sitemap and the application form).
 * Closed roles are kept here so they can be reopened by flipping the flag.
 */
export type Role = {
  slug: string;
  title: string;
  team: string;
  location: string;
  type: "Full-time" | "Part-time" | "Contract" | "Freelance";
  summary: string;
  /** Number of vacancies, shown when more than one. */
  openings?: number;
  responsibilities: string[];
  requirements: string[];
  niceToHave?: string[];
  /** Extra headed lists shown on the role page after the main lists (support, compensation, and so on). */
  sections?: { heading: string; items: string[] }[];
  open: boolean;
};

export const roles: Role[] = [
  {
    slug: "client-acquisition-partner",
    title: "Client Acquisition Partner",
    team: "Business Development",
    location: "100% remote, flexible hours",
    type: "Freelance",
    openings: 4,
    summary:
      "Help us grow our client base by finding, approaching and closing clients for our software products and custom development services. Performance-based, with a profit share on every deal you close.",
    responsibilities: [
      "Organic lead generation: find potential clients through LinkedIn, Google, business directories, referrals and professional networks, and build a qualified pipeline without paid advertising.",
      "Business development: approach startups, businesses, enterprises and organizations that need software and technology solutions, for both our existing products and custom software development.",
      "Client acquisition and deal closure: introduce our products and services, understand client requirements, present suitable solutions, and manage discussions, follow-ups, negotiations and closure through the full cycle from prospect to client.",
      "Client relationship management: build and maintain professional relationships, coordinate with our internal team on requirements, and keep communication smooth throughout the process.",
    ],
    requirements: [
      "Excellent communication, negotiation and networking skills.",
      "Able to find and approach potential clients independently.",
      "Understanding of B2B sales, client acquisition or business development.",
      "Self-driven, proactive and focused on results.",
      "Able to work independently and focus on converting opportunities into closed deals.",
    ],
    niceToHave: ["Experience in IT services, software sales, lead generation or business development."],
    sections: [
      {
        heading: "Support from our side",
        items: [
          "Complete product and service information.",
          "Product demonstrations for prospective clients.",
          "Pricing details and business proposals.",
          "Technical team support to understand client requirements.",
          "Help with solution discussions and moving deals forward.",
        ],
      },
      {
        heading: "Compensation and engagement",
        items: [
          "100% performance-based: a percentage of the profit from every successfully closed deal.",
          "No fixed salary or monthly stipend.",
          "The profit-share percentage and payout terms are agreed with you before the engagement starts.",
          "Flexible working hours and fully remote.",
          "Part-time, independent freelance engagement, with the chance of a long-term association based on performance.",
        ],
      },
      {
        heading: "Who should apply",
        items: [
          "Freelance business development professionals.",
          "Independent sales consultants.",
          "Lead generation specialists.",
          "Working professionals looking for an additional income opportunity.",
          "People with strong business networks and client acquisition ability.",
        ],
      },
    ],
    open: true,
  },
  {
    slug: "full-stack-engineer",
    title: "Full-Stack Engineer",
    team: "Engineering",
    location: "Uttar Pradesh, India (hybrid)",
    type: "Full-time",
    summary:
      "Build and ship web and mobile products for clients across the US, UK, Europe and Australia. You own features from scoping to production.",
    responsibilities: [
      "Build production features in TypeScript across React/Next.js front ends and Node.js or Python back ends.",
      "Work directly with client stakeholders on scope, trade-offs and delivery timelines.",
      "Write tests, review code and keep deployments reliable.",
    ],
    requirements: [
      "3+ years building production web applications.",
      "Strong TypeScript and at least one server-side framework.",
      "Comfortable working with relational databases and REST or GraphQL APIs.",
      "Clear written English for async work across time zones.",
    ],
    niceToHave: ["Experience with cloud deployments (AWS, GCP or Azure).", "Exposure to LLM or AI integrations."],
    open: false,
  },
  {
    slug: "ai-engineer",
    title: "AI Engineer",
    team: "AI & Automation",
    location: "Uttar Pradesh, India (hybrid)",
    type: "Full-time",
    summary:
      "Design and build AI features and workflow automation: retrieval pipelines, LLM integrations and the evaluation work that keeps them dependable.",
    responsibilities: [
      "Build LLM-backed features, retrieval pipelines and agentic workflows for client systems.",
      "Set up evaluation harnesses so model and prompt changes are measured, not guessed.",
      "Integrate AI components with existing business systems through APIs and queues.",
    ],
    requirements: [
      "2+ years of Python or TypeScript engineering, with production experience.",
      "Hands-on work with LLM APIs, embeddings or vector search.",
      "Understanding of cost, latency and failure modes for AI features.",
    ],
    niceToHave: ["Experience with workflow tools or data pipelines.", "Published or open-source work in ML or NLP."],
    open: false,
  },
  {
    slug: "product-designer",
    title: "Product Designer",
    team: "Design",
    location: "Remote (India time zone overlap preferred)",
    type: "Contract",
    summary:
      "Shape how client products look, feel and work, from discovery research through to interface design and handoff.",
    responsibilities: [
      "Run lightweight discovery with client users and turn findings into clear flows.",
      "Design interfaces, components and prototypes that engineers can build without guesswork.",
      "Keep design consistent across projects using shared patterns.",
    ],
    requirements: [
      "3+ years of product design work with a portfolio of shipped products.",
      "Fluency in Figma and in designing for responsive web and mobile.",
      "Ability to explain design decisions to non-designers.",
    ],
    niceToHave: ["Accessibility (WCAG) experience.", "Basic front-end skills (HTML/CSS)."],
    open: false,
  },
];

export const openRoles = roles.filter((role) => role.open);

export function getRole(slug: string) {
  return openRoles.find((role) => role.slug === slug);
}

export const EXPERIENCE_LEVELS = ["Less than 1 year", "1–3 years", "3–6 years", "6+ years"] as const;
