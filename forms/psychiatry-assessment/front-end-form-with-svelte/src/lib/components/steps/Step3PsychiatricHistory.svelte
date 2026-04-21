<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const h = assessment.data.psychiatricHistory;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Psychiatric History" description="Previous psychiatric diagnoses and treatment history">
	<TextArea label="Previous Diagnoses" name="previousDiagnoses" bind:value={h.previousDiagnoses} placeholder="List any previous psychiatric diagnoses" />

	<RadioGroup label="Previous psychiatric hospitalizations?" name="prevHosp" options={yesNo} bind:value={h.previousHospitalizations} />
	{#if h.previousHospitalizations === 'yes'}
		<TextArea label="Hospitalization Details" name="hospDetails" bind:value={h.hospitalizationDetails} placeholder="Number of admissions, dates, reasons, duration" />
	{/if}

	<RadioGroup label="Previous suicide attempts?" name="prevSuicide" options={yesNo} bind:value={h.previousSuicideAttempts} />
	{#if h.previousSuicideAttempts === 'yes'}
		<TextArea label="Suicide Attempt Details" name="suicideDetails" bind:value={h.suicideAttemptDetails} placeholder="Number, method, circumstances, outcome" />
	{/if}

	<RadioGroup label="History of self-harm?" name="selfHarmHx" options={yesNo} bind:value={h.selfHarmHistory} />
	{#if h.selfHarmHistory === 'yes'}
		<TextArea label="Self-Harm Details" name="selfHarmDetails" bind:value={h.selfHarmDetails} placeholder="Type, frequency, most recent episode" />
	{/if}
</SectionCard>
