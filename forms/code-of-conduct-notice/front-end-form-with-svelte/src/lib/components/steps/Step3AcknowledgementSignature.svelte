<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';

	const ack = assessment.data.acknowledgementSignature;

	// Auto-populate today's date if not yet set
	if (!ack.recipientTypedDate) {
		ack.recipientTypedDate = new Date().toISOString().slice(0, 10);
	}
</script>

<SectionCard title="Acknowledgement & Signature" description="Please confirm you have read and understood the code of conduct.">
	<div class="mb-6">
		<label class="flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors {ack.agreed ? 'border-primary bg-blue-50' : 'border-gray-300 bg-white hover:bg-gray-50'}">
			<input
				type="checkbox"
				bind:checked={ack.agreed}
				class="mt-0.5 accent-primary"
			/>
			<span class="text-sm text-gray-800">
				I have read, understood, and agree to uphold the above Code of Conduct principles. I will abide by these principles in every professional interaction with patients and colleagues.
				<span class="text-red-500">*</span>
			</span>
		</label>
	</div>

	<TextInput label="Full Name" name="recipientTypedFullName" bind:value={ack.recipientTypedFullName} placeholder="Type your full name" required />
	<TextInput label="Today's Date" name="recipientTypedDate" bind:value={ack.recipientTypedDate} type="date" required />
</SectionCard>
