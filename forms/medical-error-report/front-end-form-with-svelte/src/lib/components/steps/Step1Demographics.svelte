<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';

	const d = assessment.data.demographics;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Demographics" description="Reporter information and facility details">
	<RadioGroup
		label="Submit this report anonymously?"
		name="anonymousReport"
		options={yesNo}
		bind:value={d.anonymousReport}
	/>

	{#if d.anonymousReport !== 'yes'}
		<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
			<TextInput label="Reporter First Name" name="reporterFirstName" bind:value={d.reporterFirstName} required />
			<TextInput label="Reporter Last Name" name="reporterLastName" bind:value={d.reporterLastName} required />
		</div>

		<SelectInput
			label="Reporter Role"
			name="reporterRole"
			options={[
				{ value: 'doctor', label: 'Doctor' },
				{ value: 'nurse', label: 'Nurse' },
				{ value: 'pharmacist', label: 'Pharmacist' },
				{ value: 'allied-health', label: 'Allied Health Professional' },
				{ value: 'administrator', label: 'Administrator' },
				{ value: 'patient', label: 'Patient' },
				{ value: 'other', label: 'Other' }
			]}
			bind:value={d.reporterRole}
			required
		/>

		<TextInput label="Department" name="reporterDepartment" bind:value={d.reporterDepartment} />

		<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
			<TextInput label="Contact Phone" name="reporterContactPhone" bind:value={d.reporterContactPhone} />
			<TextInput label="Contact Email" name="reporterContactEmail" type="email" bind:value={d.reporterContactEmail} />
		</div>
	{/if}

	<TextInput label="Facility Name" name="facilityName" bind:value={d.facilityName} required />
	<TextInput label="Ward / Unit" name="facilityWard" bind:value={d.facilityWard} />
	<TextInput label="Report Date" name="reportDate" type="date" bind:value={d.reportDate} required />
</SectionCard>
