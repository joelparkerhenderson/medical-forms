<script lang="ts">
	import { Grid, Willow } from '@svar-ui/svelte-grid';
	import { fetchPatients } from '$lib/api.ts';
	import { patients as samplePatients } from '$lib/data.ts';
	import type { PatientRow } from '$lib/types.ts';

	let patients = $state<PatientRow[]>(samplePatients);
	let loading = $state(true);
	let error = $state('');
	let searchTerm = $state('');
	let abnormalityLevelFilter = $state('');
	let scoreRangeFilter = $state('');
	let gridApi = $state<any>(null);

	// Load patients from backend API, fall back to sample data
	$effect(() => {
		fetchPatients()
			.then((items) => {
				if (items.length > 0) {
					patients = items;
				}
				loading = false;
			})
			.catch(() => {
				// Backend unavailable — use sample data
				loading = false;
			});
	});

	const abnormalityLevelOptions = [
		{ value: '', label: 'All levels' },
		{ value: 'normal', label: 'Normal' },
		{ value: 'mildAbnormality', label: 'Mild Abnormality' },
		{ value: 'moderateAbnormality', label: 'Moderate Abnormality' },
		{ value: 'severeAbnormality', label: 'Severe Abnormality' },
		{ value: 'critical', label: 'Critical' },
	];

	const scoreRangeOptions = [
		{ value: '', label: 'All scores' },
		{ value: '0', label: 'Normal (0%)' },
		{ value: '1-20', label: 'Mild (1-20%)' },
		{ value: '21-50', label: 'Moderate (21-50%)' },
		{ value: '51-75', label: 'Severe (51-75%)' },
		{ value: '76-100', label: 'Critical (76-100%)' },
	];

	function abnormalityLevelLabel(level: string): string {
		switch (level) {
			case 'normal': return 'Normal';
			case 'mildAbnormality': return 'Mild';
			case 'moderateAbnormality': return 'Moderate';
			case 'severeAbnormality': return 'Severe';
			case 'critical': return 'Critical';
			case 'draft': return 'Draft';
			default: return level || 'Unknown';
		}
	}

	const columns = [
		{
			id: 'patientName',
			header: 'Patient Name',
			flexgrow: 1,
			sort: true,
		},
		{
			id: 'mrn',
			header: 'MRN',
			width: 140,
			sort: true,
		},
		{
			id: 'specimenDate',
			header: 'Specimen Date',
			width: 130,
			sort: true,
		},
		{
			id: 'referringPhysician',
			header: 'Physician',
			flexgrow: 1,
			sort: true,
		},
		{
			id: 'abnormalityLevel',
			header: 'Level',
			width: 120,
			sort: true,
			template: (value: string) => abnormalityLevelLabel(value),
		},
		{
			id: 'abnormalityScore',
			header: 'Score',
			width: 90,
			sort: true,
			template: (value: number) => `${value}%`,
		},
		{
			id: 'diagnosis',
			header: 'Diagnosis',
			flexgrow: 1,
			sort: true,
		},
	];

	function init(api: any) {
		gridApi = api;
		api.exec('sort-rows', { key: 'specimenDate', order: 'desc' });
	}

	function scoreInRange(score: number, range: string): boolean {
		switch (range) {
			case '0': return score === 0;
			case '1-20': return score >= 1 && score <= 20;
			case '21-50': return score >= 21 && score <= 50;
			case '51-75': return score >= 51 && score <= 75;
			case '76-100': return score >= 76 && score <= 100;
			default: return true;
		}
	}

	function applyFilters() {
		if (!gridApi) return;

		const term = searchTerm.toLowerCase();

		const filter = (row: PatientRow) => {
			// Text search across key fields
			if (term) {
				const matches =
					row.patientName.toLowerCase().includes(term) ||
					row.mrn.toLowerCase().includes(term) ||
					row.referringPhysician.toLowerCase().includes(term) ||
					row.diagnosis.toLowerCase().includes(term);
				if (!matches) return false;
			}

			// Abnormality level filter
			if (abnormalityLevelFilter && row.abnormalityLevel !== abnormalityLevelFilter) {
				return false;
			}

			// Score range filter
			if (scoreRangeFilter && !scoreInRange(row.abnormalityScore, scoreRangeFilter)) {
				return false;
			}

			return true;
		};

		gridApi.exec('filter-rows', { filter });
	}

	function clearFilters() {
		searchTerm = '';
		abnormalityLevelFilter = '';
		scoreRangeFilter = '';
		if (gridApi) {
			gridApi.exec('filter-rows', { filter: () => true });
		}
	}

	let hasActiveFilters = $derived(
		searchTerm !== '' || abnormalityLevelFilter !== '' || scoreRangeFilter !== ''
	);
</script>

<div class="min-h-screen bg-gray-50">
	<!-- Header -->
	<header class="bg-nhs-blue text-white shadow">
		<div class="mx-auto max-w-7xl px-4 py-4 sm:px-6">
			<h1 class="text-2xl font-bold">Hematology Assessment — Clinician Dashboard</h1>
			<p class="mt-1 text-sm text-blue-100">Patient list with hematology assessment status</p>
		</div>
	</header>

	<main class="mx-auto max-w-7xl px-4 py-6 sm:px-6">
		<!-- Filters bar -->
		<div class="mb-4 rounded-lg bg-white p-4 shadow-sm">
			<div class="flex flex-wrap items-end gap-4">
				<!-- Search -->
				<div class="min-w-[240px] flex-1">
					<label for="search" class="mb-1 block text-sm font-medium text-gray-700">
						Search
					</label>
					<input
						id="search"
						type="text"
						placeholder="Patient name, MRN, physician, or diagnosis..."
						bind:value={searchTerm}
						oninput={applyFilters}
						class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					/>
				</div>

				<!-- Abnormality Level -->
				<div>
					<label for="level-filter" class="mb-1 block text-sm font-medium text-gray-700">
						Abnormality Level
					</label>
					<select
						id="level-filter"
						bind:value={abnormalityLevelFilter}
						onchange={applyFilters}
						class="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					>
						{#each abnormalityLevelOptions as opt (opt.value)}
							<option value={opt.value}>{opt.label}</option>
						{/each}
					</select>
				</div>

				<!-- Score Range -->
				<div>
					<label for="score-filter" class="mb-1 block text-sm font-medium text-gray-700">
						Score Range
					</label>
					<select
						id="score-filter"
						bind:value={scoreRangeFilter}
						onchange={applyFilters}
						class="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					>
						{#each scoreRangeOptions as opt (opt.value)}
							<option value={opt.value}>{opt.label}</option>
						{/each}
					</select>
				</div>

				<!-- Clear filters -->
				{#if hasActiveFilters}
					<button
						onclick={clearFilters}
						class="rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
					>
						Clear filters
					</button>
				{/if}
			</div>
		</div>

		<!-- Data grid -->
		<div class="rounded-lg bg-white shadow-sm" style="height: 600px;">
			{#if loading}
				<div class="flex h-full items-center justify-center text-muted">
					Loading patients...
				</div>
			{:else}
				<Willow>
					<Grid data={patients} {columns} {init} />
				</Willow>
			{/if}
		</div>

		<!-- Summary -->
		<div class="mt-4 flex items-center gap-4 text-sm text-muted">
			<span>{patients.length} patients total</span>
			{#if error}
				<span class="text-warning">{error}</span>
			{/if}
		</div>
	</main>
</div>
