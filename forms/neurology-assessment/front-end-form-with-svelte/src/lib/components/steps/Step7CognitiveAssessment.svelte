<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const c = assessment.data.cognitiveAssessment;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Cognitive Assessment" description="Orientation, attention, memory, language, and executive function">
	<SelectInput
		label="Orientation"
		name="orientation"
		options={[
			{ value: 'fully-oriented', label: 'Fully oriented (person, place, time)' },
			{ value: 'partially-oriented', label: 'Partially oriented' },
			{ value: 'disoriented', label: 'Disoriented' }
		]}
		bind:value={c.orientation}
	/>

	<RadioGroup label="Attention normal?" name="attention" options={yesNo} bind:value={c.attentionNormal} />
	<RadioGroup label="Short-term memory intact?" name="stm" options={yesNo} bind:value={c.memoryShortTerm} />
	<RadioGroup label="Long-term memory intact?" name="ltm" options={yesNo} bind:value={c.memoryLongTerm} />

	<RadioGroup label="Language function normal?" name="languageNormal" options={yesNo} bind:value={c.languageNormal} />
	{#if c.languageNormal === 'no'}
		<TextArea label="Language deficit details" name="languageDetails" bind:value={c.languageDetails} placeholder="e.g., word-finding difficulty, comprehension issues, fluency" />
	{/if}

	<RadioGroup label="Visuospatial function normal?" name="visuospatial" options={yesNo} bind:value={c.visuospatialNormal} />
	<RadioGroup label="Executive function normal?" name="executive" options={yesNo} bind:value={c.executiveFunctionNormal} />

	<NumberInput label="MMSE Score (if performed)" name="mmse" bind:value={c.mmseScore} min={0} max={30} />
	{#if c.mmseScore !== null}
		<div class="mt-1 text-sm text-gray-500">
			{#if c.mmseScore >= 27}
				Normal cognitive function
			{:else if c.mmseScore >= 24}
				Mild cognitive impairment
			{:else if c.mmseScore >= 18}
				Mild dementia
			{:else if c.mmseScore >= 10}
				Moderate dementia
			{:else}
				Severe dementia
			{/if}
		</div>
	{/if}
</SectionCard>
