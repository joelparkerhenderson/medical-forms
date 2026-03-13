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

<SectionCard title="Medical History" description="Relevant medical conditions that may affect psychiatric care">
	<RadioGroup label="Neurological conditions?" name="neuro" options={yesNo} bind:value={m.neurologicalConditions} />
	{#if m.neurologicalConditions === 'yes'}
		<TextArea label="Neurological Details" name="neuroDetails" bind:value={m.neurologicalDetails} placeholder="e.g. epilepsy, head injury, dementia, Parkinson's" />
	{/if}

	<RadioGroup label="Endocrine conditions?" name="endocrine" options={yesNo} bind:value={m.endocrineConditions} />
	{#if m.endocrineConditions === 'yes'}
		<TextArea label="Endocrine Details" name="endocrineDetails" bind:value={m.endocrineDetails} placeholder="e.g. thyroid disorder, diabetes, adrenal insufficiency" />
	{/if}

	<RadioGroup label="Chronic pain?" name="pain" options={yesNo} bind:value={m.chronicPain} />
	{#if m.chronicPain === 'yes'}
		<TextArea label="Chronic Pain Details" name="painDetails" bind:value={m.chronicPainDetails} placeholder="Location, duration, current management" />
	{/if}

	<RadioGroup label="Currently pregnant or possibility of pregnancy?" name="pregnancy" options={yesNo} bind:value={m.pregnancy} />
	{#if m.pregnancy === 'yes'}
		<TextArea label="Pregnancy Details" name="pregnancyDetails" bind:value={m.pregnancyDetails} placeholder="Gestation, relevant obstetric history" />
	{/if}
</SectionCard>
