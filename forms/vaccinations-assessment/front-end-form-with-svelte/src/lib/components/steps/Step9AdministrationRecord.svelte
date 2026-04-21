<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';

	const ar = assessment.data.administrationRecord;
</script>

<SectionCard title="Administration Record" description="Record details of the vaccine administration.">
	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<TextInput label="Vaccine Name" name="vaccineName" bind:value={ar.vaccineName} placeholder="e.g. Priorix (MMR)" />
		<TextInput label="Batch Number" name="batchNumber" bind:value={ar.batchNumber} placeholder="e.g. ABCD1234" />
	</div>

	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<TextInput label="Expiry Date" name="expiryDate" type="date" bind:value={ar.expiryDate} />
		<TextInput label="Administration Date" name="administrationDate" type="date" bind:value={ar.administrationDate} />
	</div>

	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<SelectInput
			label="Administration Site"
			name="administrationSite"
			options={[
				{ value: 'leftDeltoid', label: 'Left Deltoid' },
				{ value: 'rightDeltoid', label: 'Right Deltoid' },
				{ value: 'leftThigh', label: 'Left Thigh' },
				{ value: 'rightThigh', label: 'Right Thigh' },
				{ value: 'oral', label: 'Oral' },
				{ value: 'nasal', label: 'Nasal' }
			]}
			bind:value={ar.administrationSite}
		/>
		<SelectInput
			label="Administration Route"
			name="administrationRoute"
			options={[
				{ value: 'intramuscular', label: 'Intramuscular (IM)' },
				{ value: 'subcutaneous', label: 'Subcutaneous (SC)' },
				{ value: 'intradermal', label: 'Intradermal (ID)' },
				{ value: 'oral', label: 'Oral' },
				{ value: 'nasal', label: 'Nasal' }
			]}
			bind:value={ar.administrationRoute}
		/>
	</div>

	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<SelectInput
			label="Dose Number"
			name="doseNumber"
			options={[
				{ value: '1', label: '1st Dose' },
				{ value: '2', label: '2nd Dose' },
				{ value: '3', label: '3rd Dose' },
				{ value: 'booster', label: 'Booster' }
			]}
			bind:value={ar.doseNumber}
		/>
		<TextInput label="Administered By" name="administeredBy" bind:value={ar.administeredBy} placeholder="e.g. Nurse Jones" />
	</div>
</SectionCard>
