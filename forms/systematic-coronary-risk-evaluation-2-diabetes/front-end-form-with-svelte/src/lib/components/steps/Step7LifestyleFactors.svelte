<script lang="ts">
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import type { LifestyleFactors } from '$lib/engine/types.js';

	let { data = $bindable() }: { data: LifestyleFactors } = $props();
</script>

<SectionCard title="Lifestyle Factors">
	<RadioGroup
		label="Smoking Status"
		name="smokingStatus"
		options={[
			{ value: 'never', label: 'Never' },
			{ value: 'former', label: 'Former' },
			{ value: 'current', label: 'Current' }
		]}
		bind:value={data.smokingStatus}
	/>

	{#if data.smokingStatus === 'current'}
		<TextInput label="Cigarettes Per Day" id="cigarettesPerDay" type="number" bind:value={data.cigarettesPerDay} min={0} max={100} step={1} />
	{/if}

	{#if data.smokingStatus === 'former'}
		<TextInput label="Years Since Quitting" id="yearsSinceQuit" type="number" bind:value={data.yearsSinceQuit} min={0} max={80} step={0.5} />
	{/if}

	<TextInput
		label="Alcohol (units per week)"
		id="alcoholUnitsPerWeek"
		type="number"
		bind:value={data.alcoholUnitsPerWeek}
		min={0}
		max={200}
		step={0.5}
		hint="1 unit = 10ml pure alcohol (e.g. half pint of beer, small glass of wine)"
	/>

	<div class="mb-4">
		<label for="physicalActivity" class="block text-sm font-medium text-gray-700 mb-1">Physical Activity Level</label>
		<select
			id="physicalActivity"
			bind:value={data.physicalActivity}
			class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary"
		>
			<option value="">Select...</option>
			<option value="sedentary">Sedentary (&lt;30 min/week)</option>
			<option value="lightlyActive">Lightly Active (30-149 min/week)</option>
			<option value="moderatelyActive">Moderately Active (150-300 min/week)</option>
			<option value="veryActive">Very Active (&gt;300 min/week)</option>
		</select>
	</div>

	<div class="mb-4">
		<label for="dietQuality" class="block text-sm font-medium text-gray-700 mb-1">Diet Quality</label>
		<select
			id="dietQuality"
			bind:value={data.dietQuality}
			class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary"
		>
			<option value="">Select...</option>
			<option value="poor">Poor</option>
			<option value="fair">Fair</option>
			<option value="good">Good</option>
			<option value="excellent">Excellent</option>
		</select>
	</div>

	<h4 class="mt-4 mb-2 text-sm font-semibold text-gray-700">Anthropometric Measurements</h4>

	<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
		<TextInput
			label="BMI (kg/m2)"
			id="bmi"
			type="number"
			bind:value={data.bmi}
			min={10}
			max={80}
			step={0.1}
			hint="Calculated from height and weight if available"
		/>
		<TextInput
			label="Waist Circumference (cm)"
			id="waistCircumferenceCm"
			type="number"
			bind:value={data.waistCircumferenceCm}
			min={40}
			max={200}
			step={0.5}
			hint="Measured at the level of the umbilicus"
		/>
	</div>
</SectionCard>
