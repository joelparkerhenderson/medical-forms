<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';

	const ct = assessment.data.currentTreatment;
</script>

<SectionCard title="Current Treatment" description="Active treatment regimen and response">
	<TextInput label="Active Regimen" name="activeRegimen" bind:value={ct.activeRegimen} placeholder="e.g., FOLFIRI + Bevacizumab" />

	<NumberInput label="Cycle Number" name="cycleNumber" bind:value={ct.cycleNumber} min={1} max={50} />

	<TextInput label="Last Treatment Date" name="lastTxDate" type="date" bind:value={ct.lastTreatmentDate} />

	<SelectInput
		label="Response Assessment"
		name="responseAssessment"
		options={[
			{ value: 'complete-response', label: 'Complete Response (CR)' },
			{ value: 'partial-response', label: 'Partial Response (PR)' },
			{ value: 'stable-disease', label: 'Stable Disease (SD)' },
			{ value: 'progressive-disease', label: 'Progressive Disease (PD)' },
			{ value: 'not-yet-assessed', label: 'Not Yet Assessed' }
		]}
		bind:value={ct.responseAssessment}
	/>
</SectionCard>
