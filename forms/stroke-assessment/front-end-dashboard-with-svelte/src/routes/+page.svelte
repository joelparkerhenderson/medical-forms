<script lang="ts">
	import { Grid, Willow } from '@svar-ui/svelte-grid';
	import { fetchPatients } from '$lib/api.ts';
	import { patients as samplePatients } from '$lib/data.ts';
	import type { PatientRow } from '$lib/types.ts';

	let patients = $state<PatientRow[]>(samplePatients);
	let loading = $state(true);
	let error = $state('');
	let searchTerm = $state('');
	let nihssFilter = $state('');
	let severityFilter = $state('');
	let thrombolysisFilter = $state('');
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

	const nihssOptions = [
		{ value: '', label: 'All NIHSS scores' },
		{ value: '0', label: 'No stroke symptoms (0)' },
		{ value: '1-4', label: 'Minor stroke (1-4)' },
		{ value: '5-15', label: 'Moderate stroke (5-15)' },
		{ value: '16-20', label: 'Moderate to severe (16-20)' },
		{ value: '21-42', label: 'Severe stroke (21-42)' },
	];

	const severityOptions = [
		{ value: '', label: 'All severities' },
		{ value: 'No stroke symptoms', label: 'No stroke symptoms' },
		{ value: 'Minor stroke', label: 'Minor stroke' },
		{ value: 'Moderate stroke', label: 'Moderate stroke' },
		{ value: 'Moderate to severe stroke', label: 'Moderate to severe stroke' },
		{ value: 'Severe stroke', label: 'Severe stroke' },
	];

	const yesNoOptions = [
		{ value: '', label: 'All' },
		{ value: 'yes', label: 'Yes' },
		{ value: 'no', label: 'No' },
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
			id: 'nihssScore',
			header: 'NIHSS Score',
			width: 110,
			sort: true,
			template: (value: number) => `${value}/42`,
		},
		{
			id: 'strokeSeverity',
			header: 'Stroke Severity',
			flexgrow: 1,
			sort: true,
		},
		{
			id: 'onsetTime',
			header: 'Onset Time',
			width: 160,
			sort: true,
		},
		{
			id: 'thrombolysisEligible',
			header: 'tPA Eligible',
			width: 110,
			sort: true,
			template: (value: boolean) => (value ? 'Yes' : 'No'),
		},
	];

	function init(api: any) {
		gridApi = api;
		api.exec('sort-rows', { key: 'nihssScore', order: 'desc' });
	}

	function nihssInRange(score: number, range: string): boolean {
		switch (range) {
			case '0': return score === 0;
			case '1-4': return score >= 1 && score <= 4;
			case '5-15': return score >= 5 && score <= 15;
			case '16-20': return score >= 16 && score <= 20;
			case '21-42': return score >= 21 && score <= 42;
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
					row.strokeSeverity.toLowerCase().includes(term);
				if (!matches) return false;
			}

			// NIHSS score range filter
			if (nihssFilter && !nihssInRange(row.nihssScore, nihssFilter)) {
				return false;
			}

			// Severity filter
			if (severityFilter && row.strokeSeverity !== severityFilter) {
				return false;
			}

			// Thrombolysis filter
			if (thrombolysisFilter === 'yes' && !row.thrombolysisEligible) return false;
			if (thrombolysisFilter === 'no' && row.thrombolysisEligible) return false;

			return true;
		};

		gridApi.exec('filter-rows', { filter });
	}

	function clearFilters() {
		searchTerm = '';
		nihssFilter = '';
		severityFilter = '';
		thrombolysisFilter = '';
		if (gridApi) {
			gridApi.exec('filter-rows', { filter: () => true });
		}
	}

	let hasActiveFilters = $derived(
		searchTerm !== '' || nihssFilter !== '' || severityFilter !== '' || thrombolysisFilter !== ''
	);
</script>

<div class="min-h-screen bg-gray-50">
	<!-- Header -->
	<header class="bg-nhs-blue text-white shadow">
		<div class="mx-auto max-w-7xl px-4 py-4 sm:px-6">
			<h1 class="text-2xl font-bold">Stroke Assessment — Clinician Dashboard</h1>
			<p class="mt-1 text-sm text-blue-100">Patient list with stroke assessment status</p>
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
						placeholder="NHS number, name, or severity..."
						bind:value={searchTerm}
						oninput={applyFilters}
						class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					/>
				</div>

				<!-- NIHSS Score -->
				<div>
					<label for="nihss-filter" class="mb-1 block text-sm font-medium text-gray-700">
						NIHSS Score
					</label>
					<select
						id="nihss-filter"
						bind:value={nihssFilter}
						onchange={applyFilters}
						class="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					>
						{#each nihssOptions as opt (opt.value)}
							<option value={opt.value}>{opt.label}</option>
						{/each}
					</select>
				</div>

				<!-- Severity -->
				<div>
					<label for="severity-filter" class="mb-1 block text-sm font-medium text-gray-700">
						Severity
					</label>
					<select
						id="severity-filter"
						bind:value={severityFilter}
						onchange={applyFilters}
						class="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					>
						{#each severityOptions as opt (opt.value)}
							<option value={opt.value}>{opt.label}</option>
						{/each}
					</select>
				</div>

				<!-- Thrombolysis eligible -->
				<div>
					<label for="thrombolysis-filter" class="mb-1 block text-sm font-medium text-gray-700">
						tPA Eligible
					</label>
					<select
						id="thrombolysis-filter"
						bind:value={thrombolysisFilter}
						onchange={applyFilters}
						class="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					>
						{#each yesNoOptions as opt (opt.value)}
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
