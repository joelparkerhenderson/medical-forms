<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';

	const m = assessment.data.mentalStatusExam;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Mental Status Examination" description="Systematic assessment of mental state">
	<TextInput label="Appearance" name="appearance" bind:value={m.appearance} placeholder="e.g. well-groomed, dishevelled, unkempt" />

	<TextInput label="Behaviour" name="behaviour" bind:value={m.behaviour} placeholder="e.g. cooperative, agitated, guarded, withdrawn" />

	<TextInput label="Speech" name="speech" bind:value={m.speech} placeholder="e.g. normal rate/volume, pressured, slowed, mute" />

	<SelectInput
		label="Mood (patient-reported)"
		name="mood"
		options={[
			{ value: 'euthymic', label: 'Euthymic (normal)' },
			{ value: 'depressed', label: 'Depressed' },
			{ value: 'elevated', label: 'Elevated' },
			{ value: 'irritable', label: 'Irritable' },
			{ value: 'anxious', label: 'Anxious' },
			{ value: 'flat', label: 'Flat' }
		]}
		bind:value={m.mood}
	/>

	<SelectInput
		label="Affect (observed)"
		name="affect"
		options={[
			{ value: 'congruent', label: 'Congruent' },
			{ value: 'incongruent', label: 'Incongruent' },
			{ value: 'restricted', label: 'Restricted' },
			{ value: 'blunted', label: 'Blunted' },
			{ value: 'flat', label: 'Flat' },
			{ value: 'labile', label: 'Labile' }
		]}
		bind:value={m.affect}
	/>

	<SelectInput
		label="Thought Process"
		name="thoughtProcess"
		options={[
			{ value: 'linear', label: 'Linear and goal-directed' },
			{ value: 'circumstantial', label: 'Circumstantial' },
			{ value: 'tangential', label: 'Tangential' },
			{ value: 'loosening', label: 'Loosening of associations' },
			{ value: 'flight-of-ideas', label: 'Flight of ideas' },
			{ value: 'thought-blocking', label: 'Thought blocking' }
		]}
		bind:value={m.thoughtProcess}
	/>

	<TextArea label="Thought Content" name="thoughtContent" bind:value={m.thoughtContent} placeholder="e.g. delusions, obsessions, overvalued ideas, ruminations" />

	<RadioGroup label="Perceptual disturbances (hallucinations, illusions)?" name="perceptual" options={yesNo} bind:value={m.perceptualDisturbances} />
	{#if m.perceptualDisturbances === 'yes'}
		<TextArea label="Perceptual Disturbance Details" name="perceptualDetails" bind:value={m.perceptualDetails} placeholder="Type (auditory, visual, tactile), content, frequency" />
	{/if}

	<RadioGroup label="Is cognition intact?" name="cognition" options={yesNo} bind:value={m.cognitionIntact} />
	{#if m.cognitionIntact === 'no'}
		<TextArea label="Cognitive Impairment Details" name="cognitionDetails" bind:value={m.cognitionDetails} placeholder="Orientation, attention, memory, executive function" />
	{/if}

	<SelectInput
		label="Insight"
		name="insight"
		options={[
			{ value: 'full', label: 'Full insight' },
			{ value: 'partial', label: 'Partial insight' },
			{ value: 'none', label: 'No insight' }
		]}
		bind:value={m.insight}
	/>

	<SelectInput
		label="Judgement"
		name="judgement"
		options={[
			{ value: 'intact', label: 'Intact' },
			{ value: 'impaired', label: 'Impaired' },
			{ value: 'poor', label: 'Poor' }
		]}
		bind:value={m.judgement}
	/>
</SectionCard>
