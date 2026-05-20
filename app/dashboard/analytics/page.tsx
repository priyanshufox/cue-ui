import Link from "next/link";

const stats = [
  { label: "Total impressions", value: "24,512", change: "+18%", up: true },
  { label: "Engagements", value: "1,843", change: "+12%", up: true },
  { label: "Clicks", value: "342", change: "-3%", up: false },
  { label: "New followers", value: "89", change: "+24%", up: true },
];

const topPosts = [
  {
    id: 1,
    platform: "Twitter/X",
    platformColor: "bg-black",
    platformInitial: "𝕏",
    content: "5 lessons we learned scaling from 0 to 10,000 users…",
    impressions: 8420,
    engagements: 312,
    date: "May 18",
  },
  {
    id: 2,
    platform: "LinkedIn",
    platformColor: "bg-blue-700",
    platformInitial: "in",
    content: "We're hiring! Looking for a passionate frontend engineer…",
    impressions: 6201,
    engagements: 204,
    date: "May 15",
  },
  {
    id: 3,
    platform: "Twitter/X",
    platformColor: "bg-black",
    platformInitial: "𝕏",
    content: "Here's a quick tip for boosting your social media engagement…",
    impressions: 4890,
    engagements: 187,
    date: "May 12",
  },
];

const barData = [55, 72, 48, 90, 65, 83, 71, 60, 88, 95, 74, 82, 67, 79];

export default function AnalyticsPage() {
  return (
    <div className="h-full flex flex-col">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Analytics</h1>
          <p className="text-xs text-gray-500 mt-0.5">Last 30 days</p>
        </div>
        <div className="flex items-center gap-3">
          <select className="text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>Last 30 days</option>
            <option>Last 7 days</option>
            <option>Last 90 days</option>
          </select>
          <select className="text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>All channels</option>
            <option>Twitter/X</option>
            <option>LinkedIn</option>
            <option>Facebook</option>
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Stats grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((s) => (
              <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-xs text-gray-500 mb-2">{s.label}</p>
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                <p className={`text-xs font-medium mt-1 ${s.up ? "text-green-600" : "text-red-500"}`}>
                  {s.change} vs. last period
                </p>
              </div>
            ))}
          </div>

          {/* Impressions chart */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-semibold text-gray-900">Impressions over time</h2>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-1.5 rounded-full bg-blue-500 inline-block"></span>
                  Impressions
                </span>
              </div>
            </div>
            {/* Simple bar chart */}
            <div className="flex items-end gap-1.5 h-32">
              {barData.map((val, i) => (
                <div
                  key={i}
                  className="flex-1 bg-blue-100 hover:bg-blue-500 rounded-t-md transition-colors cursor-pointer group relative"
                  style={{ height: `${val}%` }}
                >
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 hidden group-hover:block bg-gray-900 text-white text-xs px-1.5 py-0.5 rounded whitespace-nowrap">
                    {Math.round(val * 24.5)}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-400">
              <span>May 7</span>
              <span>May 20</span>
            </div>
          </div>

          {/* Top posts */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">Top performing posts</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {topPosts.map((post) => (
                <div key={post.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
                  <div className={`w-8 h-8 rounded-lg ${post.platformColor} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                    {post.platformInitial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 truncate">{post.content}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{post.date} · {post.platform}</p>
                  </div>
                  <div className="flex items-center gap-6 flex-shrink-0 text-right">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{post.impressions.toLocaleString()}</p>
                      <p className="text-xs text-gray-400">impressions</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{post.engagements}</p>
                      <p className="text-xs text-gray-400">engagements</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upgrade nudge */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between gap-6">
              <div>
                <h3 className="font-semibold text-lg mb-1">Unlock detailed analytics</h3>
                <p className="text-blue-100 text-sm">
                  Get audience demographics, optimal posting times, and competitor insights with Essentials.
                </p>
              </div>
              <Link
                href="/signup"
                className="flex-shrink-0 bg-white text-blue-600 hover:bg-blue-50 font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors"
              >
                Upgrade plan
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
