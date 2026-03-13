<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';

	const m = assessment.data.moodAffect;
</script>

<SectionCard title="Mood & Affect" description="How you have been feeling recently">
	<RadioGroup
		label="How would you rate your current mood?"
		name="currentMood"
		options={[
			{ value: 'very-low', label: 'Very Low' },
			{ value: 'low', label: 'Low' },
			{ value: 'neutral', label: 'Neutral' },
			{ value: 'good', label: 'Good' },
			{ value: 'very-good', label: 'Very Good' }
		]}
		bind:value={m.currentMood}
	/>

	<RadioGroup
		label="How has your sleep quality been?"
		name="sleepQuality"
		options={[
			{ value: 'very-poor', label: 'Very Poor' },
			{ value: 'poor', label: 'Poor' },
			{ value: 'fair', label: 'Fair' },
			{ value: 'good', label: 'Good' },
			{ value: 'very-good', label: 'Very Good' }
		]}
		bind:value={m.sleepQuality}
	/>

	<RadioGroup
		label="Have you experienced any changes in appetite?"
		name="appetiteChanges"
		options={[
			{ value: 'significant-decrease', label: 'Significant Decrease' },
			{ value: 'decrease', label: 'Decrease' },
			{ value: 'no-change', label: 'No Change' },
			{ value: 'increase', label: 'Increase' },
			{ value: 'significant-increase', label: 'Significant Increase' }
		]}
		bind:value={m.appetiteChanges}
	/>

	<RadioGroup
		label="How would you describe your energy level?"
		name="energyLevel"
		options={[
			{ value: 'very-low', label: 'Very Low' },
			{ value: 'low', label: 'Low' },
			{ value: 'moderate', label: 'Moderate' },
			{ value: 'high', label: 'High' },
			{ value: 'very-high', label: 'Very High' }
		]}
		bind:value={m.energyLevel}
	/>

	<RadioGroup
		label="How is your ability to concentrate?"
		name="concentration"
		options={[
			{ value: 'very-poor', label: 'Very Poor' },
			{ value: 'poor', label: 'Poor' },
			{ value: 'fair', label: 'Fair' },
			{ value: 'good', label: 'Good' },
			{ value: 'excellent', label: 'Excellent' }
		]}
		bind:value={m.concentration}
	/>
</SectionCard>
