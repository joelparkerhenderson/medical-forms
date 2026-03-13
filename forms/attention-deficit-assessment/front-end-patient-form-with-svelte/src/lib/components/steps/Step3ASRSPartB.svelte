<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';

	const b = assessment.data.asrsPartB;

	const frequencyOptions = [
		{ value: '0', label: '0 - Never' },
		{ value: '1', label: '1 - Rarely' },
		{ value: '2', label: '2 - Sometimes' },
		{ value: '3', label: '3 - Often' },
		{ value: '4', label: '4 - Very Often' }
	];

	function bindScore(field: keyof typeof b) {
		return {
			get value() {
				return b[field] !== null ? String(b[field]) : '';
			},
			set value(v: string) {
				(b as any)[field] = v === '' ? null : Number(v);
			}
		};
	}

	const q7 = bindScore('carelessMistakes');
	const q8 = bindScore('attentionDifficulty');
	const q9 = bindScore('concentrationDifficulty');
	const q10 = bindScore('misplacingThings');
	const q11 = bindScore('distractedByNoise');
	const q12 = bindScore('leavingSeat');
	const q13 = bindScore('restlessness');
	const q14 = bindScore('difficultyRelaxing');
	const q15 = bindScore('talkingTooMuch');
	const q16 = bindScore('finishingSentences');
	const q17 = bindScore('difficultyWaiting');
	const q18 = bindScore('interruptingOthers');
</script>

<SectionCard title="ASRS Part B" description="Rate how often you have experienced each additional symptom over the past 6 months.">
	<SelectInput
		label="Q7. How often do you make careless mistakes when you have to work on a boring or difficult project?"
		name="carelessMistakes"
		options={frequencyOptions}
		bind:value={q7.value}
	/>

	<SelectInput
		label="Q8. How often do you have difficulty keeping your attention when you are doing boring or repetitive work?"
		name="attentionDifficulty"
		options={frequencyOptions}
		bind:value={q8.value}
	/>

	<SelectInput
		label="Q9. How often do you have difficulty concentrating on what people say to you, even in a one-on-one situation?"
		name="concentrationDifficulty"
		options={frequencyOptions}
		bind:value={q9.value}
	/>

	<SelectInput
		label="Q10. How often do you misplace or have difficulty finding things at home or at work?"
		name="misplacingThings"
		options={frequencyOptions}
		bind:value={q10.value}
	/>

	<SelectInput
		label="Q11. How often are you distracted by activity or noise around you?"
		name="distractedByNoise"
		options={frequencyOptions}
		bind:value={q11.value}
	/>

	<SelectInput
		label="Q12. How often do you leave your seat in meetings or other situations in which you are expected to remain seated?"
		name="leavingSeat"
		options={frequencyOptions}
		bind:value={q12.value}
	/>

	<SelectInput
		label="Q13. How often do you feel restless or fidgety?"
		name="restlessness"
		options={frequencyOptions}
		bind:value={q13.value}
	/>

	<SelectInput
		label="Q14. How often do you have difficulty unwinding and relaxing when you have time to yourself?"
		name="difficultyRelaxing"
		options={frequencyOptions}
		bind:value={q14.value}
	/>

	<SelectInput
		label="Q15. How often do you find yourself talking too much when you are in social situations?"
		name="talkingTooMuch"
		options={frequencyOptions}
		bind:value={q15.value}
	/>

	<SelectInput
		label="Q16. How often do you finish the sentences of people you are talking to before they can finish them?"
		name="finishingSentences"
		options={frequencyOptions}
		bind:value={q16.value}
	/>

	<SelectInput
		label="Q17. How often do you have difficulty waiting your turn in situations when turn-taking is required?"
		name="difficultyWaiting"
		options={frequencyOptions}
		bind:value={q17.value}
	/>

	<SelectInput
		label="Q18. How often do you interrupt others when they are busy?"
		name="interruptingOthers"
		options={frequencyOptions}
		bind:value={q18.value}
	/>
</SectionCard>
