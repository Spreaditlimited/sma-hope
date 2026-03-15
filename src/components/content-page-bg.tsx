import type { CSSProperties, ReactNode } from "react";

type ContentPageBgProps = {
  image: string;
  children: ReactNode;
};

export function ContentPageBg({ image, children }: ContentPageBgProps) {
  const style = { "--page-bg-image": `url("${image}")` } as CSSProperties;
  return (
    <div className="content-page-bg" style={style}>
      {children}
    </div>
  );
}
