import { defineConfig } from 'vitepress'
import { version } from "../../package.json"

export default defineConfig({
	vite: {
		server: {
			host: "0.0.0.0",
			open: true
		}
	},
	title: "scarlett",
	description: "A rest client library that actually covers high complexity scenarios...for real!",
	outDir: "../lib-docs",
	base: "/scarlett/",
	head: [
		['link', { rel: 'icon', type: 'image/svg+xml', href: '...to define...' }],
		['meta', { property: 'og:type', content: 'website' }],
		['meta', { property: 'og:title', content: "scarlett" }],
		['meta', { property: 'og:image', content: "...to define..." }],
		['meta', { property: 'og:url', content: "" }],
		['meta', { property: 'og:description', content: "A rest client library that actually covers high complexity scenarios...for real!" }],
		['meta', { name: 'theme-color', content: '#646cff' }]
	],
	themeConfig: {
		logo: undefined,
		nav: [
			{
				text: 'Guide',
				link: '/guide/getting-started',
				activeMatch: "^/guide/"
			},
			{
				text: 'API',
				link: '/api/styles',
				activeMatch: "^/api/"
			},
			{
				text: version,
				items: [
					{
						text: 'Release Notes',
						link: 'https://github.com/Micene09/scarlett/releases'
					},
					{
						text: 'Contributing',
						link: '/contribute'
					}
				]
			}
		],
		sidebar: {
			"/": [
				{
					text: "Guide",
					items: [
						{ text: "Why", link: "/guide/why" },
						{ text: "Features", link: "/guide/features" },
						{ text: "Getting Started", link: "/guide/getting-started" },
						{ text: "Functional API Usage", link: "/guide/functional" },
						{ text: "Class API Usage", link: "/guide/class" }
					]
				},
				{
					text: "API",
					items: [
						{ text: "Styles", link: "/api/styles" },
						{ text: "Functional API", link: "/api/functional" },
						{ text: "Class API", link: "/api/class" },
						{ text: "Options", link: "/api/rest-client-options" },
						{ text: "Response Object", link: "/api/response-object" },
						{ text: "Built-in Cache System", link: "/api/in-memory-cache" },
						{ text: "Rest Error", link: "/api/rest-error" }
					]
				},
				{
					text: "Migration",
					items: [
						{ text: "1.x to 2.x", link: "/migration/1-to-2" }
					]
				}
			]
		},
		socialLinks: [
			{ icon: 'github', link: 'https://github.com/Micene09/scarlett' }
		],
		footer: {
			message: 'Released under the MIT License.',
			copyright: 'Copyright © 2019-present micene09',
		}
	}
})
