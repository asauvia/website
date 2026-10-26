import { navItemSchema, type NavItem } from "@/lib/validators";
import { serviceCatalog } from "@/data/service-catalog";
import { getAllProducts } from "@/lib/products";

const primaryNav: NavItem[] = [
  { label: "Services", href: "/services" },
  { label: "Products", href: "/products" },
  { label: "How we work", href: "/how-we-work" },
  { label: "Testimonials", href: "/testimonials" },
  { label: "Security", href: "/security" },
  { label: "About", href: "/about" },
  { label: "FAQ", href: "/faq" },
  // The blog is a subdomain app (blog/ in this repo), so this is an absolute link.
  { label: "Blog", href: "https://blog.asauvia.com" },
];

const footerGroups: { title: string; items: NavItem[]; wide?: boolean }[] = [
  {
    title: "Services",
    // Long list: laid out in two columns so the footer stays short.
    wide: true,
    items: [
      ...serviceCatalog.map((s) => ({ label: s.name, href: `/services/${s.slug}` })),
      { label: "All services", href: "/services" },
    ],
  },
  {
    title: "Products",
    items: [
      ...getAllProducts().map((product) => ({ label: product.name, href: `/products/${product.slug}` })),
      { label: "All products", href: "/products" },
    ],
  },
  {
    title: "Company",
    items: [
      { label: "About", href: "/about" },
      { label: "How we work", href: "/how-we-work" },
      { label: "Testimonials", href: "/testimonials" },
      { label: "Security", href: "/security" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Resources",
    items: [
      { label: "FAQ", href: "/faq" },
      { label: "Talk to an expert", href: "/contact" },
      { label: "Blog", href: "https://blog.asauvia.com" },
    ],
  },
  {
    title: "Legal",
    items: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "Cookies", href: "/cookies" },
    ],
  },
];

export const navigation = {
  primary: primaryNav.map((item) => navItemSchema.parse(item)),
  footerGroups: footerGroups.map((group) => ({
    title: group.title,
    wide: group.wide ?? false,
    items: group.items.map((item) => navItemSchema.parse(item)),
  })),
};
