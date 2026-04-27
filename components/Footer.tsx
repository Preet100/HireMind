import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="w-full border-t border-white/10 bg-[#16171e]/80 backdrop-blur-md mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between gap-10">
        
        {/* Brand & Description */}
        <div className="flex flex-col gap-4 max-w-sm">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="HireMind AI Logo"
              width={32}
              height={32}
              style={{ width: 32, height: "auto", borderRadius: "8px" }}
            />
            <span className="text-xl font-bold tracking-wide text-white">
              HireMind AI
            </span>
          </Link>
          <p className="text-sm text-light-400 leading-relaxed">
            Your personal AI-powered mock interview platform. Practice your skills, get instant feedback, and ace your next real-world interview.
          </p>
        </div>

        {/* Links Container */}
        <div className="flex flex-row gap-16 flex-wrap">
          {/* Quick Links */}
          <div className="flex flex-col gap-3">
            <h4 className="text-white font-semibold mb-1">Quick Links</h4>
            <Link href="/" className="text-sm text-light-400 hover:text-primary-200 transition-colors">
              Dashboard
            </Link>
            <Link href="/resume-interview" className="text-sm text-light-400 hover:text-primary-200 transition-colors">
              Resume Interview
            </Link>
            <Link href="/profile" className="text-sm text-light-400 hover:text-primary-200 transition-colors">
              Profile & Settings
            </Link>
          </div>

          {/* Socials / Contact */}
          <div className="flex flex-col gap-3">
            <h4 className="text-white font-semibold mb-1">Connect</h4>
            <a href="#" className="text-sm text-light-400 hover:text-white transition-colors flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
              GitHub
            </a>
            <a href="#" className="text-sm text-light-400 hover:text-[#1DA1F2] transition-colors flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
              Twitter
            </a>
            <a href="#" className="text-sm text-light-400 hover:text-[#0A66C2] transition-colors flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
              LinkedIn
            </a>
          </div>
        </div>
      </div>
      
      {/* Copyright Bar */}
      <div className="w-full border-t border-white/5 py-6">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-light-400">
            © {new Date().getFullYear()} HireMind AI. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="#" className="text-xs text-light-400 hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="text-xs text-light-400 hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
