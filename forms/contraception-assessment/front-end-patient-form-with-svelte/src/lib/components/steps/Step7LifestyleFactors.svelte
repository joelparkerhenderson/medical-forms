<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const l = assessment.data.lifestyleFactors;
</script>

<SectionCard title="Lifestyle Factors" description="Lifestyle factors relevant to contraceptive choice">
	<SelectInput
		label="Smoking status"
		name="smokingStatus"
		options={[
			{ value: 'never', label: 'Never smoked' },
			{ value: 'former', label: 'Former smoker' },
			{ value: 'current-light', label: 'Current smoker (< 15 per day)' },
			{ value: 'current-heavy', label: 'Current smoker (>= 15 per day)' }
		]}
		bind:value={l.smokingStatus}
	/>

	<SelectInput
		label="Alcohol use"
		name="alcoholUse"
		options={[
			{ value: 'none', label: 'None' },
			{ value: 'occasional', label: 'Occasional (1-2 units per week)' },
			{ value: 'moderate', label: 'Moderate (3-14 units per week)' },
			{ value: 'heavy', label: 'Heavy (> 14 units per week)' }
		]}
		bind:value={l.alcoholUse}
	/>

	<SelectInput
		label="Recreational drug use"
		name="drugUse"
		options={[
			{ value: 'none', label: 'None' },
			{ value: 'cannabis', label: 'Cannabis only' },
			{ value: 'recreational', label: 'Recreational drugs' },
			{ value: 'iv-drug-use', label: 'IV drug use' }
		]}
		bind:value={l.drugUse}
	/>

	<TextInput
		label="Occupation"
		name="occupation"
		bind:value={l.occupation}
		placeholder="e.g., nurse, teacher, shift worker..."
	/>

	<TextArea
		label="Travel plans (relevant for malaria prophylaxis interactions)"
		name="travelPlans"
		bind:value={l.travelPlans}
		placeholder="Any upcoming travel to areas requiring specific health considerations..."
	/>
</SectionCard>
