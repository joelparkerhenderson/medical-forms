<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import { estimateMETs } from '$lib/engine/utils';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';

	const f = assessment.data.functionalCapacity;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];

	$effect(() => {
		assessment.data.functionalCapacity.estimatedMETs = estimateMETs(f.exerciseTolerance);
	});
</script>

<SectionCard title="Functional Capacity" description="Your ability to perform daily activities and exercise">
	<SelectInput
		label="What is the most strenuous activity you can do without becoming short of breath?"
		name="exercise"
		options={[
			{ value: 'unable', label: 'Unable to perform daily activities' },
			{ value: 'light-housework', label: 'Light housework / walking around the house' },
			{ value: 'climb-stairs', label: 'Climb a flight of stairs / walk uphill' },
			{ value: 'moderate-exercise', label: 'Moderate exercise (jogging, cycling)' },
			{ value: 'vigorous-exercise', label: 'Vigorous exercise (running, swimming laps)' }
		]}
		bind:value={f.exerciseTolerance}
	/>

	{#if f.estimatedMETs !== null}
		<div class="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm">
			Estimated METs: <strong>{f.estimatedMETs}</strong>
			{#if f.estimatedMETs < 4}
				<span class="ml-2 text-orange-600">(Poor functional capacity - &lt;4 METs)</span>
			{:else}
				<span class="ml-2 text-green-600">(Adequate functional capacity - &ge;4 METs)</span>
			{/if}
		</div>
	{/if}

	<RadioGroup label="Do you use any mobility aids (wheelchair, walker, stick)?" name="mobilityAids" options={yesNo} bind:value={f.mobilityAids} />

	<RadioGroup label="Has your ability to exercise declined recently?" name="recentDecline" options={yesNo} bind:value={f.recentDecline} />
</SectionCard>
