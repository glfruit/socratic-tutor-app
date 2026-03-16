import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src")
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) {
            return;
          }

          if (id.includes("katex") || id.includes("@tiptap/extension-mathematics")) {
            return "math-editor";
          }

          if (id.includes("prosemirror")) {
            return "editor-core";
          }

          if (id.includes("@tiptap")) {
            return "editor";
          }

          if (id.includes("react-router")) {
            return "router";
          }

          if (id.includes("react-markdown")) {
            return "markdown";
          }

          if (id.includes("axios")) {
            return "network";
          }

          if (id.includes("react")) {
            return "react-vendor";
          }
        }
      }
    }
  }
});
