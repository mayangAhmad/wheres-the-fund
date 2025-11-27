'use client'

import Link from "next/link";
import Image from "next/image";
import wsrvLoader from "@/lib/services/image-service";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white pt-12 pb-6 px-6 md:px-16 lg:px-20 border-t border-gray-800">
      <div className="max-w-360 mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
        
        {/* Branding & Socials */}
        <div className="space-y-4">
          <Link href="/" className="inline-block">
            <Image
              src="/wtf-invert.svg" 
              alt="WheresTheFund Logo" 
              width={160} 
              height={45} 
              className="w-40 h-auto" // Adjust width as needed
              priority
            />
          </Link>

          <p className="text-sm text-gray-400">© 2025 All Rights Reserved.</p>
          
          <div className="flex gap-4 mt-4">
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="hover:text-teal-400 transition-colors">
              <i className="fab fa-twitter"></i>
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="hover:text-teal-400 transition-colors">
              <i className="fab fa-facebook"></i>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-teal-400 transition-colors">
              <i className="fab fa-instagram"></i>
            </a>
          </div>
        </div>

        {/* Navigation */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold mb-2 text-white">Navigation</h3>
          <ul className="space-y-2 text-gray-400">
            <li><Link href="/" className="hover:text-orange-400 transition-colors">Home</Link></li>
            <li><Link href="/dashboard" className="hover:text-orange-400 transition-colors">Dashboard</Link></li>
            <li><Link href="/how-it-works" className="hover:text-orange-400 transition-colors">How It Works?</Link></li>
            <li><Link href="/campaigns" className="hover:text-orange-400 transition-colors">Campaigns</Link></li>
            <li><Link href="/about" className="hover:text-orange-400 transition-colors">About Us</Link></li>
          </ul>
        </div>

        {/* Legal */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold mb-2 text-white">Legal</h3>
          <ul className="space-y-2 text-gray-400">
            <li><Link href="/terms" className="hover:text-orange-400 transition-colors">Terms of Service</Link></li>
            <li><Link href="/privacy" className="hover:text-orange-400 transition-colors">Privacy Policy</Link></li>
            <li><Link href="/regulation" className="hover:text-orange-400 transition-colors">Licensed & Regulation</Link></li>
          </ul>
        </div>
      </div>

      {/* CTA Button */}
      <div className="mt-12 text-center">
        <Link href="/join" className="inline-block bg-orange-500 text-white font-medium px-8 py-3 rounded-full hover:bg-teal-600 transition shadow-lg hover:shadow-teal-500/20">
          Join Us Now
        </Link>
      </div>

      {/* Scroll to Top */}
      <div className="mt-8 text-center">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="text-gray-500 hover:text-white transition-colors p-2"
          aria-label="Scroll to top"
        >
          ↑ Back to Top
        </button>
      </div>
    </footer>
  );
}