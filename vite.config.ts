import { defineConfig } from "vite";
import simpleHtmlPlugin from "vite-plugin-simple-html";
import { description, version } from "./package.json";

export default defineConfig({
  base: "./",
  build: {
    outDir: "./build",
    target: "esnext",
    sourcemap: true,
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
  resolve: {
    alias: {
      path: "./src/js/browserify/path/index.mts",
      "fs/promises": "./src/js/browserify/fs/promises/index.mts",
      fs: "./src/js/browserify/fs/index.mts"
    }
  },
  define: {
    process
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