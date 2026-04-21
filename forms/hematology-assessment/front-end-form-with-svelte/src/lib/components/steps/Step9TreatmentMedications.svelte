<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';

	const d = assessment.data.treatmentMedications;
</script>

<SectionCard title="Treatment & Medications" description="Document current treatments, medications, and response to therapy">
	<TextArea label="Current Medications" name="currentMedications" bind:value={d.currentMedications} placeholder="List all current medications and dosages" />
	<TextArea label="Chemotherapy Regimen (if applicable)" name="chemotherapyRegimen" rows={2} bind:value={d.chemotherapyRegimen} placeholder="e.g. R-CHOP cycle 3 of 6, ABVD" />

	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<SelectInput
			label="Anticoagulant Therapy"
			name="anticoagulantTherapy"
			bind:value={d.anticoagulantTherapy}
			options={[
				{ value: 'none', label: 'None' },
				{ value: 'warfarin', label: 'Warfarin' },
				{ value: 'heparin', label: 'Heparin' },
				{ value: 'lmwh', label: 'LMWH (Enoxaparin)' },
				{ value: 'doac', label: 'DOAC (Rivaroxaban/Apixaban)' },
				{ value: 'other', label: 'Other' }
			]}
		/>
		<SelectInput
			label="Iron Therapy"
			name="ironTherapy"
			bind:value={d.ironTherapy}
			options={[
				{ value: 'none', label: 'None' },
				{ value: 'oralIron', label: 'Oral Iron' },
				{ value: 'ivIron', label: 'IV Iron' },
				{ value: 'both', label: 'Both Oral and IV' }
			]}
		/>
	</div>

	<TextArea label="Treatment Response" name="treatmentResponse" rows={2} bind:value={d.treatmentResponse} placeholder="e.g. Partial response, stable disease, complete remission" />
	<TextArea label="Adverse Effects" name="adverseEffects" rows={2} bind:value={d.adverseEffects} placeholder="Document any treatment-related adverse effects" />
</SectionCard>
