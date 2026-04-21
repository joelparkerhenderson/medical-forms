<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';

	const a = assessment.data.abdominalPainAssessment;
</script>

<SectionCard title="Abdominal Pain Assessment" description="Detailed characterisation of abdominal pain">
	<SelectInput
		label="Where is the pain located?"
		name="painLocation"
		options={[
			{ value: 'epigastric', label: 'Epigastric (upper centre)' },
			{ value: 'right-upper-quadrant', label: 'Right upper quadrant' },
			{ value: 'left-upper-quadrant', label: 'Left upper quadrant' },
			{ value: 'periumbilical', label: 'Periumbilical (around navel)' },
			{ value: 'right-lower-quadrant', label: 'Right lower quadrant' },
			{ value: 'left-lower-quadrant', label: 'Left lower quadrant' },
			{ value: 'suprapubic', label: 'Suprapubic (lower centre)' },
			{ value: 'diffuse', label: 'Diffuse (all over)' }
		]}
		bind:value={a.painLocation}
	/>

	<SelectInput
		label="What is the character of the pain?"
		name="painCharacter"
		options={[
			{ value: 'cramping', label: 'Cramping' },
			{ value: 'burning', label: 'Burning' },
			{ value: 'sharp', label: 'Sharp' },
			{ value: 'dull', label: 'Dull' },
			{ value: 'colicky', label: 'Colicky (comes in waves)' }
		]}
		bind:value={a.painCharacter}
	/>

	<TextInput label="Does the pain radiate anywhere?" name="painRadiation" bind:value={a.painRadiation} placeholder="e.g. to the back, shoulder" />

	<TextArea label="What makes the pain worse (aggravating factors)?" name="aggravating" bind:value={a.aggravatingFactors} placeholder="e.g. eating, lying down, certain foods" />

	<TextArea label="What makes the pain better (relieving factors)?" name="relieving" bind:value={a.relievingFactors} placeholder="e.g. antacids, fasting, certain positions" />

	<RadioGroup
		label="How often does the pain occur?"
		name="painFrequency"
		options={[
			{ value: 'constant', label: 'Constant' },
			{ value: 'intermittent', label: 'Intermittent' },
			{ value: 'episodic', label: 'Episodic' }
		]}
		bind:value={a.painFrequency}
	/>
</SectionCard>
