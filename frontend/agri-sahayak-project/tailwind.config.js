/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./public/index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Primary Agricultural Colors
        'agri-blue': '#1E3A8A',
        'agri-amber': '#F59E0B',
        'agri-green': '#10B981',
        'agri-cream': '#FEFDF8',
        
        // Enhanced Agricultural Palette
        'agri': {
          'primary': '#2D5016', // Deep forest green
          'secondary': '#8B4513', // Rich earth brown
          'accent': '#FFB347', // Warm harvest orange
          'success': '#228B22', // Forest green
          'warning': '#DAA520', // Golden rod
          'info': '#4682B4', // Steel blue
          'light': '#F5F5DC', // Beige
          'dark': '#2F4F2F', // Dark slate gray
        },
        
        // Nature-inspired gradients
        'nature': {
          'sky': '#87CEEB',
          'earth': '#D2691E',
          'leaf': '#32CD32',
          'soil': '#8B4513',
          'wheat': '#F5DEB3',
          'water': '#4169E1',
        },
        
        // Crop-specific colors
        'crop': {
          'wheat': '#F5DEB3',
          'rice': '#90EE90',
          'cotton': '#F8F8FF',
          'sugarcane': '#ADFF2F',
          'corn': '#FFD700',
        }
      },
      
      // Enhanced spacing for better mobile experience
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      
      // Agricultural-themed shadows
      boxShadow: {
        'agri-sm': '0 2px 4px 0 rgba(45, 80, 22, 0.1)',
        'agri-md': '0 4px 6px -1px rgba(45, 80, 22, 0.1), 0 2px 4px -1px rgba(45, 80, 22, 0.06)',
        'agri-lg': '0 10px 15px -3px rgba(45, 80, 22, 0.1), 0 4px 6px -2px rgba(45, 80, 22, 0.05)',
        'agri-xl': '0 20px 25px -5px rgba(45, 80, 22, 0.1), 0 10px 10px -5px rgba(45, 80, 22, 0.04)',
      },
      
      // Enhanced border radius for modern look
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      
      // Agricultural-themed fonts
      fontFamily: {
        'agri': ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
