<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';

	const c = assessment.data.cholesterol;
</script>

<SectionCard title="Cholesterol" description="Total cholesterol and HDL are required for the Framingham calculation. Values in mg/dL or mmol/L.">
	<div class="mb-4">
		<label for="cholesterolUnit" class="mb-1 block text-sm font-medium text-gray-700">Cholesterol Unit</label>
		<select id="cholesterolUnit" name="cholesterolUnit" bind:value={c.cholesterolUnit} class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none">
			<option value="mgDl">mg/dL</option>
			<option value="mmolL">mmol/L</option>
		</select>
	</div>

	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<div class="mb-4">
			<label for="totalCholesterol" class="mb-1 block text-sm font-medium text-gray-700">Total Cholesterol</label>
			<input id="totalCholesterol" name="totalCholesterol" type="number" step="0.1" min="0" bind:value={c.totalCholesterol} placeholder="e.g. 220" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none" />
		</div>
		<div class="mb-4">
			<label for="hdlCholesterol" class="mb-1 block text-sm font-medium text-gray-700">HDL Cholesterol</label>
			<input id="hdlCholesterol" name="hdlCholesterol" type="number" step="0.1" min="0" bind:value={c.hdlCholesterol} placeholder="e.g. 50" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none" />
		</div>
	</div>

	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<div class="mb-4">
			<label for="ldlCholesterol" class="mb-1 block text-sm font-medium text-gray-700">LDL Cholesterol (optional)</label>
			<input id="ldlCholesterol" name="ldlCholesterol" type="number" step="0.1" min="0" bind:value={c.ldlCholesterol} placeholder="e.g. 140" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none" />
		</div>
		<div class="mb-4">
			<label for="triglycerides" class="mb-1 block text-sm font-medium text-gray-700">Triglycerides (optional)</label>
			<input id="triglycerides" name="triglycerides" type="number" step="0.1" min="0" bind:value={c.triglycerides} placeholder="e.g. 150" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none" />
		</div>
	</div>

	<RadioGroup
		label="Fasting Sample?"
		name="fastingSample"
		options={[
			{ value: 'yes', label: 'Yes' },
			{ value: 'no', label: 'No' }
		]}
		bind:value={c.fastingSample}
	/>
</SectionCard>
