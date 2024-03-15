// @ts-check

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
      "buffer/": "./src/js/browserify/buffer/index.mjs",
      "fs/promises": "./src/js/browserify/fs/promises/index.mjs",
      fs: "./src/js/browserify/fs/index.mjs",
      path: "./src/js/browserify/path/index.mjs",
      stream: "./src/js/browserify/stream/index.mjs",
      zlib: "./src/js/browserify/zlib/index.mjs"
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