/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://m.stripe.network https://*.stripe.com https://*.stripe.network",
              "connect-src 'self' https://api.stripe.com https://maps.googleapis.com https://*.stripe.com https://*.stripe.network https://api.trustbuild.uk wss://api.trustbuild.uk",
              "img-src 'self' data: blob: https:",
              "font-src 'self' data: https://fonts.gstatic.com https://*.stripe.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://*.stripe.com https://*.stripe.network",
              "child-src 'self' https://js.stripe.com https://*.stripe.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'"
            ].join('; ')
          }
        ]
      }
    ]
  }
};

module.exports = nextConfig;
