import React, { useState } from 'react';
import Camera from '../components/Camera';
import ImageUpload from '../components/ImageUpload';
import Result from '../components/Result';
import { verifyFace } from '../services/api';

/**
 * Verify Page
 * 
 * Main verification interface:
 * Allows user to switch between Camera and Image Upload,
 * inspect the captured/selected image, and trigger verification
 * against the AWS API Gateway endpoint.
 */
export default function Verify() {
  const [activeTab, setActiveTab] = useState('camera'); // 'camera' | 'upload'
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Handle switching tabs (clears active selection to prevent mismatched state)
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSelectedImage(null);
    setVerificationResult(null);
    setErrorMessage(null);
  };

  // Called when image is ready from Camera or Upload
  const handleImageReady = (imageDataUrl) => {
    setSelectedImage(imageDataUrl);
    setVerificationResult(null);
    setErrorMessage(null);
  };

  // Reset to initial state
  const handleReset = () => {
    setSelectedImage(null);
    setVerificationResult(null);
    setErrorMessage(null);
    setIsLoading(false);
  };

  // Trigger the API call to AWS API Gateway
  const handleVerify = async () => {
    if (!selectedImage) return;

    setIsLoading(true);
    setErrorMessage(null);
    setVerificationResult(null);

    try {
      const response = await verifyFace(selectedImage);
      setVerificationResult(response);
    } catch (err) {
      console.error('Verification request failed:', err);
      setErrorMessage(err.message || 'Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="verify-page">
      {/* Page Header */}
      <div className="page-header text-center">
        <div className="system-pill">
          <span className="live-dot"></span> SECURE ACCESS CONTROL
        </div>
        <h1 className="system-title">RiteClick FaceGate</h1>
        <p className="system-subtitle">AWS Facial Recognition Access System</p>
      </div>

      {/* Main Verification Card */}
      <div className="main-card">
        <div className="card-header">
          <div className="card-title-group">
            <h2 className="card-title">Verify Person</h2>
            <p className="card-subtitle">
              Capture or upload a clear facial image to authenticate access
            </p>
          </div>

          {/* Tab Selector: Camera vs Upload */}
          {!verificationResult && !isLoading && (
            <div className="tab-pill-group">
              <button
                type="button"
                className={`tab-pill ${activeTab === 'camera' ? 'active' : ''}`}
                onClick={() => handleTabChange('camera')}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                  <circle cx="12" cy="13" r="4"></circle>
                </svg>
                Use Camera
              </button>

              <button
                type="button"
                className={`tab-pill ${activeTab === 'upload' ? 'active' : ''}`}
                onClick={() => handleTabChange('upload')}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                Upload Image
              </button>
            </div>
          )}
        </div>

        {/* Verification Result State (Shown if loading, error, or result exists) */}
        {(isLoading || verificationResult || errorMessage) ? (
          <Result
            isLoading={isLoading}
            result={verificationResult}
            error={errorMessage}
            onReset={handleReset}
          />
        ) : (
          /* Input Acquisition State */
          <div className="input-section">
            {activeTab === 'camera' ? (
              <Camera
                onCapture={handleImageReady}
                onReset={handleReset}
                capturedImage={selectedImage}
              />
            ) : (
              <ImageUpload
                onImageSelected={handleImageReady}
                onReset={handleReset}
                selectedImage={selectedImage}
              />
            )}

            {/* Prompt to Verify Button once image is ready */}
            {selectedImage && (
              <div className="verify-action-area">
                <button
                  type="button"
                  onClick={handleVerify}
                  className="btn btn-verify"
                  disabled={isLoading}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  </svg>
                  Verify Identity
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
