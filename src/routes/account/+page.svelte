<script lang="ts">
	import InputEmail from '$lib/InputEmail.svelte';
	import InputField from '$lib/InputField.svelte';
	import InputText from '$lib/InputText.svelte';
	import InputPhone from '$lib/InputPhone.svelte';
	import InputPassword from '$lib/InputPassword.svelte';
	import type { PageData } from './$types';
	import ButtonSecondary from '$lib/ButtonSecondary.svelte';
	import { page } from '$app/stores';
	export let data: PageData;
	$: ({ user } = data);

	let oldPassword: string = '';
	let oldPasswordIsInvalid: boolean = $page.url.hash === '#invalidCredentials';
	let newPassword: string = '';
</script>

<main>
	<h1>Mon compte</h1>

	<form method="post" action="?/updateProfile">
		<h2>Profil</h2>
		<InputField label="Nom complet">
			<InputText name="name" bind:value={user.name} />
		</InputField>

		<InputField label="Adresse e-mail">
			<InputEmail name="email" bind:value={user.email} />
		</InputField>
		<InputField label="Téléphone">
			<InputPhone name="phone" bind:value={user.phone} />
		</InputField>

		<ButtonSecondary submits icon="checkmark">Enregistrer</ButtonSecondary>
	</form>

	<form method="post" action="?/changePassword" class="password">
		<h2>Changer de mot de passe</h2>

		<InputPassword
			bind:value={oldPassword}
			on:input={() => {
				oldPasswordIsInvalid = false;
			}}
			name="oldPassword"
			required
			label="Mot de passe actuel"
			errorMessage={oldPasswordIsInvalid ? 'Mot de passe invalide' : ''}
		/>
		<InputPassword
			bind:value={newPassword}
			name="newPassword"
			required
			label="Nouveau mot de passe"
			feedback
		/>
		<ButtonSecondary submits icon="checkmark">Enregistrer</ButtonSecondary>
	</form>
</main>

<style>
	main {
		max-width: 800px;
		margin: 0 auto;

		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 3rem;
	}

	h1 {
		text-align: center;
	}

	form {
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 1rem;
	}
</style>
