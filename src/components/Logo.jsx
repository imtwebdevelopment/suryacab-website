import React from 'react';

export default function Logo({ className = "w-16 h-16", showText = true }) {
  return (
    <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* Top section */}
      <rect x="10" y="20" width="22" height="26" fill="#0055b8" />
      <polygon points="50,20 64,46 36,46" fill="#0055b8" />
      <rect x="68" y="20" width="22" height="26" fill="#0055b8" />
      
      {/* Text */}
      {showText && (
        <text x="50" y="55" fontFamily="Arial, sans-serif" fontSize="10" fontWeight="bold" fill="#00a4e4" textAnchor="middle" letterSpacing="1">SURYA CABS</text>
      )}
      
      {/* Bottom section */}
      <rect x="10" y="60" width="22" height="26" fill="#0055b8" />
      <polygon points="36,60 64,60 50,86" fill="#0055b8" />
      <rect x="68" y="60" width="22" height="26" fill="#0055b8" />
    </svg>
  );
}
