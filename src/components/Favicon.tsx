import React, { useEffect } from 'react';
import { Check } from 'lucide-react';

export const Favicon: React.FC = () => {
  useEffect(() => {
    // Create a canvas to generate favicon
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Set background
      ctx.fillStyle = '#2563eb'; // Blue background
      ctx.fillRect(0, 0, 32, 32);
      
      // Draw checkmark
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      // Checkmark path
      ctx.beginPath();
      ctx.moveTo(8, 16);
      ctx.lineTo(14, 22);
      ctx.lineTo(24, 10);
      ctx.stroke();
      
      // Convert to favicon
      const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
      if (favicon) {
        favicon.href = canvas.toDataURL('image/png');
      }
    }
  }, []);

  return null; // This component doesn't render anything
};
