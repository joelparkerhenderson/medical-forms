<script lang="ts">
	import { casualtyCard } from '$lib/stores/casualtyCard.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';

	const d = casualtyCard.data.disposition;
</script>

<SectionCard title="Disposition" description="Patient outcome and discharge details">
	<RadioGroup
		label="Disposition"
		name="disposition"
		bind:value={d.disposition}
		options={[
			{ value: 'admitted', label: 'Admitted' },
			{ value: 'discharged', label: 'Discharged' },
			{ value: 'transferred', label: 'Transferred' },
			{ value: 'left-before-seen', label: 'Left Before Seen' },
			{ value: 'self-discharged', label: 'Self-Discharged' }
		]}
	/>

	{#if d.disposition === 'admitted'}
		<h3 class="mb-3 mt-4 text-lg font-semibold text-gray-800">Admission Details</h3>
		<TextInput label="Admitting Specialty" name="admittingSpecialty" bind:value={d.admittingSpecialty} />
		<TextInput label="Admitting Consultant" name="admittingConsultant" bind:value={d.admittingConsultant} />
		<TextInput label="Ward" name="ward" bind:value={d.ward} />
		<TextInput label="Level of Care" name="levelOfCare" bind:value={d.levelOfCare} placeholder="e.g. Level 1, Level 2, Level 3" />
	{/if}

	{#if d.disposition === 'discharged'}
		<h3 class="mb-3 mt-4 text-lg font-semibold text-gray-800">Discharge Details</h3>
		<TextInput label="Discharge Diagnosis" name="dischargeDiagnosis" bind:value={d.dischargeDiagnosis} />
		<TextArea label="Discharge Medications" name="dischargeMedications" bind:value={d.dischargeMedications} rows={2} />
		<TextArea label="Discharge Instructions" name="dischargeInstructions" bind:value={d.dischargeInstructions} rows={3} />
		<TextInput label="Follow-up" name="followUp" bind:value={d.followUp} placeholder="e.g. GP in 48 hours, fracture clinic 1 week" />
		<TextArea label="Return Precautions" name="returnPrecautions" bind:value={d.returnPrecautions} rows={2} placeholder="Safety-net advice for patient" />
	{/if}

	{#if d.disposition === 'transferred'}
		<h3 class="mb-3 mt-4 text-lg font-semibold text-gray-800">Transfer Details</h3>
		<TextInput label="Receiving Hospital" name="receivingHospital" bind:value={d.receivingHospital} />
		<TextInput label="Reason for Transfer" name="reasonForTransfer" bind:value={d.reasonForTransfer} />
		<TextInput label="Mode of Transfer" name="modeOfTransfer" bind:value={d.modeOfTransfer} placeholder="e.g. ambulance, helicopter" />
	{/if}

	<hr class="my-6 border-gray-200" />

	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<TextInput label="Discharge/Transfer Time" name="dischargeTime" bind:value={d.dischargeTime} type="time" />
		<TextInput label="Total Time in Department" name="totalTimeInDepartment" bind:value={d.totalTimeInDepartment} placeholder="e.g. 4h 30m" />
	</div>
</SectionCard>
