import type { AcknowledgmentRow } from './types';

export const sampleData: AcknowledgmentRow[] = [
	{
		id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
		patientName: 'Sarah Thompson',
		nhsNumber: '943 476 5919',
		acknowledgedDate: '2026-04-15',
		status: 'complete'
	},
	{
		id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
		patientName: 'James Wilson',
		nhsNumber: '725 183 4062',
		acknowledgedDate: '2026-04-14',
		status: 'complete'
	},
	{
		id: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
		patientName: 'Emily Roberts',
		nhsNumber: '481 927 3658',
		acknowledgedDate: '2026-04-14',
		status: 'complete'
	},
	{
		id: 'd4e5f6a7-b8c9-0123-defa-234567890123',
		patientName: 'Mohammed Ali Khan',
		nhsNumber: '612 845 9073',
		acknowledgedDate: '2026-04-13',
		status: 'complete'
	},
	{
		id: 'e5f6a7b8-c9d0-1234-efab-345678901234',
		patientName: 'Catherine Davies',
		nhsNumber: '358 271 6490',
		acknowledgedDate: '',
		status: 'incomplete'
	},
	{
		id: 'f6a7b8c9-d0e1-2345-fabc-456789012345',
		patientName: 'Robert Patel',
		nhsNumber: '894 536 1027',
		acknowledgedDate: '2026-04-12',
		status: 'complete'
	},
	{
		id: 'a7b8c9d0-e1f2-3456-abcd-567890123456',
		patientName: "Margaret O'Brien",
		nhsNumber: '167 493 8205',
		acknowledgedDate: '',
		status: 'incomplete'
	},
	{
		id: 'b8c9d0e1-f2a3-4567-bcde-678901234567',
		patientName: 'David Chen',
		nhsNumber: '539 718 2046',
		acknowledgedDate: '2026-04-11',
		status: 'complete'
	}
];
