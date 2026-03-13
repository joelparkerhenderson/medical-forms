<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';

	const mh = assessment.data.metabolicHealth;
</script>

<SectionCard title="Metabolic Health" description="Diabetes status, HbA1c, glucose, BMI, and waist circumference">
	<RadioGroup
		label="Has diabetes?"
		name="hasDiabetes"
		options={[
			{ value: 'yes', label: 'Yes' },
			{ value: 'no', label: 'No' }
		]}
		bind:value={mh.hasDiabetes}
		required
	/>

	{#if mh.hasDiabetes === 'yes'}
		<SelectInput
			label="Diabetes Type"
			name="diabetesType"
			options={[
				{ value: 'type1', label: 'Type 1' },
				{ value: 'type2', label: 'Type 2' },
				{ value: 'gestational', label: 'Gestational' },
				{ value: 'other', label: 'Other' }
			]}
			bind:value={mh.diabetesType}
		/>
	{/if}

	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<NumberInput label="HbA1c Value" name="hba1cValue" bind:value={mh.hba1cValue} min={2} max={200} step={0.1} />
		<SelectInput
			label="HbA1c Unit"
			name="hba1cUnit"
			options={[
				{ value: 'percent', label: '% (NGSP/DCCT)' },
				{ value: 'mmolMol', label: 'mmol/mol (IFCC)' }
			]}
			bind:value={mh.hba1cUnit}
		/>
	</div>

	<NumberInput label="Fasting Glucose" name="fastingGlucose" bind:value={mh.fastingGlucose} min={30} max={600} step={1} unit="mg/dL" />

	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<NumberInput label="BMI" name="bmi" bind:value={mh.bmi} min={10} max={80} step={0.1} unit="kg/m2" />
		<NumberInput label="Waist Circumference" name="waistCircumferenceCm" bind:value={mh.waistCircumferenceCm} min={40} max={200} step={0.1} unit="cm" />
	</div>
</SectionCard>
