<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';

	const r = assessment.data.reviewCalculate;
	const data = assessment.data;
</script>

<SectionCard title="Review & Calculate" description="Review the assessment and provide clinician details before calculating the Framingham Risk Score.">
	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<TextInput label="Clinician Name" name="clinicianName" bind:value={r.clinicianName} placeholder="e.g. Dr Smith" />
		<TextInput label="Review Date" name="reviewDate" type="date" bind:value={r.reviewDate} />
	</div>

	<div class="mb-4">
		<label for="clinicalNotes" class="mb-1 block text-sm font-medium text-gray-700">Clinical Notes</label>
		<textarea id="clinicalNotes" name="clinicalNotes" rows="4" bind:value={r.clinicalNotes} placeholder="Any additional clinical observations or notes" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"></textarea>
	</div>

	<RadioGroup
		label="Patient Consent Obtained?"
		name="patientConsent"
		options={[
			{ value: 'yes', label: 'Yes' },
			{ value: 'no', label: 'No' }
		]}
		bind:value={r.patientConsent}
	/>

	<!-- Summary of key inputs -->
	<div class="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-5">
		<h3 class="mb-3 text-base font-semibold text-gray-900">Key Inputs Summary</h3>
		<div class="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
			<div><span class="font-medium text-gray-600">Age:</span> {data.demographics.age ?? 'Not set'}</div>
			<div><span class="font-medium text-gray-600">Sex:</span> {data.demographics.sex || 'Not set'}</div>
			<div><span class="font-medium text-gray-600">Smoking:</span> {data.smokingHistory.smokingStatus || 'Not set'}</div>
			<div><span class="font-medium text-gray-600">BP Treatment:</span> {data.bloodPressure.onBpTreatment || 'Not set'}</div>
			<div><span class="font-medium text-gray-600">Systolic BP:</span> {data.bloodPressure.systolicBp ?? 'Not set'}</div>
			<div><span class="font-medium text-gray-600">Total Cholesterol:</span> {data.cholesterol.totalCholesterol ?? 'Not set'}</div>
			<div><span class="font-medium text-gray-600">HDL:</span> {data.cholesterol.hdlCholesterol ?? 'Not set'}</div>
			<div><span class="font-medium text-gray-600">Diabetes:</span> {data.medicalHistory.hasDiabetes || 'Not set'}</div>
		</div>
	</div>
</SectionCard>
