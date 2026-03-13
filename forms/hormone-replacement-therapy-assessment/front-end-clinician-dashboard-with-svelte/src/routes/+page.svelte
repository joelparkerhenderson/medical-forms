<script lang="ts">
	import { Grid, Willow } from '@svar-ui/svelte-grid';
	import { fetchPatients } from '$lib/api.ts';
	import { patients as samplePatients } from '$lib/data.ts';
	import type { PatientRow } from '$lib/types.ts';

	let patients = $state<PatientRow[]>(samplePatients);
	let loading = $state(true);
	let error = $state('');
	let searchTerm = $state('');
	let mrsFilter = $state('');
	let riskFilter = $state('');
	let hrtFilter = $state('');
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

	const mrsOptions = [
		{ value: '', label: 'All MRS scores' },
		{ value: 'minimal', label: 'No/Minimal (0-4)' },
		{ value: 'mild', label: 'Mild (5-8)' },
		{ value: 'moderate', label: 'Moderate (9-15)' },
		{ value: 'severe', label: 'Severe (16-44)' },
	];

	const riskOptions = [
		{ value: '', label: 'All classifications' },
		{ value: 'Favourable', label: 'Favourable' },
		{ value: 'Acceptable', label: 'Acceptable' },
		{ value: 'Cautious', label: 'Cautious' },
		{ value: 'Contraindicated', label: 'Contraindicated' },
	];

	const hrtOptions = [
		{ value: '', label: 'All HRT statuses' },
		{ value: 'yes', label: 'On HRT' },
		{ value: 'no', label: 'Not on HRT' },
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
			id: 'mrsScore',
			header: 'MRS Score',
			width: 110,
			sort: true,
			template: (value: number) => {
				if (value <= 4) return `${value} (Minimal)`;
				if (value <= 8) return `${value} (Mild)`;
				if (value <= 15) return `${value} (Moderate)`;
				return `${value} (Severe)`;
			},
		},
		{
			id: 'menopauseStatus',
			header: 'Menopause Status',
			width: 150,
			sort: true,
		},
		{
			id: 'riskClassification',
			header: 'Risk Classification',
			width: 160,
			sort: true,
		},
		{
			id: 'currentHRT',
			header: 'Current HRT',
			flexgrow: 1,
			sort: true,
		},
	];

	function init(api: any) {
		gridApi = api;
		api.exec('sort-rows', { key: 'patientName', order: 'asc' });
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
					row.currentHRT.toLowerCase().includes(term);
				if (!matches) return false;
			}

			// MRS score severity filter
			if (mrsFilter) {
				if (mrsFilter === 'minimal' && row.mrsScore > 4) return false;
				if (mrsFilter === 'mild' && (row.mrsScore < 5 || row.mrsScore > 8)) return false;
				if (mrsFilter === 'moderate' && (row.mrsScore < 9 || row.mrsScore > 15)) return false;
				if (mrsFilter === 'severe' && row.mrsScore < 16) return false;
			}

			// Risk classification filter
			if (riskFilter && row.riskClassification !== riskFilter) {
				return false;
			}

			// HRT status filter
			if (hrtFilter === 'yes' && (row.currentHRT === 'None' || row.currentHRT === 'Discontinued')) return false;
			if (hrtFilter === 'no' && row.currentHRT !== 'None' && row.currentHRT !== 'Discontinued') return false;

			return true;
		};

		gridApi.exec('filter-rows', { filter });
	}

	function clearFilters() {
		searchTerm = '';
		mrsFilter = '';
		riskFilter = '';
		hrtFilter = '';
		if (gridApi) {
			gridApi.exec('filter-rows', { filter: () => true });
		}
	}

	let hasActiveFilters = $derived(
		searchTerm !== '' || mrsFilter !== '' || riskFilter !== '' || hrtFilter !== ''
	);
</script>

<div class="min-h-screen bg-gray-50">
	<!-- Header -->
	<header class="bg-nhs-blue text-white shadow">
		<div class="mx-auto max-w-7xl px-4 py-4 sm:px-6">
			<h1 class="text-2xl font-bold">HRT Assessment — Clinician Dashboard</h1>
			<p class="mt-1 text-sm text-blue-100">Patient list with menopause symptom assessment and HRT status</p>
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
						placeholder="NHS number, name, or HRT..."
						bind:value={searchTerm}
						oninput={applyFilters}
						class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					/>
				</div>

				<!-- MRS Score -->
				<div>
					<label for="mrs-filter" class="mb-1 block text-sm font-medium text-gray-700">
						MRS Severity
					</label>
					<select
						id="mrs-filter"
						bind:value={mrsFilter}
						onchange={applyFilters}
						class="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					>
						{#each mrsOptions as opt (opt.value)}
							<option value={opt.value}>{opt.label}</option>
						{/each}
					</select>
				</div>

				<!-- Risk Classification -->
				<div>
					<label for="risk-filter" class="mb-1 block text-sm font-medium text-gray-700">
						Risk Classification
					</label>
					<select
						id="risk-filter"
						bind:value={riskFilter}
						onchange={applyFilters}
						class="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					>
						{#each riskOptions as opt (opt.value)}
							<option value={opt.value}>{opt.label}</option>
						{/each}
					</select>
				</div>

				<!-- HRT Status -->
				<div>
					<label for="hrt-filter" class="mb-1 block text-sm font-medium text-gray-700">
						Current HRT
					</label>
					<select
						id="hrt-filter"
						bind:value={hrtFilter}
						onchange={applyFilters}
						class="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
					>
						{#each hrtOptions as opt (opt.value)}
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
