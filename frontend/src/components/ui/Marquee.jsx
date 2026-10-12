import React from 'react';

/**
 * 21st.dev Marquee Component
 * Smooth infinite scrolling ticker with pause-on-hover and gradient edge fading.
 */
export default function Marquee({
  children,
  direction = 'left',
  speed = 40,
  pauseOnHover = true,
  className = '',
}) {
  return (
    <div
      className={`relative flex overflow-x-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)] ${className}`}
    >
      <div
        className={`flex min-w-full shrink-0 items-center justify-around gap-8 py-4 ${
          pauseOnHover ? 'hover:[animation-play-state:paused]' : ''
        } ${direction === 'left' ? 'animate-marquee-left' : 'animate-marquee-right'}`}
        style={{ animationDuration: `${speed}s` }}
      >
        {children}
      </div>

      <div
        aria-hidden="true"
        className={`flex min-w-full shrink-0 items-center justify-around gap-8 py-4 ${
          pauseOnHover ? 'hover:[animation-play-state:paused]' : ''
        } ${direction === 'left' ? 'animate-marquee-left' : 'animate-marquee-right'}`}
        style={{ animationDuration: `${speed}s` }}
      >
        {children}
      </div>
    </div>
  );
}

