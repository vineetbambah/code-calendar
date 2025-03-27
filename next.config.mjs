/** @type {import('next').NextConfig} */
export const nextConfig = {
    async rewrites() {
        return [
          {
            source: "/api/contests",
            destination: "http://3.109.59.34:3001/contests",
          },
        ];
      },
};