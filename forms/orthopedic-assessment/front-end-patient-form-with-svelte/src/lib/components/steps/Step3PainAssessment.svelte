<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';

	const p = assessment.data.painAssessment;

	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Pain Assessment" description="Rate your pain levels and describe the character of your pain">
	<NumberInput
		label="Current Pain Level"
		name="currentPainLevel"
		bind:value={p.currentPainLevel}
		min={0}
		max={10}
		unit="0-10"
		required
	/>

	<NumberInput
		label="Worst Pain (in the past week)"
		name="worstPain"
		bind:value={p.worstPain}
		min={0}
		max={10}
		unit="0-10"
		required
	/>

	<NumberInput
		label="Best Pain (in the past week)"
		name="bestPain"
		bind:value={p.bestPain}
		min={0}
		max={10}
		unit="0-10"
		required
	/>

	<SelectInput
		label="Pain Character"
		name="painCharacter"
		options={[
			{ value: 'sharp', label: 'Sharp' },
			{ value: 'dull', label: 'Dull' },
			{ value: 'aching', label: 'Aching' },
			{ value: 'burning', label: 'Burning' },
			{ value: 'throbbing', label: 'Throbbing' },
			{ value: 'stabbing', label: 'Stabbing' },
			{ value: 'radiating', label: 'Radiating' }
		]}
		bind:value={p.painCharacter}
		required
	/>

	<SelectInput
		label="Pain Frequency"
		name="painFrequency"
		options={[
			{ value: 'constant', label: 'Constant' },
			{ value: 'intermittent', label: 'Intermittent' },
			{ value: 'activity-related', label: 'Activity-related' },
			{ value: 'night-only', label: 'Night only' },
			{ value: 'morning-stiffness', label: 'Morning stiffness' }
		]}
		bind:value={p.painFrequency}
		required
	/>

	<RadioGroup
		label="Do you experience night pain?"
		name="nightPain"
		options={yesNo}
		bind:value={p.nightPain}
		required
	/>

	<RadioGroup
		label="Do you have pain with weight bearing?"
		name="painWithWeightBearing"
		options={yesNo}
		bind:value={p.painWithWeightBearing}
		required
	/>
</SectionCard>
