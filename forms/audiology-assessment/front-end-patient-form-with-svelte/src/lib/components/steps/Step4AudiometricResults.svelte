<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';

	const a = assessment.data.audiometricResults;
</script>

<SectionCard title="Audiometric Results" description="Pure tone audiometry, speech audiometry, and conduction thresholds">
	<h3 class="mb-3 font-semibold text-gray-800">Pure Tone Averages (PTA)</h3>
	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<NumberInput label="PTA Right Ear" name="ptaRight" bind:value={a.pureToneAverageRight} unit="dB HL" min={0} max={120} />
		<NumberInput label="PTA Left Ear" name="ptaLeft" bind:value={a.pureToneAverageLeft} unit="dB HL" min={0} max={120} />
	</div>

	<h3 class="mb-3 mt-4 font-semibold text-gray-800">Air Conduction Thresholds</h3>
	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<TextInput label="Air Conduction Right (e.g., 250:20, 500:25, 1k:30, 2k:35, 4k:40, 8k:45)" name="airCondRight" bind:value={a.airConductionRight} placeholder="frequency:dB pairs" />
		<TextInput label="Air Conduction Left" name="airCondLeft" bind:value={a.airConductionLeft} placeholder="frequency:dB pairs" />
	</div>

	<h3 class="mb-3 mt-4 font-semibold text-gray-800">Bone Conduction Thresholds</h3>
	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<TextInput label="Bone Conduction Right" name="boneCondRight" bind:value={a.boneConductionRight} placeholder="frequency:dB pairs" />
		<TextInput label="Bone Conduction Left" name="boneCondLeft" bind:value={a.boneConductionLeft} placeholder="frequency:dB pairs" />
	</div>

	<h3 class="mb-3 mt-4 font-semibold text-gray-800">Air-Bone Gap</h3>
	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<NumberInput label="Air-Bone Gap Right" name="abgRight" bind:value={a.airBoneGapRight} unit="dB" min={0} max={80} />
		<NumberInput label="Air-Bone Gap Left" name="abgLeft" bind:value={a.airBoneGapLeft} unit="dB" min={0} max={80} />
	</div>

	<h3 class="mb-3 mt-4 font-semibold text-gray-800">Speech Audiometry</h3>
	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<NumberInput label="Speech Recognition Threshold Right" name="srtRight" bind:value={a.speechRecognitionThresholdRight} unit="dB HL" min={0} max={120} />
		<NumberInput label="Speech Recognition Threshold Left" name="srtLeft" bind:value={a.speechRecognitionThresholdLeft} unit="dB HL" min={0} max={120} />
	</div>
	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<NumberInput label="Word Recognition Score Right" name="wrsRight" bind:value={a.wordRecognitionScoreRight} unit="%" min={0} max={100} />
		<NumberInput label="Word Recognition Score Left" name="wrsLeft" bind:value={a.wordRecognitionScoreLeft} unit="%" min={0} max={100} />
	</div>

	<SelectInput
		label="Type of Hearing Loss"
		name="hearingLossType"
		options={[
			{ value: 'conductive', label: 'Conductive' },
			{ value: 'sensorineural', label: 'Sensorineural' },
			{ value: 'mixed', label: 'Mixed' }
		]}
		bind:value={a.hearingLossType}
	/>
</SectionCard>
