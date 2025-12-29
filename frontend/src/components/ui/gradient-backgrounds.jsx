import { cn } from "@/lib/utils";

// Radial gradient - White to Indigo
export const IndigoGradientBackground = ({ children, className }) => {
  return (
    <div className={cn("min-h-screen w-full relative", className)}>
      <div
        className="fixed inset-0 z-0"
        style={{
          background: "radial-gradient(125% 125% at 50% 10%, #fff 40%, #6366f1 100%)",
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
};

// Radial gradient - White to Slate
export const SlateGradientBackground = ({ children, className }) => {
  return (
    <div className={cn("min-h-screen w-full relative", className)}>
      <div
        className="fixed inset-0 z-0"
        style={{
          background: "radial-gradient(125% 125% at 50% 10%, #fff 40%, #475569 100%)",
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default { IndigoGradientBackground, SlateGradientBackground };
