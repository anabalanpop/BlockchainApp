// Import the useState hook from React for creating component state.
import { useState } from 'react';
import logoPng from './public/logo-svg.svg'; 

// Define the Navigation functional component.
function Navigation() {
   // Create a piece of state, isOpen, to control the visibility of the mobile menu.
  const [isOpen, setIsOpen] = useState(false);

   // Define a function to toggle the mobile menu's visibility and animate it.
  const toggleMenu = () => {
    // Update the isOpen state to its negated value
    setIsOpen(!isOpen);
    // Use optional chaining to ensure document.getElementById doesn't error out in case of a null.
    // Toggle the 'translate-x-full' class to slide the mobile menu in and out.
    document.getElementById('mobile-menu')?.classList.toggle('translate-x-full');
  };

  // Render the Navigation component as a nav element.
  return (
    <nav className="relative top-0 left-0 w-full gradient-background text-white z-10 border">
      {/* Container for the navigation bar */}
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
      {/* Logo image with responsive positioning */}
        <img src={logoPng} alt="logo" className="absolute top-1 left-4 z-20 h-16 md:top-1 md:left-24 lg:left-24 lg:top-1 lg:h-32" />
        {/* Placeholder div for potentially additional content */}
        <div className="flex items-center space-x-4">
        </div>
        {/* Button to toggle the mobile menu in smaller screens */}
        <div className="md:hidden">
          <button onClick={toggleMenu}>
          {/* Ternary operator to change the button text based on the isOpen state */}
            {isOpen ? <span>Close</span> : <span>Menu</span>}
          </button>
        </div>
        {/* Mobile menu div with dynamic classes for showing/hiding */}
        <div className={`fixed top-0 right-0 transform ${isOpen ? '' : 'translate-x-full'} md:relative md:translate-x-0 transition-transform duration-300 ease-in-out h-full md:h-auto w-64 md:w-auto bg-gray-800 md:bg-transparent py-4 px-6 md:py-0`} id="mobile-menu">
        {/* Navigation links with onClick event to toggle menu upon selection */}
          <ul className={`space-y-6 md:space-y-0 md:flex md:space-x-14 md:items-center`}>
            <li className="nav-link" onClick={toggleMenu}>Home</li>
            <li className="nav-link" onClick={toggleMenu}>About</li>
            <li className="nav-link" onClick={toggleMenu}>Services</li>
            <li className="nav-link" onClick={toggleMenu}>Contact</li>
          </ul>
          {/* Close button for the mobile menu */}
          <button className="absolute top-3 right-4 md:hidden" onClick={toggleMenu}>
            <span>X</span>  {/* The 'X' here serves as the close icon */}
          </button>
        </div>
      </div>
    </nav>
  );
}

// Export the Navigation component for use in other parts of the application.
export default Navigation;
