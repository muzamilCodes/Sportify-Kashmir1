import {
  CreditCard,
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Shield,
  Truck,
  Twitter,
  Youtube,
  RefreshCw,
  Headphones,
  Clock,
  Award,
} from "lucide-react";
import NextLink from "next/link";

// Footer links are present on every page; let navigation happen on demand.
function Link(props: React.ComponentProps<typeof NextLink>) {
  return <NextLink prefetch={false} {...props} />;
}

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const sportCategories = [
    { name: "Cricket Equipment", link: "/categories/cricket" },
    { name: "Football Gear", link: "/categories/football" },
    { name: "Fitness & Gym", link: "/categories/fitness" },
    { name: "Tennis Rackets", link: "/categories/tennis" },
    { name: "Basketball", link: "/categories/basketball" },
    { name: "Badminton", link: "/categories/badminton" },
  ];

  const brands = [
    { name: "Nike", link: "/brands/nike" },
    { name: "Adidas", link: "/brands/adidas" },
    { name: "Puma", link: "/brands/puma" },
    { name: "Reebok", link: "/brands/reebok" },
    { name: "MRF", link: "/brands/mrf" },
    { name: "SS", link: "/brands/ss" },
    { name: "Cosco", link: "/brands/cosco" },
    { name: "Yonex", link: "/brands/yonex" },
    { name: "Wilson", link: "/brands/wilson" },
    { name: "Decathlon", link: "/brands/decathlon" },
  ];

  const quickLinks = [
    { name: "About Us", link: "/about" },
    { name: "Contact Us", link: "/contact" },
    { name: "Blog", link: "/blog" },
    { name: "Sale", link: "/sale" },
    { name: "Track Order", link: "/orders" },
    { name: "Wishlist", link: "/wishlist" },
  ];

  const policies = [
    { name: "7-Day Return / Easy Returns", link: "/return-policy", highlight: true },
    { name: "Shipping Policy", link: "/shipping-policy" },
    { name: "Privacy Policy", link: "/privacy-policy" },
    { name: "Terms & Conditions", link: "/terms-conditions" },
    { name: "Exchange Policy", link: "/exchange-policy" },
    { name: "Cancellation Policy", link: "/cancellation-policy" },
  ];

  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-white mt-10 pb-16 md:pb-0 text-sm">
      {/* Trust Badges */}
      <div className="bg-gray-800 dark:bg-gray-900 py-2">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-4 gap-1">
            <div className="text-center">
              <Truck className="w-5 h-5 text-green-500 mx-auto mb-1" />
              <div className="font-bold text-[10px] leading-tight">Free Shipping</div>
              <div className="hidden sm:block text-[10px] text-gray-400">Across Kashmir</div>
            </div>
            <div className="text-center">
              <Shield className="w-5 h-5 text-blue-500 mx-auto mb-1" />
              <div className="font-bold text-[10px] leading-tight">Authentic Products</div>
              <div className="hidden sm:block text-[10px] text-gray-400">100% Guaranteed</div>
            </div>
            <div className="text-center">
              <RefreshCw className="w-5 h-5 text-orange-500 mx-auto mb-1" />
              <div className="font-bold text-[10px] leading-tight">7-Day Returns</div>
              <div className="hidden sm:block text-[10px] text-gray-400">Easy Returns</div>
            </div>
            <div className="text-center">
              <Headphones className="w-5 h-5 text-purple-500 mx-auto mb-1" />
              <div className="font-bold text-[10px] leading-tight">24/7 Support</div>
              <div className="hidden sm:block text-[10px] text-gray-400">Expert Help</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <div className="text-white font-bold">SK</div>
              </div>
              <h3 className="text-base font-bold">
                Sportify <span className="text-orange-500">Kashmir</span>
              </h3>
            </div>
            <p className="text-gray-400 mb-2 text-[11px] leading-4">
              Kashmir&apos;s premier destination for premium sports equipment,
              athletic apparel, and expert advice. Serving athletes since 2024.
            </p>
            <div className="flex gap-3">
              <a href="#" className="text-gray-400 hover:text-orange-500 transition" aria-label="Instagram">
                <Instagram size={16} />
              </a>
              <a href="#" className="text-gray-400 hover:text-orange-500 transition" aria-label="Facebook">
                <Facebook size={16} />
              </a>
              <a href="#" className="text-gray-400 hover:text-orange-500 transition" aria-label="Twitter">
                <Twitter size={16} />
              </a>
              <a href="#" className="text-gray-400 hover:text-orange-500 transition" aria-label="YouTube">
                <Youtube size={16} />
              </a>
            </div>
          </div>

          {/* Sports Categories */}
          <div>
              <h4 className="text-base font-bold mb-2 flex items-center gap-2">
                <span className="w-1.5 h-5 bg-orange-500 rounded"></span>
              Shop by Sport
            </h4>
            <ul className="space-y-1">
              {sportCategories.map((category) => (
                <li key={category.name}>
                  <Link
                    href={category.link}
                    className="text-gray-400 hover:text-orange-500 transition"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
              <h4 className="text-base font-bold mb-2 flex items-center gap-2">
              <span className="w-1.5 h-5 bg-orange-500 rounded"></span>
              Quick Links
            </h4>
            <ul className="space-y-1">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.link}
                    className="text-gray-400 hover:text-orange-500 transition"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info - Handwara Address */}
          <div>
              <h4 className="text-base font-bold mb-2 flex items-center gap-2">
              <span className="w-1.5 h-5 bg-orange-500 rounded"></span>
              Contact Us
            </h4>
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-orange-500 mt-1 flex-shrink-0" />
                <div>
                  <div className="font-medium">Store Location</div>
                  <div className="text-gray-400 text-sm">
                    Handwara, Qalamabad
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-orange-500" />
                <div>
                  <div className="font-medium">Call Us</div>
                  <div className="text-gray-400">+91 9682645127</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-orange-500" />
                <div>
                  <div className="font-medium">Email Us</div>
                  <div className="text-gray-400">sportify68@gmail.com</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Policies & Services */}
        <div className="mt-4 pt-3 border-t border-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <h5 className="font-bold mb-2">Customer Services</h5>
              <ul className="space-y-1">
                <li>
                  <Link href="/product-guides" className="text-gray-400 hover:text-orange-500 text-sm transition">
                    Product Guides
                  </Link>
                </li>
                <li>
                  <Link href="/size-guide" className="text-gray-400 hover:text-orange-500 text-sm transition">
                    Size Chart
                  </Link>
                </li>
                <li>
                  <Link href="/maintenance-tips" className="text-gray-400 hover:text-orange-500 text-sm transition">
                    Maintenance Tips
                  </Link>
                </li>
                <li>
                  <Link href="/team-orders" className="text-gray-400 hover:text-orange-500 text-sm transition">
                    Team Orders
                  </Link>
                </li>
                <li>
                  <Link href="/bulk-purchases" className="text-gray-400 hover:text-orange-500 text-sm transition">
                    Bulk Purchases
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h5 className="font-bold mb-2">Policies</h5>
              <ul className="space-y-1">
                {policies.map((policy) => (
                  <li key={policy.name}>
                    <Link
                      href={policy.link}
                      className={`text-sm transition ${
                        policy.highlight
                          ? "text-orange-400 hover:text-orange-300 font-semibold"
                          : "text-gray-400 hover:text-orange-500"
                      }`}
                    >
                      {policy.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h5 className="font-bold mb-3">Popular Brands</h5>
              <div className="flex flex-wrap gap-2">
                {brands.map((brand) => (
                  <Link
                    key={brand.name}
                    href={brand.link}
                    className="px-2 py-1 bg-gray-800 dark:bg-gray-800 text-gray-300 rounded-lg hover:bg-orange-500 hover:text-white transition text-xs"
                  >
                    {brand.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="mt-4 pt-3 border-t border-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
            <div>
              <h5 className="font-bold text-base mb-1">Subscribe to Newsletter</h5>
              <p className="text-gray-400 text-sm">
                Get exclusive deals, new arrivals, and sports tips directly in your inbox!
              </p>
            </div>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-3 py-2 bg-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 border border-gray-700"
              />
              <button className="bg-orange-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-600 transition">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-4 pt-3 border-t border-gray-800 text-center text-gray-400 text-[11px]">
          <p>© {currentYear} Sportify Kashmir. All rights reserved.</p>
          <p className="text-[11px] mt-1">Proudly serving Kashmir&apos;s sports community from Handwara, Qalamabad</p>
          <div className="flex justify-center gap-3 mt-2 text-[10px]">
            <Link href="/privacy-policy" className="hover:text-orange-500 transition">
              Privacy Policy
            </Link>
            <Link href="/terms-conditions" className="hover:text-orange-500 transition">
              Terms of Use
            </Link>
            <Link href="/return-policy" className="text-orange-400 hover:text-orange-300 transition font-medium">
              7-Day Return / Easy Returns
            </Link>
            <Link href="/sitemap" className="hover:text-orange-500 transition">
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
