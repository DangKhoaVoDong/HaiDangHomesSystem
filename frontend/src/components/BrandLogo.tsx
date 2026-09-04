import Image from 'next/image';

type BrandLogoProps = { className?: string; light?: boolean; priority?: boolean };

export function BrandLogo({ className = 'h-10 w-auto', light = false, priority = false }: BrandLogoProps) {
  return (
    <Image
      src="/haidanghomes-logo.png"
      alt="Hai Dang Homes"
      width={1086}
      height={362}
      priority={priority}
      className={`${className} object-contain ${light ? 'brightness-0 invert' : ''}`}
    />
  );
}
