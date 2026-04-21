<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';

	const ack = assessment.data.acknowledgment;

	if (!ack.patientTypedDate) {
		ack.patientTypedDate = new Date().toISOString().slice(0, 10);
	}
</script>

<SectionCard title="Acknowledgment & Signature" description="Please confirm you have read and understood the legal requirements privacy notice.">
	<div class="mb-6">
		<label class="flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors {ack.agreed ? 'border-primary bg-blue-50' : 'border-gray-300 bg-white hover:bg-gray-50'}">
			<input
				type="checkbox"
				bind:checked={ack.agreed}
				class="mt-0.5 accent-primary"
			/>
			<span class="text-sm text-gray-800">
				I have read and understood the above legal requirements privacy notice. I understand the disclosures named above are required by law.
				<span class="text-red-500">*</span>
			</span>
		</label>
	</div>

	<TextInput label="Full Name" name="patientTypedFullName" bind:value={ack.patientTypedFullName} placeholder="Type your full name" required />
	<TextInput label="Today's Date" name="patientTypedDate" bind:value={ack.patientTypedDate} type="date" required />
</SectionCard>
