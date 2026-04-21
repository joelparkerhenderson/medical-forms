<script lang="ts">
	import { Grid, Willow } from '@svar-ui/svelte-grid';
	import { fetchPatients } from '$lib/api.ts';
	import { patients as samplePatients } from '$lib/data.ts';
	import type { PatientRow } from '$lib/types.ts';

	let patients = $state<PatientRow[]>(samplePatients);
	let loading = $state(true);
	let error = $state('');
	let searchTerm = $state('');
	let mmseFilter = $state('');
	let cognitiveLevelFilter = $state('');
	let ageGroupFilter = $state('');
	let referralSourceFilter = $state('');
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

	const mmseOptions = [
		{ value: '', label: 'All MMSE scores' },
		{ value: '24-30', label: 'Normal (24-30)' },
		{ value: '18-23', label: 'Mild (18-23)' },
		{ value: '10-17', label: 'Moderate (10-17)' },
		{ value: '0-9', label: 'Severe (0-9)' },
	];

	const cognitiveLevelOptions = [
		{ value: '', label: 'All levels' },
		{ value: 'Normal cognition', label: 'Normal cognition' },
		{ value: 'Mild cognitive impairment', label: 'Mild cognitive impairment' },
		{ value: 'Moderate cognitive impairment', label: 'Moderate cognitive impairment' },
		{ value: 'Severe cognitive impairment', label: 'Severe cognitive impairment' },
	];

	const ageGroupOptions = [
		{ value: '', label: 'All age groups' },
		{ value: '55-64', label: '55-64' },
		{ value: '65-74', label: '65-74' },
		{ value: '75-84', label: '75-84' },
		{ value: '85+', label: '85+' },
	];

	const referralSourceOptions = [
		{ value: '', label: 'All referral sources' },
		{ value: 'GP', label: 'GP' },
		{ value: 'Neurologist', label: 'Neurologist' },
		{ value: 'Psychiatrist', label: 'Psychiatrist' },
		{ value: 'Geriatrician', label: 'Geriatrician' },
		{ value: 'Self', label: 'Self' },
		{ value: 'Family', label: 'Family' },
	];

	const columns = [
		{
			id: 'nhsNumber',
			header: 'NHS Number',
			width: 140,
			sort: true,
		},
		{
			id: 'patientName',
			header: 'Patient Name',
			flexgrow: 1,
			sort: true,
		},
		{
			id: 'mmseScore',
			header: 'MMSE Score',
			width: 110,
			sort: true,
			template: (value: number) => `${value}/30`,
		},
		{
			id: 'cognitiveLevel',
			header: 'Cognitive Level',
			flexgrow: 1,
			sort: true,
		},
		{
			id: 'ageGroup',
			header: 'Age Group',
			width: 110,
			sort: true,
		},
		{
			id: 'referralSource',
			header: 'Referral Source',
			width: 140,
			sort: true,
		},
	];

	function init(api: any) {
		gridApi = api;
		api.exec('sort-rows', { key: 'patientName', order: 'asc' });
	}

	function mmseInRange(score: number, range: string): boolean {
		switch (range) {
			case '24-30': return score >= 24 && score <= 30;
			case '18-23': return score >= 18 && score <= 23;
			case '10-17': return score >= 10 && score <= 17;
			case '0-9': return score >= 0 && score <= 9;
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
					row.nhsNumber.toLowerCase().includes(term) ||
					row.patientName.toLowerCase().includes(term) ||
					row.cognitiveLevel.toLowerCase().includes(term);
				if (!matches) return false;
			}

			// MMSE score range filter
			if (mmseFilter && !mmseInRange(row.mmseScore, mmseFilter)) {
				return false;
			}

			// Cognitive level filter
			if (cognitiveLevelFilter && row.cognitiveLevel !== cognitiveLevelFilter) {
				return false;
			}

			// Age group filter
			if (ageGroupFilter && row.ageGroup !== ageGroupFilter) {
				return false;
			}

			// Referral source filter
			if (referralSourceFilter && row.referralSource !== referralSourceFilter) {
				return false;
			}

			return true;
		};

		gridApi.exec('filter-rows', { filter });
	}

	function clearFilters() {
		searchTerm = '';
		mmseFilter = '';
		cognitiveLevelFilter = '';
		ageGroupFilter = '';
		referralSourceFilter = '';
		if (gridApi) {
			gridApi.exec('filter-rows', { filter: () => true });
		}
	}

	let hasActiveFilters = $derived(
		searchTerm !== '' || mmseFilter !== '' || cognitiveLevelFilter !== '' || ageGroupFilter !== '' || referralSourceFilter !== ''
	);
</script>

<div class="min-h-screen bg-gray-50">
	<!-- Header -->
	<header class="bg-nhs-blue text-white shadow">
		<div class="mx-auto max-w-7xl px-4 py-4 sm:px-6">
			<h1 class="text-2xl font-bold">Cognitive Assessment — Clinician Dashboard</h1>
			<p class="mt-1 text-sm text-blue-100">Patient list with cognitive assessment status</p>
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
						placeholder="NHS number, name, or cognitive level..."
						bind:value={searchTerm}
						oninput={applyFilters}
						class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					/>
				</div>

				<!-- MMSE Score -->
				<div>
					<label for="mmse-filter" class="mb-1 block text-sm font-medium text-gray-700">
						MMSE Score
					</label>
					<select
						id="mmse-filter"
						bind:value={mmseFilter}
						onchange={applyFilters}
						class="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					>
						{#each mmseOptions as opt (opt.value)}
							<option value={opt.value}>{opt.label}</option>
						{/each}
					</select>
				</div>

				<!-- Cognitive Level -->
				<div>
					<label for="cognitive-filter" class="mb-1 block text-sm font-medium text-gray-700">
						Cognitive Level
					</label>
					<select
						id="cognitive-filter"
						bind:value={cognitiveLevelFilter}
						onchange={applyFilters}
						class="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					>
						{#each cognitiveLevelOptions as opt (opt.value)}
							<option value={opt.value}>{opt.label}</option>
						{/each}
					</select>
				</div>

				<!-- Age Group -->
				<div>
					<label for="age-filter" class="mb-1 block text-sm font-medium text-gray-700">
						Age Group
					</label>
					<select
						id="age-filter"
						bind:value={ageGroupFilter}
						onchange={applyFilters}
						class="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					>
						{#each ageGroupOptions as opt (opt.value)}
							<option value={opt.value}>{opt.label}</option>
						{/each}
					</select>
				</div>

				<!-- Referral Source -->
				<div>
					<label for="referral-filter" class="mb-1 block text-sm font-medium text-gray-700">
						Referral Source
					</label>
					<select
						id="referral-filter"
						bind:value={referralSourceFilter}
						onchange={applyFilters}
						class="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					>
						{#each referralSourceOptions as opt (opt.value)}
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
