<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';

	const vis = assessment.data.visuospatialScores;

	function setScore(value: 0 | 1) {
		vis.copying = value;
	}
</script>

<SectionCard title="Visuospatial" description="Ask the patient to copy intersecting pentagons (1 point). All 10 angles must be present and 2 must intersect.">
	<div class="mb-4">
		<p class="mb-3 text-sm font-medium text-gray-700">Copy intersecting pentagons</p>
		<p class="mb-3 text-xs text-gray-400">Show the patient two intersecting pentagons and ask them to copy the design exactly. Score 1 point if all 10 angles are present and two shapes intersect.</p>
		<div class="flex gap-3">
			<label
				class="flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-1.5 text-sm transition-colors
					{vis.copying === 1 ? 'border-primary bg-blue-50 font-medium' : 'border-gray-300 bg-white hover:bg-gray-50'}"
			>
				<input
					type="radio"
					name="vis-copying"
					checked={vis.copying === 1}
					onchange={() => setScore(1)}
					class="accent-primary"
				/>
				Correct (1)
			</label>
			<label
				class="flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-1.5 text-sm transition-colors
					{vis.copying === 0 ? 'border-primary bg-blue-50 font-medium' : 'border-gray-300 bg-white hover:bg-gray-50'}"
			>
				<input
					type="radio"
					name="vis-copying"
					checked={vis.copying === 0}
					onchange={() => setScore(0)}
					class="accent-primary"
				/>
				Incorrect (0)
			</label>
		</div>
	</div>
</SectionCard>
