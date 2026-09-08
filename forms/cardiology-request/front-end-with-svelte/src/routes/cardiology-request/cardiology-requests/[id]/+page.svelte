<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { requestStore } from '#lib/stores/result.svelte.js';
	import { calculateGrade } from '#lib/engine/grader.js';
	import { steps, TOTAL_STEPS } from '#lib/config/steps.js';
	import { sampleReferrals } from '#lib/data/sample-reports.js';

	import Form from '#lib/components/ui/Form.svelte';
	import Button from '#lib/components/ui/Button.svelte';
	import Progress from '#lib/components/ui/Progress.svelte';
	import StepList from '#lib/components/ui/StepList.svelte';
	import StepListItem from '#lib/components/ui/StepListItem.svelte';
	import ErrorSummary from '#lib/components/ui/ErrorSummary.svelte';
	import FormDataTransfer from '#lib/components/ui/FormDataTransfer.svelte';

	import Step1ReferringClinician from '#lib/components/steps/Step1ReferringClinician.svelte';
	import Step2PatientIdentification from '#lib/components/steps/Step2PatientIdentification.svelte';
	import Step3ReferralReason from '#lib/components/steps/Step3ReferralReason.svelte';
	import Step4Symptoms from '#lib/components/steps/Step4Symptoms.svelte';
	import Step5RedFlagsAndInvestigations from '#lib/components/steps/Step5RedFlagsAndInvestigations.svelte';
	import Step6CardiacHistory from '#lib/components/steps/Step6CardiacHistory.svelte';
	import Step7Triage from '#lib/components/steps/Step7Triage.svelte';
	import Step8ReviewAndSubmit from '#lib/components/steps/Step8ReviewAndSubmit.svelte';

	let errors = $state<{ id: string; message: string }[]>([]);

	const id = $derived(page.params.id ?? 'new');
	const isNew = $derived(id === 'new');

	// Hydrate the wizard whenever the route id changes: a saved draft for that id
	// wins, otherwise seed from the matching sample referral (existing id) or a
	// blank draft (new).
	$effect(() => {
		const seed = sampleReferrals.find((s) => s.id === id)?.request;
		if (requestStore.id !== id) {
			requestStore.loadForId(id, seed);
			errors = [];
		}
	});

	function validate(): boolean {
		const d = requestStore.data;
		const found: { id: string; message: string }[] = [];
		if (d.referringClinician.trim() === '') {
			found.push({ id: 'referringClinician', message: 'Referring clinician is required.' });
		}
		if (d.nhsNumber.trim() === '') {
			found.push({ id: 'nhsNumber', message: 'NHS number is required.' });
		}
		if (d.requestedService === '') {
			found.push({ id: 'requestedService', message: 'Requested service is required.' });
		}
		if (d.referralReason === '') {
			found.push({ id: 'referralReason', message: 'Primary reason for referral is required.' });
		}
		if (d.clinicalQuestion.trim() === '') {
			found.push({ id: 'clinicalQuestion', message: 'Specific clinical question is required.' });
		}
		errors = found;
		return found.length === 0;
	}

	function submit() {
		if (!validate()) {
			document.querySelector('.error-summary')?.scrollIntoView({ behavior: 'smooth' });
			return;
		}
		requestStore.result = calculateGrade(requestStore.data);
		goto(`/cardiology-requests/${id}/report`);
	}

	function startOver() {
		const seed = sampleReferrals.find((s) => s.id === id)?.request;
		requestStore.reset();
		requestStore.loadForId(id, seed);
		errors = [];
	}
</script>

<main class="mx-16 px-4 py-6">
	<h1 class="text-2xl font-bold text-base-content">
		{isNew ? 'New cardiology referral' : `Cardiology referral ${id}`}
	</h1>
	<p class="mt-1 text-sm text-base-content/70">
		Complete the eight sections; the four-axis vetting grade is computed on submit.
	</p>
	<FormDataTransfer
		slug="cardiology-request"
		getState={() => requestStore.data}
		setState={(parsed) => requestStore.importData(parsed)}
	/>

	<Progress label="Referral sections" value={TOTAL_STEPS} max={TOTAL_STEPS} />
	<StepList label="Referral sections" current={TOTAL_STEPS}>
		{#each steps as step (step.number)}
			<StepListItem status="finished" label={step.title}>{step.shortTitle}</StepListItem>
		{/each}
	</StepList>

	{#if errors.length > 0}
		<ErrorSummary title="Please fix the following before submitting" class="mb-6">
			<ul>
				{#each errors as e (e.id)}
					<li><a href={`#${e.id}`}>{e.message}</a></li>
				{/each}
			</ul>
		</ErrorSummary>
	{/if}

	<Form label="Cardiology request" onsubmit={submit}>
		<Step1ReferringClinician />
		<Step2PatientIdentification />
		<Step3ReferralReason />
		<Step4Symptoms />
		<Step5RedFlagsAndInvestigations />
		<Step6CardiacHistory />
		<Step7Triage />
		<Step8ReviewAndSubmit />

		<div class="button-group">
			<Button type="submit" data-variant="primary">Compute grade &amp; view vetting report</Button>
			<Button data-variant="danger" onclick={startOver}>Start over</Button>
		</div>
	</Form>
</main>
