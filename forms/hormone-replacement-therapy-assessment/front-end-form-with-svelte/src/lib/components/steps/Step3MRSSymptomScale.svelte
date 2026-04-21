<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';

	const s = assessment.data.mrsSymptomScale;

	const scoreOptions = [
		{ value: '0', label: '0 - None / no complaint' },
		{ value: '1', label: '1 - Mild' },
		{ value: '2', label: '2 - Moderate' },
		{ value: '3', label: '3 - Severe' },
		{ value: '4', label: '4 - Very severe' }
	];

	function handleScore(e: Event, field: keyof typeof s) {
		const val = (e.target as HTMLSelectElement).value;
		if (val === '') {
			(s as any)[field] = null;
		} else {
			(s as any)[field] = Number(val) as 0 | 1 | 2 | 3 | 4;
		}
	}

	function getVal(field: keyof typeof s): string {
		const v = s[field];
		return v === null ? '' : String(v);
	}
</script>

<SectionCard title="Menopause Rating Scale (MRS)" description="Rate each symptom from 0 (none) to 4 (very severe). This standardised scale measures symptom burden.">
	<p class="mb-4 text-sm text-gray-500">
		Which of the following symptoms apply to you at this time? Please mark the appropriate box for each symptom.
	</p>

	<h3 class="mb-3 font-semibold text-gray-700">Somatic Symptoms</h3>

	<div class="mb-4">
		<label for="hotFlushes" class="mb-1 block text-sm font-medium text-gray-700">1. Hot flushes, sweating</label>
		<select id="hotFlushes" value={getVal('hotFlushes')} onchange={(e) => handleScore(e, 'hotFlushes')} class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none">
			<option value="">-- Select --</option>
			{#each scoreOptions as opt}<option value={opt.value}>{opt.label}</option>{/each}
		</select>
	</div>

	<div class="mb-4">
		<label for="heartDiscomfort" class="mb-1 block text-sm font-medium text-gray-700">2. Heart discomfort (palpitations, tightness)</label>
		<select id="heartDiscomfort" value={getVal('heartDiscomfort')} onchange={(e) => handleScore(e, 'heartDiscomfort')} class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none">
			<option value="">-- Select --</option>
			{#each scoreOptions as opt}<option value={opt.value}>{opt.label}</option>{/each}
		</select>
	</div>

	<div class="mb-4">
		<label for="sleepProblems" class="mb-1 block text-sm font-medium text-gray-700">3. Sleep problems (difficulty falling asleep, waking early)</label>
		<select id="sleepProblems" value={getVal('sleepProblems')} onchange={(e) => handleScore(e, 'sleepProblems')} class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none">
			<option value="">-- Select --</option>
			{#each scoreOptions as opt}<option value={opt.value}>{opt.label}</option>{/each}
		</select>
	</div>

	<div class="mb-4">
		<label for="jointPain" class="mb-1 block text-sm font-medium text-gray-700">4. Joint and muscular discomfort</label>
		<select id="jointPain" value={getVal('jointPain')} onchange={(e) => handleScore(e, 'jointPain')} class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none">
			<option value="">-- Select --</option>
			{#each scoreOptions as opt}<option value={opt.value}>{opt.label}</option>{/each}
		</select>
	</div>

	<h3 class="mb-3 mt-6 font-semibold text-gray-700">Psychological Symptoms</h3>

	<div class="mb-4">
		<label for="depressiveMood" class="mb-1 block text-sm font-medium text-gray-700">5. Depressive mood (feeling down, sad, tearful)</label>
		<select id="depressiveMood" value={getVal('depressiveMood')} onchange={(e) => handleScore(e, 'depressiveMood')} class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none">
			<option value="">-- Select --</option>
			{#each scoreOptions as opt}<option value={opt.value}>{opt.label}</option>{/each}
		</select>
	</div>

	<div class="mb-4">
		<label for="irritability" class="mb-1 block text-sm font-medium text-gray-700">6. Irritability (nervousness, aggression)</label>
		<select id="irritability" value={getVal('irritability')} onchange={(e) => handleScore(e, 'irritability')} class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none">
			<option value="">-- Select --</option>
			{#each scoreOptions as opt}<option value={opt.value}>{opt.label}</option>{/each}
		</select>
	</div>

	<div class="mb-4">
		<label for="anxiety" class="mb-1 block text-sm font-medium text-gray-700">7. Anxiety (inner restlessness, panic)</label>
		<select id="anxiety" value={getVal('anxiety')} onchange={(e) => handleScore(e, 'anxiety')} class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none">
			<option value="">-- Select --</option>
			{#each scoreOptions as opt}<option value={opt.value}>{opt.label}</option>{/each}
		</select>
	</div>

	<div class="mb-4">
		<label for="fatigue" class="mb-1 block text-sm font-medium text-gray-700">8. Physical and mental exhaustion (fatigue)</label>
		<select id="fatigue" value={getVal('fatigue')} onchange={(e) => handleScore(e, 'fatigue')} class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none">
			<option value="">-- Select --</option>
			{#each scoreOptions as opt}<option value={opt.value}>{opt.label}</option>{/each}
		</select>
	</div>

	<h3 class="mb-3 mt-6 font-semibold text-gray-700">Urogenital Symptoms</h3>

	<div class="mb-4">
		<label for="sexualProblems" class="mb-1 block text-sm font-medium text-gray-700">9. Sexual problems (change in desire, activity, satisfaction)</label>
		<select id="sexualProblems" value={getVal('sexualProblems')} onchange={(e) => handleScore(e, 'sexualProblems')} class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none">
			<option value="">-- Select --</option>
			{#each scoreOptions as opt}<option value={opt.value}>{opt.label}</option>{/each}
		</select>
	</div>

	<div class="mb-4">
		<label for="bladderProblems" class="mb-1 block text-sm font-medium text-gray-700">10. Bladder problems (difficulty urinating, increased need, incontinence)</label>
		<select id="bladderProblems" value={getVal('bladderProblems')} onchange={(e) => handleScore(e, 'bladderProblems')} class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none">
			<option value="">-- Select --</option>
			{#each scoreOptions as opt}<option value={opt.value}>{opt.label}</option>{/each}
		</select>
	</div>

	<div class="mb-4">
		<label for="vaginalDryness" class="mb-1 block text-sm font-medium text-gray-700">11. Dryness of vagina (sensation of dryness, burning, difficulty with intercourse)</label>
		<select id="vaginalDryness" value={getVal('vaginalDryness')} onchange={(e) => handleScore(e, 'vaginalDryness')} class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none">
			<option value="">-- Select --</option>
			{#each scoreOptions as opt}<option value={opt.value}>{opt.label}</option>{/each}
		</select>
	</div>
</SectionCard>
