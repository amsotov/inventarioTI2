import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  return { base: process.env.VITE_BASE_PATH || env.VITE_BASE_PATH || "/" };
});
