<script lang="ts">
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import type { BloodPressure } from '$lib/engine/types.js';

	let { data = $bindable() }: { data: BloodPressure } = $props();

	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Blood Pressure">
	<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
		<TextInput
			label="Systolic Blood Pressure (mmHg)"
			id="systolicBp"
			type="number"
			bind:value={data.systolicBp}
			min={60}
			max={300}
			step={1}
		/>
		<TextInput
			label="Diastolic Blood Pressure (mmHg)"
			id="diastolicBp"
			type="number"
			bind:value={data.diastolicBp}
			min={30}
			max={200}
			step={1}
		/>
	</div>

	<RadioGroup label="On Antihypertensive Medication" name="onAntihypertensive" options={yesNo} bind:value={data.onAntihypertensive} />

	{#if data.onAntihypertensive === 'yes'}
		<TextInput
			label="Number of BP Medications"
			id="numberOfBpMedications"
			type="number"
			bind:value={data.numberOfBpMedications}
			min={1}
			max={10}
			step={1}
		/>
	{/if}

	<RadioGroup
		label="Blood Pressure at Target"
		name="bpAtTarget"
		options={yesNo}
		bind:value={data.bpAtTarget}
		hint="Target: <130/80 mmHg for most diabetes patients (ESC 2023)"
	/>

	<RadioGroup label="Home Blood Pressure Monitoring" name="homeBpMonitoring" options={yesNo} bind:value={data.homeBpMonitoring} />
</SectionCard>
