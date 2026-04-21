<script lang="ts">
	import { goto } from '$app/navigation';
	import { assessment } from '$lib/stores/assessment.svelte';
	import { validityStatusLabel, validityStatusColor, calculateAge, hasLifeSustainingRefusal } from '$lib/engine/utils';
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
				a.download = `adrt-${data.personalInformation.fullLegalName.replace(/\s+/g, '-')}-${new Date().toISOString().slice(0, 10)}.pdf`;
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

	const priorityColor: Record<string, string> = {
		high: 'bg-red-100 text-red-800 border-red-300',
		medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
		low: 'bg-gray-100 text-gray-700 border-gray-300'
	};

	const severityColor: Record<string, string> = {
		critical: 'bg-red-100 text-red-800 border-red-300',
		required: 'bg-orange-100 text-orange-800 border-orange-300',
		recommended: 'bg-blue-100 text-blue-800 border-blue-300'
	};
</script>

{#if result}
	<div class="min-h-screen bg-gray-50">
		<header class="border-b border-gray-200 bg-white shadow-sm no-print">
			<div class="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
				<h1 class="text-lg font-bold text-gray-900">ADRT Report</h1>
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
						New ADRT
					</button>
				</div>
			</div>
		</header>

		<main class="mx-auto max-w-4xl px-4 py-6">
			<!-- Validity Status Banner -->
			<div class="mb-6 rounded-xl border-2 p-6 text-center {validityStatusColor(result.validityStatus)}">
				<div class="text-3xl font-bold">{validityStatusLabel(result.validityStatus)}</div>
				<div class="mt-2 text-sm opacity-75">
					Generated {new Date(result.timestamp).toLocaleString()}
				</div>
			</div>

			<!-- Additional Flags -->
			{#if result.additionalFlags.length > 0}
				<div class="mb-6 rounded-xl border border-red-200 bg-white p-6">
					<h2 class="mb-4 text-lg font-bold text-red-800">Flagged Issues for Review</h2>
					<div class="space-y-2">
						{#each result.additionalFlags as flag}
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

			<!-- Validity Rules -->
			{#if result.firedRules.length > 0}
				<div class="mb-6 rounded-xl border border-gray-200 bg-white p-6">
					<h2 class="mb-4 text-lg font-bold text-gray-900">Validity Issues</h2>
					<table class="w-full text-sm">
						<thead>
							<tr class="border-b text-left text-gray-600">
								<th class="pb-2 pr-4">Rule</th>
								<th class="pb-2 pr-4">Category</th>
								<th class="pb-2 pr-4">Issue</th>
								<th class="pb-2">Severity</th>
							</tr>
						</thead>
						<tbody>
							{#each result.firedRules as rule}
								<tr class="border-b border-gray-100">
									<td class="py-2 pr-4 font-mono text-xs text-gray-500">{rule.id}</td>
									<td class="py-2 pr-4">{rule.category}</td>
									<td class="py-2 pr-4">{rule.description}</td>
									<td class="py-2">
										<span class="inline-block rounded-full border px-3 py-1 text-xs font-bold {severityColor[rule.severity]}">
											{rule.severity}
										</span>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}

			<!-- Personal Information Summary -->
			<div class="mb-6 rounded-xl border border-gray-200 bg-white p-6">
				<h2 class="mb-4 text-lg font-bold text-gray-900">Personal Information</h2>
				<div class="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
					<div>
						<span class="font-medium text-gray-600">Full Legal Name:</span>
						{data.personalInformation.fullLegalName || 'Not provided'}
					</div>
					<div>
						<span class="font-medium text-gray-600">DOB:</span>
						{data.personalInformation.dateOfBirth || 'Not provided'}
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

			<!-- Treatments Refused -->
			<div class="mb-6 rounded-xl border border-gray-200 bg-white p-6">
				<h2 class="mb-4 text-lg font-bold text-gray-900">Treatments Refused</h2>

				<h3 class="mb-2 font-semibold text-gray-700">General Treatments</h3>
				<ul class="mb-4 list-disc space-y-1 pl-5 text-sm">
					{#if data.treatmentsRefusedGeneral.antibiotics.refused === 'yes'}
						<li>Antibiotics: {data.treatmentsRefusedGeneral.antibiotics.specification || 'No specification'}</li>
					{/if}
					{#if data.treatmentsRefusedGeneral.bloodTransfusion.refused === 'yes'}
						<li>Blood Transfusion: {data.treatmentsRefusedGeneral.bloodTransfusion.specification || 'No specification'}</li>
					{/if}
					{#if data.treatmentsRefusedGeneral.ivFluids.refused === 'yes'}
						<li>IV Fluids: {data.treatmentsRefusedGeneral.ivFluids.specification || 'No specification'}</li>
					{/if}
					{#if data.treatmentsRefusedGeneral.tubeFeeding.refused === 'yes'}
						<li>Tube Feeding: {data.treatmentsRefusedGeneral.tubeFeeding.specification || 'No specification'}</li>
					{/if}
					{#if data.treatmentsRefusedGeneral.dialysis.refused === 'yes'}
						<li>Dialysis: {data.treatmentsRefusedGeneral.dialysis.specification || 'No specification'}</li>
					{/if}
					{#if data.treatmentsRefusedGeneral.ventilation.refused === 'yes'}
						<li>Ventilation: {data.treatmentsRefusedGeneral.ventilation.specification || 'No specification'}</li>
					{/if}
					{#each data.treatmentsRefusedGeneral.otherTreatments as t}
						{#if t.refused === 'yes'}
							<li>{t.treatment}: {t.specification || 'No specification'}</li>
						{/if}
					{/each}
				</ul>

				{#if hasLifeSustainingRefusal(data)}
					<h3 class="mb-2 font-semibold text-red-700">Life-Sustaining Treatments (Legally Binding)</h3>
					<ul class="list-disc space-y-1 pl-5 text-sm">
						{#if data.treatmentsRefusedLifeSustaining.cpr.refused === 'yes'}
							<li class="text-red-800">
								CPR {data.treatmentsRefusedLifeSustaining.cpr.evenIfLifeAtRisk === 'yes' ? '(even if life is at risk)' : ''}
								- {data.treatmentsRefusedLifeSustaining.cpr.specification || 'No specification'}
							</li>
						{/if}
						{#if data.treatmentsRefusedLifeSustaining.mechanicalVentilation.refused === 'yes'}
							<li class="text-red-800">
								Mechanical Ventilation {data.treatmentsRefusedLifeSustaining.mechanicalVentilation.evenIfLifeAtRisk === 'yes' ? '(even if life is at risk)' : ''}
								- {data.treatmentsRefusedLifeSustaining.mechanicalVentilation.specification || 'No specification'}
							</li>
						{/if}
						{#if data.treatmentsRefusedLifeSustaining.artificialNutritionHydration.refused === 'yes'}
							<li class="text-red-800">
								Artificial Nutrition/Hydration {data.treatmentsRefusedLifeSustaining.artificialNutritionHydration.evenIfLifeAtRisk === 'yes' ? '(even if life is at risk)' : ''}
								- {data.treatmentsRefusedLifeSustaining.artificialNutritionHydration.specification || 'No specification'}
							</li>
						{/if}
						{#each data.treatmentsRefusedLifeSustaining.otherLifeSustaining as t}
							{#if t.refused === 'yes'}
								<li class="text-red-800">
									{t.treatment} {t.evenIfLifeAtRisk === 'yes' ? '(even if life is at risk)' : ''}
									- {t.specification || 'No specification'}
								</li>
							{/if}
						{/each}
					</ul>
				{/if}
			</div>

			<!-- Signature Status -->
			<div class="mb-6 rounded-xl border border-gray-200 bg-white p-6">
				<h2 class="mb-4 text-lg font-bold text-gray-900">Signature Status</h2>
				<div class="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
					<div>
						<span class="font-medium text-gray-600">Patient Signed:</span>
						<span class="{data.legalSignatures.patientSignature === 'yes' ? 'text-green-700' : 'text-red-700'} font-semibold">
							{data.legalSignatures.patientSignature === 'yes' ? 'Yes' : 'No'}
						</span>
					</div>
					<div>
						<span class="font-medium text-gray-600">Witness Signed:</span>
						<span class="{data.legalSignatures.witnessSignature === 'yes' ? 'text-green-700' : 'text-red-700'} font-semibold">
							{data.legalSignatures.witnessSignature === 'yes' ? 'Yes' : 'No'}
						</span>
					</div>
					{#if hasLifeSustainingRefusal(data)}
						<div>
							<span class="font-medium text-gray-600">Life-Sustaining Witness:</span>
							<span class="{data.legalSignatures.lifeSustainingWitnessSignature === 'yes' ? 'text-green-700' : 'text-red-700'} font-semibold">
								{data.legalSignatures.lifeSustainingWitnessSignature === 'yes' ? 'Yes' : 'No'}
							</span>
						</div>
						<div>
							<span class="font-medium text-gray-600">"Even if life at risk" Statement:</span>
							<span class="{data.legalSignatures.lifeSustainingWrittenStatement === 'yes' ? 'text-green-700' : 'text-red-700'} font-semibold">
								{data.legalSignatures.lifeSustainingWrittenStatement === 'yes' ? 'Yes' : 'No'}
							</span>
						</div>
					{/if}
				</div>
			</div>
		</main>
	</div>
{/if}
