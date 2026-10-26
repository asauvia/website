import company from "@/data/company";
import { ogContentType, ogSize, renderOgImage } from "@/lib/og";
import testimonials from "@/data/testimonials";

export const alt = `${company.brandName} client reviews and testimonials`;
export const size = ogSize;
export const contentType = ogContentType;

export default function OpengraphImage() {
  return renderOgImage({
    eyebrow: "Client Stories",
    title: "What our clients say.",
    subtitle: `Verified reviews from ${testimonials.length} founders and engineering leaders across India, the US, and worldwide.`,
  });
}
