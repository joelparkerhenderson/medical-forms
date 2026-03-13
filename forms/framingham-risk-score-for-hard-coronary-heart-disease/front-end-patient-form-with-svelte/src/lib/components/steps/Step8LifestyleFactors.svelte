<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';

	const l = assessment.data.lifestyleFactors;
</script>

<SectionCard title="Lifestyle Factors" description="Lifestyle factors provide additional context for clinical decision-making beyond the core risk score.">
	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<div class="mb-4">
			<label for="physicalActivity" class="mb-1 block text-sm font-medium text-gray-700">Physical Activity Level</label>
			<select id="physicalActivity" name="physicalActivity" bind:value={l.physicalActivity} class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none">
				<option value="">-- Select --</option>
				<option value="sedentary">Sedentary</option>
				<option value="light">Light</option>
				<option value="moderate">Moderate</option>
				<option value="vigorous">Vigorous</option>
			</select>
		</div>
		<div class="mb-4">
			<label for="alcoholConsumption" class="mb-1 block text-sm font-medium text-gray-700">Alcohol Consumption</label>
			<select id="alcoholConsumption" name="alcoholConsumption" bind:value={l.alcoholConsumption} class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none">
				<option value="">-- Select --</option>
				<option value="none">None</option>
				<option value="moderate">Moderate</option>
				<option value="heavy">Heavy</option>
			</select>
		</div>
	</div>

	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<div class="mb-4">
			<label for="dietQuality" class="mb-1 block text-sm font-medium text-gray-700">Diet Quality</label>
			<select id="dietQuality" name="dietQuality" bind:value={l.dietQuality} class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none">
				<option value="">-- Select --</option>
				<option value="poor">Poor</option>
				<option value="average">Average</option>
				<option value="good">Good</option>
				<option value="excellent">Excellent</option>
			</select>
		</div>
		<div class="mb-4">
			<label for="stressLevel" class="mb-1 block text-sm font-medium text-gray-700">Stress Level</label>
			<select id="stressLevel" name="stressLevel" bind:value={l.stressLevel} class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none">
				<option value="">-- Select --</option>
				<option value="low">Low</option>
				<option value="moderate">Moderate</option>
				<option value="high">High</option>
			</select>
		</div>
	</div>

	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<div class="mb-4">
			<label for="bmi" class="mb-1 block text-sm font-medium text-gray-700">BMI (if known)</label>
			<input id="bmi" name="bmi" type="number" step="0.1" min="10" max="80" bind:value={l.bmi} placeholder="e.g. 27.5" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none" />
		</div>
		<div class="mb-4">
			<label for="waistCircumferenceCm" class="mb-1 block text-sm font-medium text-gray-700">Waist Circumference (cm)</label>
			<input id="waistCircumferenceCm" name="waistCircumferenceCm" type="number" step="0.1" min="30" max="250" bind:value={l.waistCircumferenceCm} placeholder="e.g. 95" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none" />
		</div>
	</div>
</SectionCard>
