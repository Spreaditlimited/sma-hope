import type { ReactNode } from "react";
export type PortableBlock = {
  _key?: string;
  _type: string;
  style?: string;
  listItem?: string;
  children?: { _key?: string; text?: string; marks?: string[] }[];
  markDefs?: { _key: string; _type: string; href?: string }[];
};
export type ArticleBody = string | (string | PortableBlock)[];
function text(block: PortableBlock) {
  return block.children?.map((child, index) => {
    let content: ReactNode = child.text || "";
    for (const mark of child.marks || []) {
      if (mark === "strong") content = <strong>{content}</strong>;
      else if (mark === "em") content = <em>{content}</em>;
      else {
        const link = block.markDefs?.find((d) => d._key === mark);
        if (link?.href && /^(https?:\/\/|\/(?!\/)|#|mailto:)/i.test(link.href))
          content = <a href={link.href}>{content}</a>;
      }
    }
    return <span key={child._key || index}>{content}</span>;
  });
}
export function RichBody({ body }: { body?: ArticleBody }) {
  if (!body) return <p>This article is being prepared. Please check back soon.</p>;
  if (typeof body === "string") return <p>{body}</p>;
  const output: ReactNode[] = [];
  for (let i = 0; i < body.length; i++) {
    const block = body[i];
    if (typeof block === "string") {
      output.push(<p key={i}>{block}</p>);
      continue;
    }
    if (block._type !== "block") continue;
    if (block.listItem) {
      const items: ReactNode[] = [];
      const kind = block.listItem;
      const start = i;
      while (i < body.length) {
        const item = body[i];
        if (typeof item === "string" || item.listItem !== kind) break;
        items.push(<li key={item._key || i}>{text(item)}</li>);
        i++;
      }
      i--;
      output.push(kind === "number" ? <ol key={start}>{items}</ol> : <ul key={start}>{items}</ul>);
      continue;
    }
    const content = text(block);
    const key = block._key || i;
    if (block.style === "h2") output.push(<h2 key={key}>{content}</h2>);
    else if (block.style === "h3") output.push(<h3 key={key}>{content}</h3>);
    else if (block.style === "blockquote")
      output.push(<blockquote key={key}>{content}</blockquote>);
    else output.push(<p key={key}>{content}</p>);
  }
  return <>{output}</>;
}
