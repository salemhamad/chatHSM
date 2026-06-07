import { motion } from "framer-motion";

export function AuroraBackground() {
  return (
    <>
      {/* --- DESKTOP BACKGROUND --- */}
      <div className="pointer-events-none fixed inset-0 -z-10 hidden overflow-hidden bg-background md:block">
        <div className="absolute inset-0 aurora-bg opacity-90" />
        <motion.div
          aria-hidden
          className="absolute -top-32 start-1/4 h-[36rem] w-[36rem] rounded-full blur-3xl"
          style={{ background: "var(--gradient-primary)", opacity: 0.25 }}
          animate={{ x: [0, 60, -40, 0], y: [0, 40, -20, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden
          className="absolute bottom-0 end-0 h-[28rem] w-[28rem] rounded-full blur-3xl"
          style={{ background: "oklch(0.65 0.2 330 / 35%)" }}
          animate={{ x: [0, -50, 30, 0], y: [0, -30, 20, 0] }}
          transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
        />
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "radial-gradient(currentColor 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />
      </div>

      {/* --- MOBILE BACKGROUND (OLED Black + Indigo Mesh + Filmic Noise) --- */}
      <div className="pointer-events-none fixed inset-0 -z-10 block bg-[#000000] md:hidden">
        {/* Deep Indigo/Navy Gradient from bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-[60vh] bg-gradient-to-t from-[#08102b] via-[#020617] to-transparent opacity-90" />
        
        {/* Bottom Left Indigo Glow */}
        <motion.div
          className="absolute -bottom-32 -left-20 h-[30rem] w-[30rem] rounded-full bg-[#1e40af] blur-[120px] mix-blend-screen opacity-50"
          animate={{ x: [-15, 15, -15], y: [0, -15, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Bottom Right Cyan/Blue Glow */}
        <motion.div
          className="absolute -bottom-32 -right-20 h-[32rem] w-[32rem] rounded-full bg-[#0369a1] blur-[130px] mix-blend-screen opacity-40"
          animate={{ x: [15, -15, 15], y: [-15, 15, -15] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Center Soft Radial Glow */}
        <div className="absolute left-1/2 top-[40%] h-[20rem] w-[20rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#3b82f6] opacity-[0.08] blur-[100px]" />

        {/* 3% Filmic Noise Texture overlay */}
        <div
          className="absolute inset-0 mix-blend-overlay opacity-[0.03]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
          }}
        />
      </div>
    </>
  );
}
