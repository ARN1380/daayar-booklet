// Cute hand-drawn style SVG decorations. All components accept className for
// sizing (width/height) and fill colors.

interface DecorProps {
  className?: string;
}

/** Cute baby face with rosy cheeks, closed happy eyes and a little sprout. */
export function BabyFace({ className }: DecorProps) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
      {/* sprout */}
      <path
        d="M60 14 C52 26 48 34 60 44 C72 34 68 26 60 14Z"
        fill="#8FCF8A"
      />
      <path d="M60 42 L60 52" stroke="#6FA86B" strokeWidth="3" strokeLinecap="round" />
      {/* head */}
      <circle cx="60" cy="72" r="42" fill="#FFE0B8" />
      {/* hair tuft */}
      <path
        d="M40 44 Q44 32 52 38 Q50 26 60 30 Q70 24 68 38 Q78 32 80 44"
        fill="#F5B56B"
        stroke="#E8A355"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* ears */}
      <circle cx="20" cy="76" r="8" fill="#FFE0B8" />
      <circle cx="100" cy="76" r="8" fill="#FFE0B8" />
      {/* closed happy eyes */}
      <path d="M42 68 Q48 62 54 68" stroke="#8A5A3B" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <path d="M66 68 Q72 62 78 68" stroke="#8A5A3B" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      {/* smile */}
      <path d="M50 84 Q60 94 70 84" stroke="#8A5A3B" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      {/* rosy cheeks */}
      <circle cx="38" cy="78" r="6" fill="#FFB3B3" opacity="0.8" />
      <circle cx="82" cy="78" r="6" fill="#FFB3B3" opacity="0.8" />
    </svg>
  );
}

/** Soft rounded five-point star. */
export function Star({ className }: DecorProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M12 2 L14.6 8.6 L21.5 9.3 L16.3 13.9 L17.8 20.7 L12 17.2 L6.2 20.7 L7.7 13.9 L2.5 9.3 L9.4 8.6 Z"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Soft cloud. */
export function Cloud({ className }: DecorProps) {
  return (
    <svg viewBox="0 0 64 40" className={className} aria-hidden="true">
      <path
        d="M18 36 C9 36 4 30 4 24 C4 17.5 9 13 15.5 12.5 C17.5 7 23 3 29.5 4 C34.5 0.5 42 1.5 45.5 6.5 C52 6 58 10.5 58 17 C58 24 52.5 29 46 29 L20 29 C19 33 15 36 18 36Z"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Rounded heart. */
export function Heart({ className }: DecorProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M12 21 C5 15.5 2.5 11.5 2.5 8 C2.5 4.8 5 2.5 8 2.5 C9.8 2.5 11.4 3.4 12 4.8 C12.6 3.4 14.2 2.5 16 2.5 C19 2.5 21.5 4.8 21.5 8 C21.5 11.5 19 15.5 12 21Z"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Five-petal flower with a little center. */
export function Flower({ className }: DecorProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <circle cx="24" cy="24" r="6" fill="#FFD34E" />
      {[
        [24, 8],
        [24, 40],
        [8, 24],
        [40, 24],
        [12, 12],
        [36, 36],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="7" />
      ))}
      {/* stem */}
      <path d="M24 30 C24 38 20 42 14 45" stroke="#6FA86B" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  );
}

/** Four-point sparkle. */
export function Sparkle({ className }: DecorProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M12 2 C13 8 16 11 22 12 C16 13 13 16 12 22 C11 16 8 13 2 12 C8 11 11 8 12 2Z"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Cheerful sun with rays. */
export function Sun({ className }: DecorProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <circle cx="24" cy="24" r="10" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
        <line
          key={deg}
          x1="24"
          y1="7"
          x2="24"
          y2="13"
          strokeWidth="3.5"
          strokeLinecap="round"
          transform={`rotate(${deg} 24 24)`}
        />
      ))}
    </svg>
  );
}

/** Little toy ball. */
export function Ball({ className }: DecorProps) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <circle cx="20" cy="20" r="18" />
      <path d="M20 2 A18 18 0 0 0 20 38" fill="none" strokeWidth="3" strokeLinecap="round" />
      <path d="M20 2 A18 18 0 0 1 20 38" fill="none" strokeWidth="3" strokeLinecap="round" opacity="0.55" />
    </svg>
  );
}

/** Building-block toy. */
export function Block({ className }: DecorProps) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <rect x="6" y="14" width="20" height="20" rx="4" />
      <rect x="16" y="4" width="18" height="18" rx="4" opacity="0.8" />
      <circle cx="16" cy="24" r="2.5" fill="#FFF" opacity="0.9" />
      <circle cx="25" cy="13" r="2.5" fill="#FFF" opacity="0.9" />
    </svg>
  );
}

/** Waving hand. */
export function WavingHand({ className }: DecorProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <g strokeLinecap="round">
        <path d="M14 30 C10 24 10 16 15 11 C19 7 24 6 26 9 C28 12 25 14 23 17 C30 14 34 12 35 15 C36 18 33 20 30 22 C36 21 39 21 39 24 C39 27 35 28 31 29 C36 31 38 33 37 36 C36 39 31 40 26 41 C20 42 16 38 14 30Z" fill="#FFD9A8" stroke="#E8B57E" strokeWidth="2" />
      </g>
      <circle cx="10" cy="36" r="3" fill="#FFB3B3" />
      <circle cx="38" cy="8" r="3" fill="#FFD34E" />
      <circle cx="42" cy="18" r="2" fill="#A99BE8" />
    </svg>
  );
}