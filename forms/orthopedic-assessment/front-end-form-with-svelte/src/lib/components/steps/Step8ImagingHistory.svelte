<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const img = assessment.data.imagingHistory;

	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Imaging History" description="Previous imaging studies related to your orthopedic condition">
	<!-- X-Ray -->
	<div class="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
		<h3 class="mb-3 text-sm font-bold text-gray-700">X-Ray</h3>
		<RadioGroup
			label="Has an X-ray been performed?"
			name="xRayPerformed"
			options={yesNo}
			bind:value={img.xRay.performed}
		/>
		{#if img.xRay.performed === 'yes'}
			<TextInput label="Date" name="xRayDate" type="date" bind:value={img.xRay.date} />
			<TextArea
				label="Findings"
				name="xRayFindings"
				bind:value={img.xRay.findings}
				placeholder="Describe X-ray findings..."
			/>
		{/if}
	</div>

	<!-- MRI -->
	<div class="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
		<h3 class="mb-3 text-sm font-bold text-gray-700">MRI</h3>
		<RadioGroup
			label="Has an MRI been performed?"
			name="mriPerformed"
			options={yesNo}
			bind:value={img.mri.performed}
		/>
		{#if img.mri.performed === 'yes'}
			<TextInput label="Date" name="mriDate" type="date" bind:value={img.mri.date} />
			<TextArea
				label="Findings"
				name="mriFindings"
				bind:value={img.mri.findings}
				placeholder="Describe MRI findings..."
			/>
		{/if}
	</div>

	<!-- CT Scan -->
	<div class="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
		<h3 class="mb-3 text-sm font-bold text-gray-700">CT Scan</h3>
		<RadioGroup
			label="Has a CT scan been performed?"
			name="ctScanPerformed"
			options={yesNo}
			bind:value={img.ctScan.performed}
		/>
		{#if img.ctScan.performed === 'yes'}
			<TextInput label="Date" name="ctScanDate" type="date" bind:value={img.ctScan.date} />
			<TextArea
				label="Findings"
				name="ctScanFindings"
				bind:value={img.ctScan.findings}
				placeholder="Describe CT scan findings..."
			/>
		{/if}
	</div>

	<!-- Ultrasound -->
	<div class="rounded-lg border border-gray-200 bg-gray-50 p-4">
		<h3 class="mb-3 text-sm font-bold text-gray-700">Ultrasound</h3>
		<RadioGroup
			label="Has an ultrasound been performed?"
			name="ultrasoundPerformed"
			options={yesNo}
			bind:value={img.ultrasound.performed}
		/>
		{#if img.ultrasound.performed === 'yes'}
			<TextInput label="Date" name="ultrasoundDate" type="date" bind:value={img.ultrasound.date} />
			<TextArea
				label="Findings"
				name="ultrasoundFindings"
				bind:value={img.ultrasound.findings}
				placeholder="Describe ultrasound findings..."
			/>
		{/if}
	</div>
</SectionCard>
