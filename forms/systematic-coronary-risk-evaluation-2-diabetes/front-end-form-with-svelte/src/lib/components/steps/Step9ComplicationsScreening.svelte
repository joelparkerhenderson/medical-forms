<script lang="ts">
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import type { ComplicationsScreening } from '$lib/engine/types.js';

	let { data = $bindable() }: { data: ComplicationsScreening } = $props();

	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Complications Screening">
	<h4 class="mb-2 text-sm font-semibold text-gray-700">Retinopathy</h4>

	<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
		<div class="mb-4">
			<label for="retinopathyStatus" class="block text-sm font-medium text-gray-700 mb-1">Retinopathy Status</label>
			<select
				id="retinopathyStatus"
				bind:value={data.retinopathyStatus}
				class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary"
			>
				<option value="">Select...</option>
				<option value="none">None</option>
				<option value="background">Background (R1)</option>
				<option value="preProliferative">Pre-proliferative (R2)</option>
				<option value="proliferative">Proliferative (R3)</option>
				<option value="maculopathy">Maculopathy (M1)</option>
				<option value="notScreened">Not yet screened</option>
			</select>
		</div>
		<TextInput label="Last Eye Screening Date" id="lastEyeScreeningDate" type="date" bind:value={data.lastEyeScreeningDate} />
	</div>

	<h4 class="mt-4 mb-2 text-sm font-semibold text-gray-700">Neuropathy</h4>

	<RadioGroup
		label="Neuropathy Symptoms"
		name="neuropathySymptoms"
		options={yesNo}
		bind:value={data.neuropathySymptoms}
		hint="e.g. numbness, tingling, burning sensation in feet"
	/>

	<div class="mb-4">
		<label for="monofilamentTest" class="block text-sm font-medium text-gray-700 mb-1">10g Monofilament Test</label>
		<select
			id="monofilamentTest"
			bind:value={data.monofilamentTest}
			class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary"
		>
			<option value="">Select...</option>
			<option value="normal">Normal</option>
			<option value="abnormal">Abnormal</option>
			<option value="notDone">Not done</option>
		</select>
	</div>

	<h4 class="mt-4 mb-2 text-sm font-semibold text-gray-700">Peripheral Vascular Assessment</h4>

	<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
		<div class="mb-4">
			<label for="footPulses" class="block text-sm font-medium text-gray-700 mb-1">Foot Pulses</label>
			<select
				id="footPulses"
				bind:value={data.footPulses}
				class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary"
			>
				<option value="">Select...</option>
				<option value="normal">Normal (palpable bilaterally)</option>
				<option value="absent">Absent or diminished</option>
				<option value="notChecked">Not checked</option>
			</select>
		</div>
		<TextInput label="Ankle-Brachial Index (ABI)" id="ankleBrachialIndex" type="number" bind:value={data.ankleBrachialIndex} min={0} max={2} step={0.01} />
	</div>

	<RadioGroup label="History of Foot Ulcer" name="footUlcerHistory" options={yesNo} bind:value={data.footUlcerHistory} />

	<h4 class="mt-4 mb-2 text-sm font-semibold text-gray-700">Other Complications</h4>

	<RadioGroup
		label="Erectile Dysfunction"
		name="erectileDysfunction"
		options={[
			{ value: 'yes', label: 'Yes' },
			{ value: 'no', label: 'No' },
			{ value: 'notApplicable', label: 'Not applicable' }
		]}
		bind:value={data.erectileDysfunction}
	/>
</SectionCard>
