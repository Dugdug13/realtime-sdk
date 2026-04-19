import typescript from "@rollup/plugin-typescript";

export default {
  input: "src/test-index.ts",
  output: {
    dir: "dist/test-build",
    format: "esm",
  },
  plugins: [
    typescript(),
  ],
};
