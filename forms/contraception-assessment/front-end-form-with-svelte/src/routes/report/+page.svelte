<script lang="ts">
	import { goto } from '$app/navigation';
	import { assessment } from '$lib/stores/assessment.svelte';
	import { ukmecLabel, ukmecColor, ukmecCategory, calculateAge } from '$lib/engine/utils';
	import { methodLabels } from '$lib/engine/ukmec-rules';

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
				a.download = `contraception-assessment-${data.demographics.lastName}-${new Date().toISOString().slice(0, 10)}.pdf`;
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
</script>

{#if result}
	<div class="min-h-screen bg-gray-50">
		<header class="border-b border-gray-200 bg-white shadow-sm no-print">
			<div class="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
				<h1 class="text-lg font-bold text-gray-900">Assessment Report</h1>
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
			<!-- Overall UKMEC Banner -->
			<div class="mb-6 rounded-xl border-2 p-6 text-center {ukmecColor(result.overallHighestCategory)}">
				<div class="text-3xl font-bold">UKMEC Category {result.overallHighestCategory}</div>
				<div class="mt-1 text-lg">{ukmecCategory(result.overallHighestCategory)}</div>
				{#if result.preferredMethodCategory !== null}
					<div class="mt-2 text-sm opacity-75">
						Preferred method: UKMEC {result.preferredMethodCategory} - {ukmecCategory(result.preferredMethodCategory)}
					</div>
				{/if}
				<div class="mt-2 text-sm opacity-75">
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

			<!-- UKMEC Results by Method -->
			<div class="mb-6 rounded-xl border border-gray-200 bg-white p-6">
				<h2 class="mb-4 text-lg font-bold text-gray-900">UKMEC Categories by Method</h2>
				<table class="w-full text-sm">
					<thead>
						<tr class="border-b text-left text-gray-600">
							<th class="pb-2 pr-4">Method</th>
							<th class="pb-2 pr-4">Category</th>
							<th class="pb-2">Eligibility</th>
						</tr>
					</thead>
					<tbody>
						{#each result.ukmecResults as methodResult}
							<tr class="border-b border-gray-100">
								<td class="py-2 pr-4 font-medium">{methodResult.methodLabel}</td>
								<td class="py-2 pr-4">
									<span class="inline-block rounded-full border px-3 py-0.5 text-xs font-bold {ukmecColor(methodResult.category)}">
										UKMEC {methodResult.category}
									</span>
								</td>
								<td class="py-2 text-gray-600">{ukmecCategory(methodResult.category)}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>

			<!-- UKMEC Fired Rules Breakdown -->
			{#if result.firedRules.length > 0}
				<div class="mb-6 rounded-xl border border-gray-200 bg-white p-6">
					<h2 class="mb-4 text-lg font-bold text-gray-900">UKMEC Rule Details</h2>
					<table class="w-full text-sm">
						<thead>
							<tr class="border-b text-left text-gray-600">
								<th class="pb-2 pr-4">Rule ID</th>
								<th class="pb-2 pr-4">Condition</th>
								<th class="pb-2 pr-4">Detail</th>
								<th class="pb-2">Category</th>
							</tr>
						</thead>
						<tbody>
							{#each result.firedRules as rule}
								<tr class="border-b border-gray-100">
									<td class="py-2 pr-4 font-mono text-xs text-gray-500">{rule.id}</td>
									<td class="py-2 pr-4">{rule.domain}</td>
									<td class="py-2 pr-4">{rule.description}</td>
									<td class="py-2 font-bold">UKMEC {rule.score}</td>
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
						{data.demographics.firstName} {data.demographics.lastName}
					</div>
					<div>
						<span class="font-medium text-gray-600">DOB:</span>
						{data.demographics.dateOfBirth}
						{#if calculateAge(data.demographics.dateOfBirth)}
							(Age {calculateAge(data.demographics.dateOfBirth)})
						{/if}
					</div>
					<div>
						<span class="font-medium text-gray-600">Sex:</span>
						{data.demographics.sex}
					</div>
					<div>
						<span class="font-medium text-gray-600">Current Method:</span>
						{data.currentContraception.currentMethod ? (methodLabels[data.currentContraception.currentMethod] || data.currentContraception.currentMethod) : 'None'}
					</div>
					{#if data.preferencesPriorities.preferredMethod}
						<div class="sm:col-span-2">
							<span class="font-medium text-gray-600">Preferred Method:</span>
							{methodLabels[data.preferencesPriorities.preferredMethod] || data.preferencesPriorities.preferredMethod}
						</div>
					{/if}
					<div>
						<span class="font-medium text-gray-600">BMI:</span>
						{data.cardiovascularRisk.bmi ?? 'N/A'}
					</div>
					<div>
						<span class="font-medium text-gray-600">Blood Pressure:</span>
						{data.cardiovascularRisk.bloodPressureSystolic ?? '?'}/{data.cardiovascularRisk.bloodPressureDiastolic ?? '?'} mmHg
					</div>
				</div>
			</div>
		</main>
	</div>
{/if}
