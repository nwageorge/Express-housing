// Grid background with purple/lavender gradient glow
export const GridBackground = ({ children, className = "" }) => {
  return (
    <div className={`relative min-h-screen w-full ${className}`}>
      {/* Grid pattern with purple gradient */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem]">
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_800px_at_100%_200px,#d5c5ff,transparent)]"></div>
      </div>
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

// Purple ellipse gradient at top
export const PurpleGradientBackground = ({ children, className = "" }) => {
  return (
    <div className={`relative min-h-screen w-full ${className}`}>
      {/* Purple ellipse gradient */}
      <div className="absolute top-0 z-0 h-full w-full bg-white bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

// Combined: Grid + Purple gradient
export const GridPurpleBackground = ({ children, className = "" }) => {
  return (
    <div className={`relative min-h-screen w-full ${className}`}>
      {/* Base white with grid pattern */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem]"></div>
      {/* Purple radial gradient overlay */}
      <div className="absolute top-0 left-0 right-0 bottom-0 -z-10 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
      {/* Additional purple accent on right side */}
      <div className="absolute bottom-0 left-0 right-0 top-0 -z-10 bg-[radial-gradient(circle_800px_at_100%_200px,#d5c5ff,transparent)]"></div>
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default {
  GridBackground,
  PurpleGradientBackground,
  GridPurpleBackground,
};
