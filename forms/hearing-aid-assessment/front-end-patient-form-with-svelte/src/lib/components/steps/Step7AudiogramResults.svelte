<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';

	const a = assessment.data.audiogramResults;
</script>

<SectionCard title="Audiogram Results" description="Enter audiometric test results">
	<h3 class="mb-2 text-sm font-semibold text-gray-700">Pure Tone Average (PTA)</h3>
	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<NumberInput
			label="Left ear PTA"
			name="leftPTA"
			bind:value={a.leftPTA}
			unit="dB HL"
			min={-10}
			max={120}
			step={1}
		/>
		<NumberInput
			label="Right ear PTA"
			name="rightPTA"
			bind:value={a.rightPTA}
			unit="dB HL"
			min={-10}
			max={120}
			step={1}
		/>
	</div>

	<h3 class="mb-2 mt-4 text-sm font-semibold text-gray-700">Speech Reception Threshold (SRT)</h3>
	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<NumberInput
			label="Left ear SRT"
			name="leftSRT"
			bind:value={a.leftSRT}
			unit="dB HL"
			min={-10}
			max={120}
			step={1}
		/>
		<NumberInput
			label="Right ear SRT"
			name="rightSRT"
			bind:value={a.rightSRT}
			unit="dB HL"
			min={-10}
			max={120}
			step={1}
		/>
	</div>

	<h3 class="mb-2 mt-4 text-sm font-semibold text-gray-700">Word Recognition Score</h3>
	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<NumberInput
			label="Left ear word recognition"
			name="leftWordRecognition"
			bind:value={a.leftWordRecognition}
			unit="%"
			min={0}
			max={100}
			step={1}
		/>
		<NumberInput
			label="Right ear word recognition"
			name="rightWordRecognition"
			bind:value={a.rightWordRecognition}
			unit="%"
			min={0}
			max={100}
			step={1}
		/>
	</div>

	<SelectInput
		label="Type of hearing loss"
		name="hearingLossType"
		options={[
			{ value: 'sensorineural', label: 'Sensorineural' },
			{ value: 'conductive', label: 'Conductive' },
			{ value: 'mixed', label: 'Mixed' },
			{ value: 'unknown', label: 'Unknown / Not yet determined' }
		]}
		bind:value={a.hearingLossType}
		required
	/>
</SectionCard>
