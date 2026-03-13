<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';

	const d = assessment.data.glycaemicControl;
</script>

<SectionCard title="Glycaemic Control" description="Record current glycaemic markers and monitoring approach.">
	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<NumberInput label="HbA1c Value" name="hba1cValue" bind:value={d.hba1cValue} step="0.1" min={0} placeholder="e.g. 53 or 7.0" />
		<SelectInput
			label="HbA1c Unit"
			name="hba1cUnit"
			bind:value={d.hba1cUnit}
			options={[
				{ value: 'mmolMol', label: 'mmol/mol' },
				{ value: 'percent', label: '% (DCCT)' }
			]}
		/>
	</div>

	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<NumberInput label="Agreed HbA1c Target" name="hba1cTarget" bind:value={d.hba1cTarget} step="0.1" min={0} placeholder="e.g. 48 or 6.5" />
		<NumberInput label="Time in Range (%)" name="timeInRange" bind:value={d.timeInRange} min={0} max={100} placeholder="e.g. 70" />
	</div>

	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<NumberInput label="Fasting Glucose (mmol/L)" name="fastingGlucose" bind:value={d.fastingGlucose} step="0.1" min={0} placeholder="e.g. 5.5" />
		<NumberInput label="Postprandial Glucose (mmol/L)" name="postprandialGlucose" bind:value={d.postprandialGlucose} step="0.1" min={0} placeholder="e.g. 7.8" />
	</div>

	<SelectInput
		label="Glucose Monitoring Method"
		name="glucoseMonitoringType"
		bind:value={d.glucoseMonitoringType}
		options={[
			{ value: 'smbg', label: 'Self-Monitoring Blood Glucose (SMBG)' },
			{ value: 'cgm', label: 'Continuous Glucose Monitor (CGM)' },
			{ value: 'flash', label: 'Flash Glucose Monitor' },
			{ value: 'none', label: 'None' }
		]}
	/>

	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<SelectInput
			label="Hypoglycaemia Frequency"
			name="hypoglycaemiaFrequency"
			bind:value={d.hypoglycaemiaFrequency}
			options={[
				{ value: 'never', label: 'Never' },
				{ value: 'rarely', label: 'Rarely (less than monthly)' },
				{ value: 'monthly', label: 'Monthly' },
				{ value: 'weekly', label: 'Weekly' },
				{ value: 'daily', label: 'Daily' }
			]}
		/>
		<RadioGroup
			label="Severe Hypoglycaemia (requiring assistance)"
			name="severeHypoglycaemia"
			bind:value={d.severeHypoglycaemia}
			options={[
				{ value: 'yes', label: 'Yes' },
				{ value: 'no', label: 'No' }
			]}
		/>
	</div>
</SectionCard>
