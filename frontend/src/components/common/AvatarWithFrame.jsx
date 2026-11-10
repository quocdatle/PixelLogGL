import { useId } from 'react';
import { getFrameStyle } from '../../utils/avatarFrames';

const SIZE_MAP = {
  nav: {
    box: 'w-[66px] h-[70px] sm:w-[70px] sm:h-[74px]',
    initials: 'text-lg',
    levelText: '20',
  },
  md: {
    box: 'w-16 h-[68px]',
    initials: 'text-base',
    levelText: '20',
  },
  preview: {
    box: 'w-32 h-[136px] sm:w-36 sm:h-[152px]',
    initials: 'text-2xl',
    levelText: '19',
  },
  lg: {
    box: 'w-40 h-[170px] sm:w-44 sm:h-[186px]',
    initials: 'text-4xl',
    levelText: '19',
  },
};

export default function AvatarWithFrame({
  user,
  frameId,
  size = 'md',
  showLevelBadge = true,
  previewLevel,
}) {
  const uid = useId().replace(/:/g, '');
  const activeFrameId = frameId !== undefined ? frameId : user?.equippedFrame;
  const style = getFrameStyle(activeFrameId);
  const dims = SIZE_MAP[size] || SIZE_MAP.md;

  const initials = user?.username ? user.username.slice(0, 2).toUpperCase() : 'PL';
  const hasAvatar = Boolean(user?.avatarUrl);

  const displayLevel =
    previewLevel !== undefined ? previewLevel : user?.level || 1;

  // Tính tỷ lệ vòng kinh nghiệm XP (giống thanh vòng tròn XP trên khung LoL)
  let progressRatio = 0.68;
  if (previewLevel === undefined && user) {
    if ((user.level || 1) >= (user.maxLevel || 100)) {
      progressRatio = 1;
    } else {
      const req = user.requiredCheckIns || 1;
      const prog = user.checkInProgress || 0;
      progressRatio = Math.max(0.08, Math.min(1, prog / req));
    }
  }

  const radius = 51;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progressRatio);

  const gradBorderId = `lol-border-${uid}`;
  const gradInnerId = `lol-inner-${uid}`;
  const gradHexId = `lol-hex-${uid}`;

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${dims.box}`}
      style={{
        filter: `drop-shadow(0 0 10px ${style.glowColor})`,
      }}
    >
      {/* Rotating energy aura for Mythic/Grandmaster/Epic animated tiers */}
      {style.animated && (
        <div
          className="absolute left-1/2 top-[46%] -translate-x-1/2 -translate-y-1/2 w-[78%] aspect-square rounded-full opacity-55 animate-frame-spin pointer-events-none"
          style={{
            background: `conic-gradient(from 0deg, transparent 0deg, ${style.arcColor} 90deg, transparent 180deg, ${style.borderColors[0]} 270deg, transparent 360deg)`,
          }}
          aria-hidden="true"
        />
      )}

      {/* Circular Avatar placed directly behind SVG bezel */}
      <div
        className="absolute left-1/2 top-[45.95%] -translate-x-1/2 -translate-y-1/2 w-[61.5%] aspect-square rounded-full overflow-hidden bg-zinc-900 flex items-center justify-center z-0"
      >
        {hasAvatar ? (
          <img
            src={user.avatarUrl}
            alt={user?.username || 'Avatar'}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-950 text-zinc-100 flex items-center justify-center font-extrabold tracking-tight">
            <span className={dims.initials}>{initials}</span>
          </div>
        )}
      </div>

      {/* Ornate League of Legends SVG Frame Overlay */}
      <svg
        viewBox="0 0 140 148"
        className="relative z-10 w-full h-full pointer-events-none overflow-visible"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={gradBorderId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={style.borderColors[0]} />
            <stop offset="50%" stopColor={style.borderColors[1]} />
            <stop offset="100%" stopColor={style.borderColors[2]} />
          </linearGradient>

          <linearGradient id={gradInnerId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={style.innerColors[0]} />
            <stop offset="100%" stopColor={style.innerColors[1]} />
          </linearGradient>

          <linearGradient id={gradHexId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={style.borderColors[0]} />
            <stop offset="100%" stopColor={style.borderColors[2]} />
          </linearGradient>
        </defs>

        {/* Side Winged Flourishes for Winged, Crown, and Mythic tiers */}
        {(style.ornament === 'winged' ||
          style.ornament === 'crown' ||
          style.ornament === 'mythic') && (
          <g>
            {/* Left Wing */}
            <path
              d="M21 58 L4 44 L11 63 L3 70 L17 77 Z"
              fill={`url(#${gradBorderId})`}
              stroke={style.innerColors[0]}
              strokeWidth="1.2"
            />
            {/* Right Wing */}
            <path
              d="M119 58 L136 44 L129 63 L137 70 L123 77 Z"
              fill={`url(#${gradBorderId})`}
              stroke={style.innerColors[0]}
              strokeWidth="1.2"
            />
          </g>
        )}

        {/* Extra Upper Wing Blades for Crown & Mythic tiers */}
        {(style.ornament === 'crown' || style.ornament === 'mythic') && (
          <g>
            <path
              d="M27 38 L10 22 L20 45 Z"
              fill={`url(#${gradBorderId})`}
              stroke={style.innerColors[0]}
              strokeWidth="1"
            />
            <path
              d="M113 38 L130 22 L120 45 Z"
              fill={`url(#${gradBorderId})`}
              stroke={style.innerColors[0]}
              strokeWidth="1"
            />
          </g>
        )}

        {/* Recessed Dark Track Ring */}
        <circle
          cx="70"
          cy="68"
          r="51"
          fill="none"
          stroke={`url(#${gradInnerId})`}
          strokeWidth="8.5"
        />

        {/* XP / Check-in Progress Arc (clockwise from top) */}
        <circle
          cx="70"
          cy="68"
          r={radius}
          fill="none"
          stroke={style.arcColor}
          strokeWidth="5.2"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform="rotate(-90 70 68)"
        />

        {/* Outer Metallic Bevel Ring */}
        <circle
          cx="70"
          cy="68"
          r="55.2"
          fill="none"
          stroke={`url(#${gradBorderId})`}
          strokeWidth="2.8"
        />

        {/* Inner Metallic Bevel Ring */}
        <circle
          cx="70"
          cy="68"
          r="46.2"
          fill="none"
          stroke={`url(#${gradBorderId})`}
          strokeWidth="2.8"
        />

        {/* Subtle Top Notch / Crest */}
        {style.ornament === 'base' && (
          <polygon
            points="70,8 75,14 70,20 65,14"
            fill={`url(#${gradBorderId})`}
            stroke={style.innerColors[0]}
            strokeWidth="1"
          />
        )}

        {style.ornament === 'crest' && (
          <g>
            <polygon
              points="70,4 79,14 70,23 61,14"
              fill={`url(#${gradBorderId})`}
              stroke={style.innerColors[0]}
              strokeWidth="1.2"
            />
            <polygon points="70,8 74,14 70,19 66,14" fill={style.gemColor} />
          </g>
        )}

        {(style.ornament === 'winged' || style.ornament === 'crown') && (
          <g>
            <path
              d="M54 15 L63 7 L70 2 L77 7 L86 15 L70 23 Z"
              fill={`url(#${gradBorderId})`}
              stroke={style.innerColors[0]}
              strokeWidth="1.2"
            />
            <polygon points="70,6 75,14 70,20 65,14" fill={style.gemColor} />
          </g>
        )}

        {style.ornament === 'mythic' && (
          <g>
            <path
              d="M48 16 L59 5 L70 -2 L81 5 L92 16 L79 23 L70 19 L61 23 Z"
              fill={`url(#${gradBorderId})`}
              stroke={style.innerColors[0]}
              strokeWidth="1.2"
            />
            <polygon points="70,2 76,12 70,21 64,12" fill={style.gemColor} />
            {/* Side jewel nodes */}
            <circle cx="15" cy="68" r="3" fill={style.gemColor} />
            <circle cx="125" cy="68" r="3" fill={style.gemColor} />
          </g>
        )}

        {/* Bottom League of Legends Hexagonal Level Plate */}
        {showLevelBadge && (
          <g>
            {/* Outer Metallic Hexagon */}
            <polygon
              points="46,108 94,108 103,124 94,140 46,140 37,124"
              fill={style.hexBg}
              stroke={`url(#${gradHexId})`}
              strokeWidth="3.2"
              strokeLinejoin="round"
            />
            {/* Inner Subtle Line */}
            <polygon
              points="48,111.5 92,111.5 99,124 92,136.5 48,136.5 41,124"
              fill="none"
              stroke={style.hexStroke}
              strokeOpacity="0.45"
              strokeWidth="1"
            />
            {/* Level Number */}
            <text
              x="70"
              y="125.5"
              textAnchor="middle"
              dominantBaseline="central"
              fill="#F8FAFC"
              fontSize={String(displayLevel).length >= 3 ? '17' : dims.levelText}
              fontWeight="800"
              fontFamily="system-ui, -apple-system, sans-serif"
              letterSpacing="-0.5"
            >
              {displayLevel}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
