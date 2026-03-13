<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const p = assessment.data.fmsPatterns.trunkStabilityPushUp;
	const ct = assessment.data.fmsPatterns.clearingTests;

	function setScore(s: 0 | 1 | 2 | 3) {
		p.score = s;
	}
</script>

<SectionCard title="Trunk Stability Push-Up" description="Assesses trunk stability in the sagittal plane while a symmetrical upper-extremity motion is performed.">
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
						name="trunkPushUpScore"
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

	<!-- Trunk Clearing Tests -->
	<div class="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
		<h3 class="mb-2 text-sm font-bold text-amber-800">Trunk Clearing Tests</h3>
		<p class="mb-3 text-xs text-amber-700">Spinal extension and flexion clearing tests. Positive if pain is produced during either movement.</p>
		<div class="space-y-2">
			<label class="flex items-center gap-2 text-sm font-medium text-gray-700">
				<input
					type="checkbox"
					bind:checked={ct.trunkExtensionClearingPain}
					class="accent-primary"
				/>
				Pain during trunk extension (press-up) clearing test
			</label>
			<label class="flex items-center gap-2 text-sm font-medium text-gray-700">
				<input
					type="checkbox"
					bind:checked={ct.trunkFlexionClearingPain}
					class="accent-primary"
				/>
				Pain during trunk flexion (posterior rocking) clearing test
			</label>
		</div>
	</div>

	<div class="mt-4">
		<TextArea
			label="Observations / Notes"
			name="trunkPushUpNotes"
			bind:value={p.asymmetryNotes}
			placeholder="Note any compensations, deviations, or relevant observations..."
		/>
	</div>
</SectionCard>
