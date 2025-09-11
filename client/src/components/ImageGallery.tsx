import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface ImageData {
  id: string;
  originalName: string;
  filename: string;
  thumbnail: string;
  size: number;
  uploadDate: string;
  url: string;
  thumbnailUrl: string;
}

const ImageGallery: React.FC = () => {
  const [images, setImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/images');
      if (response.data.success) {
        setImages(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch images:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteImage = async (imageId: string) => {
    if (!window.confirm('Are you sure you want to delete this image?')) {
      return;
    }

    try {
      const response = await axios.delete(`/api/images/${imageId}`);
      if (response.data.success) {
        setImages(images.filter(img => img.id !== imageId));
      }
    } catch (error) {
      console.error('Failed to delete image:', error);
      alert('Failed to delete image. Please try again.');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    fetchImages();
  }, []);

  if (loading) {
    return (
      <div className="gallery-section">
        <h2 className="section-title">Image Gallery</h2>
        <div className="loading">Loading images...</div>
      </div>
    );
  }

  return (
    <>
      <div className="gallery-section">
        <h2 className="section-title">Image Gallery</h2>
        {images.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📷</div>
            <div>No images uploaded yet</div>
            <div>Upload your first image using the form above</div>
          </div>
        ) : (
          <div className="image-grid">
            {images.map((image) => (
              <div key={image.id} className="image-card">
                <img
                  src={image.thumbnailUrl}
                  alt={image.originalName}
                  className="image-thumbnail"
                  onClick={() => setSelectedImage(image)}
                />
                <div className="image-info">
                  <div className="image-name">{image.originalName}</div>
                  <div className="image-meta">
                    {formatFileSize(image.size)} • {formatDate(image.uploadDate)}
                  </div>
                  <div className="image-actions">
                    <button
                      className="btn btn-primary"
                      onClick={() => setSelectedImage(image)}
                    >
                      View
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => deleteImage(image.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedImage && (
        <div className="modal-overlay" onClick={() => setSelectedImage(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setSelectedImage(null)}
            >
              ×
            </button>
            <img
              src={selectedImage.url}
              alt={selectedImage.originalName}
              className="modal-image"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default ImageGallery;