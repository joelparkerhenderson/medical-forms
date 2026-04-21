<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';

	const ack = assessment.data.acknowledgmentSignature;

	// Auto-populate today's date if not yet set
	if (!ack.patientTypedDate) {
		ack.patientTypedDate = new Date().toISOString().slice(0, 10);
	}
</script>

<SectionCard title="Acknowledgment & Signature" description="Please confirm you have read and understood the privacy notice.">
	<div class="mb-6">
		<label class="flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors {ack.agreed ? 'border-primary bg-blue-50' : 'border-gray-300 bg-white hover:bg-gray-50'}">
			<input
				type="checkbox"
				bind:checked={ack.agreed}
				class="mt-0.5 accent-primary"
			/>
			<span class="text-sm text-gray-800">
				I have read, understand, and agree to the above privacy notice. I understand how my personal information will be used for medical research, service planning, and quality of care purposes.
				<span class="text-red-500">*</span>
			</span>
		</label>
	</div>

	<TextInput label="Full Name" name="patientTypedFullName" bind:value={ack.patientTypedFullName} placeholder="Type your full name" required />
	<TextInput label="Today's Date" name="patientTypedDate" bind:value={ack.patientTypedDate} type="date" required />
</SectionCard>
