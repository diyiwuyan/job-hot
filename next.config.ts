import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  // 绑定自定义域名 jobhot.abcdabcd.cc 后走根路径，不再使用 /job-hot 子路径
  basePath: "",
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: "",
  },
};

export default nextConfig;
