<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';

	const cv = assessment.data.cardiovascularRisk;

	const yesNoOptions = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Cardiovascular Risk" description="Cardiovascular history and risk assessment">
	<h3 class="mb-3 text-sm font-semibold text-gray-700">Blood Pressure & Heart Rate</h3>
	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-3">
		<NumberInput label="Systolic BP" name="bloodPressureSystolic" bind:value={cv.bloodPressureSystolic} min={60} max={250} unit="mmHg" />
		<NumberInput label="Diastolic BP" name="bloodPressureDiastolic" bind:value={cv.bloodPressureDiastolic} min={30} max={150} unit="mmHg" />
		<NumberInput label="Heart Rate" name="heartRate" bind:value={cv.heartRate} min={30} max={200} unit="bpm" />
	</div>

	<h3 class="mb-3 mt-6 text-sm font-semibold text-gray-700">Cardiovascular History</h3>
	<RadioGroup label="Previous myocardial infarction (heart attack)" name="previousMI" options={yesNoOptions} bind:value={cv.previousMI} />
	<RadioGroup label="Heart failure" name="heartFailure" options={yesNoOptions} bind:value={cv.heartFailure} />
	<RadioGroup label="Peripheral vascular disease" name="peripheralVascularDisease" options={yesNoOptions} bind:value={cv.peripheralVascularDisease} />
	<RadioGroup label="Cerebrovascular disease (stroke/TIA)" name="cerebrovascularDisease" options={yesNoOptions} bind:value={cv.cerebrovascularDisease} />

	<h3 class="mb-3 mt-6 text-sm font-semibold text-gray-700">Risk Score</h3>
	<NumberInput label="QRISK Score" name="qriskScore" bind:value={cv.qriskScore} min={0} max={100} step={0.1} unit="%" />
</SectionCard>
