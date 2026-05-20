import Link from "next/link";

const footerLinks = {
  Product: ["Features", "Pricing", "Changelog", "Status"],
  Company: ["About", "Blog", "Careers", "Press"],
  Resources: ["Help Center", "Guides", "API Docs", "Integrations"],
  Legal: ["Privacy Policy", "Terms of Service", "Cookie Policy"],
};

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="32" height="32" rx="8" fill="#2563EB" />
                <path d="M8 10h16M8 16h16M8 22h10" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
              <span className="text-lg font-bold text-white">Buffer</span>
            </Link>
            <p className="text-sm leading-relaxed">
              Build your audience on social media, one post at a time.
            </p>
          </div>
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h4 className="text-sm font-semibold text-white mb-4">{section}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link}>
                    <Link href="#" className="text-sm hover:text-white transition-colors">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm">© 2025 Buffer. All rights reserved.</p>
          <div className="flex items-center gap-4">
            {["Twitter", "LinkedIn", "Instagram"].map((platform) => (
              <Link key={platform} href="#" className="text-sm hover:text-white transition-colors">
                {platform}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
