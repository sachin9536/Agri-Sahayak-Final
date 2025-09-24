//importing libraries
import React from 'react';
import { PlusCircle, User, Menu, Search } from 'lucide-react';

const ActivityBar = ({ onMouseEnter, onNewChat, onProfileClick, onTogglePin, onSearchClick }) => {
  return (
    <div
      onMouseEnter={onMouseEnter}
      className="flex flex-col items-center justify-between h-full w-full py-5 bg-transparent"
    >
      <div className="flex flex-col items-center gap-4">
        {/* Top Icon: Hamburger Menu to Pin/Unpin */}
        <button
          onClick={onTogglePin}
          className="p-2.5 rounded-xl hover:bg-agri-primary/10 dark:hover:bg-gray-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-agri-primary/30 dark:focus:ring-agri-success/30 shadow-sm"
          title="Pin Sidebar"
        >
          <Menu size={24} className="text-agri-primary dark:text-agri-success" />
        </button>

        {/* New Chat Icon (above Search) */}
        <button
          onClick={onNewChat}
          className="p-2.5 rounded-xl hover:bg-agri-primary/10 dark:hover:bg-gray-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-agri-primary/30 dark:focus:ring-agri-success/30 shadow-sm"
          title="New Chat"
          aria-label="New Chat"
        >
          <PlusCircle size={24} className="text-agri-primary dark:text-agri-success" />
        </button>

        {/* Search Icon */}
        <button
          onClick={onSearchClick}
          className="p-2.5 rounded-xl hover:bg-agri-primary/10 dark:hover:bg-gray-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-agri-primary/30 dark:focus:ring-agri-success/30 shadow-sm"
          title="Search"
          aria-label="Search"
        >
          <Search size={24} className="text-agri-primary dark:text-agri-success" />
        </button>
      </div>

      {/* Bottom Icon: User Profile */}
      <button
        onClick={onProfileClick}
        className="p-2.5 rounded-xl hover:bg-agri-primary/10 dark:hover:bg-gray-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-agri-primary/30 dark:focus:ring-agri-success/30 shadow-sm"
        title="Profile"
      >
        <User size={24} className="text-agri-primary dark:text-agri-success" />
      </button>
    </div>
  );
};

export default ActivityBar;
