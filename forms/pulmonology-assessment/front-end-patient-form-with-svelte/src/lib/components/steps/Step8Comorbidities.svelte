<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const c = assessment.data.comorbidities;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Comorbidities" description="Other medical conditions that may affect your pulmonary care">
	<RadioGroup label="Do you have cardiovascular disease (heart disease, hypertension)?" name="cvd" options={yesNo} bind:value={c.cardiovascularDisease} />
	{#if c.cardiovascularDisease === 'yes'}
		<TextInput label="Please provide details" name="cvdDetails" bind:value={c.cardiovascularDetails} />
	{/if}

	<RadioGroup label="Do you have diabetes?" name="diabetes" options={yesNo} bind:value={c.diabetes} />
	<RadioGroup label="Do you have osteoporosis?" name="osteo" options={yesNo} bind:value={c.osteoporosis} />
	<RadioGroup label="Do you have depression or anxiety?" name="depression" options={yesNo} bind:value={c.depression} />

	<RadioGroup label="Have you been diagnosed with lung cancer?" name="lungCancer" options={yesNo} bind:value={c.lungCancer} />
	{#if c.lungCancer === 'yes'}
		<TextInput label="Please provide details (type, stage, treatment)" name="cancerDetails" bind:value={c.lungCancerDetails} />
	{/if}

	<TextArea label="Any other significant medical conditions?" name="otherComorbid" bind:value={c.otherComorbidities} placeholder="List any other conditions..." />
</SectionCard>
