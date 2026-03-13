<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';

	const d = assessment.data.sleepDuration;
</script>

<SectionCard title="Sleep Duration" description="How much sleep you actually get">
	<NumberInput
		label="During the past month, how many hours of actual sleep did you get per night on average?"
		name="actualSleepHours"
		bind:value={d.actualSleepHours}
		unit="hours"
		min={0}
		max={24}
		step={0.5}
		required
	/>

	<RadioGroup
		label="Do you feel you get enough sleep?"
		name="feelEnoughSleep"
		options={[
			{ value: 'yes', label: 'Yes' },
			{ value: 'no', label: 'No' }
		]}
		bind:value={d.feelEnoughSleep}
		required
	/>
</SectionCard>
