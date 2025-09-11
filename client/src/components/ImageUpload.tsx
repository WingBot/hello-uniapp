import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
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

interface ImageUploadProps {
  onUploadSuccess?: (image: ImageData) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await axios.post('/api/images/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1)
          );
          setUploadProgress(progress);
        },
      });

      if (response.data.success) {
        onUploadSuccess?.(response.data.data);
        setUploadProgress(100);
        setTimeout(() => {
          setUploadProgress(0);
        }, 1000);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  }, [onUploadSuccess]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    multiple: false,
    disabled: uploading
  });

  return (
    <div className="upload-section">
      <h2 className="section-title">Upload Image</h2>
      <div
        {...getRootProps()}
        className={`upload-zone ${isDragActive ? 'dragover' : ''}`}
      >
        <input {...getInputProps()} />
        <div className="upload-icon">📁</div>
        <div className="upload-text">
          {uploading ? 'Uploading...' : isDragActive ? 'Drop the image here' : 'Drag & drop an image here, or click to select'}
        </div>
        <div className="upload-hint">
          Supports: JPEG, PNG, GIF, WebP (Max 10MB)
        </div>
        {uploading && (
          <div className="upload-progress">
            <div 
              className="progress-bar" 
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;