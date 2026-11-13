const backendOrigin = process.env.BACKEND_URL ?? "https://api.bestacademyofrealestate.com"
export default {
 images: { unoptimized: true },
 async rewrites() { return [{source: "/api/home-sale-questionnaire/:path*", destination: backendOrigin.replace(/\/$/, "") + "/home-sale-questionnaire/:path*"}] },
}
