export type EnvStatus = {
	key: string;
	isSet: boolean;
	preview?: string;
};

export type ApiCheckResult = {
	url: string;
	method: string;
	ok: boolean;
	status?: number;
	ms?: number;
	error?: string;
};

export type ServicesReport = {
	env: EnvStatus[];
	apIs: ApiCheckResult[];
};

export function getEnvStatus(keys: string[]): EnvStatus[] {
	return keys.map((key) => {
		const value = process.env[key];
		return {
			key,
			isSet: !!value,
			preview: value ? String(value).substring(0, 6) : undefined,
		};
	});
}

export async function testApiConnectivity(url: string, method: string = 'GET', body?: unknown): Promise<ApiCheckResult> {
	const started = Date.now();
	try {
		const res = await fetch(url, {
			method,
			headers: { 'content-type': 'application/json' },
			body: body ? JSON.stringify(body) : undefined,
			cache: 'no-store',
		});
		const ended = Date.now();
		return { url, method, ok: res.ok, status: res.status, ms: ended - started };
	} catch (e) {
		const ended = Date.now();
		return { url, method, ok: false, ms: ended - started, error: (e as Error).message };
	}
}

export async function verifyServicesReachable(services: Array<{ url: string; method?: string }>): Promise<ApiCheckResult[]> {
	const checks = await Promise.all(
		services.map((s) => testApiConnectivity(s.url, s.method))
	);
	return checks;
}

export async function buildDebugReport(keys: string[], services: Array<{ url: string; method?: string }>): Promise<ServicesReport> {
	const env = getEnvStatus(keys);
	const apIs = await verifyServicesReachable(services);
	return { env, apIs };
}


