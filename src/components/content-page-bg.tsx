import { ReactNode } from "react";
import Image from "next/image";

interface ContentPageBgProps {
  image?: string;
  children: ReactNode;
  className?: string;
}

export function ContentPageBg({ image, children, className }: ContentPageBgProps) {
  return (
    <div className={`relative min-h-screen bg-gray-50 flex flex-col font-sans ${className ?? ""}`}>
      {/* Optional: Subtle background texture/image behind the main content area */}
      {image && (
        <div className="absolute top-0 left-0 right-0 h-[70vh] -z-20 overflow-hidden pointer-events-none">
          <Image
            src={image}
            alt="Page background subtle texture"
            fill
            className="object-cover opacity-5"
            priority
          />
          {/* Gradient to fade the image out smoothly before reaching the text */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-50/80 to-gray-50" />
        </div>
      )}
      
      {/* Main Content Wrapper */}
      <div className="flex-grow relative z-10">
        {children}
      </div>
    </div>
  );
}
