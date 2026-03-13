<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';

	const d = assessment.data.familyHistory;
</script>

<SectionCard title="Family History" description="Cardiovascular and diabetes family history">
	<RadioGroup
		label="First-degree relative with CVD under age 60?"
		name="familyCVDUnder60"
		bind:value={d.familyCVDUnder60}
		options={[
			{ value: 'yes', label: 'Yes' },
			{ value: 'no', label: 'No' }
		]}
	/>
	{#if d.familyCVDUnder60 === 'yes'}
		<SelectInput
			label="Relationship"
			name="familyCVDRelationship"
			bind:value={d.familyCVDRelationship}
			options={[
				{ value: 'parent', label: 'Parent' },
				{ value: 'sibling', label: 'Sibling' },
				{ value: 'child', label: 'Child' },
				{ value: 'multiple', label: 'Multiple relatives' }
			]}
		/>
	{/if}
	<RadioGroup
		label="Family history of diabetes?"
		name="familyDiabetesHistory"
		bind:value={d.familyDiabetesHistory}
		options={[
			{ value: 'yes', label: 'Yes' },
			{ value: 'no', label: 'No' }
		]}
	/>
</SectionCard>
