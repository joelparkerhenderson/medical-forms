<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';

	const s = assessment.data.satisfactionRatings;

	const activities = [
		{ key: 'activity1' as const, label: 'Activity 1' },
		{ key: 'activity2' as const, label: 'Activity 2' },
		{ key: 'activity3' as const, label: 'Activity 3' },
		{ key: 'activity4' as const, label: 'Activity 4' },
		{ key: 'activity5' as const, label: 'Activity 5' }
	];
</script>

<SectionCard title="Satisfaction Ratings" description="Rate how satisfied you are with your performance in each activity (COPM Satisfaction Scale 1-10)">
	<p class="mb-4 text-sm text-gray-500">
		For each activity you identified, rate how satisfied you are with your current performance
		on a scale of 1 (not satisfied at all) to 10 (extremely satisfied).
	</p>

	<div class="space-y-6">
		{#each activities as activity}
			<div class="rounded-lg border border-gray-100 bg-gray-50 p-4">
				<h3 class="mb-3 text-sm font-semibold text-gray-800">{activity.label}</h3>
				<TextInput
					label="Activity Name"
					name="{activity.key}SatName"
					bind:value={s[activity.key].name}
					placeholder="e.g., Dressing, Cooking, Driving"
				/>
				<NumberInput
					label="Satisfaction Score"
					name="{activity.key}Satisfaction"
					bind:value={s[activity.key].satisfactionScore}
					min={1}
					max={10}
					unit="1-10"
				/>
			</div>
		{/each}
	</div>
</SectionCard>
