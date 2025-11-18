'use client'

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white pt-12 pb-6 px-6 md:px-16 lg:px-20">
      <div className="max-w-[90rem] mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
        
        {/* Branding & Socials */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold tracking-wide">WHERE&apos;S THE FUND</h2>
          <p className="text-sm text-gray-400">© 2025 All Rights Reserved.</p>
          <div className="flex gap-4 mt-4">
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="hover:text-teal-400">
              <i className="fab fa-twitter"></i>
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="hover:text-teal-400">
              <i className="fab fa-facebook"></i>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-teal-400">
              <i className="fab fa-instagram"></i>
            </a>
          </div>
        </div>

        {/* Navigation */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold mb-2">Navigation</h3>
          <ul className="space-y-1 text-gray-400">
            <li><Link href="/" className="hover:text-white">Home</Link></li>
            <li><Link href="/dashboard" className="hover:text-white">Dashboard</Link></li>
            <li><Link href="/how-it-works" className="hover:text-white">How It Works?</Link></li>
            <li><Link href="/campaigns" className="hover:text-white">Campaigns</Link></li>
            <li><Link href="/about" className="hover:text-white">About Us</Link></li>
          </ul>
        </div>

        {/* Legal */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold mb-2">Legal</h3>
          <ul className="space-y-1 text-gray-400">
            <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
            <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
            <li><Link href="/regulation" className="hover:text-white">Licensed & Regulation</Link></li>
          </ul>
        </div>
      </div>

      {/* CTA Button */}
      <div className="mt-12 text-center">
        <Link href="/join" className="inline-block bg-teal-500 text-white px-6 py-3 rounded-lg hover:bg-teal-600 transition">
          Join Us Now
        </Link>
      </div>

      {/* Scroll to Top */}
      <div className="mt-8 text-center">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="text-gray-400 hover:text-white transition"
          aria-label="Scroll to top"
        >
          ↑
        </button>
      </div>
    </footer>
  );
}
