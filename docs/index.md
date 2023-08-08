---
layout: home

title: Scarlett
titleTemplate: Do you wanna Fetch with me?

hero:
  name: Scarlett
  text: Do you wanna Fetch with me?
  tagline: A rest client library that actually covers high complexity scenarios...for real!
  image:
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: Why Scarlett?
      link: /guide/why
    - theme: alt
      text: View on GitHub
      link: https://github.com/Micene09/scarlett

features:
  - icon: 🖌️
    title: Multi API Styles
    details: Available Class and Functional API to find the best fit to your project
  - icon: 💪
    title: Fully Typed
    details: Success and Error response objects with intellisense covered
  - icon: 📦
    title: Tiny
    details: Zero dependencies to ensure the smallest bundle
  - icon: 🚀
    title: Feature Rich
    details: Supported timeout, in-memory cache, throw errors on failures and more!
---

<script setup>
import { VPTeamMembers, VPTeamPageTitle } from 'vitepress/theme'

const members = [
	{
		avatar: 'https://www.github.com/micene09.png',
		name: 'micene09',
		title: 'Author',
		links: [
			{ icon: 'github', link: 'https://github.com/micene09' },
			{ icon: 'twitter', link: 'https://twitter.com/XMiceneX' }
		]
	},
	{
		avatar: 'https://www.github.com/pablobbb.png',
		name: 'pablobbb',
		title: 'Maintainer',
		links: [
			{ icon: 'github', link: 'https://github.com/pablobbb' }
		]
	},
	{
		avatar: 'https://www.github.com/cataniafran.png',
		name: 'cataniafran',
		title: 'Maintainer',
		links: [
			{ icon: 'github', link: 'https://github.com/cataniafran' }
		]
	}
]
</script>

<VPTeamPageTitle>
	<template #title>
		The Team
	</template>
	<template #lead>
		Passionate people who believe that even the most complex things can be turned in easy ones.
	</template>
</VPTeamPageTitle>
<VPTeamMembers size="small" :members="members" />