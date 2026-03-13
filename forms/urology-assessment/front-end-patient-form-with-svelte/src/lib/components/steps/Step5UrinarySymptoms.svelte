<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';

	const u = assessment.data.urinarySymptoms;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];
</script>

<SectionCard title="Urinary Symptoms" description="Detailed urinary symptom assessment">
	<RadioGroup label="Do you experience increased urinary frequency?" name="frequency" options={yesNo} bind:value={u.frequency} />

	<RadioGroup label="Do you experience urinary urgency?" name="urgency" options={yesNo} bind:value={u.urgency} />

	<RadioGroup label="Do you wake at night to urinate (nocturia)?" name="nocturia" options={yesNo} bind:value={u.nocturia} />

	<RadioGroup label="Do you experience hesitancy when starting to urinate?" name="hesitancy" options={yesNo} bind:value={u.hesitancy} />

	<SelectInput
		label="How would you describe your urinary stream?"
		name="stream"
		options={[
			{ value: 'normal', label: 'Normal' },
			{ value: 'weak', label: 'Weak' },
			{ value: 'intermittent', label: 'Intermittent (stops and starts)' }
		]}
		bind:value={u.stream}
	/>

	<RadioGroup label="Do you strain to urinate?" name="straining" options={yesNo} bind:value={u.straining} />

	<RadioGroup label="Have you noticed blood in your urine (hematuria)?" name="hematuria" options={yesNo} bind:value={u.hematuria} />

	<RadioGroup label="Do you experience pain or burning during urination (dysuria)?" name="dysuria" options={yesNo} bind:value={u.dysuria} />

	<SelectInput
		label="Do you experience urinary incontinence?"
		name="incontinence"
		options={[
			{ value: 'none', label: 'None' },
			{ value: 'stress', label: 'Stress incontinence (leaking with coughing, sneezing, exercise)' },
			{ value: 'urge', label: 'Urge incontinence (sudden strong need to urinate)' },
			{ value: 'overflow', label: 'Overflow incontinence (constant dribbling)' },
			{ value: 'mixed', label: 'Mixed incontinence' }
		]}
		bind:value={u.incontinence}
	/>
</SectionCard>
