<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import PclRating from '$lib/components/ui/PclRating.svelte';

	const e = assessment.data.clusterEArousalReactivity;
</script>

<SectionCard title="Alterations in Arousal & Reactivity (DSM-5 Cluster E)" description="In the past month, how much were you bothered by:">
	<PclRating label="15. Irritable behaviour, angry outbursts, or acting aggressively?" name="e15" bind:value={e.item15IrritableOrAggressive} />
	<PclRating label="16. Taking too many risks or doing things that could cause you harm?" name="e16" bind:value={e.item16RecklessOrSelfDestructive} />
	<PclRating label="17. Being 'super-alert' or watchful or on guard?" name="e17" bind:value={e.item17SuperAlertOrOnGuard} />
	<PclRating label="18. Feeling jumpy or easily startled?" name="e18" bind:value={e.item18JumpyOrEasilyStartled} />
	<PclRating label="19. Having difficulty concentrating?" name="e19" bind:value={e.item19DifficultyConcentrating} />
	<PclRating label="20. Trouble falling or staying asleep?" name="e20" bind:value={e.item20TroubleSleeping} />
</SectionCard>
