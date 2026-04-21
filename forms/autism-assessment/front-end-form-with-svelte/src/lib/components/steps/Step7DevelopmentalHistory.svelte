<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const dh = assessment.data.developmentalHistory;
</script>

<SectionCard title="Developmental History" description="Early developmental milestones and behaviors">
	<TextArea
		label="Language milestones"
		name="languageMilestones"
		bind:value={dh.languageMilestones}
		placeholder="e.g., age of first words, first sentences, any speech delays or regression..."
	/>

	<TextArea
		label="Motor milestones"
		name="motorMilestones"
		bind:value={dh.motorMilestones}
		placeholder="e.g., age of crawling, walking, fine motor skill development, coordination difficulties..."
	/>

	<TextArea
		label="Early social behavior"
		name="earlySocialBehavior"
		bind:value={dh.earlySocialBehavior}
		placeholder="e.g., joint attention, pointing, shared play, response to name, attachment patterns..."
	/>

	<TextArea
		label="Any developmental concerns noted by parents, teachers, or professionals"
		name="developmentalConcerns"
		bind:value={dh.developmentalConcerns}
		placeholder="Describe any concerns raised during childhood..."
	/>
</SectionCard>
