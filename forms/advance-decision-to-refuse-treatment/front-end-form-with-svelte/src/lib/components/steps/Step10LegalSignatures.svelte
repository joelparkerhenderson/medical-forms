<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import { hasLifeSustainingRefusal } from '$lib/engine/utils';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const s = assessment.data.legalSignatures;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];

	const hasLS = $derived(hasLifeSustainingRefusal(assessment.data));
</script>

<SectionCard title="Legal Signatures" description="Signatures and declarations to make this ADRT legally binding">
	<div class="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
		<p class="font-bold">LEGAL REQUIREMENTS</p>
		<p class="mt-1">For this ADRT to be legally valid, it must be signed by you and witnessed. If you have refused any life-sustaining treatment, additional requirements apply as detailed below.</p>
	</div>

	<!-- Patient signature section -->
	<div class="rounded-lg border border-gray-200 p-4">
		<h3 class="mb-3 font-semibold text-gray-900">Patient Signature</h3>

		<RadioGroup
			label="I confirm that I have read and understand the contents of this ADRT"
			name="patientStatementOfUnderstanding"
			options={yesNo}
			bind:value={s.patientStatementOfUnderstanding}
			required
		/>

		<RadioGroup
			label="Patient has signed this document"
			name="patientSignature"
			options={yesNo}
			bind:value={s.patientSignature}
			required
		/>

		<TextInput label="Date of Patient Signature" name="patientSignatureDate" type="date" bind:value={s.patientSignatureDate} required />
	</div>

	<!-- Witness section -->
	<div class="mt-4 rounded-lg border border-gray-200 p-4">
		<h3 class="mb-3 font-semibold text-gray-900">Witness</h3>

		<RadioGroup
			label="Witness has signed this document"
			name="witnessSignature"
			options={yesNo}
			bind:value={s.witnessSignature}
			required
		/>

		<TextInput label="Witness Full Name" name="witnessName" bind:value={s.witnessName} required />
		<TextInput label="Witness Address" name="witnessAddress" bind:value={s.witnessAddress} />
		<TextInput label="Date of Witness Signature" name="witnessSignatureDate" type="date" bind:value={s.witnessSignatureDate} />
	</div>

	<!-- Life-sustaining treatment additional requirements -->
	{#if hasLS}
		<div class="mt-4 rounded-lg border-2 border-red-300 bg-red-50 p-4">
			<h3 class="mb-3 font-bold text-red-900">Additional Requirements for Life-Sustaining Treatment Refusal</h3>
			<p class="mb-4 text-sm text-red-800">
				Because you have refused one or more life-sustaining treatments, the following additional legal requirements must be met under the Mental Capacity Act 2005.
			</p>

			<RadioGroup
				label="I have provided a written statement that my refusal of life-sustaining treatment applies even if my life is at risk"
				name="lifeSustainingWrittenStatement"
				options={yesNo}
				bind:value={s.lifeSustainingWrittenStatement}
				required
			/>

			{#if s.lifeSustainingWrittenStatement === 'yes'}
				<TextArea
					label="Written Statement"
					name="lifeSustainingStatementText"
					bind:value={s.lifeSustainingStatementText}
					rows={4}
					placeholder="e.g. 'I understand that the treatments I have refused may be necessary to sustain my life, and I confirm that my refusal applies even if my life is at risk as a result.'"
				/>
			{/if}

			<RadioGroup
				label="Patient has signed the life-sustaining treatment refusal section"
				name="lifeSustainingSignature"
				options={yesNo}
				bind:value={s.lifeSustainingSignature}
				required
			/>

			<RadioGroup
				label="Witness has signed the life-sustaining treatment refusal section"
				name="lifeSustainingWitnessSignature"
				options={yesNo}
				bind:value={s.lifeSustainingWitnessSignature}
				required
			/>

			{#if s.lifeSustainingWitnessSignature === 'yes'}
				<TextInput label="Life-Sustaining Witness Full Name" name="lifeSustainingWitnessName" bind:value={s.lifeSustainingWitnessName} required />
				<TextInput label="Life-Sustaining Witness Address" name="lifeSustainingWitnessAddress" bind:value={s.lifeSustainingWitnessAddress} />
			{/if}
		</div>
	{/if}
</SectionCard>
