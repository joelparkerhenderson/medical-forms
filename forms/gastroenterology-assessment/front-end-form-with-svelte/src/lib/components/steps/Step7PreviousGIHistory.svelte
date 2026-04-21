<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';

	const h = assessment.data.previousGIHistory;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Previous GI History" description="Previous gastroenterological investigations and diagnoses">
	<RadioGroup label="Have you had an endoscopy (camera down the throat)?" name="endoscopy" options={yesNo} bind:value={h.previousEndoscopy} />
	{#if h.previousEndoscopy === 'yes'}
		<TextArea label="When and what were the findings?" name="endoscopyDetails" bind:value={h.endoscopyDetails} />
	{/if}

	<RadioGroup label="Have you had a colonoscopy?" name="colonoscopy" options={yesNo} bind:value={h.previousColonoscopy} />
	{#if h.previousColonoscopy === 'yes'}
		<TextArea label="When and what were the findings?" name="colonoscopyDetails" bind:value={h.colonoscopyDetails} />
	{/if}

	<RadioGroup label="Have you had any previous GI surgery?" name="giSurgery" options={yesNo} bind:value={h.previousGISurgery} />
	{#if h.previousGISurgery === 'yes'}
		<TextArea label="What surgery and when?" name="surgeryDetails" bind:value={h.surgeryDetails} />
	{/if}

	<RadioGroup label="Have you been diagnosed with inflammatory bowel disease (IBD)?" name="ibd" options={yesNo} bind:value={h.ibd} />
	{#if h.ibd === 'yes'}
		<SelectInput
			label="Which type?"
			name="ibdType"
			options={[
				{ value: 'crohns', label: "Crohn's Disease" },
				{ value: 'ulcerative-colitis', label: 'Ulcerative Colitis' }
			]}
			bind:value={h.ibdType}
		/>
	{/if}

	<RadioGroup label="Have you been diagnosed with irritable bowel syndrome (IBS)?" name="ibs" options={yesNo} bind:value={h.ibs} />

	<RadioGroup label="Have you been diagnosed with coeliac disease?" name="celiac" options={yesNo} bind:value={h.celiacDisease} />

	<RadioGroup label="Have you ever had polyps found?" name="polyps" options={yesNo} bind:value={h.polyps} />
	{#if h.polyps === 'yes'}
		<TextInput label="Details (type, number, location)" name="polypDetails" bind:value={h.polypDetails} />
	{/if}

	<RadioGroup label="Have you ever been diagnosed with a GI cancer?" name="giCancer" options={yesNo} bind:value={h.giCancer} />
	{#if h.giCancer === 'yes'}
		<TextArea label="Please provide details (type, treatment, when)" name="cancerDetails" bind:value={h.giCancerDetails} />
	{/if}
</SectionCard>
