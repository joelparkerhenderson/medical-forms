<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import { symptomResponseOptions } from '$lib/engine/symptom-rules';
	import type { PainSeverity } from '$lib/engine/types';

	const m = assessment.data.menstrualHistory;

	function setPainSeverity(value: number) {
		assessment.data.menstrualHistory.painSeverity = value as PainSeverity;
	}
</script>

<SectionCard title="Menstrual History" description="Details about your menstrual cycle and symptoms">
	<NumberInput
		label="Cycle Length"
		name="cycleLength"
		bind:value={m.cycleLength}
		unit="days"
		min={18}
		max={45}
		step={1}
	/>

	<NumberInput
		label="Cycle Duration (period length)"
		name="cycleDuration"
		bind:value={m.cycleDuration}
		unit="days"
		min={1}
		max={14}
		step={1}
	/>

	<SelectInput
		label="Flow Heaviness"
		name="flowHeaviness"
		options={[
			{ value: 'light', label: 'Light' },
			{ value: 'moderate', label: 'Moderate' },
			{ value: 'heavy', label: 'Heavy' },
			{ value: 'very-heavy', label: 'Very heavy (flooding / clots)' }
		]}
		bind:value={m.flowHeaviness}
		required
	/>

	<div class="mb-6">
		<p class="mb-3 text-sm font-medium text-gray-700">
			How severe is your menstrual pain (dysmenorrhoea)?
		</p>
		<div class="flex flex-wrap gap-2">
			{#each symptomResponseOptions as opt}
				<label
					class="flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition-colors
						{m.painSeverity === opt.value ? 'border-primary bg-blue-50 font-medium' : 'border-gray-300 bg-white hover:bg-gray-50'}"
				>
					<input
						type="radio"
						name="painSeverity"
						value={opt.value}
						checked={m.painSeverity === opt.value}
						onchange={() => setPainSeverity(opt.value)}
						class="text-primary accent-primary"
					/>
					{opt.label}
				</label>
			{/each}
		</div>
	</div>

	<RadioGroup
		label="Cycle Regularity"
		name="regularity"
		options={[
			{ value: 'regular', label: 'Regular' },
			{ value: 'irregular', label: 'Irregular' },
			{ value: 'absent', label: 'Absent (amenorrhoea)' }
		]}
		bind:value={m.regularity}
		required
	/>

	<TextInput
		label="Date of Last Menstrual Period"
		name="lastMenstrualPeriod"
		type="date"
		bind:value={m.lastMenstrualPeriod}
	/>
</SectionCard>
