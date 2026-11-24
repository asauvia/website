import company from "@/data/company";
import { ogContentType, ogSize, renderOgImage } from "@/lib/og";

export const alt = `Careers at ${company.brandName}`;
export const size = ogSize;
export const contentType = ogContentType;

export default function OpengraphImage() {
  return renderOgImage({
    eyebrow: "Careers",
    title: "Build software that changes how companies run.",
    subtitle: "Open roles in engineering, AI and design, and a direct way to apply.",
  });
}
