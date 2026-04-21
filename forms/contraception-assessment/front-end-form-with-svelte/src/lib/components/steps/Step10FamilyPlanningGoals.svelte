<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';

	const f = assessment.data.familyPlanningGoals;
</script>

<SectionCard title="Family Planning Goals" description="Your goals and preferences for family planning">
	<RadioGroup
		label="Do you desire children in the future?"
		name="desireForChildren"
		options={[
			{ value: 'yes-soon', label: 'Yes, soon' },
			{ value: 'yes-future', label: 'Yes, in the future' },
			{ value: 'unsure', label: 'Unsure' },
			{ value: 'no', label: 'No' }
		]}
		bind:value={f.desireForChildren}
	/>

	{#if f.desireForChildren === 'yes-soon' || f.desireForChildren === 'yes-future'}
		<SelectInput
			label="Timeframe for starting a family"
			name="timeframe"
			options={[
				{ value: 'within-1-year', label: 'Within 1 year' },
				{ value: '1-3-years', label: '1-3 years' },
				{ value: '3-5-years', label: '3-5 years' },
				{ value: '5-plus-years', label: '5+ years' }
			]}
			bind:value={f.timeframe}
		/>
	{:else}
		<SelectInput
			label="Timeframe"
			name="timeframe"
			options={[
				{ value: 'not-applicable', label: 'Not applicable' }
			]}
			bind:value={f.timeframe}
		/>
	{/if}

	<RadioGroup
		label="Partner involvement in contraceptive decision"
		name="partnerInvolvement"
		options={[
			{ value: 'involved', label: 'Partner involved in decision' },
			{ value: 'not-involved', label: 'Making decision independently' },
			{ value: 'not-applicable', label: 'Not applicable' }
		]}
		bind:value={f.partnerInvolvement}
	/>
</SectionCard>
