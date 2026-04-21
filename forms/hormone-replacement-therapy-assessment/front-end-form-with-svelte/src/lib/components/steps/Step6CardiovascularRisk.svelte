<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';

	const c = assessment.data.cardiovascularRisk;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Cardiovascular Risk" description="Blood pressure, lipid profile, and cardiovascular risk factors">
	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<NumberInput label="Systolic Blood Pressure" name="systolicBP" bind:value={c.systolicBP} unit="mmHg" min={60} max={250} />
		<NumberInput label="Diastolic Blood Pressure" name="diastolicBP" bind:value={c.diastolicBP} unit="mmHg" min={30} max={150} />
	</div>

	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<NumberInput label="Total Cholesterol" name="totalCholesterol" bind:value={c.totalCholesterol} unit="mmol/L" min={1} max={15} step={0.1} />
		<NumberInput label="HDL Cholesterol" name="hdlCholesterol" bind:value={c.hdlCholesterol} unit="mmol/L" min={0.1} max={5} step={0.1} />
	</div>

	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<NumberInput label="LDL Cholesterol" name="ldlCholesterol" bind:value={c.ldlCholesterol} unit="mmol/L" min={0.1} max={10} step={0.1} />
		<NumberInput label="Triglycerides" name="triglycerides" bind:value={c.triglycerides} unit="mmol/L" min={0.1} max={20} step={0.1} />
	</div>

	<RadioGroup label="Family history of cardiovascular disease?" name="familyHistoryCVD" options={yesNo} bind:value={c.familyHistoryCVD} />

	<RadioGroup label="Do you have diabetes?" name="diabetes" options={yesNo} bind:value={c.diabetes} />
	{#if c.diabetes === 'yes'}
		<SelectInput
			label="Type of diabetes"
			name="diabetesType"
			options={[
				{ value: 'type1', label: 'Type 1' },
				{ value: 'type2', label: 'Type 2' }
			]}
			bind:value={c.diabetesType}
		/>
	{/if}

	<RadioGroup
		label="Smoking status"
		name="smoking"
		options={[
			{ value: 'current', label: 'Current smoker' },
			{ value: 'ex', label: 'Ex-smoker' },
			{ value: 'never', label: 'Never smoked' }
		]}
		bind:value={c.smoking}
	/>

	<NumberInput label="QRISK Score (if known)" name="qriskScore" bind:value={c.qriskScore} unit="%" min={0} max={100} step={0.1} />
</SectionCard>
