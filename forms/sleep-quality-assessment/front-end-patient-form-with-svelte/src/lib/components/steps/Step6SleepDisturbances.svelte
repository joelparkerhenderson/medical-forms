<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const s = assessment.data.sleepDisturbances;

	const frequencyOptions = [
		{ value: 'not-during-past-month', label: 'Not during the past month' },
		{ value: 'less-than-once-week', label: 'Less than once a week' },
		{ value: 'once-or-twice-week', label: 'Once or twice a week' },
		{ value: 'three-or-more-week', label: 'Three or more times a week' }
	];
</script>

<SectionCard title="Sleep Disturbances" description="Factors that have disrupted your sleep during the past month">
	<RadioGroup
		label="Wake up in the middle of the night or early morning"
		name="wakeUpMiddleNight"
		options={frequencyOptions}
		bind:value={s.wakeUpMiddleNight}
	/>

	<RadioGroup
		label="Have to get up to use the bathroom"
		name="bathroomTrips"
		options={frequencyOptions}
		bind:value={s.bathroomTrips}
	/>

	<RadioGroup
		label="Cannot breathe comfortably"
		name="breathingDifficulty"
		options={frequencyOptions}
		bind:value={s.breathingDifficulty}
	/>

	<RadioGroup
		label="Cough or snore loudly"
		name="coughingSnoring"
		options={frequencyOptions}
		bind:value={s.coughingSnoring}
	/>

	<RadioGroup
		label="Feel too hot"
		name="tooHot"
		options={frequencyOptions}
		bind:value={s.tooHot}
	/>

	<RadioGroup
		label="Feel too cold"
		name="tooCold"
		options={frequencyOptions}
		bind:value={s.tooCold}
	/>

	<RadioGroup
		label="Have bad dreams"
		name="badDreams"
		options={frequencyOptions}
		bind:value={s.badDreams}
	/>

	<RadioGroup
		label="Have pain"
		name="pain"
		options={frequencyOptions}
		bind:value={s.pain}
	/>

	<TextArea
		label="Any other disturbances not listed above?"
		name="otherDisturbances"
		bind:value={s.otherDisturbances}
		placeholder="Describe any other reasons that have disturbed your sleep..."
	/>
</SectionCard>
