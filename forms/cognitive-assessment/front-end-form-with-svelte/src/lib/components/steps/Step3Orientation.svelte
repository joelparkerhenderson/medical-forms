<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';

	const o = assessment.data.orientationScores;

	type ScoreKey = keyof typeof o;

	const timeItems: { key: ScoreKey; label: string }[] = [
		{ key: 'year', label: 'What year is it?' },
		{ key: 'season', label: 'What season is it?' },
		{ key: 'date', label: 'What is the date today?' },
		{ key: 'day', label: 'What day of the week is it?' },
		{ key: 'month', label: 'What month is it?' }
	];

	const placeItems: { key: ScoreKey; label: string }[] = [
		{ key: 'country', label: 'What country are we in?' },
		{ key: 'county', label: 'What county/region are we in?' },
		{ key: 'town', label: 'What town/city are we in?' },
		{ key: 'hospital', label: 'What building are we in?' },
		{ key: 'floor', label: 'What floor are we on?' }
	];

	function setScore(key: ScoreKey, value: 0 | 1) {
		o[key] = value;
	}
</script>

<SectionCard title="Orientation" description="Orientation to time and place (10 points total)">
	<h3 class="mb-3 text-sm font-semibold text-gray-700">Orientation to Time (5 points)</h3>
	{#each timeItems as item}
		<div class="mb-4 border-b border-gray-100 pb-3 last:border-0 last:pb-0">
			<p class="mb-2 text-sm font-medium text-gray-700">{item.label}</p>
			<div class="flex gap-3">
				<label
					class="flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-1.5 text-sm transition-colors
						{o[item.key] === 1 ? 'border-primary bg-blue-50 font-medium' : 'border-gray-300 bg-white hover:bg-gray-50'}"
				>
					<input
						type="radio"
						name="orient-{item.key}"
						checked={o[item.key] === 1}
						onchange={() => setScore(item.key, 1)}
						class="accent-primary"
					/>
					Correct (1)
				</label>
				<label
					class="flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-1.5 text-sm transition-colors
						{o[item.key] === 0 ? 'border-primary bg-blue-50 font-medium' : 'border-gray-300 bg-white hover:bg-gray-50'}"
				>
					<input
						type="radio"
						name="orient-{item.key}"
						checked={o[item.key] === 0}
						onchange={() => setScore(item.key, 0)}
						class="accent-primary"
					/>
					Incorrect (0)
				</label>
			</div>
		</div>
	{/each}

	<h3 class="mb-3 mt-6 text-sm font-semibold text-gray-700">Orientation to Place (5 points)</h3>
	{#each placeItems as item}
		<div class="mb-4 border-b border-gray-100 pb-3 last:border-0 last:pb-0">
			<p class="mb-2 text-sm font-medium text-gray-700">{item.label}</p>
			<div class="flex gap-3">
				<label
					class="flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-1.5 text-sm transition-colors
						{o[item.key] === 1 ? 'border-primary bg-blue-50 font-medium' : 'border-gray-300 bg-white hover:bg-gray-50'}"
				>
					<input
						type="radio"
						name="orient-{item.key}"
						checked={o[item.key] === 1}
						onchange={() => setScore(item.key, 1)}
						class="accent-primary"
					/>
					Correct (1)
				</label>
				<label
					class="flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-1.5 text-sm transition-colors
						{o[item.key] === 0 ? 'border-primary bg-blue-50 font-medium' : 'border-gray-300 bg-white hover:bg-gray-50'}"
				>
					<input
						type="radio"
						name="orient-{item.key}"
						checked={o[item.key] === 0}
						onchange={() => setScore(item.key, 0)}
						class="accent-primary"
					/>
					Incorrect (0)
				</label>
			</div>
		</div>
	{/each}
</SectionCard>
