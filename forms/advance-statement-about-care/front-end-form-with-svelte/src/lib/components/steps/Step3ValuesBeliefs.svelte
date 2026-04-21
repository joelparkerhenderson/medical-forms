<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const v = assessment.data.valuesBeliefs;
</script>

<SectionCard title="Values & Beliefs" description="Share what matters most to you - your beliefs, values and what gives your life meaning">
	<TextArea
		label="Religious beliefs"
		name="religiousBeliefs"
		bind:value={v.religiousBeliefs}
		placeholder="Describe any religious beliefs that are important to you and may affect your care..."
		rows={3}
	/>

	<TextArea
		label="Spiritual beliefs"
		name="spiritualBeliefs"
		bind:value={v.spiritualBeliefs}
		placeholder="Describe any spiritual beliefs or practices important to you..."
		rows={3}
	/>

	<TextArea
		label="Cultural values"
		name="culturalValues"
		bind:value={v.culturalValues}
		placeholder="Describe any cultural values or practices that are important to you..."
		rows={3}
	/>

	<TextArea
		label="Quality of life priorities"
		name="qualityOfLifePriorities"
		bind:value={v.qualityOfLifePriorities}
		placeholder="What does quality of life mean to you? What would make life no longer worth living?"
		rows={4}
	/>

	<TextArea
		label="What makes life meaningful to you?"
		name="whatMakesLifeMeaningful"
		bind:value={v.whatMakesLifeMeaningful}
		placeholder="e.g. Family, hobbies, music, nature, social connections..."
		rows={4}
	/>

	<TextArea
		label="Important traditions or rituals"
		name="importantTraditions"
		bind:value={v.importantTraditions}
		placeholder="Any traditions, celebrations, or rituals that are important to maintain..."
		rows={3}
	/>

	<TextArea
		label="Views on dying and death"
		name="viewsOnDying"
		bind:value={v.viewsOnDying}
		placeholder="How you feel about dying and what you would wish for at end of life..."
		rows={4}
	/>
</SectionCard>
