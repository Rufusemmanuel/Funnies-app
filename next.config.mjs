/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: "/",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=3600, s-maxage=3600, stale-while-revalidate=300",
          },
          {
            key: "X-Robots-Tag",
            value: "all",
          },
        ],
      },
      {
        source: "/images/og/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, s-maxage=86400, immutable",
          },
        ],
      },
    ]
  },
}

export default nextConfig
