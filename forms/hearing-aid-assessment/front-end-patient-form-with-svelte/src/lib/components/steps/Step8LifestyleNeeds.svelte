<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';

	const l = assessment.data.lifestyleNeeds;
</script>

<SectionCard title="Lifestyle & Needs" description="Help us understand your daily life and hearing needs">
	<TextArea
		label="Describe your social activity level"
		name="socialActivity"
		bind:value={l.socialActivity}
		placeholder="e.g., very active social life, regular church attendance, frequent dining out..."
	/>

	<TextArea
		label="Occupation or daily activity requirements"
		name="occupationRequirements"
		bind:value={l.occupationRequirements}
		placeholder="e.g., retired, office environment, meetings, phone calls..."
	/>

	<TextArea
		label="Hobbies and leisure activities"
		name="hobbies"
		bind:value={l.hobbies}
		placeholder="e.g., music, theatre, sports, gardening..."
	/>

	<RadioGroup
		label="How comfortable are you with technology?"
		name="technologyComfort"
		options={[
			{ value: 'very-comfortable', label: 'Very comfortable' },
			{ value: 'comfortable', label: 'Comfortable' },
			{ value: 'somewhat-comfortable', label: 'Somewhat comfortable' },
			{ value: 'uncomfortable', label: 'Uncomfortable' }
		]}
		bind:value={l.technologyComfort}
	/>

	<RadioGroup
		label="Manual dexterity (ability to handle small objects)"
		name="dexterity"
		options={[
			{ value: 'good', label: 'Good' },
			{ value: 'fair', label: 'Fair' },
			{ value: 'poor', label: 'Poor' }
		]}
		bind:value={l.dexterity}
	/>

	<RadioGroup
		label="Vision status"
		name="visionStatus"
		options={[
			{ value: 'good', label: 'Good' },
			{ value: 'fair', label: 'Fair' },
			{ value: 'poor', label: 'Poor' }
		]}
		bind:value={l.visionStatus}
	/>
</SectionCard>
