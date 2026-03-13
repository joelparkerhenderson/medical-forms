<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';

	const lang = assessment.data.languageScores;

	type ScoreKey = keyof typeof lang;

	const items: { key: ScoreKey; label: string; instruction: string }[] = [
		{ key: 'naming1', label: 'Naming 1', instruction: 'Show a pencil. Ask: "What is this?"' },
		{ key: 'naming2', label: 'Naming 2', instruction: 'Show a watch. Ask: "What is this?"' }
	];

	function setScore(key: ScoreKey, value: 0 | 1) {
		lang[key] = value;
	}
</script>

<SectionCard title="Language" description="Naming tasks (2 points). Show objects and ask the patient to name them.">
	{#each items as item}
		<div class="mb-4 border-b border-gray-100 pb-3 last:border-0 last:pb-0">
			<p class="mb-1 text-sm font-medium text-gray-700">{item.label}</p>
			<p class="mb-2 text-xs text-gray-400">{item.instruction}</p>
			<div class="flex gap-3">
				<label
					class="flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-1.5 text-sm transition-colors
						{lang[item.key] === 1 ? 'border-primary bg-blue-50 font-medium' : 'border-gray-300 bg-white hover:bg-gray-50'}"
				>
					<input
						type="radio"
						name="lang-{item.key}"
						checked={lang[item.key] === 1}
						onchange={() => setScore(item.key, 1)}
						class="accent-primary"
					/>
					Correct (1)
				</label>
				<label
					class="flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-1.5 text-sm transition-colors
						{lang[item.key] === 0 ? 'border-primary bg-blue-50 font-medium' : 'border-gray-300 bg-white hover:bg-gray-50'}"
				>
					<input
						type="radio"
						name="lang-{item.key}"
						checked={lang[item.key] === 0}
						onchange={() => setScore(item.key, 0)}
						class="accent-primary"
					/>
					Incorrect (0)
				</label>
			</div>
		</div>
	{/each}
</SectionCard>
