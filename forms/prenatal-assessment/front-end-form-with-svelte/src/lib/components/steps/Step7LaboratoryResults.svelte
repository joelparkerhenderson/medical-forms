<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';

	const l = assessment.data.laboratoryResults;
</script>

<SectionCard title="Laboratory Results" description="Blood work and test results">
	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<SelectInput
			label="Blood Type"
			name="bloodType"
			options={[
				{ value: 'A', label: 'Type A' },
				{ value: 'B', label: 'Type B' },
				{ value: 'AB', label: 'Type AB' },
				{ value: 'O', label: 'Type O' }
			]}
			bind:value={l.bloodType}
			required
		/>

		<RadioGroup
			label="Rh Factor"
			name="rhFactor"
			options={[
				{ value: 'positive', label: 'Positive (+)' },
				{ value: 'negative', label: 'Negative (-)' }
			]}
			bind:value={l.rhFactor}
			required
		/>
	</div>

	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<NumberInput
			label="Hemoglobin"
			name="hemoglobin"
			bind:value={l.hemoglobin}
			min={3}
			max={20}
			step={0.1}
			unit="g/dL"
		/>

		<NumberInput
			label="Glucose"
			name="glucose"
			bind:value={l.glucose}
			min={1}
			max={30}
			step={0.1}
			unit="mmol/L"
		/>
	</div>

	<TextInput
		label="Urinalysis Results"
		name="urinalysis"
		bind:value={l.urinalysis}
		placeholder="e.g., Normal, Protein +, Glucose +..."
	/>

	<RadioGroup
		label="Group B Streptococcus (GBS)"
		name="gbs"
		options={[
			{ value: 'yes', label: 'Positive' },
			{ value: 'no', label: 'Negative' }
		]}
		bind:value={l.gbs}
	/>
</SectionCard>
