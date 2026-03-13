<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';
	import AllergyEntry from '$lib/components/ui/AllergyEntry.svelte';

	const f = assessment.data.foodAllergies;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Food Allergies" description="Specific food allergies, IgE type, and dietary restrictions">
	<RadioGroup label="Do you have any food allergies?" name="hasFoodAllergies" options={yesNo} bind:value={f.hasFoodAllergies} />

	{#if f.hasFoodAllergies === 'yes'}
		<div class="mb-4">
			<label class="mb-2 block text-sm font-medium text-gray-700">Food allergy details</label>
			<AllergyEntry bind:allergies={f.foodAllergies} />
		</div>

		<SelectInput
			label="IgE classification"
			name="igeType"
			options={[
				{ value: 'IgE-mediated', label: 'IgE-mediated' },
				{ value: 'non-IgE-mediated', label: 'Non-IgE-mediated' },
				{ value: 'mixed', label: 'Mixed' },
				{ value: 'unknown', label: 'Unknown' }
			]}
			bind:value={f.igeType}
		/>

		<RadioGroup label="Oral allergy syndrome?" name="oralAllergy" options={yesNo} bind:value={f.oralAllergySyndrome} />

		<TextArea label="Dietary restrictions" name="dietaryRestrictions" bind:value={f.dietaryRestrictions} placeholder="Any foods avoided due to allergies..." />
	{/if}
</SectionCard>
