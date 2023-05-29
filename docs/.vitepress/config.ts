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
				text: 'API',
				link: '/api'
			},
			{
				text: 'Usage',
				link: '/usage'
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
				{ text: "Class API", link: "/api/class" },
				{ text: "Functional API", link: "/api/functional" }
			],
			"/usage": [
				{ text: "Class API", link: "/usage/class" },
				{ text: "Functional API", link: "/usage/functional" }
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
