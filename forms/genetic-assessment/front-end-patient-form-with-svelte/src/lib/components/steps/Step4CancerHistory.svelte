<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';

	const c = assessment.data.cancerHistory;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Cancer History" description="Personal cancer history relevant to hereditary cancer syndromes">
	<RadioGroup label="Do you have a personal history of cancer?" name="personalCancerHistory" options={yesNo} bind:value={c.personalCancerHistory} />

	{#if c.personalCancerHistory === 'yes'}
		<TextInput
			label="Type of cancer"
			name="cancerType"
			bind:value={c.cancerType}
			placeholder="e.g., breast, colorectal, ovarian, prostate..."
			required
		/>

		<NumberInput
			label="Age at diagnosis"
			name="ageAtDiagnosis"
			bind:value={c.ageAtDiagnosis}
			min={0}
			max={120}
			unit="years"
		/>
	{/if}

	<RadioGroup label="Have you had multiple primary cancers (different types)?" name="multiplePrimaryCancers" options={yesNo} bind:value={c.multiplePrimaryCancers} />
</SectionCard>
