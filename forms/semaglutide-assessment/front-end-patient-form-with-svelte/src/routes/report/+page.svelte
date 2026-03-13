<script lang="ts">
	import { goto } from '$app/navigation';
	import { assessment } from '$lib/stores/assessment.svelte';
	import { eligibilityLabel, eligibilityColor, calculateAge, bmiCategory } from '$lib/engine/utils';

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
				a.download = `semaglutide-assessment-${data.demographics.lastName}-${new Date().toISOString().slice(0, 10)}.pdf`;
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
			<!-- Eligibility Status Banner -->
			<div class="mb-6 rounded-xl border-2 p-6 text-center {eligibilityColor(result.eligibilityStatus)}">
				<div class="text-3xl font-bold">{result.eligibilityStatus}</div>
				<div class="mt-1 text-lg">{eligibilityLabel(result.eligibilityStatus)}</div>
				{#if result.bmi !== null}
					<div class="mt-2 text-sm">BMI: {result.bmi.toFixed(1)} ({result.bmiCategory})</div>
				{/if}
				<div class="mt-2 text-sm opacity-75">
					Generated {new Date(result.timestamp).toLocaleString()}
				</div>
			</div>

			<!-- Absolute Contraindications -->
			{#if result.absoluteContraindications.length > 0}
				<div class="mb-6 rounded-xl border border-red-200 bg-white p-6">
					<h2 class="mb-4 text-lg font-bold text-red-800">Absolute Contraindications</h2>
					<div class="space-y-2">
						{#each result.absoluteContraindications as rule}
							<div class="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3">
								<span class="mt-0.5 rounded px-2 py-0.5 text-xs font-bold uppercase bg-red-200 text-red-800">
									{rule.category}
								</span>
								<div class="text-sm">{rule.description}</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Relative Contraindications -->
			{#if result.relativeContraindications.length > 0}
				<div class="mb-6 rounded-xl border border-yellow-200 bg-white p-6">
					<h2 class="mb-4 text-lg font-bold text-yellow-800">Relative Contraindications</h2>
					<div class="space-y-2">
						{#each result.relativeContraindications as rule}
							<div class="flex items-start gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-3">
								<span class="mt-0.5 rounded px-2 py-0.5 text-xs font-bold uppercase bg-yellow-200 text-yellow-800">
									{rule.category}
								</span>
								<div class="text-sm">{rule.description}</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Monitoring Flags -->
			{#if result.monitoringFlags.length > 0}
				<div class="mb-6 rounded-xl border border-gray-200 bg-white p-6">
					<h2 class="mb-4 text-lg font-bold text-gray-900">Flagged Issues for Clinician</h2>
					<div class="space-y-2">
						{#each result.monitoringFlags as flag}
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
						{data.demographics.dob}
						{#if calculateAge(data.demographics.dob)}
							(Age {calculateAge(data.demographics.dob)})
						{/if}
					</div>
					<div>
						<span class="font-medium text-gray-600">Sex:</span>
						{data.demographics.sex}
					</div>
					<div>
						<span class="font-medium text-gray-600">Primary Indication:</span>
						{data.indicationGoals.primaryIndication || 'N/A'}
					</div>
					{#if data.indicationGoals.weightLossGoalPercent !== null}
						<div>
							<span class="font-medium text-gray-600">Weight Loss Goal:</span>
							{data.indicationGoals.weightLossGoalPercent}%
						</div>
					{/if}
					<div>
						<span class="font-medium text-gray-600">Motivation:</span>
						{data.indicationGoals.motivationLevel || 'N/A'}
					</div>
				</div>
			</div>

			<!-- Metabolic Profile -->
			<div class="mb-6 rounded-xl border border-gray-200 bg-white p-6">
				<h2 class="mb-4 text-lg font-bold text-gray-900">Metabolic Profile</h2>
				<div class="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
					{#if data.metabolicProfile.hba1c !== null}
						<div>
							<span class="font-medium text-gray-600">HbA1c:</span>
							{data.metabolicProfile.hba1c}%
						</div>
					{/if}
					{#if data.metabolicProfile.fastingGlucose !== null}
						<div>
							<span class="font-medium text-gray-600">Fasting Glucose:</span>
							{data.metabolicProfile.fastingGlucose} mmol/L
						</div>
					{/if}
					{#if data.metabolicProfile.totalCholesterol !== null}
						<div>
							<span class="font-medium text-gray-600">Total Cholesterol:</span>
							{data.metabolicProfile.totalCholesterol} mmol/L
						</div>
					{/if}
					{#if data.metabolicProfile.ldl !== null}
						<div>
							<span class="font-medium text-gray-600">LDL:</span>
							{data.metabolicProfile.ldl} mmol/L
						</div>
					{/if}
					{#if data.metabolicProfile.hdl !== null}
						<div>
							<span class="font-medium text-gray-600">HDL:</span>
							{data.metabolicProfile.hdl} mmol/L
						</div>
					{/if}
					{#if data.metabolicProfile.triglycerides !== null}
						<div>
							<span class="font-medium text-gray-600">Triglycerides:</span>
							{data.metabolicProfile.triglycerides} mmol/L
						</div>
					{/if}
					{#if data.metabolicProfile.thyroidFunction}
						<div>
							<span class="font-medium text-gray-600">Thyroid Function:</span>
							{data.metabolicProfile.thyroidFunction}
						</div>
					{/if}
				</div>
			</div>

			<!-- Cardiovascular Risk -->
			<div class="mb-6 rounded-xl border border-gray-200 bg-white p-6">
				<h2 class="mb-4 text-lg font-bold text-gray-900">Cardiovascular Risk</h2>
				<div class="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
					{#if data.cardiovascularRisk.bloodPressureSystolic !== null && data.cardiovascularRisk.bloodPressureDiastolic !== null}
						<div>
							<span class="font-medium text-gray-600">Blood Pressure:</span>
							{data.cardiovascularRisk.bloodPressureSystolic}/{data.cardiovascularRisk.bloodPressureDiastolic} mmHg
						</div>
					{/if}
					{#if data.cardiovascularRisk.heartRate !== null}
						<div>
							<span class="font-medium text-gray-600">Heart Rate:</span>
							{data.cardiovascularRisk.heartRate} bpm
						</div>
					{/if}
					<div>
						<span class="font-medium text-gray-600">Previous MI:</span>
						{data.cardiovascularRisk.previousMI || 'N/A'}
					</div>
					<div>
						<span class="font-medium text-gray-600">Heart Failure:</span>
						{data.cardiovascularRisk.heartFailure || 'N/A'}
					</div>
					{#if data.cardiovascularRisk.qriskScore !== null}
						<div>
							<span class="font-medium text-gray-600">QRISK Score:</span>
							{data.cardiovascularRisk.qriskScore}%
						</div>
					{/if}
				</div>
			</div>

			<!-- Treatment Plan -->
			<div class="mb-6 rounded-xl border border-gray-200 bg-white p-6">
				<h2 class="mb-4 text-lg font-bold text-gray-900">Treatment Plan</h2>
				<div class="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
					<div>
						<span class="font-medium text-gray-600">Formulation:</span>
						{data.treatmentPlan.selectedFormulation || 'N/A'}
					</div>
					<div>
						<span class="font-medium text-gray-600">Starting Dose:</span>
						{data.treatmentPlan.startingDose || 'N/A'}
					</div>
					{#if data.treatmentPlan.titrationSchedule}
						<div>
							<span class="font-medium text-gray-600">Titration:</span>
							{data.treatmentPlan.titrationSchedule}
						</div>
					{/if}
					{#if data.treatmentPlan.monitoringFrequency}
						<div>
							<span class="font-medium text-gray-600">Monitoring:</span>
							{data.treatmentPlan.monitoringFrequency}
						</div>
					{/if}
					<div>
						<span class="font-medium text-gray-600">Dietary Guidance:</span>
						{data.treatmentPlan.dietaryGuidance || 'N/A'}
					</div>
					<div>
						<span class="font-medium text-gray-600">Exercise Plan:</span>
						{data.treatmentPlan.exercisePlan || 'N/A'}
					</div>
					{#if data.treatmentPlan.followUpWeeks !== null}
						<div>
							<span class="font-medium text-gray-600">Follow-up:</span>
							{data.treatmentPlan.followUpWeeks} weeks
						</div>
					{/if}
				</div>
			</div>

			<!-- Medications -->
			{#if data.currentMedications.otherDiabetesMedications.length > 0 || data.currentMedications.antihypertensives.length > 0 || data.currentMedications.lipidLowering.length > 0 || data.currentMedications.otherMedications.length > 0}
				<div class="mb-6 rounded-xl border border-gray-200 bg-white p-6">
					<h2 class="mb-4 text-lg font-bold text-gray-900">Current Medications</h2>
					{#if data.currentMedications.insulinTherapy === 'yes'}
						<h3 class="text-sm font-semibold text-gray-600">Insulin</h3>
						<p class="mb-3 text-sm">{data.currentMedications.insulinType || 'Type not specified'}</p>
					{/if}
					{#if data.currentMedications.otherDiabetesMedications.length > 0}
						<h3 class="text-sm font-semibold text-gray-600">Diabetes Medications</h3>
						<ul class="list-disc space-y-1 pl-5 text-sm mb-3">
							{#each data.currentMedications.otherDiabetesMedications as med}
								<li>{med.name} {med.dose} {med.frequency}</li>
							{/each}
						</ul>
					{/if}
					{#if data.currentMedications.antihypertensives.length > 0}
						<h3 class="text-sm font-semibold text-gray-600">Antihypertensives</h3>
						<ul class="list-disc space-y-1 pl-5 text-sm mb-3">
							{#each data.currentMedications.antihypertensives as med}
								<li>{med.name} {med.dose} {med.frequency}</li>
							{/each}
						</ul>
					{/if}
					{#if data.currentMedications.lipidLowering.length > 0}
						<h3 class="text-sm font-semibold text-gray-600">Lipid-Lowering</h3>
						<ul class="list-disc space-y-1 pl-5 text-sm mb-3">
							{#each data.currentMedications.lipidLowering as med}
								<li>{med.name} {med.dose} {med.frequency}</li>
							{/each}
						</ul>
					{/if}
					{#if data.currentMedications.otherMedications.length > 0}
						<h3 class="text-sm font-semibold text-gray-600">Other</h3>
						<ul class="list-disc space-y-1 pl-5 text-sm">
							{#each data.currentMedications.otherMedications as med}
								<li>{med.name} {med.dose} {med.frequency}</li>
							{/each}
						</ul>
					{/if}
				</div>
			{/if}
		</main>
	</div>
{/if}
