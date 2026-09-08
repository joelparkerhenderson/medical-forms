<script lang="ts">
	import Field from '#lib/components/ui/Field.svelte';
	import Fieldset from '#lib/components/ui/Fieldset.svelte';
	import TextAreaInput from '#lib/components/ui/TextAreaInput.svelte';
	import Badge from '#lib/components/ui/Badge.svelte';
	import Alert from '#lib/components/ui/Alert.svelte';
	import { requestStore } from '#lib/stores/result.svelte.js';
	import { calculateGrade } from '#lib/engine/grader.js';
	import {
		appropriatenessLabel,
		appropriatenessColor,
		safetyLabel,
		safetyColor,
		triageTierLabel,
		triageTierColor,
		recommendationLabel,
		recommendationColor
	} from '#lib/engine/utils.js';

	let d = $derived(requestStore.data);

	// Live preview of the four-axis vetting grade as the referral is edited.
	const preview = $derived(calculateGrade(d));
</script>

<Fieldset legend="8. Review and Submit">
	<p class="hint">Live four-axis vetting grade, safety flags, and the overall recommendation.</p>

	{#if preview.triageTier === 'emergency'}
		<Alert type="error" heading="Emergency triage">
			<p>
				This referral contains an acute red flag. Divert the patient to the emergency pathway now;
				do not wait for a routine clinic.
			</p>
		</Alert>
	{:else if preview.safetyBand === 'red-flag'}
		<Alert type="warning" heading="Red-flag referral">
			<p>This referral has fired a red-flag safety rule and has been escalated for urgent vetting.</p>
		</Alert>
	{/if}

	<div class="my-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
		<div class="rounded-lg border border-base-300 p-3">
			<div class="mb-1 text-xs font-semibold text-base-content/60">Axis A — Appropriateness</div>
			<Badge
				label={appropriatenessLabel(preview.appropriatenessBand)}
				color={appropriatenessColor(preview.appropriatenessBand)}
			/>
		</div>
		<div class="rounded-lg border border-base-300 p-3">
			<div class="mb-1 text-xs font-semibold text-base-content/60">Axis B — Safety</div>
			<Badge label={safetyLabel(preview.safetyBand)} color={safetyColor(preview.safetyBand)} />
		</div>
		<div class="rounded-lg border border-base-300 p-3">
			<div class="mb-1 text-xs font-semibold text-base-content/60">Axis C — Completeness</div>
			<span class="text-lg font-bold text-base-content">{preview.completenessPercent}%</span>
		</div>
		<div class="rounded-lg border border-base-300 p-3">
			<div class="mb-1 text-xs font-semibold text-base-content/60">Axis D — Triage</div>
			<Badge label={triageTierLabel(preview.triageTier)} color={triageTierColor(preview.triageTier)} />
			<div class="mt-1 text-xs text-base-content/60">{preview.targetTimeframe}</div>
		</div>
	</div>

	<div class="my-4 rounded-lg border border-base-300 p-3">
		<div class="mb-1 text-xs font-semibold text-base-content/60">Overall recommendation</div>
		<Badge
			label={recommendationLabel(preview.recommendation)}
			color={recommendationColor(preview.recommendation)}
		/>
	</div>

	<Field label="Notes" inputId="notes">
		<TextAreaInput
			id="notes"
			label="Notes"
			rows={3}
			placeholder="Free-text notes accompanying the referral…"
			bind:value={d.notes}
		/>
	</Field>
</Fieldset>
