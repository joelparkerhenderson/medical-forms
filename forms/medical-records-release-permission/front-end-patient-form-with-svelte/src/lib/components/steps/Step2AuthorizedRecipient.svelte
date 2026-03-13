<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';

	const r = assessment.data.authorizedRecipient;
</script>

<SectionCard title="Authorized Recipient" description="Details of the person or organization who will receive the medical records">
	<TextInput
		label="Recipient Name"
		name="recipientName"
		bind:value={r.recipientName}
		placeholder="e.g., Dr James Wilson"
		required
	/>

	<TextInput
		label="Organization"
		name="recipientOrganization"
		bind:value={r.recipientOrganization}
		placeholder="e.g., Royal London Hospital"
		required
	/>

	<TextInput
		label="Address"
		name="recipientAddress"
		bind:value={r.recipientAddress}
		placeholder="Full postal address of the recipient"
		required
	/>

	<div class="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
		<TextInput
			label="Phone Number"
			name="recipientPhone"
			bind:value={r.recipientPhone}
			placeholder="e.g., 020 7377 7000"
		/>
		<TextInput
			label="Email Address"
			name="recipientEmail"
			type="email"
			bind:value={r.recipientEmail}
			placeholder="e.g., recipient@nhs.uk"
		/>
	</div>

	<TextInput
		label="Role / Title"
		name="recipientRole"
		bind:value={r.recipientRole}
		placeholder="e.g., Consultant Neurologist"
	/>
</SectionCard>
