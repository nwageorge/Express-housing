import { cn } from "@/lib/utils";

// Soft Yellow Glow Background
export const YellowGlowBackground = ({ children, className }) => {
  return (
    <div className={cn("min-h-screen w-full relative bg-white", className)}>
      {/* Soft Yellow Glow */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle at center, #FFF991 0%, transparent 70%)
          `,
          opacity: 0.6,
          mixBlendMode: "multiply",
        }}
      />
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

// Light Sky Blue Glow Background
export const BlueGlowBackground = ({ children, className }) => {
  return (
    <div className={cn("min-h-screen w-full bg-white relative overflow-hidden", className)}>
      {/* Light Sky Blue Glow */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle at center, #93c5fd, transparent)
          `,
        }}
      />
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

// Combined Glow Background (Yellow + Blue blend)
export const DualGlowBackground = ({ children, className }) => {
  return (
    <div className={cn("min-h-screen w-full bg-white relative overflow-hidden", className)}>
      {/* Soft Yellow Glow - Top Left */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(ellipse at 20% 20%, #FFF991 0%, transparent 50%)
          `,
          opacity: 0.5,
        }}
      />
      {/* Light Sky Blue Glow - Bottom Right */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(ellipse at 80% 80%, #93c5fd 0%, transparent 50%)
          `,
          opacity: 0.5,
        }}
      />
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

// Healthcare Theme Background (Teal + Yellow - matching NurseNow brand)
export const HealthcareBackground = ({ children, className }) => {
  return (
    <div className={cn("min-h-screen w-full bg-white relative overflow-hidden", className)}>
      {/* Soft Yellow Glow - Top */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(ellipse at 30% 0%, #FFF991 0%, transparent 60%)
          `,
          opacity: 0.4,
        }}
      />
      {/* Soft Teal Glow - Bottom */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(ellipse at 70% 100%, #5eead4 0%, transparent 60%)
          `,
          opacity: 0.3,
        }}
      />
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default {
  YellowGlowBackground,
  BlueGlowBackground,
  DualGlowBackground,
  HealthcareBackground,
};
