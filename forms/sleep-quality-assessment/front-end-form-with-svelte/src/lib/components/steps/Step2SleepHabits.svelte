<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';

	const h = assessment.data.sleepHabits;
</script>

<SectionCard title="Sleep Habits" description="Your typical sleep patterns over the past month">
	<TextInput
		label="What time do you usually go to bed?"
		name="usualBedtime"
		type="time"
		bind:value={h.usualBedtime}
		required
	/>

	<TextInput
		label="What time do you usually wake up?"
		name="usualWakeTime"
		type="time"
		bind:value={h.usualWakeTime}
		required
	/>

	<NumberInput
		label="How many minutes does it usually take you to fall asleep?"
		name="minutesToFallAsleep"
		bind:value={h.minutesToFallAsleep}
		unit="minutes"
		min={0}
		max={360}
		step={5}
		required
	/>

	<NumberInput
		label="How many hours of actual sleep do you get per night?"
		name="hoursOfSleep"
		bind:value={h.hoursOfSleep}
		unit="hours"
		min={0}
		max={24}
		step={0.5}
		required
	/>

	<SelectInput
		label="How would you rate your overall sleep environment?"
		name="sleepEnvironment"
		options={[
			{ value: 'excellent', label: 'Excellent - quiet, dark, comfortable' },
			{ value: 'good', label: 'Good - mostly comfortable' },
			{ value: 'fair', label: 'Fair - some issues with noise, light, or comfort' },
			{ value: 'poor', label: 'Poor - significant issues affecting sleep' }
		]}
		bind:value={h.sleepEnvironment}
		required
	/>
</SectionCard>
