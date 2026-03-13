<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const rb = assessment.data.repetitiveBehaviors;

	const frequencyOptions = [
		{ value: 'never', label: 'Never' },
		{ value: 'rarely', label: 'Rarely' },
		{ value: 'sometimes', label: 'Sometimes' },
		{ value: 'often', label: 'Often' },
		{ value: 'always', label: 'Always' }
	];
</script>

<SectionCard title="Repetitive Behaviors" description="Routines, interests, and repetitive patterns">
	<RadioGroup
		label="How strongly do you adhere to routines and rituals?"
		name="routineAdherence"
		options={frequencyOptions}
		bind:value={rb.routineAdherence}
		required
	/>

	<TextArea
		label="Describe any special or intense interests"
		name="specialInterests"
		bind:value={rb.specialInterests}
		placeholder="e.g., specific topics, collections, activities that are pursued with unusual intensity..."
	/>

	<RadioGroup
		label="Do you engage in repetitive movements (e.g., hand flapping, rocking, spinning)?"
		name="repetitiveMovements"
		options={[
			{ value: 'yes', label: 'Yes' },
			{ value: 'no', label: 'No' }
		]}
		bind:value={rb.repetitiveMovements}
		required
	/>

	{#if rb.repetitiveMovements === 'yes'}
		<TextArea
			label="Describe the repetitive movements"
			name="repetitiveMovementsDetails"
			bind:value={rb.repetitiveMovementsDetails}
			placeholder="Describe the types of repetitive movements and when they occur..."
		/>
	{/if}

	<RadioGroup
		label="How much do you resist changes to routine or environment?"
		name="resistanceToChange"
		options={frequencyOptions}
		bind:value={rb.resistanceToChange}
		required
	/>
</SectionCard>
