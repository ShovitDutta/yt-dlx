/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.ytimg.com",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/ytdlp",
        destination: "/api/utils/",
      },
      {
        source: "/meta[Search]",
        destination: "/api/utils/metaSearch",
      },
      {
        source: "/ioSocket",
        destination: "/api/web/io",
      },
      {
        source: "/audio[Auto]",
        destination: "/api/audio/metaAuto",
      },
      {
        source: "/audio[Custom]",
        destination: "/api/audio/metaCustom",
      },
      {
        source: "/video[Auto]",
        destination: "/api/video/metaAuto",
      },
      {
        source: "/video[Custom]",
        destination: "/api/video/metaCustom",
      },
    ];
  },
};
export default nextConfig;
