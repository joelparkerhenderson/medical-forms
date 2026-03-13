<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';
	import { dmftScoreLabel, dmftScoreColor } from '$lib/engine/utils';

	const d = assessment.data.dmftAssessment;

	const dmftScore = $derived(
		(d.decayedTeeth ?? 0) + (d.missingTeeth ?? 0) + (d.filledTeeth ?? 0)
	);
</script>

<SectionCard title="DMFT Assessment" description="Decayed, Missing, and Filled Teeth index (maximum 32)">
	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-3">
		<NumberInput label="Decayed Teeth (D)" name="decayedTeeth" bind:value={d.decayedTeeth} min={0} max={32} />
		<NumberInput label="Missing Teeth (M)" name="missingTeeth" bind:value={d.missingTeeth} min={0} max={32} />
		<NumberInput label="Filled Teeth (F)" name="filledTeeth" bind:value={d.filledTeeth} min={0} max={32} />
	</div>

	<div class="mt-4 rounded-lg border p-4 {dmftScoreColor(dmftScore)}">
		<div class="text-center">
			<span class="text-2xl font-bold">DMFT Score: {dmftScore}</span>
			<span class="ml-2 text-lg">({dmftScoreLabel(dmftScore)})</span>
		</div>
		<div class="mt-2 text-center text-sm opacity-75">
			D = {d.decayedTeeth ?? 0} + M = {d.missingTeeth ?? 0} + F = {d.filledTeeth ?? 0}
		</div>
	</div>

	<TextArea
		label="Tooth chart notes"
		name="toothChartNotes"
		bind:value={d.toothChartNotes}
		placeholder="Note specific teeth affected using FDI notation (e.g. 16 MOD amalgam, 36 D caries)"
		rows={4}
	/>
</SectionCard>
