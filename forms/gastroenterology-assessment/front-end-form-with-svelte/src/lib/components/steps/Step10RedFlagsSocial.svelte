<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';

	const r = assessment.data.redFlagsSocial;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Red Flags & Social History" description="Warning signs and lifestyle factors">
	<RadioGroup label="Have you experienced unexplained weight loss?" name="weightLoss" options={yesNo} bind:value={r.unexplainedWeightLoss} />
	{#if r.unexplainedWeightLoss === 'yes'}
		<TextInput label="How much weight have you lost and over what period?" name="weightLossAmount" bind:value={r.weightLossAmount} placeholder="e.g. 5kg in 3 months" />
	{/if}

	<RadioGroup label="Has your appetite changed?" name="appetiteChange" options={yesNo} bind:value={r.appetiteChange} />
	{#if r.appetiteChange === 'yes'}
		<TextInput label="Please describe the change" name="appetiteDetails" bind:value={r.appetiteDetails} placeholder="e.g. decreased appetite, loss of appetite" />
	{/if}

	<RadioGroup label="Does anyone in your family have a history of GI cancer?" name="familyCancer" options={yesNo} bind:value={r.familyGICancer} />
	{#if r.familyGICancer === 'yes'}
		<TextArea label="Please provide details (who, what type, age at diagnosis)" name="familyCancerDetails" bind:value={r.familyCancerDetails} />
	{/if}

	<RadioGroup
		label="Do you smoke?"
		name="smoking"
		options={[
			{ value: 'current', label: 'Current smoker' },
			{ value: 'ex', label: 'Ex-smoker' },
			{ value: 'never', label: 'Never smoked' }
		]}
		bind:value={r.smoking}
	/>
	{#if r.smoking === 'current' || r.smoking === 'ex'}
		<NumberInput label="Pack years" name="packYears" bind:value={r.smokingPackYears} min={0} max={200} />
	{/if}

	<SelectInput
		label="How would you describe your alcohol use?"
		name="alcoholUse"
		options={[
			{ value: 'none', label: 'None' },
			{ value: 'occasional', label: 'Occasional' },
			{ value: 'moderate', label: 'Moderate' },
			{ value: 'heavy', label: 'Heavy' }
		]}
		bind:value={r.alcoholUse}
	/>
</SectionCard>
