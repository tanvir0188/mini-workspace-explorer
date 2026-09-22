"use client";

import Link from "next/link";
import { Mail } from "lucide-react";
import { useEffect, useState } from "react";

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);

const TwitterIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
  </svg>
);

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

export default function Footer() {
    const [year, setYear] = useState(2026);

    useEffect(() => {
        setYear(new Date().getFullYear());
    }, []);

    return (
        <footer className="bg-zinc-950 text-zinc-300 py-12 border-t border-zinc-900 mt-auto">
            <div className="container mx-auto px-4 md:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    <div className="col-span-1 md:col-span-2">
                        <Link href="/" className="text-2xl font-bold text-white mb-4 block">
                            Rent Nest
                        </Link>
                        <p className="text-zinc-400 max-w-sm mb-6">
                            Finding your perfect rental home has never been easier. 
                            Browse our premium selection of properties tailored to your needs.
                        </p>
                        <div className="flex gap-4">
                            <Link href="#" className="p-2 bg-zinc-900 rounded-full hover:bg-zinc-800 transition-colors">
                                <FacebookIcon className="w-5 h-5 text-zinc-400 hover:text-white" />
                            </Link>
                            <Link href="#" className="p-2 bg-zinc-900 rounded-full hover:bg-zinc-800 transition-colors">
                                <TwitterIcon className="w-5 h-5 text-zinc-400 hover:text-white" />
                            </Link>
                            <Link href="#" className="p-2 bg-zinc-900 rounded-full hover:bg-zinc-800 transition-colors">
                                <InstagramIcon className="w-5 h-5 text-zinc-400 hover:text-white" />
                            </Link>
                        </div>
                    </div>
                    
                    <div>
                        <h4 className="text-white font-semibold mb-4">Quick Links</h4>
                        <ul className="space-y-3">
                            <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
                            <li><Link href="/properties" className="hover:text-white transition-colors">Browse Properties</Link></li>
                            <li><Link href="/auth/login" className="hover:text-white transition-colors">Sign In</Link></li>
                            <li><Link href="/auth/register" className="hover:text-white transition-colors">Sign Up</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-semibold mb-4">Contact Us</h4>
                        <ul className="space-y-3">
                            <li className="flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                <span>support@rentnest.com</span>
                            </li>
                            <li>1-800-RENT-NEST</li>
                        </ul>
                    </div>
                </div>
                
                <div className="pt-8 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-zinc-500">
                    <p>&copy; {year} Rent Nest. All rights reserved.</p>
                    <div className="flex gap-6">
                        <Link href="#" className="hover:text-zinc-300 transition-colors">Privacy Policy</Link>
                        <Link href="#" className="hover:text-zinc-300 transition-colors">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
