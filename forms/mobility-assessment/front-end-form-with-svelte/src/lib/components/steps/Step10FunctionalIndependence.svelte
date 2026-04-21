<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const fi = assessment.data.functionalIndependence;

	const independenceLevels = [
		{ value: 'independent', label: 'Independent' },
		{ value: 'modified-independent', label: 'Modified Independent (device)' },
		{ value: 'supervision', label: 'Supervision' },
		{ value: 'minimal-assist', label: 'Minimal Assistance (25%)' },
		{ value: 'moderate-assist', label: 'Moderate Assistance (50%)' },
		{ value: 'maximal-assist', label: 'Maximal Assistance (75%)' },
		{ value: 'dependent', label: 'Dependent (100%)' }
	];
</script>

<SectionCard title="Functional Independence" description="Assess level of independence in daily mobility tasks">
	<SelectInput
		label="Transfers (bed, chair, toilet)"
		name="transfers"
		options={independenceLevels}
		bind:value={fi.transfers}
	/>

	<SelectInput
		label="Ambulation"
		name="ambulation"
		options={independenceLevels}
		bind:value={fi.ambulation}
	/>

	<SelectInput
		label="Stairs"
		name="stairs"
		options={independenceLevels}
		bind:value={fi.stairs}
	/>

	<SelectInput
		label="Bathing"
		name="bathing"
		options={independenceLevels}
		bind:value={fi.bathing}
	/>

	<SelectInput
		label="Dressing (lower body)"
		name="dressing"
		options={independenceLevels}
		bind:value={fi.dressing}
	/>

	<TextArea
		label="Additional Notes"
		name="additionalNotes"
		bind:value={fi.additionalNotes}
		placeholder="Any additional observations about functional independence..."
	/>
</SectionCard>
