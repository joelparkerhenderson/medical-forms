<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import { sleepEfficiencyCalc } from '$lib/engine/utils';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';

	const e = assessment.data.sleepEfficiency;

	const efficiency = $derived(sleepEfficiencyCalc(e.hoursAsleep, e.hoursInBed));
</script>

<SectionCard title="Sleep Efficiency" description="The proportion of time in bed spent actually sleeping">
	<TextInput
		label="What time do you go to bed?"
		name="effBedtime"
		type="time"
		bind:value={e.bedtime}
		required
	/>

	<TextInput
		label="What time do you get out of bed?"
		name="effWakeTime"
		type="time"
		bind:value={e.wakeTime}
		required
	/>

	<NumberInput
		label="How many hours do you spend in bed?"
		name="hoursInBed"
		bind:value={e.hoursInBed}
		unit="hours"
		min={0}
		max={24}
		step={0.5}
		required
	/>

	<NumberInput
		label="How many hours do you actually sleep?"
		name="hoursAsleep"
		bind:value={e.hoursAsleep}
		unit="hours"
		min={0}
		max={24}
		step={0.5}
		required
	/>

	{#if efficiency !== null}
		<div class="mt-4 rounded-lg border p-4 {efficiency >= 85 ? 'border-green-300 bg-green-50' : efficiency >= 75 ? 'border-yellow-300 bg-yellow-50' : 'border-red-300 bg-red-50'}">
			<p class="text-sm font-medium">
				Calculated Sleep Efficiency: <span class="text-lg font-bold">{efficiency.toFixed(1)}%</span>
			</p>
			<p class="mt-1 text-xs text-gray-600">
				{#if efficiency >= 85}
					Normal sleep efficiency (85% or above)
				{:else if efficiency >= 75}
					Mildly reduced sleep efficiency
				{:else if efficiency >= 65}
					Moderately reduced sleep efficiency
				{:else}
					Severely reduced sleep efficiency
				{/if}
			</p>
		</div>
	{/if}
</SectionCard>
