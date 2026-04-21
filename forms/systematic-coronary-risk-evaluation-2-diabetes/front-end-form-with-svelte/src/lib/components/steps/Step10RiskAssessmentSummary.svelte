<script lang="ts">
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import type { RiskAssessmentSummary } from '$lib/engine/types.js';

	let { data = $bindable() }: { data: RiskAssessmentSummary } = $props();
</script>

<SectionCard title="Risk Assessment Summary">
	<div class="mb-4">
		<label for="riskRegion" class="block text-sm font-medium text-gray-700 mb-1">Risk Region</label>
		<p class="text-xs text-gray-500 mb-1">Select the ESC cardiovascular risk region for the patient's country of origin</p>
		<select
			id="riskRegion"
			bind:value={data.riskRegion}
			class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary"
		>
			<option value="">Select...</option>
			<option value="low">Low risk (e.g. France, Spain, Greece)</option>
			<option value="moderate">Moderate risk (e.g. Germany, UK, Netherlands)</option>
			<option value="high">High risk (e.g. Poland, Czech Republic)</option>
			<option value="veryHigh">Very high risk (e.g. Lithuania, Latvia, Russia)</option>
		</select>
	</div>

	<div class="mb-4">
		<label for="additionalRiskFactors" class="block text-sm font-medium text-gray-700 mb-1">Additional Risk Factors</label>
		<p class="text-xs text-gray-500 mb-1">Note any risk factors not captured in previous steps</p>
		<textarea
			id="additionalRiskFactors"
			bind:value={data.additionalRiskFactors}
			placeholder="e.g. Obstructive sleep apnoea, PCOS, chronic inflammatory conditions"
			class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary"
			rows="3"
		></textarea>
	</div>

	<div class="mb-4">
		<label for="clinicalNotes" class="block text-sm font-medium text-gray-700 mb-1">Clinical Notes</label>
		<textarea
			id="clinicalNotes"
			bind:value={data.clinicalNotes}
			placeholder="Free text clinical notes, observations, and reasoning"
			class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary"
			rows="4"
		></textarea>
	</div>

	<div class="mb-4">
		<label for="agreedTreatmentTargets" class="block text-sm font-medium text-gray-700 mb-1">Agreed Treatment Targets</label>
		<p class="text-xs text-gray-500 mb-1">Document shared decision-making treatment targets with the patient</p>
		<textarea
			id="agreedTreatmentTargets"
			bind:value={data.agreedTreatmentTargets}
			placeholder="e.g. HbA1c target <53 mmol/mol, BP <130/80, LDL <1.8 mmol/L"
			class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary"
			rows="3"
		></textarea>
	</div>

	<div class="mb-4">
		<label for="followUpInterval" class="block text-sm font-medium text-gray-700 mb-1">Follow-up Interval</label>
		<select
			id="followUpInterval"
			bind:value={data.followUpInterval}
			class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary"
		>
			<option value="">Select...</option>
			<option value="3months">3 months</option>
			<option value="6months">6 months</option>
			<option value="12months">12 months</option>
		</select>
	</div>
</SectionCard>
