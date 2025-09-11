import React from 'react';

interface HeaderProps {
  activeTab: 'images' | 'logs';
  onTabChange: (tab: 'images' | 'logs') => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange }) => {
  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          📸 Image & Log Manager
        </div>
        <nav className="nav-tabs">
          <button
            className={`nav-tab ${activeTab === 'images' ? 'active' : ''}`}
            onClick={() => onTabChange('images')}
          >
            🖼️ Images
          </button>
          <button
            className={`nav-tab ${activeTab === 'logs' ? 'active' : ''}`}
            onClick={() => onTabChange('logs')}
          >
            📋 Logs
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;