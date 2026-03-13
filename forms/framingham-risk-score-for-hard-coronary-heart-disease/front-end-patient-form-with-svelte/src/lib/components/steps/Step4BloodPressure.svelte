<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';

	const bp = assessment.data.bloodPressure;
</script>

<SectionCard title="Blood Pressure" description="Blood pressure and treatment status affect risk calculation. Treatment increases the BP coefficient.">
	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<div class="mb-4">
			<label for="systolicBp" class="mb-1 block text-sm font-medium text-gray-700">Systolic BP (mmHg)</label>
			<input id="systolicBp" name="systolicBp" type="number" min="60" max="300" step="1" bind:value={bp.systolicBp} placeholder="e.g. 130" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none" />
		</div>
		<div class="mb-4">
			<label for="diastolicBp" class="mb-1 block text-sm font-medium text-gray-700">Diastolic BP (mmHg)</label>
			<input id="diastolicBp" name="diastolicBp" type="number" min="30" max="200" step="1" bind:value={bp.diastolicBp} placeholder="e.g. 85" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none" />
		</div>
	</div>

	<RadioGroup
		label="Currently on Blood Pressure Treatment?"
		name="onBpTreatment"
		options={[
			{ value: 'yes', label: 'Yes' },
			{ value: 'no', label: 'No' }
		]}
		bind:value={bp.onBpTreatment}
	/>

	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<TextInput label="BP Medication Name (if applicable)" name="bpMedicationName" bind:value={bp.bpMedicationName} placeholder="e.g. Amlodipine 5mg" />

		<div class="mb-4">
			<label for="bpMeasurementMethod" class="mb-1 block text-sm font-medium text-gray-700">Measurement Method</label>
			<select id="bpMeasurementMethod" name="bpMeasurementMethod" bind:value={bp.bpMeasurementMethod} class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none">
				<option value="">-- Select --</option>
				<option value="clinic">Clinic Reading</option>
				<option value="ambulatory">Ambulatory (24h)</option>
				<option value="home">Home Monitoring</option>
			</select>
		</div>
	</div>
</SectionCard>
