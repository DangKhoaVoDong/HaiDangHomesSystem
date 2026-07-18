const footerLinks = [
  { label: 'Privacy Policy', href: '#' },
  { label: 'Terms of Service', href: '#' },
  { label: 'Sustainability', href: '#' },
  { label: 'Press', href: '#' },
  { label: 'Contact Us', href: '#' },
];

export const SiteFooterSection = () => {
  return (
    <footer className="full-width bg-[#1c1b1b] grid grid-cols-1 md:grid-cols-12 gap-gutter px-margin-desktop py-16 w-full">
      {/* Footer Brand */}
      <div className="md:col-span-12 mb-8">
        <span className="font-display-lg text-[28px] tracking-widest uppercase text-white">
          HAIDANG HOME
        </span>
      </div>

      {/* Footer Bottom */}
      <div className="md:col-span-12 flex flex-wrap gap-6 border-t border-white/10 pt-8 justify-between items-center">
        <p className="font-body-md text-sm text-surface-variant/70">
          © 2024 HAIDANG HOME. All Rights Reserved.
        </p>
        <nav className="flex gap-8">
          {footerLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="font-label-sm text-xs text-surface-variant/70 hover:text-white transition-all uppercase tracking-wider"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
};
