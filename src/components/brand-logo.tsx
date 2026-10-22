import Image from "next/image";

export function BrandLogo({ priority = false, alt = "SMA Hope Foundation" }: { priority?: boolean; alt?: string }) {
  return <span className="brand-logo">
    <Image className="brand-logo-light" src="/SMA Hope Foundation logo.png" alt={alt} width={240} height={127} priority={priority} />
    <Image className="brand-logo-dark" src="/sma-hope-logo-dark.png" alt={alt} width={240} height={127} />
  </span>;
}
