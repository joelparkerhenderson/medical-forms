<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';

	const a = assessment.data.asrsPartA;

	const frequencyOptions = [
		{ value: '0', label: '0 - Never' },
		{ value: '1', label: '1 - Rarely' },
		{ value: '2', label: '2 - Sometimes' },
		{ value: '3', label: '3 - Often' },
		{ value: '4', label: '4 - Very Often' }
	];

	function bindScore(field: keyof typeof a) {
		return {
			get value() {
				return a[field] !== null ? String(a[field]) : '';
			},
			set value(v: string) {
				(a as any)[field] = v === '' ? null : Number(v);
			}
		};
	}

	const q1 = bindScore('focusDifficulty');
	const q2 = bindScore('organizationDifficulty');
	const q3 = bindScore('rememberingDifficulty');
	const q4 = bindScore('avoidingTasks');
	const q5 = bindScore('fidgeting');
	const q6 = bindScore('overlyActive');
</script>

<SectionCard title="ASRS Part A Screener" description="Rate how often you have experienced each symptom over the past 6 months. These 6 questions are the ASRS v1.1 screener.">
	<SelectInput
		label="Q1. How often do you have difficulty concentrating on what people say to you, even when they are speaking directly?"
		name="focusDifficulty"
		options={frequencyOptions}
		bind:value={q1.value}
		required
	/>

	<SelectInput
		label="Q2. How often do you have difficulty organizing tasks and activities?"
		name="organizationDifficulty"
		options={frequencyOptions}
		bind:value={q2.value}
		required
	/>

	<SelectInput
		label="Q3. How often do you have problems remembering appointments or obligations?"
		name="rememberingDifficulty"
		options={frequencyOptions}
		bind:value={q3.value}
		required
	/>

	<SelectInput
		label="Q4. When you have a task that requires sustained mental effort, how often do you avoid or delay starting it?"
		name="avoidingTasks"
		options={frequencyOptions}
		bind:value={q4.value}
		required
	/>

	<SelectInput
		label="Q5. How often do you fidget or squirm with your hands or feet when you have to sit down for a long time?"
		name="fidgeting"
		options={frequencyOptions}
		bind:value={q5.value}
		required
	/>

	<SelectInput
		label="Q6. How often do you feel overly active or compelled to do things, as if driven by a motor?"
		name="overlyActive"
		options={frequencyOptions}
		bind:value={q6.value}
		required
	/>
</SectionCard>
