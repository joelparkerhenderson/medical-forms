<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';

	const loc = assessment.data.levelOfConsciousness;
</script>

<SectionCard title="Level of Consciousness" description="NIHSS Items 1a, 1b, 1c">
	<RadioGroup
		label="1a. Level of Consciousness"
		name="loc"
		options={[
			{ value: '0', label: '0 - Alert; keenly responsive' },
			{ value: '1', label: '1 - Not alert; but arousable by minor stimulation' },
			{ value: '2', label: '2 - Not alert; requires repeated stimulation' },
			{ value: '3', label: '3 - Unresponsive or responds only with reflex' }
		]}
		bind:value={loc.loc as any}
		required
	/>

	<RadioGroup
		label="1b. LOC Questions (month, age)"
		name="locQuestions"
		options={[
			{ value: '0', label: '0 - Answers both correctly' },
			{ value: '1', label: '1 - Answers one correctly' },
			{ value: '2', label: '2 - Answers neither correctly' }
		]}
		bind:value={loc.locQuestions as any}
		required
	/>

	<RadioGroup
		label="1c. LOC Commands (open/close eyes, grip/release)"
		name="locCommands"
		options={[
			{ value: '0', label: '0 - Performs both tasks correctly' },
			{ value: '1', label: '1 - Performs one task correctly' },
			{ value: '2', label: '2 - Performs neither task correctly' }
		]}
		bind:value={loc.locCommands as any}
		required
	/>
</SectionCard>
