<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';

	const att = assessment.data.attentionScores;

	type ScoreKey = keyof typeof att;

	const items: { key: ScoreKey; label: string }[] = [
		{ key: 'serial1', label: '100 - 7 = 93' },
		{ key: 'serial2', label: '93 - 7 = 86' },
		{ key: 'serial3', label: '86 - 7 = 79' },
		{ key: 'serial4', label: '79 - 7 = 72' },
		{ key: 'serial5', label: '72 - 7 = 65' }
	];

	function setScore(key: ScoreKey, value: 0 | 1) {
		att[key] = value;
	}
</script>

<SectionCard title="Attention & Calculation" description="Serial 7s: Ask the patient to subtract 7 from 100 repeatedly (5 points). Alternative: spell WORLD backwards.">
	{#each items as item}
		<div class="mb-4 border-b border-gray-100 pb-3 last:border-0 last:pb-0">
			<p class="mb-2 text-sm font-medium text-gray-700">{item.label}</p>
			<div class="flex gap-3">
				<label
					class="flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-1.5 text-sm transition-colors
						{att[item.key] === 1 ? 'border-primary bg-blue-50 font-medium' : 'border-gray-300 bg-white hover:bg-gray-50'}"
				>
					<input
						type="radio"
						name="att-{item.key}"
						checked={att[item.key] === 1}
						onchange={() => setScore(item.key, 1)}
						class="accent-primary"
					/>
					Correct (1)
				</label>
				<label
					class="flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-1.5 text-sm transition-colors
						{att[item.key] === 0 ? 'border-primary bg-blue-50 font-medium' : 'border-gray-300 bg-white hover:bg-gray-50'}"
				>
					<input
						type="radio"
						name="att-{item.key}"
						checked={att[item.key] === 0}
						onchange={() => setScore(item.key, 0)}
						class="accent-primary"
					/>
					Incorrect (0)
				</label>
			</div>
		</div>
	{/each}
</SectionCard>
