<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';

	const mp = assessment.data.metabolicProfile;
</script>

<SectionCard title="Metabolic Profile" description="Key metabolic markers relevant to semaglutide prescribing">
	<h3 class="mb-3 text-sm font-semibold text-gray-700">Glycaemic Control</h3>
	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<NumberInput label="HbA1c" name="hba1c" bind:value={mp.hba1c} min={3} max={20} step={0.1} unit="%" />
		<NumberInput label="Fasting Glucose" name="fastingGlucose" bind:value={mp.fastingGlucose} min={1} max={30} step={0.1} unit="mmol/L" />
	</div>
	<NumberInput label="Fasting Insulin Level" name="insulinLevel" bind:value={mp.insulinLevel} min={0} max={200} step={0.1} unit="mIU/L" />

	<h3 class="mb-3 mt-6 text-sm font-semibold text-gray-700">Lipid Profile</h3>
	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<NumberInput label="Total Cholesterol" name="totalCholesterol" bind:value={mp.totalCholesterol} min={1} max={15} step={0.1} unit="mmol/L" />
		<NumberInput label="LDL Cholesterol" name="ldl" bind:value={mp.ldl} min={0} max={10} step={0.1} unit="mmol/L" />
		<NumberInput label="HDL Cholesterol" name="hdl" bind:value={mp.hdl} min={0} max={5} step={0.1} unit="mmol/L" />
		<NumberInput label="Triglycerides" name="triglycerides" bind:value={mp.triglycerides} min={0} max={20} step={0.1} unit="mmol/L" />
	</div>

	<h3 class="mb-3 mt-6 text-sm font-semibold text-gray-700">Thyroid</h3>
	<TextInput
		label="Thyroid Function"
		name="thyroidFunction"
		bind:value={mp.thyroidFunction}
		placeholder="e.g., Normal, Hypothyroid, Hyperthyroid, TSH level..."
	/>
</SectionCard>
