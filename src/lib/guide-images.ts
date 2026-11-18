import assets from "@/content/guide-images.json";

export type GuideImageAsset = {
  slug: string;
  alt: string;
  src: string;
  width: number;
  height: number;
  sharingUrl: string;
};
const bySlug = new Map<string, GuideImageAsset>(assets.map(asset => [asset.slug, asset]));
export function getGuideImage(slug: string): GuideImageAsset | undefined {
  return bySlug.get(slug);
}
// Cloudinary performs the resizing and format negotiation, without a second image proxy.
export function guideImageUrl(image: GuideImageAsset, width: number): string {
  const bounded = Math.max(1, Math.min(image.width, Math.round(width)));
  return image.src.replace("/image/upload/", `/image/upload/c_limit,w_${bounded}/q_auto/f_auto/`);
}
