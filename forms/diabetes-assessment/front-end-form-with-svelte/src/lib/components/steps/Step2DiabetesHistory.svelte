<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';

	const d = assessment.data.diabetesHistory;
</script>

<SectionCard title="Diabetes History" description="Record the patient's diabetes diagnosis and history.">
	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<SelectInput
			label="Diabetes Type"
			name="diabetesType"
			bind:value={d.diabetesType}
			options={[
				{ value: 'type1', label: 'Type 1' },
				{ value: 'type2', label: 'Type 2' },
				{ value: 'gestational', label: 'Gestational' },
				{ value: 'other', label: 'Other' }
			]}
		/>
		<NumberInput label="Age at Diagnosis" name="ageAtDiagnosis" bind:value={d.ageAtDiagnosis} min={0} max={120} placeholder="e.g. 45" />
	</div>

	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<NumberInput label="Years Since Diagnosis" name="yearsDuration" bind:value={d.yearsDuration} min={0} max={100} placeholder="e.g. 10" />
		<SelectInput
			label="Diagnosis Method"
			name="diagnosisMethod"
			bind:value={d.diagnosisMethod}
			options={[
				{ value: 'hba1c', label: 'HbA1c' },
				{ value: 'fastingGlucose', label: 'Fasting Glucose' },
				{ value: 'ogtt', label: 'OGTT' },
				{ value: 'randomGlucose', label: 'Random Glucose' },
				{ value: 'other', label: 'Other' }
			]}
		/>
	</div>

	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<RadioGroup
			label="Family History of Diabetes"
			name="familyHistory"
			bind:value={d.familyHistory}
			options={[
				{ value: 'yes', label: 'Yes' },
				{ value: 'no', label: 'No' }
			]}
		/>
		<SelectInput
			label="Autoantibodies Tested"
			name="autoantibodiesTested"
			bind:value={d.autoantibodiesTested}
			options={[
				{ value: 'yes', label: 'Yes - Positive' },
				{ value: 'negative', label: 'Yes - Negative' },
				{ value: 'notTested', label: 'Not Tested' }
			]}
		/>
	</div>
</SectionCard>
