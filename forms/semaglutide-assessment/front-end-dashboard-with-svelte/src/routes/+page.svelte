<script lang="ts">
	import { Grid, Willow } from '@svar-ui/svelte-grid';
	import { fetchPatients } from '$lib/api.ts';
	import { patients as samplePatients } from '$lib/data.ts';
	import type { PatientRow } from '$lib/types.ts';

	let patients = $state<PatientRow[]>(samplePatients);
	let loading = $state(true);
	let error = $state('');
	let searchTerm = $state('');
	let eligibilityFilter = $state('');
	let indicationFilter = $state('');
	let reviewFilter = $state('');
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

	const eligibilityOptions = [
		{ value: '', label: 'All statuses' },
		{ value: 'Eligible', label: 'Eligible' },
		{ value: 'Conditional', label: 'Conditional' },
		{ value: 'Ineligible', label: 'Ineligible' },
	];

	const indicationOptions = [
		{ value: '', label: 'All indications' },
		{ value: 'Type 2 Diabetes', label: 'Type 2 Diabetes' },
		{ value: 'Weight Management', label: 'Weight Management' },
		{ value: 'Cardiovascular Risk Reduction', label: 'Cardiovascular Risk Reduction' },
	];

	const reviewOptions = [
		{ value: '', label: 'All review statuses' },
		{ value: 'Complete', label: 'Complete' },
		{ value: 'Pending Review', label: 'Pending Review' },
		{ value: 'Awaiting Labs', label: 'Awaiting Labs' },
		{ value: 'Declined', label: 'Declined' },
	];

	const columns = [
		{
			id: 'nhsNumber',
			header: 'NHS Number',
			width: 140,
			sort: true,
		},
		{
			id: 'lastName',
			header: 'Last Name',
			width: 120,
			sort: true,
		},
		{
			id: 'firstName',
			header: 'First Name',
			width: 120,
			sort: true,
		},
		{
			id: 'eligibilityStatus',
			header: 'Eligibility',
			width: 120,
			sort: true,
		},
		{
			id: 'primaryIndication',
			header: 'Indication',
			flexgrow: 1,
			sort: true,
		},
		{
			id: 'bmi',
			header: 'BMI',
			width: 80,
			sort: true,
			template: (value: number) => value.toFixed(1),
		},
		{
			id: 'currentDose',
			header: 'Current Dose',
			width: 130,
			sort: true,
		},
		{
			id: 'reviewStatus',
			header: 'Review Status',
			width: 140,
			sort: true,
		},
	];

	function init(api: any) {
		gridApi = api;
		api.exec('sort-rows', { key: 'lastName', order: 'asc' });
	}

	function applyFilters() {
		if (!gridApi) return;

		const term = searchTerm.toLowerCase();

		const filter = (row: PatientRow) => {
			// Text search across key fields
			if (term) {
				const matches =
					row.nhsNumber.toLowerCase().includes(term) ||
					row.firstName.toLowerCase().includes(term) ||
					row.lastName.toLowerCase().includes(term) ||
					row.primaryIndication.toLowerCase().includes(term);
				if (!matches) return false;
			}

			// Eligibility status filter
			if (eligibilityFilter && row.eligibilityStatus !== eligibilityFilter) {
				return false;
			}

			// Indication filter
			if (indicationFilter && row.primaryIndication !== indicationFilter) {
				return false;
			}

			// Review status filter
			if (reviewFilter && row.reviewStatus !== reviewFilter) {
				return false;
			}

			return true;
		};

		gridApi.exec('filter-rows', { filter });
	}

	function clearFilters() {
		searchTerm = '';
		eligibilityFilter = '';
		indicationFilter = '';
		reviewFilter = '';
		if (gridApi) {
			gridApi.exec('filter-rows', { filter: () => true });
		}
	}

	let hasActiveFilters = $derived(
		searchTerm !== '' || eligibilityFilter !== '' || indicationFilter !== '' || reviewFilter !== ''
	);
</script>

<div class="min-h-screen bg-gray-50">
	<!-- Header -->
	<header class="bg-nhs-blue text-white shadow">
		<div class="mx-auto max-w-7xl px-4 py-4 sm:px-6">
			<h1 class="text-2xl font-bold">Semaglutide Assessment — Clinician Dashboard</h1>
			<p class="mt-1 text-sm text-blue-100">Patient list with semaglutide eligibility and treatment status</p>
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
						placeholder="NHS number, name, or indication..."
						bind:value={searchTerm}
						oninput={applyFilters}
						class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					/>
				</div>

				<!-- Eligibility Status -->
				<div>
					<label for="eligibility-filter" class="mb-1 block text-sm font-medium text-gray-700">
						Eligibility
					</label>
					<select
						id="eligibility-filter"
						bind:value={eligibilityFilter}
						onchange={applyFilters}
						class="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					>
						{#each eligibilityOptions as opt (opt.value)}
							<option value={opt.value}>{opt.label}</option>
						{/each}
					</select>
				</div>

				<!-- Indication -->
				<div>
					<label for="indication-filter" class="mb-1 block text-sm font-medium text-gray-700">
						Indication
					</label>
					<select
						id="indication-filter"
						bind:value={indicationFilter}
						onchange={applyFilters}
						class="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					>
						{#each indicationOptions as opt (opt.value)}
							<option value={opt.value}>{opt.label}</option>
						{/each}
					</select>
				</div>

				<!-- Review Status -->
				<div>
					<label for="review-filter" class="mb-1 block text-sm font-medium text-gray-700">
						Review Status
					</label>
					<select
						id="review-filter"
						bind:value={reviewFilter}
						onchange={applyFilters}
						class="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					>
						{#each reviewOptions as opt (opt.value)}
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
