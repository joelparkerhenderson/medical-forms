<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';

	const c = assessment.data.communicationDifficulties;

	const difficultyOptions = [
		{ value: 'none', label: 'None' },
		{ value: 'slight', label: 'Slight' },
		{ value: 'moderate', label: 'Moderate' },
		{ value: 'severe', label: 'Severe' }
	];
</script>

<SectionCard title="Communication Difficulties" description="Rate your difficulty in the following listening situations">
	<RadioGroup
		label="Conversation in a quiet room (one-to-one)"
		name="quietConversation"
		options={difficultyOptions}
		bind:value={c.quietConversation}
	/>

	<RadioGroup
		label="Group conversation (3 or more people)"
		name="groupConversation"
		options={difficultyOptions}
		bind:value={c.groupConversation}
	/>

	<RadioGroup
		label="Telephone conversations"
		name="telephone"
		options={difficultyOptions}
		bind:value={c.telephone}
	/>

	<RadioGroup
		label="Listening to television or radio"
		name="television"
		options={difficultyOptions}
		bind:value={c.television}
	/>

	<RadioGroup
		label="Hearing in public places (shops, restaurants, etc.)"
		name="publicPlaces"
		options={difficultyOptions}
		bind:value={c.publicPlaces}
	/>

	<RadioGroup
		label="Hearing difficulty at work or during regular activities"
		name="workDifficulty"
		options={difficultyOptions}
		bind:value={c.workDifficulty}
	/>
</SectionCard>
