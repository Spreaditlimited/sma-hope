/* eslint-disable @next/next/no-img-element -- Cloudinary supplies responsive resizing, automatic format and quality directly. */
import { getGuideImage, guideImageUrl } from "@/lib/guide-images";

type Props = { slug: string; variant?: "feature" | "card" };
export function GuideImage({ slug, variant = "feature" }: Props) {
  const image = getGuideImage(slug);
  if (!image) return null;
  const card = variant === "card";
  const widths = card ? [320, 480, 640, 960] : [640, 960, 1280, 1600, 2000, 2400];
  return <img
    className={`guide-image guide-image--${variant}`}
    src={guideImageUrl(image, card ? 640 : 1600)}
    srcSet={widths.map(width => `${guideImageUrl(image, width)} ${width}w`).join(", ")}
    sizes={card ? "(max-width: 650px) calc(100vw - 40px), (max-width: 1000px) 45vw, 360px" : "(max-width: 1100px) calc(100vw - 40px), 1050px"}
    width={image.width}
    height={image.height}
    alt={image.alt}
    loading={card ? "lazy" : "eager"}
    fetchPriority={card ? "auto" : "high"}
    decoding="async"
  />;
}
