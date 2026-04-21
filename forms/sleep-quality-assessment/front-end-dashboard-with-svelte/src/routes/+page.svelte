<script lang="ts">
	import { Grid, Willow } from '@svar-ui/svelte-grid';
	import { fetchPatients } from '$lib/api.ts';
	import { patients as samplePatients } from '$lib/data.ts';
	import type { PatientRow } from '$lib/types.ts';

	let patients = $state<PatientRow[]>(samplePatients);
	let loading = $state(true);
	let error = $state('');
	let searchTerm = $state('');
	let psqiFilter = $state('');
	let sleepQualityFilter = $state('');
	let snoringFilter = $state('');
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

	const psqiOptions = [
		{ value: '', label: 'All PSQI scores' },
		{ value: '0-5', label: 'Good sleep quality (0-5)' },
		{ value: '6-10', label: 'Poor sleep quality (6-10)' },
		{ value: '11-15', label: 'Sleep disorder likely (11-15)' },
		{ value: '16-21', label: 'Severe sleep disturbance (16-21)' },
	];

	const sleepQualityOptions = [
		{ value: '', label: 'All categories' },
		{ value: 'Good sleep quality', label: 'Good sleep quality' },
		{ value: 'Poor sleep quality', label: 'Poor sleep quality' },
		{ value: 'Sleep disorder likely', label: 'Sleep disorder likely' },
		{ value: 'Severe sleep disturbance', label: 'Severe sleep disturbance' },
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
			id: 'psqiScore',
			header: 'PSQI Score',
			width: 110,
			sort: true,
			template: (value: number) => `${value}/21`,
		},
		{
			id: 'sleepQuality',
			header: 'Sleep Quality',
			width: 180,
			sort: true,
		},
		{
			id: 'primaryConcern',
			header: 'Primary Concern',
			flexgrow: 1,
			sort: true,
		},
		{
			id: 'snoringFlag',
			header: 'Snoring',
			width: 100,
			sort: true,
			template: (value: boolean) => (value ? 'Yes' : 'No'),
		},
	];

	function init(api: any) {
		gridApi = api;
		api.exec('sort-rows', { key: 'patientName', order: 'asc' });
	}

	function psqiInRange(score: number, range: string): boolean {
		switch (range) {
			case '0-5': return score >= 0 && score <= 5;
			case '6-10': return score >= 6 && score <= 10;
			case '11-15': return score >= 11 && score <= 15;
			case '16-21': return score >= 16 && score <= 21;
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
					row.primaryConcern.toLowerCase().includes(term);
				if (!matches) return false;
			}

			// PSQI score range filter
			if (psqiFilter && !psqiInRange(row.psqiScore, psqiFilter)) {
				return false;
			}

			// Sleep quality filter
			if (sleepQualityFilter && row.sleepQuality !== sleepQualityFilter) {
				return false;
			}

			// Snoring filter
			if (snoringFilter === 'yes' && !row.snoringFlag) return false;
			if (snoringFilter === 'no' && row.snoringFlag) return false;

			return true;
		};

		gridApi.exec('filter-rows', { filter });
	}

	function clearFilters() {
		searchTerm = '';
		psqiFilter = '';
		sleepQualityFilter = '';
		snoringFilter = '';
		if (gridApi) {
			gridApi.exec('filter-rows', { filter: () => true });
		}
	}

	let hasActiveFilters = $derived(
		searchTerm !== '' || psqiFilter !== '' || sleepQualityFilter !== '' || snoringFilter !== ''
	);
</script>

<div class="min-h-screen bg-gray-50">
	<!-- Header -->
	<header class="bg-nhs-blue text-white shadow">
		<div class="mx-auto max-w-7xl px-4 py-4 sm:px-6">
			<h1 class="text-2xl font-bold">Sleep Quality Assessment — Clinician Dashboard</h1>
			<p class="mt-1 text-sm text-blue-100">Patient list with sleep quality assessment status</p>
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
						placeholder="NHS number, name, or concern..."
						bind:value={searchTerm}
						oninput={applyFilters}
						class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					/>
				</div>

				<!-- PSQI Score -->
				<div>
					<label for="psqi-filter" class="mb-1 block text-sm font-medium text-gray-700">
						PSQI Score
					</label>
					<select
						id="psqi-filter"
						bind:value={psqiFilter}
						onchange={applyFilters}
						class="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					>
						{#each psqiOptions as opt (opt.value)}
							<option value={opt.value}>{opt.label}</option>
						{/each}
					</select>
				</div>

				<!-- Sleep Quality -->
				<div>
					<label for="quality-filter" class="mb-1 block text-sm font-medium text-gray-700">
						Sleep Quality
					</label>
					<select
						id="quality-filter"
						bind:value={sleepQualityFilter}
						onchange={applyFilters}
						class="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					>
						{#each sleepQualityOptions as opt (opt.value)}
							<option value={opt.value}>{opt.label}</option>
						{/each}
					</select>
				</div>

				<!-- Snoring flag -->
				<div>
					<label for="snoring-filter" class="mb-1 block text-sm font-medium text-gray-700">
						Snoring
					</label>
					<select
						id="snoring-filter"
						bind:value={snoringFilter}
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
