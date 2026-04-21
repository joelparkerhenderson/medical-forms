<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const p = assessment.data.fmsPatterns.deepSquat;

	function setScore(s: 0 | 1 | 2 | 3) {
		p.score = s;
	}
</script>

<SectionCard title="Deep Squat" description="Assesses bilateral, symmetrical, functional mobility of the hips, knees, and ankles. Dowel held overhead assesses shoulder and thoracic spine mobility.">
	<fieldset class="mb-4">
		<legend class="mb-2 block text-sm font-medium text-gray-700">
			Score <span class="text-red-500">*</span>
		</legend>
		<div class="flex flex-wrap gap-3">
			{#each [
				{ value: 0, label: '0 - Pain during movement' },
				{ value: 1, label: '1 - Unable to perform pattern' },
				{ value: 2, label: '2 - Performs with compensation' },
				{ value: 3, label: '3 - Performs without compensation' }
			] as opt (opt.value)}
				<label
					class="flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2 transition-colors
						{p.score === opt.value ? 'border-primary bg-blue-50 font-medium' : 'border-gray-300 bg-white hover:bg-gray-50'}"
				>
					<input
						type="radio"
						name="deepSquatScore"
						value={opt.value}
						checked={p.score === opt.value}
						onchange={() => setScore(opt.value as 0 | 1 | 2 | 3)}
						class="text-primary accent-primary"
					/>
					{opt.label}
				</label>
			{/each}
		</div>
	</fieldset>

	<div class="mb-4">
		<label class="flex items-center gap-2 text-sm font-medium text-gray-700">
			<input
				type="checkbox"
				bind:checked={p.painDuringMovement}
				class="accent-primary"
			/>
			Pain reported during this movement
		</label>
	</div>

	<TextArea
		label="Observations / Notes"
		name="deepSquatNotes"
		bind:value={p.asymmetryNotes}
		placeholder="Note any compensations, deviations, or relevant observations..."
	/>
</SectionCard>
