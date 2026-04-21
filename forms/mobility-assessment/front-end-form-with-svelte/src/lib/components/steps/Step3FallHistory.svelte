<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import CheckboxGroup from '$lib/components/ui/CheckboxGroup.svelte';

	const f = assessment.data.fallHistory;
</script>

<SectionCard title="Fall History" description="History of falls and fall risk factors">
	<NumberInput
		label="Number of falls in the last 12 months"
		name="fallsLastYear"
		bind:value={f.fallsLastYear}
		min={0}
		max={100}
	/>

	<TextInput label="Date of Most Recent Fall" name="lastFallDate" type="date" bind:value={f.lastFallDate} />

	<TextArea
		label="Circumstances of Falls"
		name="fallCircumstances"
		bind:value={f.fallCircumstances}
		placeholder="Describe circumstances of any falls (location, activity, time of day)..."
	/>

	<TextArea
		label="Injuries from Falls"
		name="injuriesFromFalls"
		bind:value={f.injuriesFromFalls}
		placeholder="Describe any injuries sustained from falls..."
	/>

	<RadioGroup
		label="Fear of Falling"
		name="fearOfFalling"
		options={[
			{ value: 'none', label: 'None' },
			{ value: 'mild', label: 'Mild' },
			{ value: 'moderate', label: 'Moderate' },
			{ value: 'severe', label: 'Severe' }
		]}
		bind:value={f.fearOfFalling}
	/>

	<CheckboxGroup
		label="Fall Risk Factors"
		options={[
			{ value: 'vision-impairment', label: 'Vision impairment' },
			{ value: 'hearing-impairment', label: 'Hearing impairment' },
			{ value: 'peripheral-neuropathy', label: 'Peripheral neuropathy' },
			{ value: 'orthostatic-hypotension', label: 'Orthostatic hypotension' },
			{ value: 'cognitive-impairment', label: 'Cognitive impairment' },
			{ value: 'urinary-urgency', label: 'Urinary urgency' },
			{ value: 'environmental-hazards', label: 'Environmental hazards' },
			{ value: 'footwear-issues', label: 'Inappropriate footwear' }
		]}
		bind:values={f.fallRiskFactors}
	/>
</SectionCard>
