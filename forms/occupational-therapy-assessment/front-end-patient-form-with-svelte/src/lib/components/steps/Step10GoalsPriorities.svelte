<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const g = assessment.data.goalsPriorities;
</script>

<SectionCard title="Goals & Priorities" description="Identify your goals and priorities for occupational therapy intervention">
	<TextArea
		label="Short-Term Goals"
		name="shortTermGoals"
		bind:value={g.shortTermGoals}
		placeholder="What would you like to achieve in the next 2-4 weeks? (e.g., Independent in dressing, Safe kitchen use)..."
		rows={3}
	/>

	<TextArea
		label="Long-Term Goals"
		name="longTermGoals"
		bind:value={g.longTermGoals}
		placeholder="What would you like to achieve in the next 3-6 months? (e.g., Return to work, Drive independently)..."
		rows={3}
	/>

	<TextArea
		label="Priority Areas"
		name="priorityAreas"
		bind:value={g.priorityAreas}
		placeholder="Which areas of daily life are most important for you to improve? (e.g., Self-care, Work, Leisure)..."
		rows={3}
	/>

	<TextArea
		label="Discharge Goals"
		name="dischargeGoals"
		bind:value={g.dischargeGoals}
		placeholder="What would successful completion of OT look like for you? (e.g., Independent in all ADLs, Return to full community participation)..."
		rows={3}
	/>
</SectionCard>
