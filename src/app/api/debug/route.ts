import { NextResponse } from 'next/server';
import { buildDebugReport } from '@/lib/debug';

export async function GET() {
	if (process.env.NODE_ENV !== 'development') {
		return NextResponse.json({ error: 'Debug endpoint disabled in non-development environments' }, { status: 403 });
	}

	const keys = [
		'OPENROUTER_API_KEY_FREE',
		'OPENROUTER_API_KEY_PRO',
		'ANTHROPIC_API_KEY',
		'GITHUB_TOKEN',
		'NEXT_PUBLIC_GITHUB_TOKEN',
		'NEXT_PUBLIC_CONVEX_URL',
	];

	const services = [
		{ url: 'https://api.github.com' },
		{ url: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1' },
		{ url: process.env.NEXT_PUBLIC_CONVEX_URL || 'https://affable-flamingo-729.convex.cloud' },
	];

	const report = await buildDebugReport(keys, services);
	return NextResponse.json({ nodeEnv: process.env.NODE_ENV, report });
}


