<script lang="ts">
	import { goto } from '$app/navigation';
	import { assessment } from '$lib/stores/assessment.svelte';
	import { tinettiScoreLabel, tinettiScoreColor, calculateAge, tugCategory, tugScoreColor } from '$lib/engine/utils';

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
				a.download = `mobility-assessment-${data.demographics.lastName}-${new Date().toISOString().slice(0, 10)}.pdf`;
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
			<!-- Tinetti Score Banner -->
			<div class="mb-6 rounded-xl border-2 p-6 text-center {tinettiScoreColor(result.tinettiTotal)}">
				<div class="text-3xl font-bold">Tinetti {result.tinettiTotal}/28</div>
				<div class="mt-1 text-lg">Balance: {result.balanceScore}/16 | Gait: {result.gaitScore}/12</div>
				<div class="mt-1 text-lg font-semibold">{result.tinettiCategory}</div>
				<div class="mt-2 text-sm opacity-75">
					Generated {new Date(result.timestamp).toLocaleString()}
				</div>
			</div>

			<!-- TUG Result -->
			{#if data.timedUpAndGo.timeSeconds !== null}
				<div class="mb-6 rounded-xl border-2 p-4 text-center {tugScoreColor(data.timedUpAndGo.timeSeconds)}">
					<div class="text-xl font-bold">TUG: {data.timedUpAndGo.timeSeconds}s</div>
					<div class="text-sm">{tugCategory(data.timedUpAndGo.timeSeconds)}</div>
				</div>
			{/if}

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

			<!-- Tinetti Breakdown -->
			{#if result.firedRules.length > 0}
				<div class="mb-6 rounded-xl border border-gray-200 bg-white p-6">
					<h2 class="mb-4 text-lg font-bold text-gray-900">Tinetti Score Breakdown</h2>
					<table class="w-full text-sm">
						<thead>
							<tr class="border-b text-left text-gray-600">
								<th class="pb-2 pr-4">Item</th>
								<th class="pb-2 pr-4">Domain</th>
								<th class="pb-2 pr-4">Description</th>
								<th class="pb-2">Score</th>
							</tr>
						</thead>
						<tbody>
							{#each result.firedRules as rule}
								<tr class="border-b border-gray-100">
									<td class="py-2 pr-4 font-mono text-xs text-gray-500">{rule.id}</td>
									<td class="py-2 pr-4">{rule.domain}</td>
									<td class="py-2 pr-4">{rule.description}</td>
									<td class="py-2 font-bold">{rule.score}</td>
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
						<span class="font-medium text-gray-600">Referring Provider:</span>
						{data.referralInfo.referringProvider || 'N/A'}
					</div>
					<div class="sm:col-span-2">
						<span class="font-medium text-gray-600">Primary Diagnosis:</span>
						{data.referralInfo.primaryDiagnosis || 'N/A'}
					</div>
					<div>
						<span class="font-medium text-gray-600">Falls Last Year:</span>
						{data.fallHistory.fallsLastYear ?? 'N/A'}
					</div>
					<div>
						<span class="font-medium text-gray-600">Fear of Falling:</span>
						{data.fallHistory.fearOfFalling || 'N/A'}
					</div>
				</div>
			</div>

			<!-- Medications -->
			{#if data.currentMedications.medications.length > 0}
				<div class="mb-6 rounded-xl border border-gray-200 bg-white p-6">
					<h2 class="mb-4 text-lg font-bold text-gray-900">Current Medications</h2>
					<ul class="list-disc space-y-1 pl-5 text-sm">
						{#each data.currentMedications.medications as med}
							<li>{med.name} {med.dose} {med.frequency}</li>
						{/each}
					</ul>
				</div>
			{/if}

			<!-- Assistive Devices -->
			{#if data.assistiveDevices.currentDevices.length > 0}
				<div class="mb-6 rounded-xl border border-gray-200 bg-white p-6">
					<h2 class="mb-4 text-lg font-bold text-gray-900">Assistive Devices</h2>
					<p class="text-sm">
						<span class="font-medium text-gray-600">Current:</span>
						{data.assistiveDevices.currentDevices.join(', ')}
					</p>
					{#if data.assistiveDevices.recommendedDevices}
						<p class="mt-2 text-sm">
							<span class="font-medium text-gray-600">Recommended:</span>
							{data.assistiveDevices.recommendedDevices}
						</p>
					{/if}
				</div>
			{/if}

			<!-- Functional Independence -->
			<div class="mb-6 rounded-xl border border-gray-200 bg-white p-6">
				<h2 class="mb-4 text-lg font-bold text-gray-900">Functional Independence</h2>
				<div class="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
					<div><span class="font-medium text-gray-600">Transfers:</span> {data.functionalIndependence.transfers || 'N/A'}</div>
					<div><span class="font-medium text-gray-600">Ambulation:</span> {data.functionalIndependence.ambulation || 'N/A'}</div>
					<div><span class="font-medium text-gray-600">Stairs:</span> {data.functionalIndependence.stairs || 'N/A'}</div>
					<div><span class="font-medium text-gray-600">Bathing:</span> {data.functionalIndependence.bathing || 'N/A'}</div>
					<div><span class="font-medium text-gray-600">Dressing:</span> {data.functionalIndependence.dressing || 'N/A'}</div>
				</div>
			</div>
		</main>
	</div>
{/if}
