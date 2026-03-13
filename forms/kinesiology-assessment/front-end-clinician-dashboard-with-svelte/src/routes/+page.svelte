<script lang="ts">
	import { Grid, Willow } from '@svar-ui/svelte-grid';
	import { fetchPatients } from '$lib/api.ts';
	import { patients as samplePatients } from '$lib/data.ts';
	import type { PatientRow } from '$lib/types.ts';

	let patients = $state<PatientRow[]>(samplePatients);
	let loading = $state(true);
	let error = $state('');
	let searchTerm = $state('');
	let fmsFilter = $state('');
	let categoryFilter = $state('');
	let painFilter = $state('');
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

	const fmsOptions = [
		{ value: '', label: 'All FMS scores' },
		{ value: '18-21', label: 'Excellent (18-21)' },
		{ value: '14-17', label: 'Good (14-17)' },
		{ value: '10-13', label: 'Fair (10-13)' },
		{ value: '0-9', label: 'Poor (0-9)' },
	];

	const categoryOptions = [
		{ value: '', label: 'All categories' },
		{ value: 'Excellent', label: 'Excellent' },
		{ value: 'Good', label: 'Good' },
		{ value: 'Fair', label: 'Fair' },
		{ value: 'Poor', label: 'Poor' },
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
			id: 'fmsScore',
			header: 'FMS Score',
			width: 110,
			sort: true,
			template: (value: number) => `${value}/21`,
		},
		{
			id: 'movementCategory',
			header: 'Category',
			width: 120,
			sort: true,
		},
		{
			id: 'sportType',
			header: 'Sport/Activity',
			flexgrow: 1,
			sort: true,
		},
		{
			id: 'painFlag',
			header: 'Pain Flag',
			width: 100,
			sort: true,
			template: (value: boolean) => (value ? 'Yes' : 'No'),
		},
	];

	function init(api: any) {
		gridApi = api;
		api.exec('sort-rows', { key: 'patientName', order: 'asc' });
	}

	function fmsInRange(score: number, range: string): boolean {
		switch (range) {
			case '18-21': return score >= 18 && score <= 21;
			case '14-17': return score >= 14 && score <= 17;
			case '10-13': return score >= 10 && score <= 13;
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
					row.sportType.toLowerCase().includes(term);
				if (!matches) return false;
			}

			// FMS score range filter
			if (fmsFilter && !fmsInRange(row.fmsScore, fmsFilter)) {
				return false;
			}

			// Category filter
			if (categoryFilter && row.movementCategory !== categoryFilter) {
				return false;
			}

			// Pain filter
			if (painFilter === 'yes' && !row.painFlag) return false;
			if (painFilter === 'no' && row.painFlag) return false;

			return true;
		};

		gridApi.exec('filter-rows', { filter });
	}

	function clearFilters() {
		searchTerm = '';
		fmsFilter = '';
		categoryFilter = '';
		painFilter = '';
		if (gridApi) {
			gridApi.exec('filter-rows', { filter: () => true });
		}
	}

	let hasActiveFilters = $derived(
		searchTerm !== '' || fmsFilter !== '' || categoryFilter !== '' || painFilter !== ''
	);
</script>

<div class="min-h-screen bg-gray-50">
	<!-- Header -->
	<header class="bg-nhs-blue text-white shadow">
		<div class="mx-auto max-w-7xl px-4 py-4 sm:px-6">
			<h1 class="text-2xl font-bold">Kinesiology Assessment — Clinician Dashboard</h1>
			<p class="mt-1 text-sm text-blue-100">Patient list with FMS assessment status</p>
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
						placeholder="NHS number, name, or sport..."
						bind:value={searchTerm}
						oninput={applyFilters}
						class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					/>
				</div>

				<!-- FMS Score -->
				<div>
					<label for="fms-filter" class="mb-1 block text-sm font-medium text-gray-700">
						FMS Score
					</label>
					<select
						id="fms-filter"
						bind:value={fmsFilter}
						onchange={applyFilters}
						class="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					>
						{#each fmsOptions as opt (opt.value)}
							<option value={opt.value}>{opt.label}</option>
						{/each}
					</select>
				</div>

				<!-- Category -->
				<div>
					<label for="category-filter" class="mb-1 block text-sm font-medium text-gray-700">
						Category
					</label>
					<select
						id="category-filter"
						bind:value={categoryFilter}
						onchange={applyFilters}
						class="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					>
						{#each categoryOptions as opt (opt.value)}
							<option value={opt.value}>{opt.label}</option>
						{/each}
					</select>
				</div>

				<!-- Pain flag -->
				<div>
					<label for="pain-filter" class="mb-1 block text-sm font-medium text-gray-700">
						Pain Flag
					</label>
					<select
						id="pain-filter"
						bind:value={painFilter}
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
