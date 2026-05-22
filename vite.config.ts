import { resolve } from "node:path";
import { defineConfig } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";

// Library mode — produkujeme ESM bundle + assety, sub-app si Tailwind/React
// nese sám jako peer dep.
export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: true,
    target: "es2022",
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      formats: ["es"],
      fileName: () => "index.js",
    },
    rollupOptions: {
      external: [
        "react",
        "react/jsx-runtime",
        "react-dom",
        "react-router-dom",
        "@supabase/supabase-js",
        "lucide-react",
        "clsx",
        "tailwind-merge",
        "react-hook-form",
        "@hookform/resolvers/zod",
        "zod",
      ],
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === "tokens.css") return "tokens.css";
          if (assetInfo.name && /\.png$/i.test(assetInfo.name)) {
            return "assets/logo/[name][extname]";
          }
          return "assets/[name]-[hash][extname]";
        },
      },
    },
  },
  plugins: [
    // Zkopíruj tokens.css i logo PNG do dist v deterministických cestách.
    viteStaticCopy({
      targets: [
        { src: "src/tokens.css", dest: "." },
        { src: "src/assets/logo/*.png", dest: "assets/logo" },
      ],
    }),
  ],
});
