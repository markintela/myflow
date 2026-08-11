interface MyflowLogoProps {
  dark?: boolean;
  size?: number;
}

export function MyflowLogo({ dark = false, size = 32 }: MyflowLogoProps) {
  const neutral = dark ? "oklch(85% 0.01 90)" : "oklch(30% 0.01 90)";

  const styles: Record<string, React.CSSProperties> = {
    wrap: {
      fontFamily: "var(--font-logo), sans-serif",
      fontSize: size,
      lineHeight: 1,
      letterSpacing: "-0.01em",
      display: "inline-flex",
    },
    m: { fontWeight: 400, color: neutral },
    y: { fontWeight: 500, color: neutral },
    f: { fontWeight: 600, color: "oklch(72% 0.15 182)" },
    l: { fontWeight: 700, color: "oklch(72% 0.15 198)" },
    o: { fontWeight: 800, color: "oklch(72% 0.15 214)" },
    w: { fontWeight: 800, color: "oklch(72% 0.15 230)" },
  };

  return (
    <div style={styles.wrap}>
      <span style={styles.m}>m</span>
      <span style={styles.y}>y</span>
      <span style={styles.f}>f</span>
      <span style={styles.l}>l</span>
      <span style={styles.o}>o</span>
      <span style={styles.w}>w</span>
    </div>
  );
}
