<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const fh = assessment.data.familyHistory;
</script>

<SectionCard title="Family History" description="Family history of neurodevelopmental and mental health conditions">
	<RadioGroup
		label="Family history of autism spectrum disorder?"
		name="autismFamily"
		options={[
			{ value: 'yes', label: 'Yes' },
			{ value: 'no', label: 'No' }
		]}
		bind:value={fh.autismFamily}
		required
	/>

	{#if fh.autismFamily === 'yes'}
		<TextArea
			label="Details of autism in family"
			name="autismFamilyDetails"
			bind:value={fh.autismFamilyDetails}
			placeholder="Which family members? Age at diagnosis?"
		/>
	{/if}

	<RadioGroup
		label="Family history of ADHD?"
		name="adhdFamily"
		options={[
			{ value: 'yes', label: 'Yes' },
			{ value: 'no', label: 'No' }
		]}
		bind:value={fh.adhdFamily}
		required
	/>

	{#if fh.adhdFamily === 'yes'}
		<TextArea
			label="Details of ADHD in family"
			name="adhdFamilyDetails"
			bind:value={fh.adhdFamilyDetails}
			placeholder="Which family members? Age at diagnosis?"
		/>
	{/if}

	<RadioGroup
		label="Family history of learning disabilities?"
		name="learningDisabilities"
		options={[
			{ value: 'yes', label: 'Yes' },
			{ value: 'no', label: 'No' }
		]}
		bind:value={fh.learningDisabilities}
		required
	/>

	{#if fh.learningDisabilities === 'yes'}
		<TextArea
			label="Details of learning disabilities in family"
			name="learningDisabilitiesDetails"
			bind:value={fh.learningDisabilitiesDetails}
			placeholder="Which family members? What type of learning disability?"
		/>
	{/if}

	<RadioGroup
		label="Family history of mental health conditions?"
		name="mentalHealthFamily"
		options={[
			{ value: 'yes', label: 'Yes' },
			{ value: 'no', label: 'No' }
		]}
		bind:value={fh.mentalHealthFamily}
		required
	/>

	{#if fh.mentalHealthFamily === 'yes'}
		<TextArea
			label="Details of mental health conditions in family"
			name="mentalHealthFamilyDetails"
			bind:value={fh.mentalHealthFamilyDetails}
			placeholder="Which family members? What conditions (depression, anxiety, bipolar, etc.)?"
		/>
	{/if}
</SectionCard>
