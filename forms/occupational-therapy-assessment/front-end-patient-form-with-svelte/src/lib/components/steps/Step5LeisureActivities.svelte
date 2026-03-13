<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const l = assessment.data.leisureActivities;

	const difficultyOptions = [
		{ value: 'none', label: 'No difficulty' },
		{ value: 'some', label: 'Some difficulty' },
		{ value: 'significant', label: 'Significant difficulty' },
		{ value: 'unable', label: 'Unable to perform' }
	];
</script>

<SectionCard title="Leisure Activities" description="Assess your ability to participate in leisure and social activities">
	<div class="space-y-6">
		<div class="rounded-lg border border-gray-100 bg-gray-50 p-4">
			<h3 class="mb-3 text-sm font-semibold text-gray-800">Quiet Recreation</h3>
			<p class="mb-3 text-xs text-gray-500">Reading, crafts, puzzles, watching TV, hobbies</p>
			<RadioGroup
				label="Level of difficulty"
				name="quietRecreationDifficulty"
				options={difficultyOptions}
				bind:value={l.quietRecreation.difficulty}
				required
			/>
			<TextArea
				label="Details"
				name="quietRecreationDetails"
				bind:value={l.quietRecreation.details}
				placeholder="Describe any specific difficulties..."
			/>
		</div>

		<div class="rounded-lg border border-gray-100 bg-gray-50 p-4">
			<h3 class="mb-3 text-sm font-semibold text-gray-800">Active Recreation</h3>
			<p class="mb-3 text-xs text-gray-500">Sports, exercise, gardening, walking, physical activities</p>
			<RadioGroup
				label="Level of difficulty"
				name="activeRecreationDifficulty"
				options={difficultyOptions}
				bind:value={l.activeRecreation.difficulty}
				required
			/>
			<TextArea
				label="Details"
				name="activeRecreationDetails"
				bind:value={l.activeRecreation.details}
				placeholder="Describe any specific difficulties..."
			/>
		</div>

		<div class="rounded-lg border border-gray-100 bg-gray-50 p-4">
			<h3 class="mb-3 text-sm font-semibold text-gray-800">Social Participation</h3>
			<p class="mb-3 text-xs text-gray-500">Visiting friends/family, community events, social gatherings</p>
			<RadioGroup
				label="Level of difficulty"
				name="socialParticipationDifficulty"
				options={difficultyOptions}
				bind:value={l.socialParticipation.difficulty}
				required
			/>
			<TextArea
				label="Details"
				name="socialParticipationDetails"
				bind:value={l.socialParticipation.details}
				placeholder="Describe any specific difficulties..."
			/>
		</div>
	</div>
</SectionCard>
