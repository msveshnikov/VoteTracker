import { Link } from "wouter";
import { Facebook, Twitter, Github, CheckCircle } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap">
          <div className="w-full md:w-1/3 mb-8 md:mb-0">
            <div className="flex items-center mb-4">
              <CheckCircle className="h-8 w-8 text-white" />
              <span className="ml-2 text-xl font-bold">
                MakeYour<span className="text-primary">.</span>vote
              </span>
            </div>
            <p className="text-gray-400 mb-4">
              The Definitive Source for Public Opinion. Unifying all votes into a single source of truth.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div className="w-full md:w-2/3">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-white font-semibold mb-4">Resources</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-white transition text-sm">How It Works</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition text-sm">API Documentation</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition text-sm">Developers</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition text-sm">Integrations</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-white font-semibold mb-4">Company</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-white transition text-sm">About Us</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition text-sm">Careers</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition text-sm">Press</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition text-sm">Contact</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-white font-semibold mb-4">Legal</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-white transition text-sm">Terms of Service</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition text-sm">Privacy Policy</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition text-sm">Cookie Policy</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition text-sm">GDPR</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-700 text-center">
          <p className="text-gray-400 text-sm">&copy; {new Date().getFullYear()} MakeYour.vote. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
