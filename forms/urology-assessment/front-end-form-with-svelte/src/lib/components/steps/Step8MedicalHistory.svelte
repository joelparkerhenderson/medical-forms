<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const m = assessment.data.medicalHistory;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Medical History" description="Previous urological conditions and relevant medical history">
	<TextArea
		label="Previous urological conditions"
		name="previousUrologic"
		bind:value={m.previousUrologicConditions}
		placeholder="e.g., kidney stones, UTIs, BPH, prostatitis..."
	/>

	<TextArea
		label="Surgical history"
		name="surgicalHistory"
		bind:value={m.surgicalHistory}
		placeholder="e.g., TURP, prostatectomy, cystoscopy, vasectomy..."
	/>

	<RadioGroup label="Do you have diabetes?" name="diabetes" options={yesNo} bind:value={m.diabetes} />

	<RadioGroup label="Do you have hypertension?" name="hypertension" options={yesNo} bind:value={m.hypertension} />

	<RadioGroup label="Do you have any neurological conditions?" name="neurologicConditions" options={yesNo} bind:value={m.neurologicConditions} />
	{#if m.neurologicConditions === 'yes'}
		<TextArea label="Please provide details" name="neurologicDetails" bind:value={m.neurologicConditionDetails} />
	{/if}
</SectionCard>
