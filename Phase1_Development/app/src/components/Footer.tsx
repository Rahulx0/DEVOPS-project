import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-gray-800 py-12 border-t border-gray-200 dark:border-gray-700 transition-colors duration-300">
      <div className="container mx-auto px-6 text-center text-text-light dark:text-gray-300">
        <span className="text-3xl font-heading font-bold tracking-tight text-primary dark:text-secondary inline-block mb-4">
          UrbanGear
        </span>
        <p className="mb-8 font-semibold">Elevate Your Street Style.</p>
        <div className="flex justify-center space-x-6 mb-8">
            <button type="button" className="hover:text-primary dark:hover:text-secondary">About</button>
            <button type="button" className="hover:text-primary dark:hover:text-secondary">Contact</button>
            <button type="button" className="hover:text-primary dark:hover:text-secondary">FAQ</button>
            <button type="button" className="hover:text-primary dark:hover:text-secondary">Returns</button>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
          <p>&copy; {new Date().getFullYear()} UrbanGear. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
// CI: pipeline test 2025-11-20