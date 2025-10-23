import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white py-12 border-t border-gray-200">
      <div className="container mx-auto px-6 text-center text-text-light">
        <a href="#" className="text-3xl font-heading font-bold tracking-tight text-primary inline-block mb-4">
          UrbanGear
        </a>
        <p className="mb-8 font-semibold">Elevate Your Street Style.</p>
        <div className="flex justify-center space-x-6 mb-8">
            <a href="#" className="hover:text-primary">About</a>
            <a href="#" className="hover:text-primary">Contact</a>
            <a href="#" className="hover:text-primary">FAQ</a>
            <a href="#" className="hover:text-primary">Returns</a>
        </div>
        <div className="border-t border-gray-200 pt-8">
          <p>&copy; {new Date().getFullYear()} UrbanGear. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;