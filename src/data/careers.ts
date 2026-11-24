/**
 * Open roles shown on /careers and /careers/[slug].
 *
 * DRAFT CONTENT: the roles below are placeholders written to match the service catalog.
 * Replace them with real openings (or set `open: false` / remove entries) before the page goes live.
 */
export type Role = {
  slug: string;
  title: string;
  team: string;
  location: string;
  type: "Full-time" | "Part-time" | "Contract";
  summary: string;
  responsibilities: string[];
  requirements: string[];
  niceToHave?: string[];
  open: boolean;
};

export const roles: Role[] = [
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
    open: true,
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
    open: true,
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
    open: true,
  },
];

export const openRoles = roles.filter((role) => role.open);

export function getRole(slug: string) {
  return openRoles.find((role) => role.slug === slug);
}

export const EXPERIENCE_LEVELS = ["Less than 1 year", "1–3 years", "3–6 years", "6+ years"] as const;
