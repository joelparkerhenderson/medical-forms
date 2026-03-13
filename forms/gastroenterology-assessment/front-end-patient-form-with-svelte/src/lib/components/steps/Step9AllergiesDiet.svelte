<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';
	import AllergyEntry from '$lib/components/ui/AllergyEntry.svelte';

	const a = assessment.data.allergiesDiet;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Allergies & Diet" description="Drug allergies, food intolerances, and dietary restrictions">
	<div class="mb-6">
		<h3 class="mb-3 text-sm font-medium text-gray-700">Drug Allergies</h3>
		<AllergyEntry bind:allergies={a.drugAllergies} />
		{#if a.drugAllergies.length === 0}
			<p class="mt-3 text-sm text-gray-500">No drug allergies added. Click the button above to add one, or proceed if you have none.</p>
		{/if}
	</div>

	<TextArea
		label="Do you have any food intolerances?"
		name="foodIntolerances"
		bind:value={a.foodIntolerances}
		placeholder="e.g. spicy food, dairy, wheat"
	/>

	<TextArea
		label="Do you have any dietary restrictions?"
		name="dietaryRestrictions"
		bind:value={a.dietaryRestrictions}
		placeholder="e.g. vegetarian, vegan, halal, kosher"
	/>

	<RadioGroup label="Do you have a gluten intolerance?" name="glutenIntolerance" options={yesNo} bind:value={a.glutenIntolerance} />

	<RadioGroup label="Do you have a lactose intolerance?" name="lactoseIntolerance" options={yesNo} bind:value={a.lactoseIntolerance} />
</SectionCard>
