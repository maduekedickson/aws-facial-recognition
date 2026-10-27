import React, { useState, useRef, useEffect } from 'react';
import { resizeImage } from '../services/api';

/**
 * Camera Component
 * 
 * Interacts with the browser's MediaDevices API to stream webcam video,
 * captures a still frame, converts it to JPEG, and provides retake capability.
 */
export default function Camera({ onCapture, onReset, capturedImage }) {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);

  // Starts the webcam stream
  const startCamera = async () => {
    setCameraError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        }
      });

      setStream(mediaStream);
      setIsCameraActive(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setCameraError('Unable to access camera. Please check browser permissions.');
      setIsCameraActive(false);
    }
  };

  // Stops all media tracks on the active stream
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  // Captures the current video frame into a JPEG image
  const captureFace = async () => {
    if (!videoRef.current || !isCameraActive) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Initial capture as JPEG data URL
    const rawDataUrl = canvas.toDataURL('image/jpeg', 0.9);

    // Stop the camera stream now that we have captured the frame
    stopCamera();

    try {
      // Resize to reasonable dimensions for API Gateway efficiency
      const optimizedJpeg = await resizeImage(rawDataUrl, 800, 0.85);
      onCapture(optimizedJpeg);
    } catch (err) {
      console.error('Failed to optimize captured image:', err);
      onCapture(rawDataUrl);
    }
  };

  // Handle Retake action
  const handleRetake = () => {
    if (onReset) onReset();
    startCamera();
  };

  // Cleanup: ensure camera is stopped when component unmounts
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  // Sync stream to video ref if state updates
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="camera-container">
      {/* Camera Viewfinder / Preview Display */}
      <div className="viewfinder-box">
        {capturedImage ? (
          // Display captured frame
          <div className="preview-wrapper">
            <img
              src={capturedImage}
              alt="Captured Face"
              className="captured-preview-img"
            />
            <div className="preview-badge">Captured Frame</div>
          </div>
        ) : isCameraActive ? (
          // Live Webcam Stream
          <div className="video-wrapper">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="live-video"
            />
            {/* Target reticle overlay for corporate security aesthetic */}
            <div className="face-reticle-overlay">
              <div className="reticle-frame"></div>
              <span className="reticle-hint">Align Face Inside Frame</span>
            </div>
          </div>
        ) : (
          // Camera Inactive State
          <div className="camera-placeholder">
            <div className="camera-icon-circle">
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
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                <circle cx="12" cy="13" r="4"></circle>
              </svg>
            </div>
            <p className="placeholder-text">Camera is currently inactive</p>
            <span className="placeholder-subtext">Click "Start Camera" to initialize live facial scan</span>
          </div>
        )}
      </div>

      {/* Error message */}
      {cameraError && (
        <div className="alert-box alert-error">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span>{cameraError}</span>
        </div>
      )}

      {/* Camera Controls */}
      <div className="controls-row">
        {capturedImage ? (
          <button
            type="button"
            onClick={handleRetake}
            className="btn btn-secondary"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="1 4 1 10 7 10"></polyline>
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
            </svg>
            Retake
          </button>
        ) : isCameraActive ? (
          <>
            <button
              type="button"
              onClick={captureFace}
              className="btn btn-primary"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19 4h-3.17L14.42 2H9.58L8.17 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"></path>
              </svg>
              Capture Face
            </button>
            <button
              type="button"
              onClick={stopCamera}
              className="btn btn-outline"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="6" y="6" width="12" height="12"></rect>
              </svg>
              Stop Camera
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={startCamera}
            className="btn btn-primary"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
            Start Camera
          </button>
        )}
      </div>
    </div>
  );
}
