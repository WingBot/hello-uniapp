import React, { useState } from 'react';
import './App.css';
import ImageUpload from './components/ImageUpload';
import ImageGallery from './components/ImageGallery';
import LogViewer from './components/LogViewer';
import Header from './components/Header';

function App() {
  const [activeTab, setActiveTab] = useState<'images' | 'logs'>('images');

  return (
    <div className="App">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="main-content">
        {activeTab === 'images' ? (
          <div className="images-section">
            <ImageUpload />
            <ImageGallery />
          </div>
        ) : (
          <LogViewer />
        )}
      </main>
    </div>
  );
}

export default App;