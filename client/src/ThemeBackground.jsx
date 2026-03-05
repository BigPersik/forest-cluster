import React, { useRef, useState, useEffect } from 'react';

const BG_IMAGE_URL = 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1920&q=80';
/**
 * Jungle theme: tropical rainforest background, 3D tilt, floating “leaf” particles.
 */
export function ThemeBackground() {
  const containerRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onMove = (e) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const x = (e.clientX - cx) / rect.width;
      const y = (e.clientY - cy) / rect.height;
      setTilt({ x: y * 4, y: -x * 4 });
    };
    const onLeave = () => setTilt({ x: 0, y: 0 });
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseleave', onLeave);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  return (
    <div className="theme-bg" ref={containerRef} aria-hidden="true">
      {/* 3D layer: background image with perspective and mouse tilt */}
      <div
        className="theme-bg-image-wrap"
        style={{
          transform: `perspective(1200px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(1.08)`,
        }}
      >
        <div className="theme-bg-image" style={{ backgroundImage: `url(${BG_IMAGE_URL})` }} />
      </div>
      {/* Parallax overlay gradient (animated) */}
      <div className="theme-bg-overlay" />
      {/* Animated vignette */}
      <div className="theme-bg-vignette" />
      {/* Floating particles / atmosphere */}
      <div className="theme-bg-particles">
        <span className="particle p1" />
        <span className="particle p2" />
        <span className="particle p3" />
        <span className="particle p4" />
        <span className="particle p5" />
      </div>
    </div>
  );
}
