import Link from "next/link";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

const platforms = [
  { name: "Twitter / X", color: "bg-black", icon: "𝕏" },
  { name: "LinkedIn", color: "bg-blue-700", icon: "in" },
  { name: "Facebook", color: "bg-blue-600", icon: "f" },
  { name: "Instagram", color: "bg-gradient-to-br from-purple-500 to-pink-500", icon: "IG" },
];

const features = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    title: "Schedule posts in advance",
    description: "Plan and schedule your social media content weeks ahead. Set it and forget it — Buffer publishes automatically at the perfect time.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: "Analyze your performance",
    description: "Get in-depth analytics for every post. Understand what resonates with your audience and double down on what works.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
      </svg>
    ),
    title: "Engage your audience",
    description: "Respond to comments and messages from all your social accounts in one unified inbox. Never miss a conversation.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
    title: "Manage multiple channels",
    description: "Connect up to 3 social profiles on the free plan. Upgrade to manage unlimited channels across your entire brand.",
  },
];

const testimonials = [
  {
    quote: "Buffer has completely transformed how I manage social media for my clients. The scheduling interface is incredibly intuitive.",
    author: "Sarah Chen",
    role: "Social Media Manager",
    company: "Freelance",
    avatar: "SC",
  },
  {
    quote: "We grew our Twitter following by 340% in 6 months just by being consistent with Buffer's scheduling tools.",
    author: "Marcus Johnson",
    role: "Founder",
    company: "TechStartup Inc.",
    avatar: "MJ",
  },
  {
    quote: "The analytics are a game-changer. I can finally see what content actually works and stop guessing.",
    author: "Priya Patel",
    role: "Content Strategist",
    company: "Growth Co.",
    avatar: "PP",
  },
];

const pricingPlans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for individuals just getting started with social media.",
    features: [
      "3 social channels",
      "10 scheduled posts",
      "Basic analytics",
      "Single user",
    ],
    cta: "Get started free",
    href: "/signup",
    highlighted: false,
  },
  {
    name: "Essentials",
    price: "$6",
    period: "per channel/month",
    description: "Everything you need to build your presence on social media.",
    features: [
      "Unlimited channels",
      "Unlimited scheduled posts",
      "Advanced analytics",
      "AI writing assistant",
      "Link in bio",
    ],
    cta: "Start free trial",
    href: "/signup",
    highlighted: true,
  },
  {
    name: "Team",
    price: "$12",
    period: "per channel/month",
    description: "Collaborate with your team to create and publish great content.",
    features: [
      "Everything in Essentials",
      "Unlimited team members",
      "Draft collaboration",
      "Approval workflows",
      "Custom access levels",
    ],
    cta: "Start free trial",
    href: "/signup",
    highlighted: false,
  },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-full">
      <Navbar />

      {/* Hero */}
      <section className="bg-white pt-20 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-sm font-medium px-3 py-1.5 rounded-full mb-6">
            <span className="w-2 h-2 bg-blue-500 rounded-full inline-block"></span>
            Trusted by 75,000+ businesses worldwide
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 leading-tight tracking-tight mb-6">
            Grow your audience on{" "}
            <span className="text-blue-600">social media</span>
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto mb-10">
            Buffer helps you build an audience organically. Schedule posts across every
            platform, analyze performance, and engage with your followers — all in one place.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base px-8 py-3.5 rounded-xl transition-colors"
            >
              Get started for free
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link
              href="#features"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-gray-700 hover:text-gray-900 font-semibold text-base px-8 py-3.5 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors"
            >
              See how it works
            </Link>
          </div>
          <p className="text-sm text-gray-500 mt-4">No credit card required · Free forever plan available</p>
        </div>

        {/* Dashboard mockup */}
        <div className="max-w-5xl mx-auto mt-16">
          <div className="bg-gray-900 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-gray-800">
            {/* Window chrome */}
            <div className="flex items-center gap-2 px-4 py-3 bg-gray-800 border-b border-gray-700">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <div className="mx-auto text-xs text-gray-500">buffer.app/dashboard</div>
            </div>
            {/* Mock dashboard content */}
            <div className="flex h-80">
              {/* Sidebar */}
              <div className="w-16 bg-indigo-950 flex flex-col items-center py-4 gap-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 32 32" fill="none">
                    <path d="M8 10h16M8 16h16M8 22h10" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                </div>
                {[...Array(4)].map((_, i) => (
                  <div key={i} className={`w-8 h-8 rounded-lg ${i === 0 ? "bg-indigo-700" : "bg-indigo-900"} flex items-center justify-center`}>
                    <div className="w-4 h-4 bg-indigo-500 rounded-sm opacity-60"></div>
                  </div>
                ))}
              </div>
              {/* Main content */}
              <div className="flex-1 bg-gray-50 p-4 overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-8 w-28 bg-blue-600 rounded-lg"></div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
                      <div className="h-3 w-16 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 w-full bg-gray-100 rounded mb-1"></div>
                      <div className="h-3 w-4/5 bg-gray-100 rounded mb-3"></div>
                      <div className="flex items-center justify-between">
                        <div className="h-3 w-10 bg-blue-100 rounded"></div>
                        <div className="h-3 w-8 bg-gray-100 rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform support */}
      <section className="bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 border-y border-gray-100">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm font-medium text-gray-500 mb-6 uppercase tracking-wider">Publish to every major platform</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {platforms.map((p) => (
              <div key={p.name} className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 shadow-sm">
                <span className={`w-6 h-6 rounded-full ${p.color} text-white text-xs font-bold flex items-center justify-center`}>
                  {p.icon}
                </span>
                <span className="text-sm font-medium text-gray-700">{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-white py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything you need to grow
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Buffer is the all-in-one social media toolkit for small businesses, creators, and agencies.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="flex gap-5 p-6 rounded-2xl border border-gray-100 hover:border-blue-100 hover:bg-blue-50/30 transition-all">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social proof / stats */}
      <section className="bg-blue-600 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { stat: "75K+", label: "Businesses" },
              { stat: "1M+", label: "Posts scheduled daily" },
              { stat: "4.5★", label: "Average rating" },
              { stat: "10yr+", label: "In business" },
            ].map((item) => (
              <div key={item.label}>
                <div className="text-4xl font-bold text-white mb-1">{item.stat}</div>
                <div className="text-blue-200 text-sm font-medium">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-white py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Loved by creators worldwide</h2>
            <p className="text-lg text-gray-600">See what our customers have to say about Buffer.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t) => (
              <div key={t.author} className="bg-gray-50 rounded-2xl p-7 border border-gray-100">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-700 leading-relaxed mb-5">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{t.author}</div>
                    <div className="text-xs text-gray-500">{t.role} · {t.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-gray-50 py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Simple, transparent pricing</h2>
            <p className="text-lg text-gray-600">
              Start for free, upgrade when you need more. No hidden fees.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-8 border-2 ${
                  plan.highlighted
                    ? "border-blue-600 bg-white shadow-xl shadow-blue-100"
                    : "border-gray-200 bg-white"
                } relative`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                      Most popular
                    </span>
                  </div>
                )}
                <h3 className="text-xl font-bold text-gray-900 mb-1">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  {plan.price !== "$0" && (
                    <span className="text-gray-500 text-sm">/{plan.period}</span>
                  )}
                </div>
                {plan.price === "$0" && (
                  <p className="text-gray-500 text-sm mb-4">{plan.period}</p>
                )}
                <p className="text-gray-600 text-sm leading-relaxed mb-6">{plan.description}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                      <svg className="w-4 h-4 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.href}
                  className={`block w-full text-center py-3 rounded-xl font-semibold text-sm transition-colors ${
                    plan.highlighted
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-white py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Ready to grow your audience?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join 75,000+ businesses using Buffer to build their social media presence.
            Start free, no credit card required.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base px-8 py-4 rounded-xl transition-colors"
          >
            Get started for free
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
