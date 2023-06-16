import { defineConfig } from 'vitepress'
import { version } from "../../package.json"

export default defineConfig({
	title: "scarlett",
	description: "A strongly typed with zero dependencies, rest client library based on Fetch API.",
	outDir: "../lib-docs",
	base: "/scarlett/",
	head: [
	  ['link', { rel: 'icon', type: 'image/svg+xml', href: '...to define...' }],
	  ['meta', { property: 'og:type', content: 'website' }],
	  ['meta', { property: 'og:title', content: "scarlett" }],
	  ['meta', { property: 'og:image', content: "...to define..." }],
	  ['meta', { property: 'og:url', content: "" }],
	  ['meta', { property: 'og:description', content: "A strongly typed with zero dependencies, rest client library based on Fetch API." }],
	  ['meta', { name: 'theme-color', content: '#646cff' }]
	],
	themeConfig: {
		logo: undefined,
		nav: [
			{
				text: 'Guide',
				link: '/guide/getting-started'
			},
			{
				text: 'API',
				link: '/api'
			},
			{
				text: version,
				items: [
					{
						text: 'Releases',
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
			"/api": [
				{ text: "API Intro", link: "/api" },
				{ text: "Class API", link: "/api/class" },
				{ text: "Functional API", link: "/api/functional" },
				{ text: "In-Memory Cache", link: "/api/in-memory-cache" },
				{ text: "Response Object", link: "/api/response-object" },
				{ text: "Rest Error", link: "/api/rest-error" }
			],
			"/guide": [
				{ text: "Why", link: "/guide/why" },
				{ text: "Getting Started", link: "/guide/getting-started" },
				{ text: "Class API Usage", link: "/guide/class" },
				{ text: "Functional API Usage", link: "/guide/functional" }
			]
		},
		socialLinks: [
			{ icon: 'github', link: 'https://github.com/Micene09/scarlett' }
		],
		footer: {
			message: 'Released under the MIT License.',
			copyright: 'Copyright © 2020-present micene09',
		}
	}
})
