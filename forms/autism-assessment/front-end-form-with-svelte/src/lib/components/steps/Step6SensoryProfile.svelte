<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const sp = assessment.data.sensoryProfile;

	const sensoryOptions = [
		{ value: 'none', label: 'None' },
		{ value: 'mild', label: 'Mild' },
		{ value: 'moderate', label: 'Moderate' },
		{ value: 'severe', label: 'Severe' }
	];
</script>

<SectionCard title="Sensory Profile" description="Sensory sensitivities and seeking behaviors">
	<RadioGroup
		label="Visual sensitivity (e.g., bright lights, certain patterns, visual overload)"
		name="visualSensitivity"
		options={sensoryOptions}
		bind:value={sp.visualSensitivity}
		required
	/>

	<RadioGroup
		label="Auditory sensitivity (e.g., loud sounds, background noise, specific frequencies)"
		name="auditorySensitivity"
		options={sensoryOptions}
		bind:value={sp.auditorySensitivity}
		required
	/>

	<RadioGroup
		label="Tactile sensitivity (e.g., clothing textures, light touch, temperature)"
		name="tactileSensitivity"
		options={sensoryOptions}
		bind:value={sp.tactileSensitivity}
		required
	/>

	<RadioGroup
		label="Olfactory sensitivity (e.g., certain smells, perfumes, food odors)"
		name="olfactorySensitivity"
		options={sensoryOptions}
		bind:value={sp.olfactorySensitivity}
		required
	/>

	<RadioGroup
		label="Gustatory sensitivity (e.g., food textures, specific tastes, limited diet)"
		name="gustatorySensitivity"
		options={sensoryOptions}
		bind:value={sp.gustatorySensitivity}
		required
	/>

	<TextArea
		label="Sensory seeking behaviors"
		name="sensorySeekingBehaviors"
		bind:value={sp.sensorySeekingBehaviors}
		placeholder="Describe any sensory seeking behaviors (e.g., spinning, deep pressure, chewing objects)..."
	/>
</SectionCard>
