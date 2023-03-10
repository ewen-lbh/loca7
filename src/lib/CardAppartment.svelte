<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import ButtonColored from './ButtonColored.svelte';
	import CarouselImages from './CarouselImages.svelte';
	import Icon from './Icon.svelte';
	import {
		appartmentPhotoURL,
		DISPLAY_APPARTMENT_KIND,
		type GeographicPoint,
		type AppartmentKind,
		type Photo
	} from './types';
	import {
		availableAtSentence,
		distanceBetween,
		distanceDisplay,
		durationDisplay,
		ENSEEIHT
	} from './utils';
	const emit = createEventDispatcher();

	export let photos: Photo[] | null;
	export let id: string;
	export let rent: number;
	export let charges: number;
	export let surface: number;
	export let kind: AppartmentKind;
	export let roomsCount: number;
	export let availableAt: Date;
	export let address: string;
	export let location: GeographicPoint | null;
	export let hasFurniture: boolean | null;
	export let hasParking: boolean | null;
	export let editable: boolean = false;
	export let small: boolean = false;

	let secondsAvailableSince = (Date.now() - availableAt.valueOf()) * 1e-3;
</script>

<article class:editable class:small>
	<section class="photos">
		<CarouselImages cover images={photos?.map(appartmentPhotoURL) || []} />
	</section>
	<svelte:element
		this={editable ? 'div' : 'a'}
		class="content"
		href={editable ? '' : `/appartements/${id}`}
	>
		<section class="figures">
			<section class="price">
				<p class="typo-big-figure rent">{rent + charges}€</p>
				<p class="charges">
					{#if !small}
						dont {charges}€ de charges<br />
					{/if}
					soit {Math.round((rent + charges) / surface)} €/m²
				</p>
			</section>
			<section class="space">
				<p class="typo-big-figure surface">{surface}m²</p>
				<p class="type">
					{DISPLAY_APPARTMENT_KIND[kind]}
					{#if kind === 'colocation'}<br />de {roomsCount} chambres{/if}
				</p>
			</section>
		</section>
		{#if !small}
			<section class="situation">
				<span class="icon"><Icon name="calendar" /></span>
				<p class="when">
					{availableAtSentence(secondsAvailableSince, availableAt)}
					{#if secondsAvailableSince !== 0}
						<span class="muted"
							>{#if secondsAvailableSince > 0}il y a{:else}dans{/if}
							{durationDisplay(Math.abs(secondsAvailableSince))}</span
						>
					{/if}
				</p>
				<span class="icon"><Icon name="location" /></span>
				<p class="where">
					{address}
					{#if location}
						<span class="muted">à {distanceDisplay(distanceBetween(location, ENSEEIHT))}</span>
					{/if}
				</p>
			</section>
			<section class="aspects">
				<p class="furniture">
					<span class="icon"><Icon name="furniture" cancel={!hasFurniture} /></span>
					{hasFurniture ? 'Meublé' : 'Non meublé'}
				</p>
				<p class="parking">
					<span class="icon"><Icon name="parking" cancel={!hasParking} /></span>
					{hasParking ? 'Place de parking' : 'Pas de place de parking'}
				</p>
			</section>
		{/if}
		{#if editable}
			<section class="editable">
				<ButtonColored dangerous href="/appartements/{id}/supprimer">Supprimer</ButtonColored>
				<ButtonColored href="/appartements/{id}" on:click={() => emit('delete')}
					>Annonce</ButtonColored
				>
				<ButtonColored href="/appartements/{id}/modifier" on:click={() => emit('edit')}
					>Modifier</ButtonColored
				>
			</section>
		{/if}
	</svelte:element>
</article>

<style>
	article {
		display: flex;
		flex-direction: column;

		box-shadow: -0.5rem 0.5rem 1rem rgba(0, 0, 0, 0.25);

		background: var(--card-bg, var(--bg));
		border-radius: 1rem;
		/* width: 600px; */
		max-width: 400px;
		overflow: hidden;
	}

	.content {
		padding: 1.5em;
		transition: all 0.25s ease;
	}

	section.photos {
		position: relative;
		/* width: 300px; */
		height: 200px;
		flex-grow: 1;
		flex-shrink: 0;
	}

	article.small section.photos {
		height: 150px;
	}

	section.figures {
		display: flex;
		justify-content: space-between;
		margin-bottom: 2em;
		gap: 2rem;
		flex-wrap: wrap;
	}

	section.space {
		display: flex;
		flex-direction: column;
		align-items: end;
		text-align: right;
	}

	section.figures section {
		/* width: 50%; */
	}

	section.situation {
		display: grid;
		grid-template-columns: 1.2em 1fr;
		gap: 0.5rem;
		align-items: center;
	}

	section.situation .icon {
		display: inline-block;
		height: 1.2em;
	}

	p .muted {
		color: var(--muted);
	}

	section.aspects {
		display: flex;
		gap: 1rem;
		margin-top: 1.5rem;
		flex-wrap: wrap;
	}

	section.aspects p {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	section.aspects .icon {
		display: inline-block;
		height: 1.2em;
	}

	article:not(.editable) .content:hover,
	article:not(.editable) .content:focus {
		background: var(--ice);
	}

	section.editable {
		display: flex;
		justify-content: space-between;
		gap: 0.5rem;
		margin-top: 2rem;
	}
</style>
