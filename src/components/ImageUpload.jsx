import React, { useState, useRef } from 'react';
import { resizeImage } from '../services/api';

/**
 * ImageUpload Component
 * 
 * Allows users to upload an existing image file (JPEG or PNG),
 * validates the file type, resizes/converts it to JPEG, and displays a preview.
 */
export default function ImageUpload({ onImageSelected, onReset, selectedImage }) {
  const [dragOver, setDragOver] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef(null);

  // Process and optimize the selected file
  const processFile = async (file) => {
    setUploadError(null);

    if (!file) return;

    // Validate mime type: only image/jpeg and image/png
    if (file.type !== 'image/jpeg' && file.type !== 'image/png') {
      setUploadError('Invalid format. Please select a JPEG or PNG image.');
      return;
    }

    try {
      setFileName(file.name);
      // Resize and convert to JPEG base64 data URL
      const optimizedJpeg = await resizeImage(file, 800, 0.85);
      onImageSelected(optimizedJpeg);
    } catch (err) {
      console.error('Image processing failed:', err);
      setUploadError('Failed to process image file. Please try another one.');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleClear = () => {
    setFileName('');
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onReset) onReset();
  };

  return (
    <div className="upload-container">
      {selectedImage ? (
        // Preview Selected Image
        <div className="preview-container">
          <div className="preview-wrapper">
            <img
              src={selectedImage}
              alt="Selected Preview"
              className="captured-preview-img"
            />
            <div className="preview-badge">Ready for Verification</div>
          </div>

          {fileName && <div className="file-info-tag">{fileName}</div>}

          <div className="controls-row">
            <button
              type="button"
              onClick={handleClear}
              className="btn btn-secondary"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="1 4 1 10 7 10"></polyline>
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
              </svg>
              Choose Different Image
            </button>
          </div>
        </div>
      ) : (
        // Dropzone & File Selector
        <div
          className={`dropzone-box ${dragOver ? 'dropzone-active' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/jpeg, image/png"
            style={{ display: 'none' }}
          />

          <div className="upload-icon-circle">
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
          </div>

          <p className="dropzone-primary-text">Click or drag image here to upload</p>
          <span className="dropzone-secondary-text">Supported formats: JPEG, PNG (Auto-optimized)</span>

          <button
            type="button"
            className="btn btn-outline-sm"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
          >
            Browse Files
          </button>
        </div>
      )}

      {/* Upload Error Message */}
      {uploadError && (
        <div className="alert-box alert-error">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span>{uploadError}</span>
        </div>
      )}
    </div>
  );
}
