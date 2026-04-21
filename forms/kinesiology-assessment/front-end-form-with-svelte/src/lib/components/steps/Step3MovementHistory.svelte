<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';

	const m = assessment.data.movementHistory;
</script>

<SectionCard title="Movement History" description="Previous injuries, activity level, and current pain status">
	<TextArea
		label="Injury History"
		name="injuryHistory"
		bind:value={m.injuryHistory}
		placeholder="Describe any previous musculoskeletal injuries, surgeries, or chronic conditions..."
	/>

	<RadioGroup
		label="Current Activity Level"
		name="activityLevel"
		options={[
			{ value: 'sedentary', label: 'Sedentary' },
			{ value: 'light', label: 'Light' },
			{ value: 'moderate', label: 'Moderate' },
			{ value: 'vigorous', label: 'Vigorous' },
			{ value: 'elite', label: 'Elite' }
		]}
		bind:value={m.activityLevel}
		required
	/>

	<TextArea
		label="Sport/Exercise Participation"
		name="sportParticipation"
		bind:value={m.sportParticipation}
		placeholder="Describe current sport/exercise participation, frequency, and duration..."
	/>

	<RadioGroup
		label="Current Pain Level"
		name="currentPain"
		options={[
			{ value: 'none', label: 'None' },
			{ value: 'mild', label: 'Mild' },
			{ value: 'moderate', label: 'Moderate' },
			{ value: 'severe', label: 'Severe' }
		]}
		bind:value={m.currentPain}
		required
	/>

	<TextArea
		label="Pain Details"
		name="currentPainDetails"
		bind:value={m.currentPainDetails}
		placeholder="If pain is present, describe location, nature, and aggravating/easing factors..."
	/>

	<TextArea
		label="Previous Treatments"
		name="previousTreatments"
		bind:value={m.previousTreatments}
		placeholder="List any previous physiotherapy, chiropractic, or other treatments..."
	/>
</SectionCard>
