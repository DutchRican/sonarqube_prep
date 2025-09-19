export const SONAR_HOST_URL = 'SONAR_HOST_URL';
export const SONAR_TOKEN = 'SONAR_TOKEN';

export const badgeOptions: { title: string, val: string }[] = [
	{ title: 'Quality Gate Status', val: 'alert_status' },
	{ title: 'Lines of Code', val: 'ncloc' },
	{ title: 'Coverage', val: 'coverage' },
	{ title: 'Maintainability Rating', val: 'sqale_rating' },
	{ title: 'Technical Debt', val: 'sqale_index' },
	{ title: 'Reliability Rating', val: 'reliability_rating' },
	{ title: 'Security Rating', val: 'security_rating' }
];

