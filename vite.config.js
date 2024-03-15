// @ts-check

import { defineConfig } from "vite";
import simpleHtmlPlugin from "vite-plugin-simple-html";
import { description, version } from "./package.json";

export default defineConfig({
  base: "./",
  build: {
    outDir: "./build",
    target: "esnext",
    rollupOptions: {
      input: {
        app: "./src/html/index.html"
      }
    }
  },
  server: {
    port: 5500,
    strictPort: true
  },
  preview: {
    port: 5500,
    strictPort: true
  },
  plugins: [
    simpleHtmlPlugin({
      inject: {
        data: {
          description,
          version
        }
      }
    })
  ]
});