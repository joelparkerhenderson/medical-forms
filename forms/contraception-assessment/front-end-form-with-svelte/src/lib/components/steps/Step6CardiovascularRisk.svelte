<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';

	const c = assessment.data.cardiovascularRisk;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Cardiovascular Risk" description="Factors affecting cardiovascular risk and contraceptive eligibility">
	<NumberInput
		label="BMI"
		name="bmi"
		bind:value={c.bmi}
		unit="kg/m2"
		min={10}
		max={80}
		step={0.1}
	/>

	<SelectInput
		label="Smoking status"
		name="smoking"
		options={[
			{ value: 'never', label: 'Never smoked' },
			{ value: 'former', label: 'Former smoker' },
			{ value: 'current-light', label: 'Current smoker (< 15 per day)' },
			{ value: 'current-heavy', label: 'Current smoker (>= 15 per day)' }
		]}
		bind:value={c.smoking}
	/>

	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<NumberInput
			label="Blood pressure (systolic)"
			name="bpSystolic"
			bind:value={c.bloodPressureSystolic}
			unit="mmHg"
			min={60}
			max={250}
		/>
		<NumberInput
			label="Blood pressure (diastolic)"
			name="bpDiastolic"
			bind:value={c.bloodPressureDiastolic}
			unit="mmHg"
			min={30}
			max={150}
		/>
	</div>

	<RadioGroup
		label="Family history of cardiovascular disease (before age 50)?"
		name="familyHistoryCVD"
		options={yesNo}
		bind:value={c.familyHistoryCVD}
	/>

	<RadioGroup
		label="Do you have lipid disorders (high cholesterol/triglycerides)?"
		name="lipidDisorders"
		options={yesNo}
		bind:value={c.lipidDisorders}
	/>
</SectionCard>
