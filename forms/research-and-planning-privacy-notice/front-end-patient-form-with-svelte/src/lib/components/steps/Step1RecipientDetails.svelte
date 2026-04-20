<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';

	const rd = assessment.data.recipientDetails;
</script>

<SectionCard title="Recipient Details" description="Enter the details of the patient acknowledging the research and planning privacy notice.">
	<TextInput label="Organisation Name" name="organisationName" bind:value={rd.organisationName} placeholder="e.g. Riverside Medical Practice" required />
	<TextInput label="Recipient Name" name="recipientName" bind:value={rd.recipientName} placeholder="e.g. Mrs Jane Smith" required />
	<TextInput label="NHS Number (optional)" name="recipientNhsNumber" bind:value={rd.recipientNhsNumber} placeholder="e.g. 943 476 5919" />
	<TextInput label="Date of Birth (optional)" name="recipientDob" bind:value={rd.recipientDob} type="date" />
</SectionCard>
