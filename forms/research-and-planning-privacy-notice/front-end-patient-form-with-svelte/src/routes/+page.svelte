<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import { validateForm } from '$lib/engine/form-validator';
	import { detectAdditionalFlags } from '$lib/engine/flagged-issues';
	import { completenessColor } from '$lib/engine/utils';
	import Step1RecipientDetails from '$lib/components/steps/Step1RecipientDetails.svelte';
	import Step2ResearchPlanningPrivacyNotice from '$lib/components/steps/Step2ResearchPlanningPrivacyNotice.svelte';
	import Step3AcknowledgementSignature from '$lib/components/steps/Step3AcknowledgementSignature.svelte';

	const submitted = $derived(assessment.result !== null);

	const priorityColor: Record<string, string> = {
		high: 'bg-red-100 text-red-800 border-red-300',
		medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
		low: 'bg-gray-100 text-gray-700 border-gray-300'
	};

	function submitForm() {
		const { completeness, status, firedRules } = validateForm(assessment.data);
		const additionalFlags = detectAdditionalFlags(assessment.data);
		assessment.result = {
			completenessPercent: completeness,
			status,
			firedRules,
			additionalFlags,
			timestamp: new Date().toISOString()
		};
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	function startNew() {
		assessment.reset();
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}
</script>

<svelte:head>
	<title>Research & Planning Privacy Notice</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<header class="border-b border-nhs-blue bg-nhs-blue shadow-sm no-print">
		<div class="mx-auto max-w-2xl px-4 py-4">
			<h1 class="text-xl font-bold text-white">Research & Planning Privacy Notice</h1>
			<p class="mt-0.5 text-sm text-blue-100">
				UK GDPR / NHS National Data Opt-Out — read, record preferences, acknowledge, and sign
			</p>
		</div>
	</header>

	<main class="mx-auto max-w-2xl px-4 py-8">
		{#if submitted && assessment.result}
			<div class="mb-6 flex items-center justify-between">
				<h2 class="text-2xl font-bold text-gray-900">Acknowledgement Summary</h2>
				<div class="flex gap-3 no-print">
					<button
						onclick={() => window.print()}
						class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
					>
						Print
					</button>
					<button
						onclick={startNew}
						class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
					>
						New Form
					</button>
				</div>
			</div>

			<div
				class="mb-6 rounded-xl border-2 p-6 text-center {completenessColor(
					assessment.result.completenessPercent
				)}"
			>
				<div class="text-3xl font-bold">{assessment.result.completenessPercent}% Complete</div>
				<div class="mt-1 text-lg">{assessment.result.status}</div>
				<div class="mt-2 text-sm opacity-75">
					Generated {new Date(assessment.result.timestamp).toLocaleString()}
				</div>
			</div>

			{#if assessment.result.additionalFlags.length > 0}
				<div class="mb-6 rounded-xl border border-red-200 bg-white p-6">
					<h3 class="mb-4 text-lg font-bold text-red-800">Flagged Issues</h3>
					<div class="space-y-2">
						{#each assessment.result.additionalFlags as flag}
							<div class="flex items-start gap-3 rounded-lg border p-3 {priorityColor[flag.priority]}">
								<span class="mt-0.5 rounded px-2 py-0.5 text-xs font-bold uppercase {priorityColor[flag.priority]}">
									{flag.priority}
								</span>
								<div>
									<span class="font-medium">{flag.category}:</span>
									{flag.message}
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}

			{#if assessment.result.firedRules.length > 0}
				<div class="mb-6 rounded-xl border border-gray-200 bg-white p-6">
					<h3 class="mb-4 text-lg font-bold text-gray-900">Missing Required Fields</h3>
					<table class="w-full text-sm">
						<thead>
							<tr class="border-b text-left text-gray-600">
								<th class="pb-2 pr-4">Rule</th>
								<th class="pb-2 pr-4">Section</th>
								<th class="pb-2 pr-4">Issue</th>
								<th class="pb-2">Field</th>
							</tr>
						</thead>
						<tbody>
							{#each assessment.result.firedRules as rule}
								<tr class="border-b border-gray-100">
									<td class="py-2 pr-4 font-mono text-xs text-gray-500">{rule.id}</td>
									<td class="py-2 pr-4">{rule.section}</td>
									<td class="py-2 pr-4">{rule.description}</td>
									<td class="py-2 font-mono text-xs">{rule.field}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}

			<div class="mb-6 rounded-xl border border-gray-200 bg-white p-6">
				<h3 class="mb-4 text-lg font-bold text-gray-900">Preferences & Signature</h3>
				<div class="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
					<div>
						<span class="font-medium text-gray-600">Acknowledged: </span>
						<span class="{assessment.data.acknowledgementSignature.agreed ? 'font-bold text-green-700' : 'font-bold text-red-700'}">
							{assessment.data.acknowledgementSignature.agreed ? 'Yes' : 'No'}
						</span>
					</div>
					<div>
						<span class="font-medium text-gray-600">Type 1 opt-out: </span>
						{assessment.data.acknowledgementSignature.type1OptOut || 'N/A'}
					</div>
					<div>
						<span class="font-medium text-gray-600">National Data Opt-Out: </span>
						{assessment.data.acknowledgementSignature.nationalDataOptOut || 'N/A'}
					</div>
					<div>
						<span class="font-medium text-gray-600">Recipient Name: </span>
						{assessment.data.acknowledgementSignature.recipientTypedFullName || 'N/A'}
					</div>
					<div>
						<span class="font-medium text-gray-600">Date: </span>
						{assessment.data.acknowledgementSignature.recipientTypedDate || 'N/A'}
					</div>
					<div>
						<span class="font-medium text-gray-600">Organisation: </span>
						{assessment.data.recipientDetails.organisationName || 'N/A'}
					</div>
				</div>
			</div>
		{:else}
			<div class="mb-8">
				<Step1RecipientDetails />
			</div>

			<div class="mb-8">
				<Step2ResearchPlanningPrivacyNotice />
			</div>

			<div class="mb-8">
				<Step3AcknowledgementSignature />
			</div>

			<div class="mx-auto max-w-2xl">
				<button
					onclick={submitForm}
					class="w-full rounded-lg bg-primary px-8 py-3 text-lg font-medium text-white transition-colors hover:bg-primary-dark"
				>
					Submit Research & Planning Privacy Acknowledgement
				</button>
				<p class="mt-3 text-center text-xs text-gray-400">
					For information-governance records. Aligned with UK GDPR and the NHS National Data Opt-Out.
				</p>
			</div>
		{/if}
	</main>
</div>
