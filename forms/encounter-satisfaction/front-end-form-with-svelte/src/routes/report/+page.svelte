<script lang="ts">
	import { goto } from '$app/navigation';
	import { assessment } from '$lib/stores/assessment.svelte';
	import { satisfactionScoreColor, calculateAge } from '$lib/engine/utils';

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
				a.download = `encounter-satisfaction-${data.demographics.lastName}-${new Date().toISOString().slice(0, 10)}.pdf`;
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
				<h1 class="text-lg font-bold text-gray-900">Satisfaction Report</h1>
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
						New Survey
					</button>
				</div>
			</div>
		</header>

		<main class="mx-auto max-w-4xl px-4 py-6">
			<!-- Composite Score Banner -->
			<div class="mb-6 rounded-xl border-2 p-6 text-center {satisfactionScoreColor(result.compositeScore)}">
				<div class="text-3xl font-bold">{result.compositeScore.toFixed(1)}/5.0</div>
				<div class="mt-1 text-lg">{result.category}</div>
				<div class="mt-2 text-sm opacity-75">
					{result.answeredCount} of 19 questions answered |
					Generated {new Date(result.timestamp).toLocaleString()}
				</div>
			</div>

			<!-- Flagged Issues -->
			{#if result.additionalFlags.length > 0}
				<div class="mb-6 rounded-xl border border-red-200 bg-white p-6">
					<h2 class="mb-4 text-lg font-bold text-red-800">Flagged Issues</h2>
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

			<!-- Domain Breakdown -->
			{#if result.domainScores.length > 0}
				<div class="mb-6 rounded-xl border border-gray-200 bg-white p-6">
					<h2 class="mb-4 text-lg font-bold text-gray-900">Score Breakdown by Domain</h2>
					<div class="space-y-4">
						{#each result.domainScores as domain}
							<div>
								<div class="mb-1 flex items-center justify-between">
									<span class="text-sm font-semibold text-gray-700">{domain.domain}</span>
									<span class="text-sm font-bold {satisfactionScoreColor(domain.mean)} rounded px-2 py-0.5">
										{domain.mean.toFixed(1)}/5.0
									</span>
								</div>
								<div class="h-2 w-full overflow-hidden rounded-full bg-gray-200">
									<div
										class="h-2 rounded-full bg-primary transition-all duration-300"
										style="width: {(domain.mean / 5) * 100}%"
									></div>
								</div>
								<table class="mt-2 w-full text-sm">
									<tbody>
										{#each domain.questions as q}
											<tr class="border-b border-gray-50">
												<td class="py-1 pr-4 font-mono text-xs text-gray-400">{q.id}</td>
												<td class="py-1 pr-4 text-gray-600">{q.text}</td>
												<td class="py-1 font-bold">{q.score}/5</td>
											</tr>
										{/each}
									</tbody>
								</table>
							</div>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Patient & Visit Summary -->
			<div class="mb-6 rounded-xl border border-gray-200 bg-white p-6">
				<h2 class="mb-4 text-lg font-bold text-gray-900">Patient & Visit Summary</h2>
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
						<span class="font-medium text-gray-600">Visit Date:</span>
						{data.visitInformation.visitDate || 'N/A'}
					</div>
					<div>
						<span class="font-medium text-gray-600">Department:</span>
						{data.visitInformation.department || 'N/A'}
					</div>
					<div>
						<span class="font-medium text-gray-600">Provider:</span>
						{data.visitInformation.providerName || 'N/A'}
					</div>
					<div>
						<span class="font-medium text-gray-600">Visit Type:</span>
						{data.visitInformation.visitType || 'N/A'}
					</div>
					<div>
						<span class="font-medium text-gray-600">First Visit:</span>
						{data.visitInformation.firstVisit || 'N/A'}
					</div>
				</div>
			</div>

			<!-- Comments -->
			{#if data.overallSatisfaction.comments}
				<div class="mb-6 rounded-xl border border-gray-200 bg-white p-6">
					<h2 class="mb-4 text-lg font-bold text-gray-900">Patient Comments</h2>
					<p class="text-sm text-gray-700 whitespace-pre-wrap">{data.overallSatisfaction.comments}</p>
				</div>
			{/if}
		</main>
	</div>
{/if}
