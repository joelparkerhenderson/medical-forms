<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import AllergyEntry from '$lib/components/ui/AllergyEntry.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const a = assessment.data.allergies;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Allergies" description="Drug allergies, contact allergies, and latex sensitivity">
	<h3 class="mb-2 text-sm font-semibold text-gray-700">Drug Allergies</h3>
	<AllergyEntry bind:allergies={a.drugAllergies} />
	{#if a.drugAllergies.length === 0}
		<p class="mt-2 mb-4 text-sm text-gray-500">No drug allergies added. Click the button above to add one, or proceed if you have none.</p>
	{/if}

	<div class="mt-6">
		<TextArea
			label="Contact allergies (e.g., nickel, fragrances, adhesives)"
			name="contactAllergies"
			bind:value={a.contactAllergies}
			placeholder="List any known contact allergies..."
		/>
	</div>

	<RadioGroup
		label="Do you have a latex allergy?"
		name="latexAllergy"
		options={yesNo}
		bind:value={a.latexAllergy}
	/>
</SectionCard>
