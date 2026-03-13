<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';

	const m = assessment.data.manualHandling;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Manual Handling" description="Lifting, carrying, pushing and pulling tasks">
	<SelectInput
		label="How often do you lift objects?"
		name="liftFreq"
		options={[
			{ value: 'none', label: 'None' },
			{ value: 'occasional', label: 'Occasional (a few times per shift)' },
			{ value: 'frequent', label: 'Frequent (regularly throughout shift)' },
			{ value: 'constant', label: 'Constant (most of the shift)' }
		]}
		bind:value={m.liftingFrequency}
	/>

	<NumberInput label="Typical load weight" name="loadWeight" bind:value={m.loadWeightKg} min={0} max={200} unit="kg" />

	<NumberInput label="Typical carry distance" name="carryDist" bind:value={m.carryDistanceMetres} min={0} max={500} unit="metres" />

	<SelectInput
		label="Push/pull forces required"
		name="pushPull"
		options={[
			{ value: 'none', label: 'None' },
			{ value: 'light', label: 'Light' },
			{ value: 'moderate', label: 'Moderate' },
			{ value: 'heavy', label: 'Heavy' }
		]}
		bind:value={m.pushPullForces}
	/>

	<RadioGroup label="Is team lifting available when needed?" name="teamLift" options={yesNo} bind:value={m.teamLifting} />

	<RadioGroup label="Are mechanical aids available (trolleys, hoists, etc.)?" name="mechAids" options={yesNo} bind:value={m.mechanicalAidsAvailable} />
</SectionCard>
