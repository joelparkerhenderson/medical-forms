<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const rc = assessment.data.reviewCalculate;
	const data = assessment.data;
</script>

<SectionCard title="Review & Calculate" description="Review the assessment summary and submit for risk calculation">
	<SelectInput
		label="PREVENT Model Type"
		name="modelType"
		options={[
			{ value: 'base', label: 'Base Model (without HbA1c/uACR)' },
			{ value: 'full', label: 'Full Model (with HbA1c and uACR)' }
		]}
		bind:value={rc.modelType}
	/>

	<TextInput label="Clinician Name" name="clinicianName" bind:value={rc.clinicianName} />
	<TextInput label="Review Date" name="reviewDate" type="date" bind:value={rc.reviewDate} />

	<TextArea
		label="Clinical Notes"
		name="clinicalNotes"
		bind:value={rc.clinicalNotes}
		placeholder="Any additional clinical observations or context"
		rows={4}
	/>

	<div class="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
		<h3 class="mb-3 font-semibold text-blue-900">Assessment Summary</h3>
		<div class="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
			<div>
				<span class="font-medium text-gray-600">Patient:</span>
				{data.patientInformation.fullName || 'Not provided'}
			</div>
			<div>
				<span class="font-medium text-gray-600">Age / Sex:</span>
				{data.demographics.age ?? 'N/A'} / {data.demographics.sex || 'N/A'}
			</div>
			<div>
				<span class="font-medium text-gray-600">Systolic BP:</span>
				{data.bloodPressure.systolicBp !== null ? `${data.bloodPressure.systolicBp} mmHg` : 'N/A'}
			</div>
			<div>
				<span class="font-medium text-gray-600">Total Cholesterol:</span>
				{data.cholesterolLipids.totalCholesterol !== null ? `${data.cholesterolLipids.totalCholesterol} mg/dL` : 'N/A'}
			</div>
			<div>
				<span class="font-medium text-gray-600">HDL Cholesterol:</span>
				{data.cholesterolLipids.hdlCholesterol !== null ? `${data.cholesterolLipids.hdlCholesterol} mg/dL` : 'N/A'}
			</div>
			<div>
				<span class="font-medium text-gray-600">Diabetes:</span>
				{data.metabolicHealth.hasDiabetes || 'N/A'}
			</div>
			<div>
				<span class="font-medium text-gray-600">Smoking:</span>
				{data.smokingHistory.smokingStatus || 'N/A'}
			</div>
			<div>
				<span class="font-medium text-gray-600">eGFR:</span>
				{data.renalFunction.egfr !== null ? `${data.renalFunction.egfr} mL/min` : 'N/A'}
			</div>
			<div>
				<span class="font-medium text-gray-600">BMI:</span>
				{data.metabolicHealth.bmi !== null ? data.metabolicHealth.bmi : 'N/A'}
			</div>
			<div>
				<span class="font-medium text-gray-600">Known CVD:</span>
				{data.medicalHistory.hasKnownCvd || 'N/A'}
			</div>
		</div>
	</div>

	<p class="mt-4 text-xs text-gray-500">
		Click "Submit Assessment" below to calculate the PREVENT CVD risk score and generate the report.
	</p>
</SectionCard>
