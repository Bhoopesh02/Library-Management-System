import React, { useEffect, useState } from 'react';
import styles from './ImageLightbox.module.css';

const ImageLightbox = ({ isOpen, onClose, frontCoverUrl, backCoverUrl, initialSide = 'front' }) => {
  const [currentSide, setCurrentSide] = useState(initialSide);

  // Sync state when opened
  useEffect(() => {
    if (isOpen) {
      setCurrentSide(initialSide);
      // Prevent body scrolling
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, initialSide]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isOpen && e.key === 'Escape') {
        onClose();
      }
      if (isOpen && hasBothCovers) {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
          toggleSide();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentSide, frontCoverUrl, backCoverUrl]);

  if (!isOpen) return null;

  const hasBothCovers = frontCoverUrl && backCoverUrl;
  const currentImageUrl = currentSide === 'front' ? frontCoverUrl : backCoverUrl;

  const toggleSide = (e) => {
    if (e) e.stopPropagation();
    setCurrentSide((prev) => (prev === 'front' ? 'back' : 'front'));
  };

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains(styles.overlay)) {
      onClose();
    }
  };

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <button className={styles.closeBtn} onClick={onClose} aria-label="Close lightbox">
        &times;
      </button>

      {hasBothCovers && (
        <button 
          className={`${styles.navBtn} ${styles.navLeft}`} 
          onClick={toggleSide}
          aria-label="Previous cover"
        >
          &#10094;
        </button>
      )}

      <div className={styles.content}>
        <img 
          src={currentImageUrl} 
          alt={`Book ${currentSide} cover`} 
          className={styles.image} 
        />
        {hasBothCovers && (
          <div className={styles.badge}>
            {currentSide === 'front' ? 'Front Cover' : 'Back Cover'}
          </div>
        )}
      </div>

      {hasBothCovers && (
        <button 
          className={`${styles.navBtn} ${styles.navRight}`} 
          onClick={toggleSide}
          aria-label="Next cover"
        >
          &#10095;
        </button>
      )}
    </div>
  );
};

export default ImageLightbox;
