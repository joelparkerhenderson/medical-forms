<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';

	const ack = assessment.data.acknowledgementSignature;

	if (!ack.recipientTypedDate) {
		ack.recipientTypedDate = new Date().toISOString().slice(0, 10);
	}
</script>

<SectionCard title="Opt-Out Preference, Acknowledgement & Signature" description="Record your Type 1 and National Data Opt-Out preferences, then acknowledge and sign.">
	<fieldset class="mb-5 rounded-lg border border-gray-200 p-4">
		<legend class="px-2 text-sm font-medium text-gray-700">Type 1 opt-out (from this practice)</legend>
		<label class="mb-2 flex cursor-pointer items-center gap-3">
			<input type="radio" bind:group={ack.type1OptOut} value="opt-in" class="accent-primary" />
			<span class="text-sm">Opt in — I consent to my information being used for research and planning purposes</span>
		</label>
		<label class="flex cursor-pointer items-center gap-3">
			<input type="radio" bind:group={ack.type1OptOut} value="opt-out" class="accent-primary" />
			<span class="text-sm">Opt out — I do not want my identifiable information shared from this practice for research or planning</span>
		</label>
	</fieldset>

	<fieldset class="mb-5 rounded-lg border border-gray-200 p-4">
		<legend class="px-2 text-sm font-medium text-gray-700">NHS National Data Opt-Out</legend>
		<label class="mb-2 flex cursor-pointer items-center gap-3">
			<input type="radio" bind:group={ack.nationalDataOptOut} value="opt-in" class="accent-primary" />
			<span class="text-sm">Opt in — I allow my confidential patient information to be used for research and planning across the NHS</span>
		</label>
		<label class="flex cursor-pointer items-center gap-3">
			<input type="radio" bind:group={ack.nationalDataOptOut} value="opt-out" class="accent-primary" />
			<span class="text-sm">Opt out — I do not want my data used beyond my individual care and treatment</span>
		</label>
	</fieldset>

	<div class="mb-6">
		<label class="flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors {ack.agreed ? 'border-primary bg-blue-50' : 'border-gray-300 bg-white hover:bg-gray-50'}">
			<input
				type="checkbox"
				bind:checked={ack.agreed}
				class="mt-0.5 accent-primary"
			/>
			<span class="text-sm text-gray-800">
				I confirm I have read and understood the research and planning privacy notice and my opt-out choices above.
				<span class="text-red-500">*</span>
			</span>
		</label>
	</div>

	<TextInput label="Full Name" name="recipientTypedFullName" bind:value={ack.recipientTypedFullName} placeholder="Type your full name" required />
	<TextInput label="Today's Date" name="recipientTypedDate" bind:value={ack.recipientTypedDate} type="date" required />
</SectionCard>
