<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';

	const v = assessment.data.vitalSigns;
</script>

<SectionCard title="Vital Signs" description="Current vital sign measurements">
	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<NumberInput
			label="Blood Pressure - Systolic"
			name="bpSystolic"
			bind:value={v.bloodPressureSystolic}
			min={60}
			max={250}
			unit="mmHg"
			required
		/>
		<NumberInput
			label="Blood Pressure - Diastolic"
			name="bpDiastolic"
			bind:value={v.bloodPressureDiastolic}
			min={30}
			max={150}
			unit="mmHg"
			required
		/>
	</div>

	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<NumberInput
			label="Weight"
			name="weight"
			bind:value={v.weight}
			min={30}
			max={300}
			step={0.1}
			unit="kg"
		/>
		<NumberInput
			label="Height"
			name="height"
			bind:value={v.height}
			min={100}
			max={250}
			step={0.1}
			unit="cm"
		/>
	</div>

	<NumberInput
		label="BMI"
		name="bmi"
		bind:value={v.bmi}
		min={10}
		max={80}
		step={0.1}
		unit="kg/m2"
	/>

	<NumberInput
		label="Fundal Height"
		name="fundalHeight"
		bind:value={v.fundalHeight}
		min={10}
		max={50}
		step={0.5}
		unit="cm"
	/>

	<NumberInput
		label="Fetal Heart Rate"
		name="fetalHeartRate"
		bind:value={v.fetalHeartRate}
		min={60}
		max={220}
		unit="bpm"
	/>
</SectionCard>
