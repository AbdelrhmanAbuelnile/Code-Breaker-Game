import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
// https://vite.dev/config/
export default defineConfig({
	plugins: [
		react(),
		tailwindcss(),
		VitePWA({
			registerType: "autoUpdate",
			includeAssets: ["favicon.ico", "robots.txt"],
			manifest: {
				name: "Code Breaker Game",
				short_name: "Code Breaker",
				description: "A fun and challenging code-breaking game",
				theme_color: "#573c5b",
				background_color: "#573c5b",
				display: "standalone",
				start_url: "/",
				scope: "/",
				icons: [
					// Android icons
					{
						src: "android/android-launchericon-192-192.png",
						sizes: "192x192",
						type: "image/png",
						purpose: "any maskable",
					},
					{
						src: "android/android-launchericon-512-512.png",
						sizes: "512x512",
						type: "image/png",
						purpose: "any maskable",
					},
					// iOS icons
					{
						src: "ios/180.png",
						sizes: "180x180",
						type: "image/png",
					},
					{
						src: "ios/152.png",
						sizes: "152x152",
						type: "image/png",
					},
					{
						src: "ios/144.png",
						sizes: "144x144",
						type: "image/png",
					},
					{
						src: "ios/120.png",
						sizes: "120x120",
						type: "image/png",
					},
					// Windows 11 icons
					{
						src: "windows11/Square150x150Logo.scale-200.png",
						sizes: "300x300",
						type: "image/png",
					},
					{
						src: "windows11/Square44x44Logo.scale-200.png",
						sizes: "88x88",
						type: "image/png",
					},
				],
				shortcuts: [],
			},
			devOptions: {
				enabled: true,
				type: "module",
			},
			workbox: {
				globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
			},
		}),
	],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
});
