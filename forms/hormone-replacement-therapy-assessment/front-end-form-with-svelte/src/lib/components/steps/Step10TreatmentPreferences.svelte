<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const t = assessment.data.treatmentPreferences;
</script>

<SectionCard title="Treatment Preferences" description="Your preferences and goals for HRT treatment">
	<RadioGroup
		label="Do you have a preference for HRT route of administration?"
		name="routePreference"
		options={[
			{ value: 'oral', label: 'Oral (tablets)' },
			{ value: 'transdermal', label: 'Transdermal (patches/gel)' },
			{ value: 'vaginal', label: 'Vaginal (cream/pessary/ring)' }
		]}
		bind:value={t.routePreference}
	/>

	{#if t.routePreference}
		<TextArea
			label="Why do you prefer this route?"
			name="routePreferenceReason"
			bind:value={t.routePreferenceReason}
			placeholder="e.g., convenience, previous experience, advice from GP..."
		/>
	{/if}

	<TextArea
		label="Do you have any concerns about HRT?"
		name="concernsAboutHRT"
		bind:value={t.concernsAboutHRT}
		placeholder="e.g., cancer risk, weight gain, side effects, long-term use..."
	/>

	<TextArea
		label="Relevant lifestyle factors"
		name="lifestyleFactors"
		bind:value={t.lifestyleFactors}
		placeholder="e.g., exercise frequency, diet, stress levels, work demands..."
	/>

	<TextArea
		label="What are your main goals for treatment?"
		name="treatmentGoals"
		bind:value={t.treatmentGoals}
		placeholder="e.g., reduce hot flushes, improve sleep, protect bone health, improve quality of life..."
	/>
</SectionCard>
