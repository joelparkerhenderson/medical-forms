<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';

	const rd = assessment.data.recipientDetails;
</script>

<SectionCard title="Recipient Details" description="Enter the details of the person acknowledging the code of conduct.">
	<TextInput label="Organisation Name" name="organisationName" bind:value={rd.organisationName} placeholder="e.g. Riverside Medical Practice" required />
	<TextInput label="Recipient Name" name="recipientName" bind:value={rd.recipientName} placeholder="e.g. Dr Jane Smith" required />
	<TextInput label="Recipient Role" name="recipientRole" bind:value={rd.recipientRole} placeholder="e.g. General Practitioner, Healthcare Assistant, Contractor" required />
	<TextInput label="Employee / Contractor ID (optional)" name="recipientEmployeeId" bind:value={rd.recipientEmployeeId} placeholder="e.g. 4827" />
</SectionCard>
