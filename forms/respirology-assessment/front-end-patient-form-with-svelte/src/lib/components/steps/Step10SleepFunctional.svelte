<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import { calculateStopBang } from '$lib/engine/utils';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';
	import NumberInput from '$lib/components/ui/NumberInput.svelte';

	const sf = assessment.data.sleepFunctional;
	const yesNo = [
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' }
	];

	$effect(() => {
		assessment.data.sleepFunctional.stopBangScore = calculateStopBang(
			sf.osaScreenSnoring,
			sf.osaScreenTired,
			sf.osaScreenObservedApnoea,
			sf.osaScreenBMIOver35,
			sf.osaScreenAge50Plus,
			sf.osaScreenNeckOver40cm,
			sf.osaScreenMale
		);
	});
</script>

<SectionCard title="Sleep & Functional Status" description="Sleep quality, OSA screening, and functional capacity">
	<SelectInput
		label="Sleep Quality"
		name="sleepQuality"
		options={[
			{ value: 'good', label: 'Good' },
			{ value: 'fair', label: 'Fair' },
			{ value: 'poor', label: 'Poor' }
		]}
		bind:value={sf.sleepQuality}
	/>

	<h3 class="mt-6 mb-3 font-medium text-gray-800">STOP-BANG OSA Screening</h3>

	<RadioGroup label="Do you SNORE loudly?" name="snoring" options={yesNo} bind:value={sf.osaScreenSnoring} />
	<RadioGroup label="Do you feel TIRED or sleepy during the day?" name="tired" options={yesNo} bind:value={sf.osaScreenTired} />
	<RadioGroup label="Has anyone OBSERVED you stop breathing during sleep?" name="observed" options={yesNo} bind:value={sf.osaScreenObservedApnoea} />
	<RadioGroup label="Is your BMI over 35?" name="bmiOver35" options={yesNo} bind:value={sf.osaScreenBMIOver35} />
	<RadioGroup label="Are you aged 50 or over?" name="age50Plus" options={yesNo} bind:value={sf.osaScreenAge50Plus} />
	<RadioGroup label="Is your neck circumference over 40cm?" name="neckOver40" options={yesNo} bind:value={sf.osaScreenNeckOver40cm} />
	<RadioGroup label="Are you male?" name="male" options={yesNo} bind:value={sf.osaScreenMale} />

	<div class="mt-2 mb-4">
		<span class="mb-1 block text-sm font-medium text-gray-700">STOP-BANG Score</span>
		<div class="flex h-[38px] items-center rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm">
			{#if sf.stopBangScore !== null}
				<span class="font-medium">{sf.stopBangScore}/7</span>
				<span class="ml-2 text-gray-500">
					{#if sf.stopBangScore >= 5}
						(High risk of OSA)
					{:else if sf.stopBangScore >= 3}
						(Intermediate risk of OSA)
					{:else}
						(Low risk of OSA)
					{/if}
				</span>
			{:else}
				<span class="text-gray-400">Auto-calculated</span>
			{/if}
		</div>
	</div>

	<RadioGroup label="Do you experience excessive daytime somnolence?" name="somnolence" options={yesNo} bind:value={sf.daytimeSomnolence} />
	{#if sf.daytimeSomnolence === 'yes'}
		<NumberInput label="Epworth Sleepiness Scale Score" name="epworth" bind:value={sf.epworthScore} min={0} max={24} />
	{/if}

	<SelectInput
		label="Functional Status"
		name="functionalStatus"
		options={[
			{ value: 'independent', label: 'Independent - able to perform all daily activities' },
			{ value: 'limited', label: 'Limited - needs some assistance with daily activities' },
			{ value: 'dependent', label: 'Dependent - needs significant assistance' }
		]}
		bind:value={sf.functionalStatus}
	/>
</SectionCard>
