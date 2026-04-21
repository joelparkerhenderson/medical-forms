<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';

	const d = assessment.data.daytimeDysfunction;

	const frequencyOptions = [
		{ value: 'not-during-past-month', label: 'Not during the past month' },
		{ value: 'less-than-once-week', label: 'Less than once a week' },
		{ value: 'once-or-twice-week', label: 'Once or twice a week' },
		{ value: 'three-or-more-week', label: 'Three or more times a week' }
	];

	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Daytime Dysfunction" description="How your sleep quality affects your daily life">
	<RadioGroup
		label="During the past month, how often have you had trouble staying awake while driving, eating, or engaging in social activity?"
		name="troubleStayingAwake"
		options={frequencyOptions}
		bind:value={d.troubleStayingAwake}
		required
	/>

	<RadioGroup
		label="During the past month, how much of a problem has it been for you to keep up enough enthusiasm to get things done?"
		name="enthusiasmProblem"
		options={frequencyOptions}
		bind:value={d.enthusiasmProblem}
		required
	/>

	<RadioGroup
		label="Have you experienced drowsiness while driving in the past month?"
		name="drivingDrowsiness"
		options={yesNo}
		bind:value={d.drivingDrowsiness}
		required
	/>
</SectionCard>
