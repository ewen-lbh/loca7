<script lang="ts">
	import BaseInputText from './BaseInputText.svelte';

	export let unit: string = '';
	export let value: number | undefined;
	export let id: string | undefined = undefined;
	export let name: string | undefined = undefined;
	export let initial: number | undefined = undefined;
	export let placeholder: string = '';

	export let positive: boolean = false;
	export let nonzero: boolean = false;
	export let integer: boolean = false;
	export let required: boolean = false;
	export let showEmptyErrors: boolean = true;

	let errorMessage: string = '';
	$: {
		if (value === undefined) {
			if (required && showEmptyErrors) {
				errorMessage = 'Ce champ est requis';
			} else {
				errorMessage = '';
			}
		} else {
			if (value === null) {
				errorMessage = 'Entrez un nombre';
			} else if (integer && Math.ceil(value) !== value) {
				errorMessage = 'Entrez un nombre entier';
			} else if (positive && value < 0) {
				errorMessage = 'Entrez un nombre positif';
			} else if (nonzero && value === 0) {
				errorMessage = 'Entrez un nombre non nul';
			} else {
				errorMessage = '';
			}
		}
	}
</script>

<BaseInputText {placeholder} type="number" {unit} bind:value {id} {name} {initial} {errorMessage} />
