<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const e = assessment.data.environmentalAllergies;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Environmental Allergies" description="Pollen, dust mites, mould, animal dander, latex, and insect stings">
	<RadioGroup label="Pollen allergy?" name="pollen" options={yesNo} bind:value={e.pollenAllergy} />
	<RadioGroup label="Dust mite allergy?" name="dustMite" options={yesNo} bind:value={e.dustMiteAllergy} />
	<RadioGroup label="Mould allergy?" name="mould" options={yesNo} bind:value={e.mouldAllergy} />
	<RadioGroup label="Animal dander allergy?" name="animalDander" options={yesNo} bind:value={e.animalDanderAllergy} />
	<RadioGroup label="Latex allergy?" name="latex" options={yesNo} bind:value={e.latexAllergy} />

	<RadioGroup label="Insect sting allergy?" name="insectSting" options={yesNo} bind:value={e.insectStingAllergy} />
	{#if e.insectStingAllergy === 'yes'}
		<SelectInput
			label="Insect sting reaction severity"
			name="insectStingSeverity"
			options={[
				{ value: 'mild', label: 'Mild (local reaction)' },
				{ value: 'moderate', label: 'Moderate (large local or mild systemic)' },
				{ value: 'severe', label: 'Severe (systemic reaction)' },
				{ value: 'anaphylaxis', label: 'Anaphylaxis' }
			]}
			bind:value={e.insectStingSeverity}
			required
		/>
	{/if}

	<SelectInput
		label="Seasonal pattern"
		name="seasonalPattern"
		options={[
			{ value: 'perennial', label: 'Perennial (year-round)' },
			{ value: 'spring', label: 'Spring' },
			{ value: 'summer', label: 'Summer' },
			{ value: 'autumn', label: 'Autumn' },
			{ value: 'winter', label: 'Winter' },
			{ value: 'multiple', label: 'Multiple seasons' }
		]}
		bind:value={e.seasonalPattern}
	/>

	<TextArea label="Other environmental allergens" name="otherEnvironmental" bind:value={e.otherEnvironmentalAllergens} placeholder="Any other environmental triggers..." />
</SectionCard>
