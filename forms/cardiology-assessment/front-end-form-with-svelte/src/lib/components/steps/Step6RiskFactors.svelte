<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';

	const r = assessment.data.riskFactors;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Risk Factors" description="Hypertension, diabetes, hyperlipidaemia, family history, obesity">
	<RadioGroup label="Do you have high blood pressure (hypertension)?" name="htn" options={yesNo} bind:value={r.hypertension} />
	{#if r.hypertension === 'yes'}
		<RadioGroup label="Is it well controlled with medication?" name="htnCtrl" options={yesNo} bind:value={r.hypertensionControlled} required />
	{/if}

	<RadioGroup label="Do you have diabetes?" name="diabetes" options={yesNo} bind:value={r.diabetes} />
	{#if r.diabetes === 'yes'}
		<SelectInput
			label="Type of diabetes"
			name="diabetesType"
			options={[
				{ value: 'type1', label: 'Type 1' },
				{ value: 'type2', label: 'Type 2' }
			]}
			bind:value={r.diabetesType}
		/>
	{/if}

	<RadioGroup label="Do you have high cholesterol (hyperlipidaemia)?" name="lipid" options={yesNo} bind:value={r.hyperlipidaemia} />

	<RadioGroup label="Is there a family history of premature cardiovascular disease?" name="famHx" options={yesNo} bind:value={r.familyHistory} />
	{#if r.familyHistory === 'yes'}
		<TextInput label="Family history details" name="famHxDetails" bind:value={r.familyHistoryDetails} placeholder="e.g. Father had MI at age 45" />
	{/if}

	<RadioGroup label="Are you obese (BMI >= 30)?" name="obesity" options={yesNo} bind:value={r.obesity} />
</SectionCard>
