import { defineConfig } from 'vitepress'
import { version } from "../../package.json"

export default defineConfig({
	title: "scarlett",
	description: "A strongly typed with zero dependencies, rest client library based on Fetch API.",
	outDir: "../lib-docs",
	base: "/scarlett/",
	themeConfig: {
		nav: [
			{
				text: 'Usage',
				link: '/usage/getting-started'
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
			"/why": [
				{ text: "API Intro", link: "/api" },
				{ text: "Getting Started", link: "/usage/getting-started" }
			],
			"/api": [
				{ text: "API Intro", link: "/api" },
				{ text: "Class API", link: "/api/class" },
				{ text: "Functional API", link: "/api/functional" },
				{ text: "Rest Error", link: "/api/rest-error" }
			],
			"/usage": [
				{ text: "Getting Started", link: "/usage/getting-started" },
				{ text: "Class API Usage", link: "/usage/class" },
				{ text: "Functional API Usage", link: "/usage/functional" }
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
