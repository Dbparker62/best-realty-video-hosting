/** @type {import('next').NextConfig} */
const backendOrigin =
  process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_BACKEND_URL ?? "https://36fjcwgqfc.execute-api.us-east-1.amazonaws.com"

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendOrigin.replace(/\/$/, "")}/:path*`,
      },
    ]
  },
  async redirects() {
    return [
      {
        source: "/success",
        destination: "/payment/success",
        permanent: false,
      },
      {
        source: "/cancel",
        destination: "/payment/cancel",
        permanent: false,
      },
    ]
  },
}

export default nextConfig
