import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: "#2563EB",
          blueSoft: "#DBEAFE",
          green: "#16A34A",
          greenSoft: "#DCFCE7",
          cyan: "#0891B2",
          cyanSoft: "#CFFAFE",
        },
      },
    },
  },
  plugins: [],
};

export default config;
