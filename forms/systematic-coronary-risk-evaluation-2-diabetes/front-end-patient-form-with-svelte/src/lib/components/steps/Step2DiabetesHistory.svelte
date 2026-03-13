<script lang="ts">
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import type { DiabetesHistory } from '$lib/engine/types.js';

	let { data = $bindable() }: { data: DiabetesHistory } = $props();
</script>

<SectionCard title="Diabetes History">
	<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
		<div class="mb-4">
			<label for="diabetesType" class="block text-sm font-medium text-gray-700 mb-1"
				>Diabetes Type</label
			>
			<select
				id="diabetesType"
				bind:value={data.diabetesType}
				class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary"
			>
				<option value="">Select...</option>
				<option value="type1">Type 1</option>
				<option value="type2">Type 2</option>
				<option value="gestational">Gestational</option>
				<option value="other">Other</option>
			</select>
		</div>
		<TextInput
			label="Age at Diagnosis (years)"
			id="ageAtDiagnosis"
			type="number"
			bind:value={data.ageAtDiagnosis}
			min={0}
			max={120}
			step={1}
		/>
	</div>

	<TextInput
		label="Diabetes Duration (years)"
		id="diabetesDurationYears"
		type="number"
		bind:value={data.diabetesDurationYears}
		min={0}
		max={100}
		step={0.5}
	/>

	<h4 class="mt-4 mb-2 text-sm font-semibold text-gray-700">Glycaemic Control</h4>

	<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
		<TextInput
			label="HbA1c Value"
			id="hba1cValue"
			type="number"
			bind:value={data.hba1cValue}
			min={0}
			step={0.1}
		/>
		<RadioGroup
			label="HbA1c Unit"
			name="hba1cUnit"
			options={[
				{ value: 'mmolMol', label: 'mmol/mol' },
				{ value: 'percent', label: '%' }
			]}
			bind:value={data.hba1cUnit}
		/>
	</div>

	<TextInput
		label="Fasting Glucose (mmol/L)"
		id="fastingGlucose"
		type="number"
		bind:value={data.fastingGlucose}
		min={0}
		step={0.1}
	/>

	<h4 class="mt-4 mb-2 text-sm font-semibold text-gray-700">Diabetes Treatment</h4>

	<div class="mb-4">
		<label for="diabetesTreatment" class="block text-sm font-medium text-gray-700 mb-1"
			>Current Treatment</label
		>
		<select
			id="diabetesTreatment"
			bind:value={data.diabetesTreatment}
			class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary"
		>
			<option value="">Select...</option>
			<option value="diet">Diet only</option>
			<option value="oral">Oral medication only</option>
			<option value="insulin">Insulin only</option>
			<option value="combined">Combined (oral + insulin)</option>
		</select>
	</div>

	{#if data.diabetesTreatment === 'insulin' || data.diabetesTreatment === 'combined'}
		<TextInput
			label="Duration on Insulin (years)"
			id="insulinDurationYears"
			type="number"
			bind:value={data.insulinDurationYears}
			min={0}
			max={100}
			step={0.5}
		/>
	{/if}
</SectionCard>
