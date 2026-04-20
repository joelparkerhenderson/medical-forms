<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import PclRating from '$lib/components/ui/PclRating.svelte';

	const c = assessment.data.clusterCAvoidance;
</script>

<SectionCard title="Avoidance Symptoms (DSM-5 Cluster C)" description="In the past month, how much were you bothered by:">
	<PclRating label="6. Avoiding memories, thoughts, or feelings related to the stressful experience?" name="c6" bind:value={c.item6AvoidingMemoriesThoughtsFeelings} />
	<PclRating label="7. Avoiding external reminders of the stressful experience (for example people, places, conversations, activities, objects, or situations)?" name="c7" bind:value={c.item7AvoidingExternalReminders} />
</SectionCard>
