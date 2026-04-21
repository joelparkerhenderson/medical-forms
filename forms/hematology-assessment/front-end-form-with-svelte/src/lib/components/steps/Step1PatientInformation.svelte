<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';

	const d = assessment.data.patientInformation;
</script>

<SectionCard title="Patient Information" description="Patient demographic and specimen details">
	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<TextInput label="Patient Name" name="patientName" bind:value={d.patientName} placeholder="e.g. Jane Smith" required />
		<TextInput label="Date of Birth" name="dateOfBirth" type="date" bind:value={d.dateOfBirth} required />
	</div>

	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<TextInput label="Medical Record Number" name="medicalRecordNumber" bind:value={d.medicalRecordNumber} placeholder="e.g. MRN-123456" />
		<TextInput label="Referring Physician" name="referringPhysician" bind:value={d.referringPhysician} placeholder="e.g. Dr Johnson" />
	</div>

	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<TextInput label="Clinical Indication" name="clinicalIndication" bind:value={d.clinicalIndication} placeholder="e.g. Suspected anemia, fatigue" />
		<TextInput label="Specimen Date" name="specimenDate" type="date" bind:value={d.specimenDate} />
	</div>

	<SelectInput
		label="Specimen Type"
		name="specimenType"
		bind:value={d.specimenType}
		options={[
			{ value: 'edtaBlood', label: 'EDTA Blood' },
			{ value: 'citratedBlood', label: 'Citrated Blood' },
			{ value: 'serumSample', label: 'Serum Sample' },
			{ value: 'boneMarrow', label: 'Bone Marrow' },
			{ value: 'other', label: 'Other' }
		]}
	/>
</SectionCard>
