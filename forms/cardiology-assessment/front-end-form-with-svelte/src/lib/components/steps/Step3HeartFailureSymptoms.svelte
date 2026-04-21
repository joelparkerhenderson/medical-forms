<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';

	const h = assessment.data.heartFailureSymptoms;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Heart Failure Symptoms" description="Dyspnoea, orthopnoea, oedema, and NYHA classification">
	<RadioGroup label="Do you experience shortness of breath (dyspnoea)?" name="dyspnoea" options={yesNo} bind:value={h.dyspnoea} />

	{#if h.dyspnoea === 'yes'}
		<RadioGroup label="Is the shortness of breath on exertion?" name="dyspnoeaOnExertion" options={yesNo} bind:value={h.dyspnoeaOnExertion} />
	{/if}

	<RadioGroup label="Do you need to sit upright to breathe comfortably (orthopnoea)?" name="orthopnoea" options={yesNo} bind:value={h.orthopnoea} />

	<RadioGroup label="Do you wake at night gasping for breath (PND)?" name="pnd" options={yesNo} bind:value={h.pnd} />

	<RadioGroup label="Do you have swelling of the ankles or legs (peripheral oedema)?" name="oedema" options={yesNo} bind:value={h.peripheralOedema} />

	<SelectInput
		label="NYHA Heart Failure Class"
		name="nyhaClass"
		options={[
			{ value: '1', label: 'Class I - No limitation of physical activity' },
			{ value: '2', label: 'Class II - Slight limitation of physical activity' },
			{ value: '3', label: 'Class III - Marked limitation of physical activity' },
			{ value: '4', label: 'Class IV - Symptoms at rest' }
		]}
		bind:value={h.nyhaClass}
	/>
</SectionCard>
