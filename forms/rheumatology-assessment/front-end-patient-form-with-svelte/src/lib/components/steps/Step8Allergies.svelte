<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import AllergyEntry from '$lib/components/ui/AllergyEntry.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';

	const d = assessment.data.allergies;
</script>

<SectionCard title="Allergies" description="Drug allergies and latex sensitivity">
	<h3 class="mb-2 font-semibold text-gray-800">Drug Allergies</h3>
	<AllergyEntry bind:allergies={d.drugAllergies} />
	{#if d.drugAllergies.length === 0}
		<p class="mt-3 mb-4 text-sm text-gray-500">No drug allergies added. Click the button above to add one, or proceed to next step if you have none.</p>
	{/if}

	<div class="mt-6">
		<RadioGroup
			label="Latex Allergy"
			name="latexAllergy"
			options={[
				{ value: 'yes', label: 'Yes' },
				{ value: 'no', label: 'No' }
			]}
			bind:value={d.latexAllergy}
		/>
	</div>
</SectionCard>
