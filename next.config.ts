import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: { root: __dirname },
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
  },

  // Old panel / auth URLs no longer exist — redirect permanently so search
  // engines transfer any ranking to the live pages instead of indexing 404s.
  async redirects() {
    return [
      { source: "/diagnosis", destination: "/analyze", permanent: true },
      { source: "/upload", destination: "/analyze", permanent: true },
      { source: "/user/:path*", destination: "/analyze", permanent: true },
      { source: "/auth/:path*", destination: "/analyze", permanent: true },
      { source: "/admin/:path*", destination: "/", permanent: true },
      { source: "/doctor/:path*", destination: "/", permanent: true },
      { source: "/doctors/:path*", destination: "/", permanent: true },
      { source: "/consultation/:path*", destination: "/", permanent: true },
      { source: "/video-room/:path*", destination: "/", permanent: true },
      // Condition pages from the earlier 9-class model
      { source: "/conditions/melanoma", destination: "/conditions/skin-cancer", permanent: true },
      { source: "/conditions/basal-cell-carcinoma", destination: "/conditions/skin-cancer", permanent: true },
      { source: "/conditions/squamous-cell-carcinoma", destination: "/conditions/skin-cancer", permanent: true },
      { source: "/conditions/nevus", destination: "/conditions/moles", permanent: true },
      { source: "/conditions/dermatofibroma", destination: "/conditions/benign-skin-tumors", permanent: true },
      { source: "/conditions/vascular-lesion", destination: "/conditions/vascular-tumors", permanent: true },
      { source: "/conditions/pigmented-benign-keratosis", destination: "/conditions/sun-damage", permanent: true },
    ];
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          // Camera is needed on our own origin for the "Take a Photo" option
          { key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
