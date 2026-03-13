<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const c = assessment.data.carePreferences;

	const placeOptions = [
		{ value: 'home', label: 'Home' },
		{ value: 'hospital', label: 'Hospital' },
		{ value: 'hospice', label: 'Hospice' },
		{ value: 'care-home', label: 'Care Home' },
		{ value: 'no-preference', label: 'No Preference' }
	];
</script>

<SectionCard title="Care Preferences" description="Where and how you would like to be cared for">
	<RadioGroup
		label="Preferred place of care"
		name="preferredPlaceOfCare"
		options={placeOptions}
		bind:value={c.preferredPlaceOfCare}
		required
	/>

	<RadioGroup
		label="Preferred place of death"
		name="preferredPlaceOfDeath"
		options={placeOptions}
		bind:value={c.preferredPlaceOfDeath}
	/>

	<TextArea
		label="Personal comfort preferences"
		name="personalComfortPreferences"
		bind:value={c.personalComfortPreferences}
		placeholder="e.g. I like to have music playing, a particular blanket, scented candles..."
		rows={4}
	/>

	<TextArea
		label="Daily routine preferences"
		name="dailyRoutinePreferences"
		bind:value={c.dailyRoutinePreferences}
		placeholder="e.g. I like to wake early, have tea at certain times, watch particular TV programmes..."
		rows={4}
	/>

	<TextArea
		label="Dietary requirements and preferences"
		name="dietaryRequirements"
		bind:value={c.dietaryRequirements}
		placeholder="Any dietary requirements, favourite foods, or things you dislike..."
		rows={3}
	/>

	<TextArea
		label="Clothing preferences"
		name="clothingPreferences"
		bind:value={c.clothingPreferences}
		placeholder="What you prefer to wear, items that are important to you..."
		rows={3}
	/>

	<TextArea
		label="Hygiene and personal care preferences"
		name="hygienePreferences"
		bind:value={c.hygienePreferences}
		placeholder="e.g. Bath vs shower preference, products you use, hair care..."
		rows={3}
	/>

	<TextArea
		label="Environment preferences"
		name="environmentPreferences"
		bind:value={c.environmentPreferences}
		placeholder="e.g. Temperature, lighting, noise level, having a window open..."
		rows={3}
	/>
</SectionCard>
