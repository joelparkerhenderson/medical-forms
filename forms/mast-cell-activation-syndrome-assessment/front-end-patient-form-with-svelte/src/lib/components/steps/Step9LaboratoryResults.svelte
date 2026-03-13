<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';

	const l = assessment.data.laboratoryResults;
</script>

<SectionCard title="Laboratory Results" description="Enter any available laboratory test results (leave blank if not tested)">
	<NumberInput
		label="Serum Tryptase"
		name="serumTryptase"
		bind:value={l.serumTryptase}
		unit="ng/mL"
		min={0}
		max={200}
		step={0.1}
	/>
	<p class="mb-4 -mt-2 text-xs text-gray-400">Normal range: &lt; 11.4 ng/mL. Elevated levels may indicate mast cell activation.</p>

	<NumberInput
		label="Plasma Histamine"
		name="histamine"
		bind:value={l.histamine}
		unit="ng/mL"
		min={0}
		max={50}
		step={0.01}
	/>
	<p class="mb-4 -mt-2 text-xs text-gray-400">Normal range: &lt; 1.0 ng/mL. Elevated during or shortly after mast cell episodes.</p>

	<NumberInput
		label="Prostaglandin D2"
		name="prostaglandinD2"
		bind:value={l.prostaglandinD2}
		unit="ng/mL"
		min={0}
		max={50}
		step={0.01}
	/>
	<p class="mb-4 -mt-2 text-xs text-gray-400">Normal range: &lt; 0.3 ng/mL. A key mediator released by mast cells.</p>

	<NumberInput
		label="Chromogranin A"
		name="chromograninA"
		bind:value={l.chromograninA}
		unit="ng/mL"
		min={0}
		max={500}
		step={0.1}
	/>
	<p class="-mt-2 text-xs text-gray-400">Can be elevated in mast cell disorders. Interpret with caution (affected by PPIs).</p>
</SectionCard>
