<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';

	const m = assessment.data.sleepMedicationUse;

	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];

	const frequencyOptions = [
		{ value: 'not-during-past-month', label: 'Not during the past month' },
		{ value: 'less-than-once-week', label: 'Less than once a week' },
		{ value: 'once-or-twice-week', label: 'Once or twice a week' },
		{ value: 'three-or-more-week', label: 'Three or more times a week' }
	];
</script>

<SectionCard title="Sleep Medication Use" description="Medication used to help you sleep">
	<RadioGroup
		label="Do you currently use prescription sleep medications?"
		name="prescriptionSleepMeds"
		options={yesNo}
		bind:value={m.prescriptionSleepMeds}
		required
	/>

	<RadioGroup
		label="Do you currently use over-the-counter sleep aids (e.g., melatonin, antihistamines)?"
		name="otcSleepAids"
		options={yesNo}
		bind:value={m.otcSleepAids}
		required
	/>

	<RadioGroup
		label="During the past month, how often have you taken medicine to help you sleep (prescribed or over the counter)?"
		name="medicationFrequency"
		options={frequencyOptions}
		bind:value={m.frequency}
		required
	/>
</SectionCard>
