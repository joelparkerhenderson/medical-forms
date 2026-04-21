<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import PclRating from '$lib/components/ui/PclRating.svelte';

	const b = assessment.data.clusterBIntrusion;
</script>

<SectionCard title="Intrusion Symptoms (DSM-5 Cluster B)" description="In the past month, how much were you bothered by:">
	<PclRating label="1. Repeated, disturbing, and unwanted memories of the stressful experience?" name="b1" bind:value={b.item1RepeatedDisturbingMemories} />
	<PclRating label="2. Repeated, disturbing dreams of the stressful experience?" name="b2" bind:value={b.item2RepeatedDisturbingDreams} />
	<PclRating label="3. Suddenly feeling or acting as if the stressful experience were actually happening again (as if you were actually back there re-living it)?" name="b3" bind:value={b.item3FeelingReliving} />
	<PclRating label="4. Feeling very upset when something reminded you of the stressful experience?" name="b4" bind:value={b.item4FeelingUpsetByReminders} />
	<PclRating label="5. Having strong physical reactions when something reminded you of the stressful experience (for example heart pounding, trouble breathing, sweating)?" name="b5" bind:value={b.item5StrongPhysicalReactions} />
</SectionCard>
