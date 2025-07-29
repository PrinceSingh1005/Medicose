import React from 'react';

function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-6 mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p>&copy; {new Date().getFullYear()} MediCose. All rights reserved.</p>
        <div className="flex justify-center space-x-4 mt-2">
          <a href="#" className="hover:text-primary transition duration-200">Privacy Policy</a>
          <a href="#" className="hover:text-primary transition duration-200">Terms of Service</a>
          <a href="#" className="hover:text-primary transition duration-200">Contact Us</a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;