import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          ink: "#123047",
          trail: "#1A7A72",
          trailDark: "#14635D",
          mint: "#D7F0ED",
          spark: "#E3A008",
          paper: "#F7F4EE"
        }
      }
    }
  },
  plugins: []
};

export default config;
