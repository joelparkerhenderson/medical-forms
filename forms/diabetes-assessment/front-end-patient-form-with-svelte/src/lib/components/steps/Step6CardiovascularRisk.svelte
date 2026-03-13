<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';

	const d = assessment.data.cardiovascularRisk;
</script>

<SectionCard title="Cardiovascular Risk" description="Assess cardiovascular risk factors and current management.">
	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<NumberInput label="Systolic BP (mmHg)" name="systolicBp" bind:value={d.systolicBp} min={60} max={300} placeholder="e.g. 130" />
		<NumberInput label="Diastolic BP (mmHg)" name="diastolicBp" bind:value={d.diastolicBp} min={30} max={200} placeholder="e.g. 80" />
	</div>

	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<SelectInput
			label="On Antihypertensive"
			name="onAntihypertensive"
			bind:value={d.onAntihypertensive}
			options={[
				{ value: 'yes', label: 'Yes' },
				{ value: 'no', label: 'No' }
			]}
		/>
		<SelectInput
			label="On Statin"
			name="onStatin"
			bind:value={d.onStatin}
			options={[
				{ value: 'yes', label: 'Yes' },
				{ value: 'no', label: 'No' },
				{ value: 'intolerant', label: 'Statin Intolerant' }
			]}
		/>
	</div>

	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<NumberInput label="Total Cholesterol (mmol/L)" name="totalCholesterol" bind:value={d.totalCholesterol} step="0.1" min={0} placeholder="e.g. 4.5" />
		<NumberInput label="LDL Cholesterol (mmol/L)" name="ldlCholesterol" bind:value={d.ldlCholesterol} step="0.1" min={0} placeholder="e.g. 2.0" />
	</div>

	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<SelectInput
			label="Smoking Status"
			name="smokingStatus"
			bind:value={d.smokingStatus}
			options={[
				{ value: 'never', label: 'Never Smoked' },
				{ value: 'exSmoker', label: 'Ex-Smoker' },
				{ value: 'currentSmoker', label: 'Current Smoker' }
			]}
		/>
		<RadioGroup
			label="Previous CVD Event"
			name="previousCvdEvent"
			bind:value={d.previousCvdEvent}
			options={[
				{ value: 'yes', label: 'Yes' },
				{ value: 'no', label: 'No' }
			]}
		/>
	</div>

	<NumberInput label="QRISK Score (%)" name="qriskScore" bind:value={d.qriskScore} step="0.1" min={0} max={100} placeholder="e.g. 15.2" />
</SectionCard>
