<script lang="ts">
	import { goto } from '$app/navigation';
	import { assessment } from '$lib/stores/assessment.svelte';
	import { completenessLevelLabel, completenessLevelColor, calculateAge, formatDate, placeLabel, priorityColor } from '$lib/engine/utils';
	import Badge from '$lib/components/ui/Badge.svelte';

	const data = $derived(assessment.data);
	const result = $derived(assessment.result);

	$effect(() => {
		if (!assessment.result) {
			goto('/');
		}
	});

	let pdfError = $state('');

	async function downloadPDF() {
		pdfError = '';
		try {
			const res = await fetch('/report/pdf', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ data: assessment.data, result: assessment.result })
			});
			if (res.ok) {
				const blob = await res.blob();
				const url = URL.createObjectURL(blob);
				const a = document.createElement('a');
				a.href = url;
				a.download = `advance-statement-${data.personalInformation.lastName}-${new Date().toISOString().slice(0, 10)}.pdf`;
				a.click();
				URL.revokeObjectURL(url);
			} else {
				pdfError = 'Failed to generate PDF. Please try again.';
			}
		} catch {
			pdfError = 'Failed to generate PDF. Please check your connection and try again.';
		}
	}

	function startNew() {
		assessment.reset();
		goto('/');
	}
</script>

{#if result}
	<div class="min-h-screen bg-gray-50">
		<header class="border-b border-gray-200 bg-white shadow-sm no-print">
			<div class="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
				<h1 class="text-lg font-bold text-gray-900">Advance Statement Summary</h1>
				<div class="flex gap-3">
					{#if pdfError}
						<span class="text-sm text-red-600">{pdfError}</span>
					{/if}
					<button
						onclick={downloadPDF}
						class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
					>
						Download PDF
					</button>
					<button
						onclick={() => window.print()}
						class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
					>
						Print
					</button>
					<button
						onclick={startNew}
						class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
					>
						New Statement
					</button>
				</div>
			</div>
		</header>

		<main class="mx-auto max-w-4xl px-4 py-6">
			<!-- Completeness Banner -->
			<div class="mb-6 rounded-xl border-2 p-6 text-center {completenessLevelColor(result.level)}">
				<div class="text-3xl font-bold">{completenessLevelLabel(result.level)}</div>
				<div class="mt-1 text-lg">{result.completedCount} of {result.totalCount} sections completed</div>
				<div class="mt-2 text-sm opacity-75">
					Generated {new Date(result.timestamp).toLocaleString()}
				</div>
			</div>

			<!-- Flagged Issues -->
			{#if result.flaggedIssues.length > 0}
				<div class="mb-6 rounded-xl border border-red-200 bg-white p-6">
					<h2 class="mb-4 text-lg font-bold text-red-800">Issues Requiring Attention</h2>
					<div class="space-y-2">
						{#each result.flaggedIssues as flag}
							<div class="flex items-start gap-3 rounded-lg border p-3 {priorityColor(flag.priority)}">
								<span class="mt-0.5 rounded px-2 py-0.5 text-xs font-bold uppercase {priorityColor(flag.priority)}">
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

			<!-- Missing Sections -->
			{#if result.missingSections.length > 0}
				<div class="mb-6 rounded-xl border border-gray-200 bg-white p-6">
					<h2 class="mb-4 text-lg font-bold text-gray-900">Incomplete Sections</h2>
					<div class="space-y-1 text-sm">
						{#each result.missingSections as section}
							<div class="flex items-center gap-2">
								{#if section.required}
									<span class="rounded bg-red-100 px-1.5 py-0.5 text-xs text-red-700">Required</span>
								{:else}
									<span class="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600">Optional</span>
								{/if}
								<span>{section.section}: {section.description}</span>
							</div>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Personal Information -->
			<div class="mb-6 rounded-xl border border-gray-200 bg-white p-6">
				<h2 class="mb-4 text-lg font-bold text-gray-900">Personal Information</h2>
				<div class="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
					<div>
						<span class="font-medium text-gray-600">Name:</span>
						{data.personalInformation.firstName} {data.personalInformation.lastName}
					</div>
					<div>
						<span class="font-medium text-gray-600">DOB:</span>
						{formatDate(data.personalInformation.dateOfBirth)}
						{#if calculateAge(data.personalInformation.dateOfBirth)}
							(Age {calculateAge(data.personalInformation.dateOfBirth)})
						{/if}
					</div>
					<div>
						<span class="font-medium text-gray-600">NHS Number:</span>
						{data.personalInformation.nhsNumber || 'Not provided'}
					</div>
					<div>
						<span class="font-medium text-gray-600">GP:</span>
						{data.personalInformation.gpName || 'Not provided'}
					</div>
				</div>
			</div>

			<!-- Values & Beliefs -->
			{#if data.valuesBeliefs.qualityOfLifePriorities || data.valuesBeliefs.whatMakesLifeMeaningful}
				<div class="mb-6 rounded-xl border border-gray-200 bg-white p-6">
					<h2 class="mb-4 text-lg font-bold text-gray-900">Values & Beliefs</h2>
					{#if data.valuesBeliefs.qualityOfLifePriorities}
						<div class="mb-3">
							<span class="text-sm font-medium text-gray-600">Quality of life priorities:</span>
							<p class="mt-1 text-sm">{data.valuesBeliefs.qualityOfLifePriorities}</p>
						</div>
					{/if}
					{#if data.valuesBeliefs.whatMakesLifeMeaningful}
						<div class="mb-3">
							<span class="text-sm font-medium text-gray-600">What makes life meaningful:</span>
							<p class="mt-1 text-sm">{data.valuesBeliefs.whatMakesLifeMeaningful}</p>
						</div>
					{/if}
				</div>
			{/if}

			<!-- Care Preferences -->
			<div class="mb-6 rounded-xl border border-gray-200 bg-white p-6">
				<h2 class="mb-4 text-lg font-bold text-gray-900">Care Preferences</h2>
				<div class="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
					<div>
						<span class="font-medium text-gray-600">Preferred place of care:</span>
						{placeLabel(data.carePreferences.preferredPlaceOfCare)}
					</div>
					<div>
						<span class="font-medium text-gray-600">Preferred place of death:</span>
						{placeLabel(data.carePreferences.preferredPlaceOfDeath)}
					</div>
				</div>
			</div>

			<!-- Medical Treatment Wishes -->
			{#if data.medicalTreatmentWishes.resuscitationWishes || data.medicalTreatmentWishes.painManagementPreferences}
				<div class="mb-6 rounded-xl border border-gray-200 bg-white p-6">
					<h2 class="mb-4 text-lg font-bold text-gray-900">Medical Treatment Wishes</h2>
					{#if data.medicalTreatmentWishes.resuscitationWishes}
						<div class="mb-3">
							<span class="text-sm font-medium text-gray-600">Resuscitation wishes:</span>
							<p class="mt-1 text-sm">{data.medicalTreatmentWishes.resuscitationWishes}</p>
						</div>
					{/if}
					{#if data.medicalTreatmentWishes.painManagementPreferences}
						<div class="mb-3">
							<span class="text-sm font-medium text-gray-600">Pain management:</span>
							<p class="mt-1 text-sm">{data.medicalTreatmentWishes.painManagementPreferences}</p>
						</div>
					{/if}
				</div>
			{/if}

			<!-- People Important to Me -->
			{#if data.peopleImportantToMe.people.length > 0}
				<div class="mb-6 rounded-xl border border-gray-200 bg-white p-6">
					<h2 class="mb-4 text-lg font-bold text-gray-900">People Important to Me</h2>
					<div class="space-y-2 text-sm">
						{#each data.peopleImportantToMe.people as person}
							{#if person.name}
								<div class="rounded-lg border border-gray-100 bg-gray-50 p-3">
									<div class="font-medium">{person.name} ({person.relationship})</div>
									{#if person.telephone}<div class="text-gray-600">Tel: {person.telephone}</div>{/if}
									{#if person.role}<div class="text-gray-600">Role: {person.role}</div>{/if}
								</div>
							{/if}
						{/each}
					</div>
				</div>
			{/if}

			<!-- Signatures -->
			<div class="mb-6 rounded-xl border border-gray-200 bg-white p-6">
				<h2 class="mb-4 text-lg font-bold text-gray-900">Signatures</h2>
				<div class="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
					<div>
						<span class="font-medium text-gray-600">Patient signed:</span>
						{data.signaturesWitnesses.patientSignature ? 'Yes' : 'No'}
						{#if data.signaturesWitnesses.patientSignatureDate}
							({formatDate(data.signaturesWitnesses.patientSignatureDate)})
						{/if}
					</div>
					<div>
						<span class="font-medium text-gray-600">Witnessed:</span>
						{data.signaturesWitnesses.witnessName ? `Yes (${data.signaturesWitnesses.witnessName})` : 'No'}
					</div>
					<div>
						<span class="font-medium text-gray-600">Review date:</span>
						{data.signaturesWitnesses.reviewDate ? formatDate(data.signaturesWitnesses.reviewDate) : 'Not set'}
					</div>
					<div>
						<span class="font-medium text-gray-600">HCP acknowledged:</span>
						{data.signaturesWitnesses.healthcareProfessionalName ? `Yes (${data.signaturesWitnesses.healthcareProfessionalName})` : 'No'}
					</div>
				</div>
			</div>
		</main>
	</div>
{/if}
