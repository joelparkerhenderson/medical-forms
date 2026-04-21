<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';

	const rec = assessment.data.recallScores;

	type ScoreKey = keyof typeof rec;

	const items: { key: ScoreKey; label: string }[] = [
		{ key: 'object1', label: 'Recall object 1' },
		{ key: 'object2', label: 'Recall object 2' },
		{ key: 'object3', label: 'Recall object 3' }
	];

	function setScore(key: ScoreKey, value: 0 | 1) {
		rec[key] = value;
	}
</script>

<SectionCard title="Recall" description="Ask the patient to recall the three objects named in the Registration step (3 points).">
	{#each items as item}
		<div class="mb-4 border-b border-gray-100 pb-3 last:border-0 last:pb-0">
			<p class="mb-2 text-sm font-medium text-gray-700">{item.label}</p>
			<div class="flex gap-3">
				<label
					class="flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-1.5 text-sm transition-colors
						{rec[item.key] === 1 ? 'border-primary bg-blue-50 font-medium' : 'border-gray-300 bg-white hover:bg-gray-50'}"
				>
					<input
						type="radio"
						name="rec-{item.key}"
						checked={rec[item.key] === 1}
						onchange={() => setScore(item.key, 1)}
						class="accent-primary"
					/>
					Correct (1)
				</label>
				<label
					class="flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-1.5 text-sm transition-colors
						{rec[item.key] === 0 ? 'border-primary bg-blue-50 font-medium' : 'border-gray-300 bg-white hover:bg-gray-50'}"
				>
					<input
						type="radio"
						name="rec-{item.key}"
						checked={rec[item.key] === 0}
						onchange={() => setScore(item.key, 0)}
						class="accent-primary"
					/>
					Incorrect (0)
				</label>
			</div>
		</div>
	{/each}
</SectionCard>
