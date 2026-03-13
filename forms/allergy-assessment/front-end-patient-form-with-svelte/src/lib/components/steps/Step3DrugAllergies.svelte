<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';
	import AllergyEntry from '$lib/components/ui/AllergyEntry.svelte';

	const d = assessment.data.drugAllergies;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Drug Allergies" description="Specific drug allergies, reaction types, severity, and cross-reactivity">
	<RadioGroup label="Do you have any drug allergies?" name="hasDrugAllergies" options={yesNo} bind:value={d.hasDrugAllergies} />

	{#if d.hasDrugAllergies === 'yes'}
		<div class="mb-4">
			<label class="mb-2 block text-sm font-medium text-gray-700">Drug allergy details</label>
			<AllergyEntry bind:allergies={d.drugAllergies} />
		</div>

		<TextArea
			label="Cross-reactivity concerns"
			name="crossReactivity"
			bind:value={d.crossReactivityConcerns}
			placeholder="e.g. Penicillin/cephalosporin cross-reactivity, NSAID class effects..."
		/>
	{/if}
</SectionCard>
