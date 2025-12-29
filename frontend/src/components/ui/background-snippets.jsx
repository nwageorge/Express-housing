// Grid background with purple gradient accent
export const GridPurpleBackground = ({ children }) => {
  return (
    <div className="relative min-h-screen w-full">
      {/* Grid pattern with purple accent */}
      <div className="fixed inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem]">
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_800px_at_100%_200px,#d5c5ff,transparent)]"></div>
      </div>
      {/* Content */}
      {children}
    </div>
  );
};

// Purple ellipse gradient background
export const PurpleEllipseBackground = ({ children }) => {
  return (
    <div className="relative min-h-screen w-full">
      {/* Purple ellipse gradient */}
      <div className="fixed top-0 z-[-2] h-screen w-screen bg-white bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
      {/* Content */}
      {children}
    </div>
  );
};

export default { GridPurpleBackground, PurpleEllipseBackground };
