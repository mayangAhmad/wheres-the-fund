export default function ImpactHighlights() {
  return (
    <section className="py-16 px-6 md:px-16 lg:px-20 bg-gray-900">
      <div className="max-w-[90rem] mx-auto bg-gray-800 rounded-2xl p-8 md:p-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-white text-center">
          {/* Feature 1 */}
          <div>
            <h3 className="text-xl font-semibold mb-2">We value transparency</h3>
            <p className="text-sm text-gray-300">
              You can see how your donation is being used by each campaign.
              Hover to Dashboard to see more.
            </p>
          </div>

          {/* Feature 2 */}
          <div>
            <h3 className="text-xl font-semibold mb-2">Donate with ease</h3>
            <p className="text-sm text-gray-300">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </p>
          </div>

          {/* Feature 3 */}
          <div>
            <h3 className="text-xl font-semibold mb-2">Impact guaranteed</h3>
            <p className="text-sm text-gray-300">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
