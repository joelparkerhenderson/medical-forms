<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import AllergyEntry from '$lib/components/ui/AllergyEntry.svelte';

	const a = assessment.data.allergies;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Allergies" description="Drug allergies and contrast allergy">
	<RadioGroup label="Do you have any drug allergies?" name="drugAllergies" options={yesNo} bind:value={a.drugAllergies} />

	{#if a.drugAllergies === 'yes'}
		<div class="mt-2">
			<AllergyEntry bind:allergies={a.allergies} />
		</div>
	{/if}

	<RadioGroup label="Do you have a contrast dye allergy?" name="contrastAllergy" options={yesNo} bind:value={a.contrastAllergy} />
	{#if a.contrastAllergy === 'yes'}
		<TextInput label="Contrast allergy details" name="contrastAllergyDetails" bind:value={a.contrastAllergyDetails} placeholder="e.g. Iodine contrast - rash and wheeze" />
	{/if}
</SectionCard>
