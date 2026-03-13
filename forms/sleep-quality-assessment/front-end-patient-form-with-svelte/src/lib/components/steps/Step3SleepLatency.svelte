<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';

	const l = assessment.data.sleepLatency;

	const frequencyOptions = [
		{ value: 'not-during-past-month', label: 'Not during the past month' },
		{ value: 'less-than-once-week', label: 'Less than once a week' },
		{ value: 'once-or-twice-week', label: 'Once or twice a week' },
		{ value: 'three-or-more-week', label: 'Three or more times a week' }
	];
</script>

<SectionCard title="Sleep Latency" description="How easily you fall asleep and stay asleep">
	<RadioGroup
		label="During the past month, how often have you had trouble falling asleep within 30 minutes?"
		name="timeToFallAsleep"
		options={frequencyOptions}
		bind:value={l.timeToFallAsleep}
		required
	/>

	<RadioGroup
		label="During the past month, how often have you woken up in the middle of the night or early morning?"
		name="wakeUpDuringNight"
		options={frequencyOptions}
		bind:value={l.wakeUpDuringNight}
		required
	/>
</SectionCard>
