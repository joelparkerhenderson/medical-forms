<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const sc = assessment.data.socialCommunication;

	const frequencyOptions = [
		{ value: 'never', label: 'Never' },
		{ value: 'rarely', label: 'Rarely' },
		{ value: 'sometimes', label: 'Sometimes' },
		{ value: 'often', label: 'Often' },
		{ value: 'always', label: 'Always' }
	];
</script>

<SectionCard title="Social Communication" description="Social interaction and communication patterns">
	<RadioGroup
		label="How often do you maintain comfortable eye contact during conversation?"
		name="eyeContact"
		options={frequencyOptions}
		bind:value={sc.eyeContact}
		required
	/>

	<RadioGroup
		label="How often do you engage in social reciprocity (turn-taking in conversation, responding to others' emotions)?"
		name="socialReciprocity"
		options={frequencyOptions}
		bind:value={sc.socialReciprocity}
		required
	/>

	<RadioGroup
		label="How often do you find it easy to start and maintain conversations?"
		name="conversationSkills"
		options={frequencyOptions}
		bind:value={sc.conversationSkills}
		required
	/>

	<TextArea
		label="Describe your friendship patterns"
		name="friendshipPatterns"
		bind:value={sc.friendshipPatterns}
		placeholder="e.g., number of close friends, how friendships are maintained, difficulties in social relationships..."
	/>

	<TextArea
		label="Any additional social communication difficulties"
		name="socialDifficultiesDetails"
		bind:value={sc.socialDifficultiesDetails}
		placeholder="Describe any other social or communication challenges..."
	/>
</SectionCard>
