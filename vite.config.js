// @ts-check

import { defineConfig } from "vite";
import simpleHtmlPlugin from "vite-plugin-simple-html";
import { nodePolyfills } from "vite-plugin-node-polyfills";
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
      "fs/promises": "./src/js/browserify/fs/promises/index.mjs",
      fs: "./src/js/browserify/fs/index.mjs"
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
    }),
    nodePolyfills({
      include: [
        "buffer",
        "fs",
        "path",
        "stream"
      ],
      globals: {
        process: true
      }
    })
  ]
});