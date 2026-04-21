<script lang="ts">
	import { Grid, Willow } from '@svar-ui/svelte-grid';
	import { fetchPatients } from '$lib/api.ts';
	import { patients as samplePatients } from '$lib/data.ts';
	import type { PatientRow } from '$lib/types.ts';

	let patients = $state<PatientRow[]>(samplePatients);
	let loading = $state(true);
	let error = $state('');
	let searchTerm = $state('');
	let performanceFilter = $state('');
	let satisfactionFilter = $state('');
	let priorityFilter = $state('');
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

	const scoreRangeOptions = [
		{ value: '', label: 'All scores' },
		{ value: 'significant', label: 'Significant issues (<5)' },
		{ value: 'moderate', label: 'Moderate concerns (5-7)' },
		{ value: 'good', label: 'Good performance (>7)' },
	];

	const priorityOptions = [
		{ value: '', label: 'All priority areas' },
		{ value: 'Self-care', label: 'Self-care' },
		{ value: 'Mobility', label: 'Mobility' },
		{ value: 'Cognitive', label: 'Cognitive' },
		{ value: 'Pain', label: 'Pain management' },
		{ value: 'work', label: 'Return to work' },
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
			id: 'performanceScore',
			header: 'Performance',
			width: 120,
			sort: true,
			template: (value: number) => `${value}/10`,
		},
		{
			id: 'satisfactionScore',
			header: 'Satisfaction',
			width: 120,
			sort: true,
			template: (value: number) => `${value}/10`,
		},
		{
			id: 'primaryDiagnosis',
			header: 'Primary Diagnosis',
			flexgrow: 1,
			sort: true,
		},
		{
			id: 'priorityArea',
			header: 'Priority Area',
			width: 180,
			sort: true,
		},
	];

	function init(api: any) {
		gridApi = api;
		api.exec('sort-rows', { key: 'patientName', order: 'asc' });
	}

	function scoreInRange(score: number, range: string): boolean {
		switch (range) {
			case 'significant': return score < 5;
			case 'moderate': return score >= 5 && score <= 7;
			case 'good': return score > 7;
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
					row.primaryDiagnosis.toLowerCase().includes(term) ||
					row.priorityArea.toLowerCase().includes(term);
				if (!matches) return false;
			}

			// Performance score range filter
			if (performanceFilter && !scoreInRange(row.performanceScore, performanceFilter)) {
				return false;
			}

			// Satisfaction score range filter
			if (satisfactionFilter && !scoreInRange(row.satisfactionScore, satisfactionFilter)) {
				return false;
			}

			// Priority area filter
			if (priorityFilter && !row.priorityArea.toLowerCase().includes(priorityFilter.toLowerCase())) {
				return false;
			}

			return true;
		};

		gridApi.exec('filter-rows', { filter });
	}

	function clearFilters() {
		searchTerm = '';
		performanceFilter = '';
		satisfactionFilter = '';
		priorityFilter = '';
		if (gridApi) {
			gridApi.exec('filter-rows', { filter: () => true });
		}
	}

	let hasActiveFilters = $derived(
		searchTerm !== '' || performanceFilter !== '' || satisfactionFilter !== '' || priorityFilter !== ''
	);
</script>

<div class="min-h-screen bg-gray-50">
	<!-- Header -->
	<header class="bg-nhs-blue text-white shadow">
		<div class="mx-auto max-w-7xl px-4 py-4 sm:px-6">
			<h1 class="text-2xl font-bold">Occupational Therapy Assessment — Clinician Dashboard</h1>
			<p class="mt-1 text-sm text-blue-100">Patient list with COPM assessment status</p>
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
						placeholder="NHS number, name, diagnosis, or priority..."
						bind:value={searchTerm}
						oninput={applyFilters}
						class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					/>
				</div>

				<!-- Performance Score -->
				<div>
					<label for="performance-filter" class="mb-1 block text-sm font-medium text-gray-700">
						Performance
					</label>
					<select
						id="performance-filter"
						bind:value={performanceFilter}
						onchange={applyFilters}
						class="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					>
						{#each scoreRangeOptions as opt (opt.value)}
							<option value={opt.value}>{opt.label}</option>
						{/each}
					</select>
				</div>

				<!-- Satisfaction Score -->
				<div>
					<label for="satisfaction-filter" class="mb-1 block text-sm font-medium text-gray-700">
						Satisfaction
					</label>
					<select
						id="satisfaction-filter"
						bind:value={satisfactionFilter}
						onchange={applyFilters}
						class="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					>
						{#each scoreRangeOptions as opt (opt.value)}
							<option value={opt.value}>{opt.label}</option>
						{/each}
					</select>
				</div>

				<!-- Priority Area -->
				<div>
					<label for="priority-filter" class="mb-1 block text-sm font-medium text-gray-700">
						Priority Area
					</label>
					<select
						id="priority-filter"
						bind:value={priorityFilter}
						onchange={applyFilters}
						class="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					>
						{#each priorityOptions as opt (opt.value)}
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
