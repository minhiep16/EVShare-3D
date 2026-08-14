import React, { useRef, useState, useEffect } from 'react';

/**
 * Tilt3DCard wraps any content with a 3D perspective and mouse-tracking tilt.
 * Use `translateZ(...)` on child elements to make them pop out of the card.
 */
const Tilt3DCard = ({ 
  children, 
  className = "", 
  maxTilt = 15, // Maximum tilt in degrees
  scale = 1.02, // Scale when hovering
  perspective = 1000 // Perspective depth
}) => {
  const cardRef = useRef(null);
  const [style, setStyle] = useState({});
  const [isHovered, setIsHovered] = useState(false);

  // Revert back to original state smoothly when mouse leaves
  const handleMouseLeave = () => {
    setIsHovered(false);
    setStyle({
      transform: `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale(1)`,
      transition: 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)'
    });
  };

  // Calculate tilt based on mouse position
  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    setIsHovered(true);

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left; // x position within the element
    const y = e.clientY - rect.top; // y position within the element

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Calculate rotation (-maxTilt to +maxTilt)
    const rotateX = ((y - centerY) / centerY) * -maxTilt;
    const rotateY = ((x - centerX) / centerX) * maxTilt;

    setStyle({
      transform: `perspective(${perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`,
      transition: 'transform 0.1s cubic-bezier(0.25, 0.46, 0.45, 0.94)' // Quick response to mouse
    });
  };

  // Set initial style on mount
  useEffect(() => {
    setStyle({
      transform: `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale(1)`,
      transition: 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)'
    });
  }, [perspective]);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative group ${className}`}
      style={{
        ...style,
        transformStyle: 'preserve-3d',
        willChange: 'transform'
      }}
    >
      {/* Dynamic Glare/Lighting Effect */}
      {isHovered && (
        <div 
          className="absolute inset-0 z-0 pointer-events-none rounded-inherit transition-opacity duration-300"
          style={{
            background: 'radial-gradient(circle at center, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 60%)',
            transform: 'translateZ(1px)' // Just slightly above the background
          }}
        />
      )}
      
      {/* Content wrapper with transform-style to allow children to pop out */}
      <div 
        className="w-full h-full" 
        style={{ transformStyle: 'preserve-3d' }}
      >
        {children}
      </div>
    </div>
  );
};

export default Tilt3DCard;
