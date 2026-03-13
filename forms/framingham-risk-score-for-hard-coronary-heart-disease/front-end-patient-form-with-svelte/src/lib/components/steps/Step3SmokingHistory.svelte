<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';

	const s = assessment.data.smokingHistory;
</script>

<SectionCard title="Smoking History" description="Smoking status is a key factor in the Framingham risk calculation.">
	<RadioGroup
		label="Current Smoking Status"
		name="smokingStatus"
		options={[
			{ value: 'current', label: 'Current Smoker' },
			{ value: 'former', label: 'Former Smoker' },
			{ value: 'never', label: 'Never Smoked' }
		]}
		bind:value={s.smokingStatus}
	/>

	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<div class="mb-4">
			<label for="cigarettesPerDay" class="mb-1 block text-sm font-medium text-gray-700">Cigarettes per Day (if applicable)</label>
			<input id="cigarettesPerDay" name="cigarettesPerDay" type="number" min="0" max="100" bind:value={s.cigarettesPerDay} placeholder="e.g. 20" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none" />
		</div>
		<div class="mb-4">
			<label for="yearsSmoked" class="mb-1 block text-sm font-medium text-gray-700">Years Smoked</label>
			<input id="yearsSmoked" name="yearsSmoked" type="number" min="0" max="100" bind:value={s.yearsSmoked} placeholder="e.g. 15" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none" />
		</div>
	</div>

	<div class="mb-4">
		<label for="yearsSinceQuit" class="mb-1 block text-sm font-medium text-gray-700">Years Since Quitting (if former smoker)</label>
		<input id="yearsSinceQuit" name="yearsSinceQuit" type="number" min="0" max="100" bind:value={s.yearsSinceQuit} placeholder="e.g. 5" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none" />
	</div>
</SectionCard>
