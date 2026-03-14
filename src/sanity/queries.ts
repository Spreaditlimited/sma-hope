export const latestUpdatesQuery = `*[_type == "post"] | order(publishedAt desc)[0...3]{
  title,
  "slug": slug.current,
  excerpt,
  publishedAt,
  category,
  "image": featuredImage.asset->url
}`;

export const updatesQuery = `*[_type == "post"] | order(publishedAt desc){
  title,
  "slug": slug.current,
  excerpt,
  publishedAt,
  category,
  "image": featuredImage.asset->url,
  body
}`;

export const updateBySlugQuery = `*[_type == "post" && slug.current == $slug][0]{
  title,
  "slug": slug.current,
  excerpt,
  publishedAt,
  category,
  "image": featuredImage.asset->url,
  body
}`;

export const faqQuery = `*[_type == "faqItem"] | order(category asc, orderRank asc){
  category,
  question,
  answer
}`;
