/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
        return [
            {
                source: "/api/contests",
                destination: process.env.API_CONTESTS_URL,
            },
        ];
    },
};
export default nextConfig;