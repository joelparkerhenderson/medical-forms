<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';

	const d = assessment.data.complicationsScreening;
</script>

<SectionCard title="Complications Screening" description="Record diabetes-related complications and screening results.">
	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<SelectInput
			label="Retinopathy Status"
			name="retinopathyStatus"
			bind:value={d.retinopathyStatus}
			options={[
				{ value: 'none', label: 'None' },
				{ value: 'background', label: 'Background' },
				{ value: 'preProliferative', label: 'Pre-Proliferative' },
				{ value: 'proliferative', label: 'Proliferative' },
				{ value: 'maculopathy', label: 'Maculopathy' }
			]}
		/>
		<TextInput label="Last Eye Screening Date" name="lastEyeScreening" type="date" bind:value={d.lastEyeScreening} />
	</div>

	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<SelectInput
			label="Nephropathy Status"
			name="nephropathyStatus"
			bind:value={d.nephropathyStatus}
			options={[
				{ value: 'normal', label: 'Normal' },
				{ value: 'microalbuminuria', label: 'Microalbuminuria' },
				{ value: 'macroalbuminuria', label: 'Macroalbuminuria' },
				{ value: 'ckd', label: 'Chronic Kidney Disease' }
			]}
		/>
		<NumberInput label="eGFR (mL/min/1.73m2)" name="egfr" bind:value={d.egfr} step="0.1" min={0} placeholder="e.g. 90" />
	</div>

	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<NumberInput label="Urine ACR (mg/mmol)" name="urineAcr" bind:value={d.urineAcr} step="0.1" min={0} placeholder="e.g. 2.5" />
		<RadioGroup
			label="Neuropathy Symptoms"
			name="neuropathySymptoms"
			bind:value={d.neuropathySymptoms}
			options={[
				{ value: 'yes', label: 'Yes' },
				{ value: 'no', label: 'No' }
			]}
		/>
	</div>

	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<SelectInput
			label="Autonomic Neuropathy"
			name="autonomicNeuropathy"
			bind:value={d.autonomicNeuropathy}
			options={[
				{ value: 'none', label: 'None' },
				{ value: 'suspected', label: 'Suspected' },
				{ value: 'confirmed', label: 'Confirmed' }
			]}
		/>
		<SelectInput
			label="Erectile Dysfunction"
			name="erectileDysfunction"
			bind:value={d.erectileDysfunction}
			options={[
				{ value: 'notApplicable', label: 'Not Applicable' },
				{ value: 'no', label: 'No' },
				{ value: 'yes', label: 'Yes' }
			]}
		/>
	</div>
</SectionCard>
