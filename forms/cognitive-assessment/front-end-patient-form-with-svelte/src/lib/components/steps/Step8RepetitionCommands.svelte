<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';

	const lang = assessment.data.repetitionCommands;

	type ScoreKey = keyof typeof lang;

	const repetitionItems: { key: ScoreKey; label: string; instruction: string }[] = [
		{ key: 'repetition', label: 'Repetition', instruction: 'Ask patient to repeat: "No ifs, ands, or buts"' }
	];

	const commandItems: { key: ScoreKey; label: string; instruction: string }[] = [
		{ key: 'command1', label: 'Command 1', instruction: 'Take this paper in your right hand' },
		{ key: 'command2', label: 'Command 2', instruction: 'Fold it in half' },
		{ key: 'command3', label: 'Command 3', instruction: 'Put it on the floor' }
	];

	const readWriteItems: { key: ScoreKey; label: string; instruction: string }[] = [
		{ key: 'reading', label: 'Reading', instruction: 'Show card: "CLOSE YOUR EYES". Ask patient to read and do what it says.' },
		{ key: 'writing', label: 'Writing', instruction: 'Ask patient to write a sentence (must contain a subject and a verb, and make sense).' }
	];

	function setScore(key: ScoreKey, value: 0 | 1) {
		lang[key] = value;
	}
</script>

<SectionCard title="Repetition & Commands" description="Repetition (1 point), three-stage command (3 points), reading (1 point), and writing (1 point).">
	<h3 class="mb-3 text-sm font-semibold text-gray-700">Repetition (1 point)</h3>
	{#each repetitionItems as item}
		<div class="mb-4 border-b border-gray-100 pb-3">
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

	<h3 class="mb-3 mt-6 text-sm font-semibold text-gray-700">Three-Stage Command (3 points)</h3>
	{#each commandItems as item}
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

	<h3 class="mb-3 mt-6 text-sm font-semibold text-gray-700">Reading & Writing (2 points)</h3>
	{#each readWriteItems as item}
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
