import React from 'react';
import { Link } from 'react-router-dom';
import {
  Trophy,
  ShieldCheck,
  Truck,
  Sparkles,
  Award,
  Mail,
  Phone,
  MapPin,
  Crown,
  HeartHandshake,
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 mt-20 text-slate-400 text-sm">
      {/* Trust bar */}
      <div className="border-b border-slate-900 bg-slate-900/50 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-semibold">20+ Years Expertise</h4>
              <p className="text-xs text-slate-400">Led by Ms. Madhu Sharma</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-semibold">Free Precision Engraving</h4>
              <p className="text-xs text-slate-400">High-detail laser etching on all awards</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-semibold">End-to-End Customization</h4>
              <p className="text-xs text-slate-400">Crystal, wood, metal, acrylic & mementos</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-semibold">Timely Delivery</h4>
              <p className="text-xs text-slate-400">Reliable pan-India delivery schedules</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div className="space-y-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black text-xl font-heading-cinzel">
              S
            </div>
            <span className="text-lg font-bold text-white font-heading-cinzel">
              SHREEJI<span className="text-amber-400 ml-1">CORPORATES</span>
            </span>
          </div>
          <p className="text-xs leading-relaxed text-slate-400">
            A professionally managed organization specializing in trophies, awards, mementos, medals, corporate gifts, and customized recognition solutions — built on a foundation of trust, quality, and 20+ years of expertise.
          </p>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <span className="font-semibold text-white block">Our Core Promise:</span>
            <span className="text-[11px] text-amber-300">
              "We don't just supply awards — we craft meaningful recognition."
            </span>
          </div>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4 text-xs tracking-wider uppercase">Product Portfolio</h4>
          <ul className="space-y-2.5 text-xs">
            <li><Link to="/catalog?category=corporate-leadership" className="hover:text-amber-400 transition-colors">Corporate & Leadership Awards</Link></li>
            <li><Link to="/catalog?category=crystal-mementos" className="hover:text-amber-400 transition-colors">Crystal & Glass Mementos</Link></li>
            <li><Link to="/catalog?category=wooden-trophies" className="hover:text-amber-400 transition-colors">Artistic Wooden Trophies</Link></li>
            <li><Link to="/catalog?category=acrylic-plaques" className="hover:text-amber-400 transition-colors">Custom Acrylic Plaques</Link></li>
            <li><Link to="/catalog?category=sports-championship" className="hover:text-amber-400 transition-colors">Sports Cups & Trophies</Link></li>
            <li><Link to="/catalog?category=milestone-honors" className="hover:text-amber-400 transition-colors">Milestone & Service Honors</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4 text-xs tracking-wider uppercase">Sectors We Serve</h4>
          <ul className="space-y-2.5 text-xs text-slate-400">
            <li>• Educational Institutions & Convocations</li>
            <li>• Corporate Organizations & HR Programs</li>
            <li>• Sports Leagues & Tournaments</li>
            <li>• Government & Public Service Bodies</li>
            <li>• Social Organizations & NGOs</li>
            <li>• Event Management & Galas</li>
          </ul>
        </div>

        <div className="space-y-3">
          <h4 className="text-white font-semibold mb-4 text-xs tracking-wider uppercase">Contact Shreeji</h4>
          <div className="flex items-start space-x-2.5 text-xs">
            <MapPin className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <span>Plot D-102, FF Back Side, Hastsal Vihar Part-III, Uttam Nagar, New Delhi – 110059</span>
          </div>
          <div className="flex items-center space-x-2.5 text-xs">
            <Phone className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>+91 87969 77707 / +91 92669 44393</span>
          </div>
          <div className="flex items-center space-x-2.5 text-xs">
            <Mail className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>madhu@shreejicorporates.com</span>
          </div>
          <div className="flex items-center space-x-2.5 text-xs">
            <Mail className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>shreejicorporates@gmail.com</span>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-900 py-6 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between max-w-7xl mx-auto px-4 gap-2">
        <span>&copy; {new Date().getFullYear()} Shreeji Corporates. All Rights Reserved. Crafted with React, Framer Motion & Django REST Framework.</span>
        <Link to="/admin-panel" className="text-slate-400 hover:text-amber-400 transition-colors flex items-center gap-1 font-semibold">
          <span>Trophy Admin Studio</span>
        </Link>
      </div>
    </footer>
  );
}
