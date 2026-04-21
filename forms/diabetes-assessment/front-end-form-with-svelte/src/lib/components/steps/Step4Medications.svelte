<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';
	import LikertGroup from '$lib/components/ui/LikertGroup.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const d = assessment.data.medications;
</script>

<SectionCard title="Medications" description="Record current diabetes medications and adherence.">
	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<RadioGroup
			label="Metformin"
			name="metformin"
			bind:value={d.metformin}
			options={[
				{ value: 'yes', label: 'Yes' },
				{ value: 'no', label: 'No' }
			]}
		/>
		<SelectInput
			label="Sulfonylurea"
			name="sulfonylurea"
			bind:value={d.sulfonylurea}
			options={[
				{ value: 'yes', label: 'Yes' },
				{ value: 'no', label: 'No' },
				{ value: 'previouslyUsed', label: 'Previously Used' }
			]}
		/>
	</div>

	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<SelectInput
			label="SGLT2 Inhibitor"
			name="sglt2Inhibitor"
			bind:value={d.sglt2Inhibitor}
			options={[
				{ value: 'yes', label: 'Yes' },
				{ value: 'no', label: 'No' },
				{ value: 'contraindicated', label: 'Contraindicated' }
			]}
		/>
		<SelectInput
			label="GLP-1 Receptor Agonist"
			name="glp1Agonist"
			bind:value={d.glp1Agonist}
			options={[
				{ value: 'yes', label: 'Yes' },
				{ value: 'no', label: 'No' },
				{ value: 'previouslyUsed', label: 'Previously Used' }
			]}
		/>
	</div>

	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<SelectInput
			label="DPP-4 Inhibitor"
			name="dpp4Inhibitor"
			bind:value={d.dpp4Inhibitor}
			options={[
				{ value: 'yes', label: 'Yes' },
				{ value: 'no', label: 'No' }
			]}
		/>
		<RadioGroup
			label="Insulin"
			name="insulin"
			bind:value={d.insulin}
			options={[
				{ value: 'yes', label: 'Yes' },
				{ value: 'no', label: 'No' }
			]}
		/>
	</div>

	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<SelectInput
			label="Insulin Regimen"
			name="insulinRegimen"
			bind:value={d.insulinRegimen}
			options={[
				{ value: 'basalOnly', label: 'Basal Only' },
				{ value: 'basalBolus', label: 'Basal-Bolus' },
				{ value: 'mixedInsulin', label: 'Mixed Insulin' },
				{ value: 'pump', label: 'Insulin Pump' },
				{ value: 'notApplicable', label: 'Not Applicable' }
			]}
		/>
		<NumberInput label="Insulin Total Daily Dose (units)" name="insulinDailyDose" bind:value={d.insulinDailyDose} step="0.5" min={0} placeholder="e.g. 42" />
	</div>

	<LikertGroup
		label="Medication Adherence (self-reported)"
		name="medicationAdherence"
		bind:value={d.medicationAdherence}
		options={[
			{ value: 1, label: 'Very Poor' },
			{ value: 2, label: 'Poor' },
			{ value: 3, label: 'Fair' },
			{ value: 4, label: 'Good' },
			{ value: 5, label: 'Excellent' }
		]}
	/>

	<TextArea label="Other Medications" name="otherMedications" bind:value={d.otherMedications} rows={3} placeholder="List any other medications (non-diabetes)" />
</SectionCard>
