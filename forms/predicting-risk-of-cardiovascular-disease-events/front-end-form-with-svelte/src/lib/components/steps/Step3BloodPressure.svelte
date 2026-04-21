<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';

	const bp = assessment.data.bloodPressure;
</script>

<SectionCard title="Blood Pressure" description="Blood pressure readings and antihypertensive treatment status">
	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<NumberInput label="Systolic BP" name="systolicBp" bind:value={bp.systolicBp} min={60} max={300} unit="mmHg" required />
		<NumberInput label="Diastolic BP" name="diastolicBp" bind:value={bp.diastolicBp} min={30} max={200} unit="mmHg" required />
	</div>

	<RadioGroup
		label="On antihypertensive medication?"
		name="onAntihypertensive"
		options={[
			{ value: 'yes', label: 'Yes' },
			{ value: 'no', label: 'No' }
		]}
		bind:value={bp.onAntihypertensive}
	/>

	{#if bp.onAntihypertensive === 'yes'}
		<NumberInput
			label="Number of BP medications"
			name="numberOfBpMedications"
			bind:value={bp.numberOfBpMedications}
			min={1}
			max={10}
		/>
	{/if}

	<RadioGroup
		label="Blood pressure at target?"
		name="bpAtTarget"
		options={[
			{ value: 'yes', label: 'Yes' },
			{ value: 'no', label: 'No' },
			{ value: 'unknown', label: 'Unknown' }
		]}
		bind:value={bp.bpAtTarget}
	/>
</SectionCard>
