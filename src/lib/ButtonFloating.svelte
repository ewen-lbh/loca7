<script lang="ts">
	import Icon from './Icon.svelte';

	export let id: string = '';
	export let icon: string;
	export let href: string = '';

	let hoverOrFocus = false;
</script>

<svelte:element
	this={href ? 'a' : 'button'}
	class="button-floating"
	{id}
	{href}
	on:focus={() => (hoverOrFocus = true)}
	on:blur={() => (hoverOrFocus = false)}
	on:mouseenter={() => (hoverOrFocus = true)}
	on:mouseleave={() => (hoverOrFocus = false)}
	on:click
>
	<div class="icon">
		<Icon name={icon} color={hoverOrFocus ? 'bg' : 'fg'} />
	</div>
	<slot />
</svelte:element>

<style>
	.button-floating {
		background: var(--bg);
		color: var(--fg);
		border-color: transparent;
		box-shadow: -0.5rem 0.5rem 1rem rgba(0, 0, 0, 0.25);
		font-size: 1rem;

		border-radius: 10000px;
		/* width: 4rem; */
		padding: 1rem 1.5rem;
		gap: 1rem;

		cursor: pointer;
		display: flex;
		align-items: center;
	}

	a.button-floating {
		height: 2rem;
	}

	.button-floating:hover,
	.button-floating:focus {
		background: var(--fg);
		color: var(--bg);
	}

	.icon {
		height: 2rem;
	}
</style>
