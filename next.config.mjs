/** @type {import('next').NextConfig} */
import pkg from "./package.json" assert { type: "json" };

const nextConfig = {
  output: "standalone",
  env: {
    version: pkg.version,
  },
};

export default nextConfig;
