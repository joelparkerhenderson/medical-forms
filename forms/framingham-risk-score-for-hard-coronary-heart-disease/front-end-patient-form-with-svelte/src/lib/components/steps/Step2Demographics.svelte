<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';

	const d = assessment.data.demographics;
</script>

<SectionCard title="Demographics" description="Age and sex are required for the Framingham calculation. Valid age range: 30-79.">
	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<div class="mb-4">
			<label for="age" class="mb-1 block text-sm font-medium text-gray-700">Age (years)</label>
			<input id="age" name="age" type="number" min="1" max="120" bind:value={d.age} placeholder="e.g. 55" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none" />
		</div>

		<RadioGroup
			label="Sex"
			name="sex"
			options={[
				{ value: 'male', label: 'Male' },
				{ value: 'female', label: 'Female' }
			]}
			bind:value={d.sex}
		/>
	</div>

	<div class="mb-4">
		<label for="ethnicity" class="mb-1 block text-sm font-medium text-gray-700">Ethnicity</label>
		<select id="ethnicity" name="ethnicity" bind:value={d.ethnicity} class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none">
			<option value="">-- Prefer not to say --</option>
			<option value="whitebritish">White - British</option>
			<option value="whiteother">White - Other</option>
			<option value="asian">Asian or Asian British</option>
			<option value="black">Black or Black British</option>
			<option value="mixed">Mixed / Multiple</option>
			<option value="other">Other</option>
		</select>
	</div>

	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<div class="mb-4">
			<label for="heightCm" class="mb-1 block text-sm font-medium text-gray-700">Height (cm)</label>
			<input id="heightCm" name="heightCm" type="number" step="0.1" min="50" max="250" bind:value={d.heightCm} placeholder="e.g. 175" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none" />
		</div>
		<div class="mb-4">
			<label for="weightKg" class="mb-1 block text-sm font-medium text-gray-700">Weight (kg)</label>
			<input id="weightKg" name="weightKg" type="number" step="0.1" min="20" max="300" bind:value={d.weightKg} placeholder="e.g. 80" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none" />
		</div>
	</div>
</SectionCard>
