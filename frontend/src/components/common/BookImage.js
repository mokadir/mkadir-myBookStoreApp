import React, { useState } from 'react';

/**
 * BookImage - Handles book cover images with proper fallback chain
 * 
 * Fallback chain:
 * 1. book.coverImage (from API/book record)
 * 2. Inline SVG placeholder (no external dependencies)
 * 3. Never shows broken image icon
 */
const FALLBACK_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600" viewBox="0 0 400 600">
    <rect width="400" height="600" fill="#f1f5f9"/>
    <rect x="50" y="180" width="300" height="240" rx="12" fill="#e2e8f0"/>
    <text x="200" y="310" text-anchor="middle" font-family="Arial, sans-serif" font-size="64" fill="#94a3b8">📚</text>
    <text x="200" y="370" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" fill="#94a3b8">No Cover</text>
  </svg>`
)}`;

const BookImage = ({ src, alt, className, style, width, height }) => {
  const [imgSrc, setImgSrc] = useState(src || FALLBACK_SVG);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(FALLBACK_SVG);
    }
  };

  return (
    <img
      src={imgSrc}
      alt={alt || 'Book cover'}
      className={className}
      style={style}
      width={width}
      height={height}
      onError={handleError}
      loading="lazy"
    />
  );
};

export default BookImage;