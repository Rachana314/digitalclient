import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

export default function Footer() {
  return (
    <footer className="bg-[#5273FF] text-white mt-10">
      {/* Top Section */}
      <div className="mx-auto max-w-7xl px-2 py-10">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">

         {/* Logo */}
<div className="flex items-start">
  <img
    src={logo}
    alt="Digital Census Logo"
    className="h-80 w-80 object-contain flex-shrink-0"
  />
</div>




       {/* Quick Links */}
<div className="sm:ml-27 lg:ml-35">
  <h4 className="text-lg font-bold mb-4 text-white">Quick Links</h4>
  <div className="grid gap-2 text-sm sm:text-base">
    <Link className="text-white hover:text-[#FA6800] transition" to="/">Home</Link>
    <Link className="text-white hover:text-[#FA6800] transition" to="/services">Services</Link>
    <Link className="text-white hover:text-[#FA6800] transition" to="/how-it-works">How It Works</Link>
    <Link className="text-white hover:text-[#FA6800] transition" to="/news">News</Link>
    <Link className="text-white hover:text-[#FA6800] transition" to="/contact">Contact Us</Link>
    <Link className="text-white hover:text-[#FA6800] transition" to="/privacy-policy">Privacy Policy</Link>
  </div>
</div>


          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-bold mb-4 text-white">Contact</h4>
            <p className="text-sm sm:text-base text-white/90 leading-relaxed">
              PathariSanishchare-9 <br />
              Phone: 021-555231<br />
              Email: digitalcensus4@gmail.com <br />
              Sun–Fri, 10 AM – 5 PM
            </p>
          </div>

        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-[#1A1A1A] text-center py-4 text-sm text-white">
        © {new Date().getFullYear()} Digital Census. All rights reserved.
      </div>
    </footer>
  );
}
