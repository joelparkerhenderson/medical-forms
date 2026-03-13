<script lang="ts">
	import { goto } from '$app/navigation';
	import { assessment } from '$lib/stores/assessment.svelte';
	import { riskCategoryLabel, riskCategoryColor } from '$lib/engine/utils';
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
				a.download = `prevent-cvd-risk-${data.patientInformation.fullName.replace(/\s+/g, '-') || 'report'}-${new Date().toISOString().slice(0, 10)}.pdf`;
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

	const riskLevelColor: Record<string, string> = {
		high: 'text-red-700 bg-red-50',
		medium: 'text-yellow-700 bg-yellow-50',
		low: 'text-green-700 bg-green-50'
	};
</script>

{#if result}
	<div class="min-h-screen bg-gray-50">
		<header class="border-b border-gray-200 bg-white shadow-sm no-print">
			<div class="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
				<h1 class="text-lg font-bold text-gray-900">PREVENT CVD Risk Report</h1>
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
						New Assessment
					</button>
				</div>
			</div>
		</header>

		<main class="mx-auto max-w-4xl px-4 py-6">
			<!-- Risk Category Banner -->
			<div class="mb-6 rounded-xl border-2 p-6 text-center {riskCategoryColor(result.riskCategory)}">
				<div class="text-lg font-medium uppercase tracking-wide">{riskCategoryLabel(result.riskCategory)}</div>
				<div class="mt-3 flex items-center justify-center gap-8">
					<div>
						<div class="text-4xl font-bold">{result.tenYearRiskPercent}%</div>
						<div class="mt-1 text-sm opacity-75">10-Year Risk</div>
					</div>
					<div class="h-12 w-px bg-current opacity-25"></div>
					<div>
						<div class="text-4xl font-bold">{result.thirtyYearRiskPercent}%</div>
						<div class="mt-1 text-sm opacity-75">30-Year Risk</div>
					</div>
				</div>
				<div class="mt-3 text-sm opacity-75">
					Generated {new Date(result.timestamp).toLocaleString()}
				</div>
			</div>

			<!-- Additional Flags -->
			{#if result.additionalFlags.length > 0}
				<div class="mb-6 rounded-xl border border-red-200 bg-white p-6">
					<h2 class="mb-4 text-lg font-bold text-red-800">Flagged Issues for Clinician</h2>
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

			<!-- Fired Rules -->
			{#if result.firedRules.length > 0}
				<div class="mb-6 rounded-xl border border-gray-200 bg-white p-6">
					<h2 class="mb-4 text-lg font-bold text-gray-900">Risk Rules Triggered</h2>
					<table class="w-full text-sm">
						<thead>
							<tr class="border-b text-left text-gray-600">
								<th class="pb-2 pr-4">Rule</th>
								<th class="pb-2 pr-4">Category</th>
								<th class="pb-2 pr-4">Description</th>
								<th class="pb-2">Level</th>
							</tr>
						</thead>
						<tbody>
							{#each result.firedRules as rule}
								<tr class="border-b border-gray-100">
									<td class="py-2 pr-4 font-mono text-xs text-gray-500">{rule.id}</td>
									<td class="py-2 pr-4">{rule.category}</td>
									<td class="py-2 pr-4">{rule.description}</td>
									<td class="py-2">
										<span class="rounded px-2 py-0.5 text-xs font-bold uppercase {riskLevelColor[rule.riskLevel] ?? 'text-gray-600 bg-gray-50'}">
											{rule.riskLevel}
										</span>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}

			<!-- Patient Summary -->
			<div class="mb-6 rounded-xl border border-gray-200 bg-white p-6">
				<h2 class="mb-4 text-lg font-bold text-gray-900">Patient Summary</h2>
				<div class="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
					<div>
						<span class="font-medium text-gray-600">Name:</span>
						{data.patientInformation.fullName || 'N/A'}
					</div>
					<div>
						<span class="font-medium text-gray-600">DOB:</span>
						{data.patientInformation.dateOfBirth || 'N/A'}
					</div>
					<div>
						<span class="font-medium text-gray-600">NHS Number:</span>
						{data.patientInformation.nhsNumber || 'N/A'}
					</div>
					<div>
						<span class="font-medium text-gray-600">GP:</span>
						{data.patientInformation.gpName || 'N/A'}
						{#if data.patientInformation.gpPractice}
							({data.patientInformation.gpPractice})
						{/if}
					</div>
					<div>
						<span class="font-medium text-gray-600">Age / Sex:</span>
						{data.demographics.age ?? 'N/A'} / {data.demographics.sex || 'N/A'}
					</div>
					<div>
						<span class="font-medium text-gray-600">Ethnicity:</span>
						{data.demographics.ethnicity || 'N/A'}
					</div>
				</div>
			</div>

			<!-- Clinical Data Summary -->
			<div class="mb-6 rounded-xl border border-gray-200 bg-white p-6">
				<h2 class="mb-4 text-lg font-bold text-gray-900">Clinical Data</h2>
				<div class="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
					<div>
						<span class="font-medium text-gray-600">Systolic BP:</span>
						{data.bloodPressure.systolicBp !== null ? `${data.bloodPressure.systolicBp} mmHg` : 'N/A'}
					</div>
					<div>
						<span class="font-medium text-gray-600">Diastolic BP:</span>
						{data.bloodPressure.diastolicBp !== null ? `${data.bloodPressure.diastolicBp} mmHg` : 'N/A'}
					</div>
					<div>
						<span class="font-medium text-gray-600">On Antihypertensive:</span>
						{data.bloodPressure.onAntihypertensive || 'N/A'}
					</div>
					<div>
						<span class="font-medium text-gray-600">Total Cholesterol:</span>
						{data.cholesterolLipids.totalCholesterol !== null ? `${data.cholesterolLipids.totalCholesterol} mg/dL` : 'N/A'}
					</div>
					<div>
						<span class="font-medium text-gray-600">HDL Cholesterol:</span>
						{data.cholesterolLipids.hdlCholesterol !== null ? `${data.cholesterolLipids.hdlCholesterol} mg/dL` : 'N/A'}
					</div>
					<div>
						<span class="font-medium text-gray-600">LDL Cholesterol:</span>
						{data.cholesterolLipids.ldlCholesterol !== null ? `${data.cholesterolLipids.ldlCholesterol} mg/dL` : 'N/A'}
					</div>
					<div>
						<span class="font-medium text-gray-600">On Statin:</span>
						{data.cholesterolLipids.onStatin || 'N/A'}
					</div>
					<div>
						<span class="font-medium text-gray-600">Diabetes:</span>
						{data.metabolicHealth.hasDiabetes || 'N/A'}
						{#if data.metabolicHealth.diabetesType}
							({data.metabolicHealth.diabetesType})
						{/if}
					</div>
					<div>
						<span class="font-medium text-gray-600">HbA1c:</span>
						{data.metabolicHealth.hba1cValue !== null ? `${data.metabolicHealth.hba1cValue} ${data.metabolicHealth.hba1cUnit || ''}` : 'N/A'}
					</div>
					<div>
						<span class="font-medium text-gray-600">BMI:</span>
						{data.metabolicHealth.bmi !== null ? data.metabolicHealth.bmi : 'N/A'}
					</div>
					<div>
						<span class="font-medium text-gray-600">eGFR:</span>
						{data.renalFunction.egfr !== null ? `${data.renalFunction.egfr} mL/min` : 'N/A'}
					</div>
					<div>
						<span class="font-medium text-gray-600">Urine ACR:</span>
						{data.renalFunction.urineAcr !== null ? `${data.renalFunction.urineAcr} mg/g` : 'N/A'}
					</div>
					<div>
						<span class="font-medium text-gray-600">Smoking Status:</span>
						{data.smokingHistory.smokingStatus || 'N/A'}
					</div>
					<div>
						<span class="font-medium text-gray-600">Known CVD:</span>
						{data.medicalHistory.hasKnownCvd || 'N/A'}
					</div>
					<div>
						<span class="font-medium text-gray-600">Atrial Fibrillation:</span>
						{data.medicalHistory.atrialFibrillation || 'N/A'}
					</div>
					<div>
						<span class="font-medium text-gray-600">Family CVD History:</span>
						{data.medicalHistory.familyCvdHistory || 'N/A'}
					</div>
				</div>
			</div>

			<!-- Clinical Notes -->
			{#if data.reviewCalculate.clinicalNotes}
				<div class="mb-6 rounded-xl border border-gray-200 bg-white p-6">
					<h2 class="mb-4 text-lg font-bold text-gray-900">Clinical Notes</h2>
					<p class="whitespace-pre-wrap text-sm text-gray-700">{data.reviewCalculate.clinicalNotes}</p>
					{#if data.reviewCalculate.clinicianName}
						<p class="mt-3 text-sm text-gray-500">
							Reviewed by: {data.reviewCalculate.clinicianName}
							{#if data.reviewCalculate.reviewDate}
								on {data.reviewCalculate.reviewDate}
							{/if}
						</p>
					{/if}
				</div>
			{/if}
		</main>
	</div>
{/if}
