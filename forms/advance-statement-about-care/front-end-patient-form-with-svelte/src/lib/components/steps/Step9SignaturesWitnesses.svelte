<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const sw = assessment.data.signaturesWitnesses;
</script>

<SectionCard title="Signatures & Witnesses" description="Signing and witnessing your advance statement to confirm its validity">
	<div class="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
		<strong>About signing:</strong> Your advance statement is a record of your wishes. While it
		does not need to be witnessed to be valid, having a witness and healthcare professional
		acknowledgement strengthens the document and helps ensure your wishes are respected.
	</div>

	<div class="border-b border-gray-200 pb-4 mb-4">
		<h3 class="mb-3 text-sm font-semibold text-gray-700">Patient Signature</h3>
		<TextInput
			label="Your signature (type your full name)"
			name="patientSignature"
			bind:value={sw.patientSignature}
			placeholder="Type your full name as your signature"
			required
		/>
		<TextInput
			label="Date"
			name="patientSignatureDate"
			type="date"
			bind:value={sw.patientSignatureDate}
			required
		/>
	</div>

	<div class="border-b border-gray-200 pb-4 mb-4">
		<h3 class="mb-3 text-sm font-semibold text-gray-700">Witness Details</h3>
		<TextInput label="Witness name" name="witnessName" bind:value={sw.witnessName} />
		<TextInput label="Witness address" name="witnessAddress" bind:value={sw.witnessAddress} />
		<TextInput
			label="Witness signature (type full name)"
			name="witnessSignature"
			bind:value={sw.witnessSignature}
			placeholder="Type full name as signature"
		/>
		<TextInput label="Witness signature date" name="witnessSignatureDate" type="date" bind:value={sw.witnessSignatureDate} />
	</div>

	<div class="border-b border-gray-200 pb-4 mb-4">
		<h3 class="mb-3 text-sm font-semibold text-gray-700">Review Date</h3>
		<TextInput
			label="When should this statement be reviewed?"
			name="reviewDate"
			type="date"
			bind:value={sw.reviewDate}
		/>
		<p class="mt-1 text-xs text-gray-500">
			It is recommended to review your advance statement at least once a year, or when your circumstances change.
		</p>
	</div>

	<div>
		<h3 class="mb-3 text-sm font-semibold text-gray-700">Healthcare Professional Acknowledgement</h3>
		<TextInput label="Healthcare professional name" name="hcpName" bind:value={sw.healthcareProfessionalName} />
		<TextInput label="Role / position" name="hcpRole" bind:value={sw.healthcareProfessionalRole} placeholder="e.g. General Practitioner, Consultant" />
		<TextInput
			label="Healthcare professional signature (type full name)"
			name="hcpSignature"
			bind:value={sw.healthcareProfessionalSignature}
			placeholder="Type full name as signature"
		/>
		<TextInput label="Date" name="hcpDate" type="date" bind:value={sw.healthcareProfessionalDate} />
	</div>
</SectionCard>
