"use client";

import React from "react";

export default function DebugPanel({ enabled }: { enabled: boolean }) {
	const [apiLogs, setApiLogs] = React.useState<string[]>([]);
	const [timing, setTiming] = React.useState<string[]>([]);

	React.useEffect(() => {
		if (!enabled) return;
		const originalFetch = window.fetch.bind(window);
		window.fetch = async (...args: Parameters<typeof fetch>): Promise<Response> => {
			const start = performance.now();
			const res = await originalFetch(...args);
			const end = performance.now();
			const dur = end - start;
			try {
				const [url, init] = args as [RequestInfo | URL, RequestInit?];
				const method = init?.method || 'GET';
				let preview = '';
				try { preview = JSON.stringify(await res.clone().json()).slice(0, 300); } catch {}
				setApiLogs((prev) => prev.concat(`${method} ${String(url)} [${res.status}] → ${preview}`));
				setTiming((prev) => prev.concat(`${method} ${String(url)} took ${dur.toFixed(1)}ms`));
			} catch {}
			return res;
		};
		return () => { window.fetch = originalFetch; };
	}, [enabled]);

	if (!enabled) return null;

	return (
		<div className="fixed bottom-2 right-2 z-50 max-h-[40vh] w-[480px] overflow-auto rounded-md border border-border bg-background p-3 text-xs shadow-lg">
			<div className="mb-2 text-sm font-semibold">Debug Panel</div>
			<div className="space-y-2">
				<div>
					<div className="mb-1 font-medium">API Logs</div>
					<ul className="space-y-1">
						{apiLogs.map((l, i) => (<li key={i} className="break-words">{l}</li>))}
					</ul>
				</div>
				<div>
					<div className="mb-1 font-medium">Timing</div>
					<ul className="space-y-1">
						{timing.map((t, i) => (<li key={i} className="break-words">{t}</li>))}
					</ul>
				</div>
			</div>
		</div>
	);
}


