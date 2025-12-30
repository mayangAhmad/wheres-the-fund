import { ShieldCheck, HeartHandshake, TrendingUp } from "lucide-react";

export default function ImpactHighlights() {
  const highlights = [
    {
      title: "We Value Transparency",
      description:
        "Track every cent. You can see exactly how your donation is being used by each campaign with our real-time dashboard.",
      icon: <ShieldCheck className="w-8 h-8 text-blue-400" />,
    },
    {
      title: "Donate with Ease",
      description:
        "Seamless transactions using crypto or fiat. We've optimized the process so you can support causes in just a few clicks.",
      icon: <HeartHandshake className="w-8 h-8 text-pink-500" />,
    },
    {
      title: "Impact Guaranteed",
      description:
        "Verified NGOs only. We ensure your money reaches actual people in need through our strict vetting process.",
      icon: <TrendingUp className="w-8 h-8 text-green-400" />,
    },
  ];

  return (
    <section className="py-20 px-6 md:px-16 lg:px-24 bg-gray-950">
      <div className="max-w-7xl mx-auto">
        
        {/* Optional Section Header */}
        <div className="text-center mb-12">
           <h2 className="text-3xl font-bold text-white mb-4">Why Choose Us?</h2>
           <div className="h-1 w-20 bg-blue-600 mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {highlights.map((item, index) => (
            <div
              key={index}
              className="group relative bg-gray-900/50 border border-gray-800 rounded-3xl p-8 hover:bg-gray-900 transition-all duration-300 hover:-translate-y-2 hover:border-blue-500/30 hover:shadow-xl hover:shadow-blue-900/10"
            >
              {/* Icon Container with subtle glow */}
              <div className="mb-6 inline-flex items-center justify-center p-3 rounded-2xl bg-gray-800 group-hover:bg-gray-800/80 transition-colors border border-gray-700 group-hover:border-gray-600">
                {item.icon}
              </div>

              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">
                {item.title}
              </h3>
              
              <p className="text-gray-400 leading-relaxed text-sm md:text-base">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}