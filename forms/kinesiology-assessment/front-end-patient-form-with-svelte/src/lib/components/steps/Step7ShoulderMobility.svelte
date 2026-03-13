<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const p = assessment.data.fmsPatterns.shoulderMobility;
	const ct = assessment.data.fmsPatterns.clearingTests;

	const scoreOptions = [
		{ value: 0, label: '0 - Pain' },
		{ value: 1, label: '1 - Unable' },
		{ value: 2, label: '2 - With compensation' },
		{ value: 3, label: '3 - Without compensation' }
	];

	function setLeft(s: 0 | 1 | 2 | 3) { p.leftScore = s; }
	function setRight(s: 0 | 1 | 2 | 3) { p.rightScore = s; }
</script>

<SectionCard title="Shoulder Mobility" description="Assesses bilateral shoulder range of motion, combining internal rotation with adduction and external rotation with abduction.">
	<div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
		<fieldset>
			<legend class="mb-2 block text-sm font-medium text-gray-700">Left Side Score</legend>
			<div class="flex flex-col gap-2">
				{#each scoreOptions as opt (opt.value)}
					<label
						class="flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2 transition-colors
							{p.leftScore === opt.value ? 'border-primary bg-blue-50 font-medium' : 'border-gray-300 bg-white hover:bg-gray-50'}"
					>
						<input
							type="radio"
							name="shoulderMobilityLeft"
							value={opt.value}
							checked={p.leftScore === opt.value}
							onchange={() => setLeft(opt.value as 0 | 1 | 2 | 3)}
							class="text-primary accent-primary"
						/>
						{opt.label}
					</label>
				{/each}
			</div>
		</fieldset>

		<fieldset>
			<legend class="mb-2 block text-sm font-medium text-gray-700">Right Side Score</legend>
			<div class="flex flex-col gap-2">
				{#each scoreOptions as opt (opt.value)}
					<label
						class="flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2 transition-colors
							{p.rightScore === opt.value ? 'border-primary bg-blue-50 font-medium' : 'border-gray-300 bg-white hover:bg-gray-50'}"
					>
						<input
							type="radio"
							name="shoulderMobilityRight"
							value={opt.value}
							checked={p.rightScore === opt.value}
							onchange={() => setRight(opt.value as 0 | 1 | 2 | 3)}
							class="text-primary accent-primary"
						/>
						{opt.label}
					</label>
				{/each}
			</div>
		</fieldset>
	</div>

	<div class="mt-4 mb-4">
		<label class="flex items-center gap-2 text-sm font-medium text-gray-700">
			<input
				type="checkbox"
				bind:checked={p.painDuringMovement}
				class="accent-primary"
			/>
			Pain reported during this movement
		</label>
	</div>

	<!-- Shoulder Clearing Test -->
	<div class="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
		<h3 class="mb-2 text-sm font-bold text-amber-800">Shoulder Clearing Test</h3>
		<p class="mb-3 text-xs text-amber-700">Place hand on opposite shoulder and attempt to point elbow upward. Positive if pain is produced.</p>
		<label class="flex items-center gap-2 text-sm font-medium text-gray-700">
			<input
				type="checkbox"
				bind:checked={ct.shoulderClearingPain}
				class="accent-primary"
			/>
			Pain produced during shoulder clearing test
		</label>
	</div>

	<div class="mt-4">
		<TextArea
			label="Asymmetry Notes / Observations"
			name="shoulderMobilityNotes"
			bind:value={p.asymmetryNotes}
			placeholder="Note any left-right differences, compensations, or relevant observations..."
		/>
	</div>
</SectionCard>
