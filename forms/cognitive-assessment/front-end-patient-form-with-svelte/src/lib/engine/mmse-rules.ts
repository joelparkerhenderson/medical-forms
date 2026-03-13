import type { MMSERuleDefinition } from './types';

/**
 * MMSE (Mini-Mental State Examination) scoring domains.
 *
 * Total score range: 0-30
 *
 * Domains:
 *   Orientation (Time)  = 5 points
 *   Orientation (Place) = 5 points
 *   Registration         = 3 points
 *   Attention & Calc     = 5 points
 *   Recall               = 3 points
 *   Language (Naming)    = 2 points
 *   Language (Repetition)= 1 point
 *   Language (Command)   = 3 points
 *   Language (Reading)   = 1 point
 *   Language (Writing)   = 1 point
 *   Visuospatial (Copy)  = 1 point
 */
export const mmseDomains: MMSERuleDefinition[] = [
	// Orientation - Time (5 points)
	{ id: 'MMSE-OT-01', domain: 'Orientation (Time)', item: 'What year is it?', maxScore: 1 },
	{ id: 'MMSE-OT-02', domain: 'Orientation (Time)', item: 'What season is it?', maxScore: 1 },
	{ id: 'MMSE-OT-03', domain: 'Orientation (Time)', item: 'What date is it?', maxScore: 1 },
	{ id: 'MMSE-OT-04', domain: 'Orientation (Time)', item: 'What day of the week is it?', maxScore: 1 },
	{ id: 'MMSE-OT-05', domain: 'Orientation (Time)', item: 'What month is it?', maxScore: 1 },

	// Orientation - Place (5 points)
	{ id: 'MMSE-OP-01', domain: 'Orientation (Place)', item: 'What country are we in?', maxScore: 1 },
	{ id: 'MMSE-OP-02', domain: 'Orientation (Place)', item: 'What county/region are we in?', maxScore: 1 },
	{ id: 'MMSE-OP-03', domain: 'Orientation (Place)', item: 'What town/city are we in?', maxScore: 1 },
	{ id: 'MMSE-OP-04', domain: 'Orientation (Place)', item: 'What building are we in?', maxScore: 1 },
	{ id: 'MMSE-OP-05', domain: 'Orientation (Place)', item: 'What floor are we on?', maxScore: 1 },

	// Registration (3 points)
	{ id: 'MMSE-REG-01', domain: 'Registration', item: 'Repeat object 1 (e.g., apple)', maxScore: 1 },
	{ id: 'MMSE-REG-02', domain: 'Registration', item: 'Repeat object 2 (e.g., table)', maxScore: 1 },
	{ id: 'MMSE-REG-03', domain: 'Registration', item: 'Repeat object 3 (e.g., penny)', maxScore: 1 },

	// Attention & Calculation (5 points)
	{ id: 'MMSE-ATT-01', domain: 'Attention & Calculation', item: 'Serial 7s: 100 - 7 = 93', maxScore: 1 },
	{ id: 'MMSE-ATT-02', domain: 'Attention & Calculation', item: 'Serial 7s: 93 - 7 = 86', maxScore: 1 },
	{ id: 'MMSE-ATT-03', domain: 'Attention & Calculation', item: 'Serial 7s: 86 - 7 = 79', maxScore: 1 },
	{ id: 'MMSE-ATT-04', domain: 'Attention & Calculation', item: 'Serial 7s: 79 - 7 = 72', maxScore: 1 },
	{ id: 'MMSE-ATT-05', domain: 'Attention & Calculation', item: 'Serial 7s: 72 - 7 = 65', maxScore: 1 },

	// Recall (3 points)
	{ id: 'MMSE-REC-01', domain: 'Recall', item: 'Recall object 1', maxScore: 1 },
	{ id: 'MMSE-REC-02', domain: 'Recall', item: 'Recall object 2', maxScore: 1 },
	{ id: 'MMSE-REC-03', domain: 'Recall', item: 'Recall object 3', maxScore: 1 },

	// Language - Naming (2 points)
	{ id: 'MMSE-LNG-01', domain: 'Language (Naming)', item: 'Name a pencil', maxScore: 1 },
	{ id: 'MMSE-LNG-02', domain: 'Language (Naming)', item: 'Name a watch', maxScore: 1 },

	// Language - Repetition (1 point)
	{ id: 'MMSE-LNG-03', domain: 'Language (Repetition)', item: 'Repeat: "No ifs, ands, or buts"', maxScore: 1 },

	// Language - Command (3 points)
	{ id: 'MMSE-LNG-04', domain: 'Language (Command)', item: 'Take paper in right hand', maxScore: 1 },
	{ id: 'MMSE-LNG-05', domain: 'Language (Command)', item: 'Fold paper in half', maxScore: 1 },
	{ id: 'MMSE-LNG-06', domain: 'Language (Command)', item: 'Put paper on floor', maxScore: 1 },

	// Language - Reading (1 point)
	{ id: 'MMSE-LNG-07', domain: 'Language (Reading)', item: 'Read and obey: "Close your eyes"', maxScore: 1 },

	// Language - Writing (1 point)
	{ id: 'MMSE-LNG-08', domain: 'Language (Writing)', item: 'Write a sentence', maxScore: 1 },

	// Visuospatial - Copying (1 point)
	{ id: 'MMSE-VIS-01', domain: 'Visuospatial', item: 'Copy intersecting pentagons', maxScore: 1 },
];

/**
 * MMSE domain max scores for summary.
 */
export const mmseDomainMaxScores: Record<string, number> = {
	'Orientation': 10,
	'Registration': 3,
	'Attention & Calculation': 5,
	'Recall': 3,
	'Language': 8,
	'Visuospatial': 1,
};
