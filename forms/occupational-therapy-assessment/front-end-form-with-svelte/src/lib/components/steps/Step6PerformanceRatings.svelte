<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';

	const p = assessment.data.performanceRatings;

	const activities = [
		{ key: 'activity1' as const, label: 'Activity 1' },
		{ key: 'activity2' as const, label: 'Activity 2' },
		{ key: 'activity3' as const, label: 'Activity 3' },
		{ key: 'activity4' as const, label: 'Activity 4' },
		{ key: 'activity5' as const, label: 'Activity 5' }
	];
</script>

<SectionCard title="Performance Ratings" description="Rate how well you can perform each identified activity (COPM Performance Scale 1-10)">
	<p class="mb-4 text-sm text-gray-500">
		Identify up to 5 activities that are difficult for you. Rate the importance of each activity
		and how well you currently perform it on a scale of 1 (not able to do it) to 10 (able to do it extremely well).
	</p>

	<div class="space-y-6">
		{#each activities as activity}
			<div class="rounded-lg border border-gray-100 bg-gray-50 p-4">
				<h3 class="mb-3 text-sm font-semibold text-gray-800">{activity.label}</h3>
				<TextInput
					label="Activity Name"
					name="{activity.key}Name"
					bind:value={p[activity.key].name}
					placeholder="e.g., Dressing, Cooking, Driving"
				/>
				<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
					<NumberInput
						label="Importance"
						name="{activity.key}Importance"
						bind:value={p[activity.key].importance}
						min={1}
						max={10}
						unit="1-10"
					/>
					<NumberInput
						label="Performance Score"
						name="{activity.key}Performance"
						bind:value={p[activity.key].performanceScore}
						min={1}
						max={10}
						unit="1-10"
					/>
				</div>
			</div>
		{/each}
	</div>
</SectionCard>
