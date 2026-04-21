<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import AllergyEntry from '$lib/components/ui/AllergyEntry.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const a = assessment.data.allergies;

	let envAllergenText = $state(a.environmentalAllergens.join(', '));

	$effect(() => {
		assessment.data.allergies.environmentalAllergens = envAllergenText
			.split(',')
			.map((s) => s.trim())
			.filter((s) => s.length > 0);
	});
</script>

<SectionCard title="Allergies" description="Drug allergies and environmental allergens">
	<h3 class="mb-2 font-medium text-gray-800">Drug Allergies</h3>
	<AllergyEntry bind:allergies={a.drugAllergies} />
	{#if a.drugAllergies.length === 0}
		<p class="mt-2 mb-4 text-sm text-gray-500">No drug allergies added. Click the button above to add one, or proceed to next step if you have none.</p>
	{/if}

	<div class="mt-6">
		<TextArea
			label="Environmental Allergens"
			name="envAllergens"
			bind:value={envAllergenText}
			placeholder="e.g. dust mites, pollen, mould, animal dander (comma-separated)"
		/>
	</div>
</SectionCard>
