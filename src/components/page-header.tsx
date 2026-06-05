import Image from "next/image";

interface PageHeaderProps {
  title: string;
  intro?: string;
  backgroundImage?: string;
}

export function PageHeader({ title, intro, backgroundImage }: PageHeaderProps) {
  return (
    <header className="relative flex items-center justify-center overflow-hidden bg-slate-950 px-4 py-20 text-center md:bg-transparent md:py-32">
      {/* Background Image & Overlay */}
      {backgroundImage && (
        <div className="absolute inset-0 -z-10 hidden md:block">
          <Image
            src={backgroundImage}
            alt={`${title} background`}
            fill
            className="object-cover object-center"
            priority
          />
          {/* Stronger overlay to keep heading copy legible on all image backgrounds */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950/80 via-slate-900/70 to-slate-950/78" />
        </div>
      )}

      {/* Header Content */}
      <div className="relative z-10 max-w-4xl mx-auto space-y-6">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight !text-white drop-shadow-[0_6px_20px_rgba(2,12,20,0.55)] [text-wrap:balance]">
          {title}
        </h1>
        
        {intro && (
          <p className="text-lg md:text-2xl font-semibold !text-slate-100 leading-relaxed max-w-3xl mx-auto drop-shadow-[0_4px_16px_rgba(2,12,20,0.5)] [text-wrap:pretty]">
            {intro}
          </p>
        )}
      </div>
    </header>
  );
}
