<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';

	const reg = assessment.data.registrationScores;

	type ScoreKey = keyof typeof reg;

	const items: { key: ScoreKey; label: string; example: string }[] = [
		{ key: 'object1', label: 'Object 1', example: 'e.g., Apple' },
		{ key: 'object2', label: 'Object 2', example: 'e.g., Table' },
		{ key: 'object3', label: 'Object 3', example: 'e.g., Penny' }
	];

	function setScore(key: ScoreKey, value: 0 | 1) {
		reg[key] = value;
	}
</script>

<SectionCard title="Registration" description="Name three objects and ask the patient to repeat them (3 points). Record the number of trials needed to learn all three.">
	{#each items as item}
		<div class="mb-4 border-b border-gray-100 pb-3 last:border-0 last:pb-0">
			<p class="mb-1 text-sm font-medium text-gray-700">{item.label}</p>
			<p class="mb-2 text-xs text-gray-400">{item.example}</p>
			<div class="flex gap-3">
				<label
					class="flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-1.5 text-sm transition-colors
						{reg[item.key] === 1 ? 'border-primary bg-blue-50 font-medium' : 'border-gray-300 bg-white hover:bg-gray-50'}"
				>
					<input
						type="radio"
						name="reg-{item.key}"
						checked={reg[item.key] === 1}
						onchange={() => setScore(item.key, 1)}
						class="accent-primary"
					/>
					Correct (1)
				</label>
				<label
					class="flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-1.5 text-sm transition-colors
						{reg[item.key] === 0 ? 'border-primary bg-blue-50 font-medium' : 'border-gray-300 bg-white hover:bg-gray-50'}"
				>
					<input
						type="radio"
						name="reg-{item.key}"
						checked={reg[item.key] === 0}
						onchange={() => setScore(item.key, 0)}
						class="accent-primary"
					/>
					Incorrect (0)
				</label>
			</div>
		</div>
	{/each}
</SectionCard>
