<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';

	const s = assessment.data.symptomFrequency;
</script>

<SectionCard title="Symptom Frequency" description="Asthma Control Test (ACT) questions - think about the past 4 weeks">
	<RadioGroup
		label="How much of the time did your asthma keep you from getting as much done at work, school, or at home?"
		name="activityLimitation"
		options={[
			{ value: 'not-at-all', label: 'Not at all' },
			{ value: 'a-little', label: 'A little of the time' },
			{ value: 'somewhat', label: 'Some of the time' },
			{ value: 'a-lot', label: 'Most of the time' },
			{ value: 'extremely', label: 'All of the time' }
		]}
		bind:value={s.activityLimitation}
	/>

	<RadioGroup
		label="How often have you had shortness of breath?"
		name="daytimeSymptoms"
		options={[
			{ value: 'not-at-all', label: 'Not at all' },
			{ value: 'once-or-twice', label: 'Once or twice a week' },
			{ value: 'three-to-six', label: '3 to 6 times a week' },
			{ value: 'once-a-day', label: 'Once a day' },
			{ value: 'more-than-once-a-day', label: 'More than once a day' }
		]}
		bind:value={s.daytimeSymptoms}
	/>

	<RadioGroup
		label="How often did your asthma symptoms wake you up at night or earlier than usual in the morning?"
		name="nighttimeAwakening"
		options={[
			{ value: 'not-at-all', label: 'Not at all' },
			{ value: 'once-or-twice', label: 'Once or twice' },
			{ value: 'once-a-week', label: 'Once a week' },
			{ value: 'two-to-three-nights', label: '2 to 3 nights a week' },
			{ value: 'four-or-more-nights', label: '4 or more nights a week' }
		]}
		bind:value={s.nighttimeAwakening}
	/>

	<RadioGroup
		label="How often have you used your rescue inhaler or nebuliser medication?"
		name="rescueInhalerUse"
		options={[
			{ value: 'not-at-all', label: 'Not at all' },
			{ value: 'once-or-twice', label: 'Once a week or less' },
			{ value: 'three-to-six', label: '2 or 3 times a week' },
			{ value: 'once-a-day', label: '1 or 2 times a day' },
			{ value: 'two-or-more-times-a-day', label: '3 or more times a day' }
		]}
		bind:value={s.rescueInhalerUse}
	/>

	<RadioGroup
		label="How would you rate your asthma control during the past 4 weeks?"
		name="selfRatedControl"
		options={[
			{ value: 'completely-controlled', label: 'Completely controlled' },
			{ value: 'well-controlled', label: 'Well controlled' },
			{ value: 'somewhat-controlled', label: 'Somewhat controlled' },
			{ value: 'poorly-controlled', label: 'Poorly controlled' },
			{ value: 'not-controlled-at-all', label: 'Not controlled at all' }
		]}
		bind:value={s.selfRatedControl}
	/>
</SectionCard>
