<script lang="ts">
	import { assessment } from '$lib/stores/assessment.svelte';
	import SectionCard from '$lib/components/ui/SectionCard.svelte';
	import RadioGroup from '$lib/components/ui/RadioGroup.svelte';
	import TextArea from '$lib/components/ui/TextArea.svelte';

	const ls = assessment.data.treatmentsRefusedLifeSustaining;
	const yesNo = [
		{ value: 'yes', label: 'Yes - Refuse' },
		{ value: 'no', label: 'No - Do not refuse' }
	];
	const yesNoLifeRisk = [
		{ value: 'yes', label: 'Yes - even if my life is at risk' },
		{ value: 'no', label: 'No' }
	];

	function addOther() {
		ls.otherLifeSustaining = [...ls.otherLifeSustaining, { treatment: '', refused: 'yes', evenIfLifeAtRisk: '', specification: '' }];
	}

	function removeOther(index: number) {
		ls.otherLifeSustaining = ls.otherLifeSustaining.filter((_, i) => i !== index);
	}
</script>

<SectionCard title="Treatments Refused - Life-Sustaining" description="Refusal of life-sustaining treatment has additional legal requirements">
	<div class="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
		<p class="font-bold">IMPORTANT LEGAL REQUIREMENT</p>
		<p class="mt-1">Under the Mental Capacity Act 2005, for an ADRT to be legally valid for life-sustaining treatment, you <strong>MUST</strong>:</p>
		<ul class="mt-2 list-disc space-y-1 pl-5">
			<li>Explicitly state that the refusal applies <strong>"even if life is at risk"</strong></li>
			<li>The ADRT must be <strong>in writing</strong></li>
			<li>It must be <strong>signed</strong> by you</li>
			<li>Your signature must be <strong>witnessed</strong></li>
		</ul>
		<p class="mt-2">Without these requirements, the ADRT will NOT be legally binding for life-sustaining treatment.</p>
	</div>

	<div class="space-y-6">
		<div class="rounded-lg border-2 border-red-200 p-4">
			<RadioGroup label="Cardiopulmonary Resuscitation (CPR)" name="cpr" options={yesNo} bind:value={ls.cpr.refused} />
			{#if ls.cpr.refused === 'yes'}
				<div class="ml-4 mt-2 rounded border border-red-100 bg-red-50 p-3">
					<RadioGroup
						label="I confirm this refusal applies even if my life is at risk as a result"
						name="cprLifeRisk"
						options={yesNoLifeRisk}
						bind:value={ls.cpr.evenIfLifeAtRisk}
						required
					/>
				</div>
				<TextArea label="Specification" name="cprSpec" bind:value={ls.cpr.specification} placeholder="Any specific conditions or details about your CPR refusal" />
			{/if}
		</div>

		<div class="rounded-lg border-2 border-red-200 p-4">
			<RadioGroup label="Mechanical Ventilation (life support machine)" name="mechVent" options={yesNo} bind:value={ls.mechanicalVentilation.refused} />
			{#if ls.mechanicalVentilation.refused === 'yes'}
				<div class="ml-4 mt-2 rounded border border-red-100 bg-red-50 p-3">
					<RadioGroup
						label="I confirm this refusal applies even if my life is at risk as a result"
						name="mechVentLifeRisk"
						options={yesNoLifeRisk}
						bind:value={ls.mechanicalVentilation.evenIfLifeAtRisk}
						required
					/>
				</div>
				<TextArea label="Specification" name="mechVentSpec" bind:value={ls.mechanicalVentilation.specification} placeholder="Any specific conditions or details" />
			{/if}
		</div>

		<div class="rounded-lg border-2 border-red-200 p-4">
			<RadioGroup label="Artificial Nutrition and Hydration (including tube feeding and IV nutrition)" name="anh" options={yesNo} bind:value={ls.artificialNutritionHydration.refused} />
			{#if ls.artificialNutritionHydration.refused === 'yes'}
				<div class="ml-4 mt-2 rounded border border-red-100 bg-red-50 p-3">
					<RadioGroup
						label="I confirm this refusal applies even if my life is at risk as a result"
						name="anhLifeRisk"
						options={yesNoLifeRisk}
						bind:value={ls.artificialNutritionHydration.evenIfLifeAtRisk}
						required
					/>
				</div>
				<TextArea label="Specification" name="anhSpec" bind:value={ls.artificialNutritionHydration.specification} placeholder="Any specific conditions or details" />
			{/if}
		</div>
	</div>

	<!-- Other life-sustaining treatments -->
	<div class="mt-6">
		<h3 class="mb-3 text-sm font-semibold text-gray-700">Other Life-Sustaining Treatments to Refuse</h3>
		{#each ls.otherLifeSustaining as other, i}
			<div class="mb-3 rounded-lg border-2 border-red-200 bg-red-50 p-3">
				<div class="flex items-start justify-between">
					<div class="flex-1">
						<input
							type="text"
							placeholder="Life-sustaining treatment name"
							bind:value={other.treatment}
							class="mb-2 w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-primary focus:outline-none"
						/>
						<RadioGroup
							label="This refusal applies even if my life is at risk"
							name="otherLSLifeRisk-{i}"
							options={yesNoLifeRisk}
							bind:value={other.evenIfLifeAtRisk}
						/>
						<textarea
							placeholder="Specification"
							bind:value={other.specification}
							rows={2}
							class="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-primary focus:outline-none"
						></textarea>
					</div>
					<button
						type="button"
						onclick={() => removeOther(i)}
						class="ml-2 text-red-500 hover:text-red-700"
						aria-label="Remove treatment"
					>
						&times;
					</button>
				</div>
			</div>
		{/each}
		<button
			type="button"
			onclick={addOther}
			class="rounded-lg border-2 border-dashed border-red-300 px-4 py-2 text-sm text-red-600 transition-colors hover:border-red-500 hover:text-red-700"
		>
			+ Add Another Life-Sustaining Treatment
		</button>
	</div>
</SectionCard>
