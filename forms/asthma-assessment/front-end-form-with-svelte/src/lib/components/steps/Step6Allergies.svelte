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

	function addEnvironmentalAllergy() {
		a.environmentalAllergies = [...a.environmentalAllergies, ''];
	}

	function removeEnvironmentalAllergy(index: number) {
		a.environmentalAllergies = a.environmentalAllergies.filter((_, i) => i !== index);
	}
</script>

<SectionCard title="Allergies" description="Document drug allergies and environmental sensitivities">
	<h3 class="mb-2 text-sm font-semibold text-gray-700">Drug Allergies</h3>
	<AllergyEntry bind:allergies={a.drugAllergies} />
	{#if a.drugAllergies.length === 0}
		<p class="mt-2 mb-4 text-sm text-gray-500">No drug allergies added. Click the button above to add one, or proceed if you have none.</p>
	{/if}

	<h3 class="mt-6 mb-2 text-sm font-semibold text-gray-700">Environmental Allergies</h3>
	<div class="space-y-2">
		{#each a.environmentalAllergies as allergy, i}
			<div class="flex items-center gap-2">
				<input
					type="text"
					placeholder="e.g., dust mites, pollen, mold, pet dander"
					bind:value={a.environmentalAllergies[i]}
					class="flex-1 rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-primary focus:outline-none"
				/>
				<button
					type="button"
					onclick={() => removeEnvironmentalAllergy(i)}
					class="text-red-500 hover:text-red-700"
					aria-label="Remove environmental allergy"
				>
					&times;
				</button>
			</div>
		{/each}
		<button
			type="button"
			onclick={addEnvironmentalAllergy}
			class="rounded-lg border-2 border-dashed border-gray-300 px-4 py-2 text-sm text-gray-600 transition-colors hover:border-primary hover:text-primary"
		>
			+ Add Environmental Allergy
		</button>
	</div>

	<div class="mt-6">
		<RadioGroup label="Has allergy testing been done?" name="allergyTestingDone" options={yesNo} bind:value={a.allergyTestingDone} />
		{#if a.allergyTestingDone === 'yes'}
			<TextArea label="Allergy Test Results" name="allergyTestResults" bind:value={a.allergyTestResults} placeholder="Describe test results..." />
		{/if}
	</div>
</SectionCard>
