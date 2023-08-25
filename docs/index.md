---
layout: home

title: Scarlett
titleTemplate: A rest client library ready to cover high complexity scenarios...for real!

hero:
  name: Scarlett
  text: Fetch data like a Pro
  tagline: A rest client library ready to cover high complexity scenarios...for real!
  image: /hero.png
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
  - icon: 💪
    title: Truly Typed
    details: Everything is typed and extensible, you can infer types even on success and error response objects
  - icon: 🛡️
    title: Control the Throw
    details: Full control over the Throw mechanism, you choose which error is Fatal or Handled
  - icon: ⚙️
    title: Options specializations
    details: Define multiple layers of configuration on global or specialized scopes
  - icon: 🖥️
    title: Multi Platform
    details: It's supported just everywhere, use it on browsers or in your favorite runtime
  - icon: ⚡️
    title: Fetch API based
    details: Based on the same standard behind PWAs and standard browser's request mechanism...and yeah, it's fast!
  - icon: 🖌️
    title: API Styles
    details: Available Class and Functional API to find the best fit to your project
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
			{ icon: 'github', link: 'https://github.com/pablobbb' },
			{ icon: 'twitter', link: 'https://twitter.com/fresh_rapp' }
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
		Passionate people who believe that even the most complex things can be turned into easy ones.
	</template>
</VPTeamPageTitle>
<VPTeamMembers size="small" :members="members" />