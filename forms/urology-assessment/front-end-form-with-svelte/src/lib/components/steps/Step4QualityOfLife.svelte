<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import { qolResponseOptions } from '$lib/engine/ipss-rules';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';
	import type { QoLScore } from '$lib/engine/types';

	const qol = assessment.data.qualityOfLife;

	function setQolScore(value: number) {
		assessment.data.qualityOfLife.qolScore = value as QoLScore;
	}
</script>

<SectionCard title="Quality of Life" description="IPSS Quality of Life assessment - how do your urinary symptoms affect your daily life?">
	<div class="mb-6">
		<p class="mb-3 text-sm font-medium text-gray-700">
			If you were to spend the rest of your life with your urinary condition just the way it is now, how would you feel about that?
		</p>
		<div class="flex flex-wrap gap-2">
			{#each qolResponseOptions as opt}
				<label
					class="flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition-colors
						{qol.qolScore === opt.value ? 'border-primary bg-blue-50 font-medium' : 'border-gray-300 bg-white hover:bg-gray-50'}"
				>
					<input
						type="radio"
						name="qol-score"
						value={opt.value}
						checked={qol.qolScore === opt.value}
						onchange={() => setQolScore(opt.value)}
						class="text-primary accent-primary"
					/>
					{opt.label}
				</label>
			{/each}
		</div>
	</div>

	<TextArea
		label="How do your urinary symptoms impact your daily life?"
		name="qolImpact"
		bind:value={qol.qolImpact}
		placeholder="Describe how your symptoms affect work, sleep, travel, social activities..."
	/>
</SectionCard>
