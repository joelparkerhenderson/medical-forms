import { browser } from '$app/env';
import type { CardiologyRequest, GradingResult } from '#lib/engine/types.js';

/** localStorage draft key for a given referral id (defaults to `new`). */
function storageKey(id: string): string {
	return `cardiology-request.front-end-with-svelte.${id || 'new'}.v1`;
}

/** A blank cardiology request with all fields at their unanswered defaults. */
export function createDefaultRequest(): CardiologyRequest {
	return {
		// Referring clinician
		referringClinician: '',
		referrerRole: '',
		registrationBody: '',
		registrationNumber: '',
		supervisingConsultant: '',
		requesterContact: '',
		referralDate: '',

		// Patient identification
		nhsNumber: '',
		patientName: '',
		dateOfBirth: '',

		// Referral lifecycle / setting
		status: 'draft',
		siteName: '',
		setting: '',
		requestedByDate: '',

		// Requested service and reason
		requestedService: '',
		referralReason: '',
		clinicalQuestion: '',
		relevantHistory: '',

		// Symptoms
		symptomChestPain: false,
		chestPainCharacter: '',
		symptomBreathlessness: false,
		nyhaClass: '',
		symptomPalpitations: false,
		symptomSyncope: false,
		symptomOedema: false,

		// Red flags / acuity
		suspectedAcs: false,
		exertionalSyncope: false,
		newOnsetHeartFailure: false,

		// Investigations already performed
		ecgDone: false,
		ecgFindings: '',
		troponinStatus: '',
		bnpStatus: '',

		// Cardiac history and risk factors
		knownCoronaryArteryDisease: false,
		previousMi: false,
		heartFailure: false,
		valveDisease: false,
		arrhythmia: false,
		hypertension: false,
		diabetes: false,
		currentMedications: '',

		// Triage
		urgency: 'routine',
		notes: ''
	};
}

/**
 * Svelte 5 reactive store for the cardiology request, with localStorage
 * persistence so an in-progress referral survives a page reload.
 */
class RequestStore {
	data = $state<CardiologyRequest>(createDefaultRequest());
	result = $state<GradingResult | null>(null);
	currentStep = $state(1);
	/**
	 * The id of the referral currently loaded into the store (`new` for a
	 * fresh draft). Starts as `''`, not `'new'`: the wizard page only calls
	 * loadForId() when `requestStore.id !== id`, so if this defaulted to the
	 * literal string `'new'` the very first visit to the (very common)
	 * `/new` route would never call loadForId() at all -- the saved-draft-
	 * takes-precedence restore loadForId() documents would silently never
	 * run for that route. `''` never collides with a real route id.
	 */
	id = $state('');
	// True once loadForId() has run for the first time. Guards the
	// persistence effect below: without it, the effect's very first
	// (immediate) run persists the *blank* initial `data` before
	// loadForId() ever gets a chance to read a previously-saved draft from
	// localStorage -- silently clobbering it with blank data on every
	// fresh page load. Verified live (a filled field, reloaded, came back
	// empty; localStorage itself had already been overwritten) before
	// fixing, not assumed.
	#loaded = false;

	constructor() {
		if (browser) {
			// Persist on every change, keyed by the current referral id. Reads
			// `this.id`/`this.data` unconditionally (before the #loaded guard)
			// so both stay tracked dependencies even while the guard is
			// suppressing the actual write -- otherwise this effect would stop
			// re-running for their *later* changes too, once #loaded flips.
			$effect.root(() => {
				$effect(() => {
					const key = storageKey(this.id);
					const snapshot = JSON.stringify(this.data);
					if (!this.#loaded) return;
					localStorage.setItem(key, snapshot);
				});
			});
		}
	}

	/**
	 * Load the referral for `id` into the store. A saved draft for that id (in
	 * localStorage) takes precedence; otherwise the `seed` request is used (e.g. a
	 * sample referral for an existing id), falling back to a blank draft for `new`.
	 */
	loadForId(id: string, seed?: CardiologyRequest) {
		const key = id || 'new';
		this.id = key;
		this.result = null;
		this.currentStep = 1;

		let draft: Partial<CardiologyRequest> | null = null;
		if (browser) {
			const raw = localStorage.getItem(storageKey(key));
			if (raw) {
				try {
					draft = JSON.parse(raw) as Partial<CardiologyRequest>;
				} catch {
					// Ignore corrupt storage.
				}
			}
		}

		const base = seed ?? createDefaultRequest();
		this.data = draft ? { ...base, ...draft } : { ...base };
		this.#loaded = true;
	}

	reset() {
		this.data = createDefaultRequest();
		this.result = null;
		this.currentStep = 1;
		if (browser) {
			localStorage.removeItem(storageKey(this.id));
		}
	}

	/**
	 * Replace the current draft with an imported object, tolerating a
	 * partial or foreign-shaped file the same way `loadForId`'s saved-draft
	 * restore already does (shallow-merged onto a fresh default request --
	 * this form's state has no nested sections, unlike some others'), and
	 * resetting any derived/result state. Used by
	 * `#lib/components/ui/FormDataTransfer.svelte`'s JSON import.
	 */
	importData(raw: Record<string, unknown>) {
		this.data = { ...createDefaultRequest(), ...(raw as Partial<CardiologyRequest>) };
		this.result = null;
		this.currentStep = 1;
	}
}

export const requestStore = new RequestStore();
