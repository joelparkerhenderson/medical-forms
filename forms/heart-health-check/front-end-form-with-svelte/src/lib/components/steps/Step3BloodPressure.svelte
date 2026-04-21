<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';

	const d = assessment.data.bloodPressure;
</script>

<SectionCard title="Blood Pressure" description="Blood pressure readings and treatment status">
	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<NumberInput label="Systolic BP" name="systolicBP" bind:value={d.systolicBP} min={70} max={250} unit="mmHg" required />
		<NumberInput label="Diastolic BP" name="diastolicBP" bind:value={d.diastolicBP} min={40} max={150} unit="mmHg" />
	</div>
	<NumberInput label="Systolic BP Standard Deviation" name="systolicBPSD" bind:value={d.systolicBPSD} min={0} max={50} step={0.1} unit="mmHg" />
	<RadioGroup
		label="On blood pressure treatment?"
		name="onBPTreatment"
		bind:value={d.onBPTreatment}
		options={[
			{ value: 'yes', label: 'Yes' },
			{ value: 'no', label: 'No' }
		]}
	/>
	{#if d.onBPTreatment === 'yes'}
		<NumberInput label="Number of BP Medications" name="numberOfBPMedications" bind:value={d.numberOfBPMedications} min={1} max={10} />
	{/if}
</SectionCard>
