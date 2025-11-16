'use client';

import * as React from 'react';
import { initPostHog, trackEvent } from '@/lib/analytics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast, Toaster } from 'sonner';
import { Check, X, Sparkles, Shield, Zap, ArrowLeft } from '@/lib/icons';
import Link from 'next/link';

type BillingPeriod = 'monthly' | 'annual';

export default function PricingPage() {
	const [billingPeriod, setBillingPeriod] = React.useState<BillingPeriod>('monthly');
	const tableRef = React.useRef<HTMLDivElement>(null);
	const freeCardRef = React.useRef<HTMLDivElement>(null);
	const proCardRef = React.useRef<HTMLDivElement>(null);

	React.useEffect(() => {
		initPostHog();
		trackEvent('pricing_page_viewed');

		const observerOptions = { threshold: 0.5 };

		const freeCardObserver = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					trackEvent('free_plan_card_viewed');
					freeCardObserver.disconnect();
				}
			},
			observerOptions
		);

		const proCardObserver = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					trackEvent('pro_plan_card_viewed');
					proCardObserver.disconnect();
				}
			},
			observerOptions
		);

		const tableObserver = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					trackEvent('pricing_table_viewed');
					tableObserver.disconnect();
				}
			},
			{ threshold: 0.1 }
		);

		if (freeCardRef.current) {
			freeCardObserver.observe(freeCardRef.current);
		}
		if (proCardRef.current) {
			proCardObserver.observe(proCardRef.current);
		}
		if (tableRef.current) {
			tableObserver.observe(tableRef.current);
		}

		return () => {
			freeCardObserver.disconnect();
			proCardObserver.disconnect();
			tableObserver.disconnect();
		};
	}, []);

	const handleUpgrade = async (period: BillingPeriod) => {
		try {
			trackEvent('pricing_card_clicked', { plan_type: 'pro', billing_period: period });
			trackEvent('payment_initiated');
			const response = await fetch('/api/stripe/checkout', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ billingPeriod: period }),
			});

			if (!response.ok) {
				throw new Error('Non-200 response');
			}

            const { url } = await response.json();
			if (!url) {
				throw new Error('Missing checkout url');
			}
            try { trackEvent('billing_redirected_to_clerk'); } catch {}
			window.location.href = url;
		} catch (error) {
			console.error('Checkout error:', error);
			toast.error('Failed to start checkout');
			trackEvent('payment_failed', { error_type: 'checkout_start' });
		}
	};

	const priceLabel = billingPeriod === 'monthly' ? '$9' : '$84';
	const priceUnit = billingPeriod === 'monthly' ? 'month' : 'year';

	return (
		<main className="relative">
			<Toaster position="top-right" richColors />
			{/* Hero */}
			<section className="relative overflow-hidden">
				<div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-background via-background to-background" />
				<div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
					<div className="mx-auto max-w-3xl text-center">
						<div className="mb-4 flex justify-start md:justify-center">
							<Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition">
								<ArrowLeft className="h-4 w-4" aria-hidden />
								<span>Back to Home</span>
							</Link>
						</div>
						<Badge variant="secondary" className="mb-4 inline-flex items-center gap-1">
							<Sparkles className="h-3.5 w-3.5" aria-hidden />
							Pricing
						</Badge>
						<h1 className="text-balance text-3xl font-bold tracking-tight md:text-5xl">Simple, transparent pricing</h1>
						<p className="mt-4 text-muted-foreground md:text-lg">
							Choose the plan that fits. Upgrade anytime. Cancel whenever.
						</p>
						{/* Toggle */}
						<div className="mt-6 inline-flex items-center justify-center gap-2 rounded-full border bg-card p-1 shadow-sm" role="group" aria-label="Billing period">
							<button
								type="button"
								className={`rounded-full px-4 py-2 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
									billingPeriod === 'monthly' ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground hover:text-foreground'
								}`}
								onClick={() => setBillingPeriod('monthly')}
							>
								Monthly
							</button>
							<button
								type="button"
								className={`rounded-full px-4 py-2 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
									billingPeriod === 'annual' ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground hover:text-foreground'
								}`}
								onClick={() => setBillingPeriod('annual')}
							>
								Annual
							</button>
						</div>
						{billingPeriod === 'annual' && (
							<p className="mt-2 text-xs text-muted-foreground">Save 22% with annual billing</p>
						)}
					</div>
					{/* Cards */}
					<div className="mt-12 grid grid-cols-1 gap-6 md:mt-16 md:grid-cols-2">
						<Card ref={freeCardRef} className="relative h-full border-muted-foreground/20 shadow-lg transition hover:shadow-xl">
							<CardHeader>
								<CardTitle className="flex items-center justify-between text-2xl">Free <Badge variant="outline">Starter</Badge></CardTitle>
								<CardDescription>All the basics to explore the product.</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="mb-6">
									<span className="text-3xl font-bold">$0</span>
									<span className="ml-2 text-muted-foreground">forever</span>
								</div>
								<ul className="space-y-3 text-sm">
									<li className="flex items-start gap-3"><Check className="mt-0.5 h-4 w-4 text-green-600" aria-hidden /> 5 generations/day</li>
									<li className="flex items-start gap-3"><Check className="mt-0.5 h-4 w-4 text-green-600" aria-hidden /> 20 prompts/day</li>
									<li className="flex items-start gap-3"><X className="mt-0.5 h-4 w-4 text-rose-500" aria-hidden /> Private repos</li>
									<li className="flex items-start gap-3"><Check className="mt-0.5 h-4 w-4 text-green-600" aria-hidden /> Public repos only</li>
									<li className="flex items-start gap-3"><Check className="mt-0.5 h-4 w-4 text-green-600" aria-hidden /> Basic context files</li>
								</ul>
								<div className="mt-8">
						<Button className="w-full" size="lg" variant="outline" aria-label="Start for free" onClick={() => trackEvent('pricing_card_clicked', { plan_type: 'free' })}>Start for free</Button>
								</div>
							</CardContent>
						</Card>

						<Card ref={proCardRef} className="relative h-full border-primary/40 shadow-xl ring-1 ring-primary/10 transition hover:shadow-2xl">
							<div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-primary via-primary/80 to-primary/60" aria-hidden />
							<CardHeader>
								<div className="mb-2 flex items-center justify-between">
									<CardTitle className="text-2xl">Pro</CardTitle>
									<Badge className="bg-primary text-primary-foreground">Most popular</Badge>
								</div>
								<CardDescription>Power features for teams and creators.</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="mb-6 flex items-end gap-2">
									<span className="text-4xl font-bold">{priceLabel}</span>
									<span className="text-muted-foreground">/ {priceUnit}</span>
									{billingPeriod === 'annual' && (
										<Badge variant="secondary" className="ml-1">2 months free</Badge>
									)}
								</div>
								<ul className="space-y-3 text-sm">
									<li className="flex items-start gap-3"><Zap className="mt-0.5 h-4 w-4 text-primary" aria-hidden /> Unlimited generations</li>
									<li className="flex items-start gap-3"><Zap className="mt-0.5 h-4 w-4 text-primary" aria-hidden /> Unlimited prompts</li>
									<li className="flex items-start gap-3"><Shield className="mt-0.5 h-4 w-4 text-primary" aria-hidden /> Private repos</li>
									<li className="flex items-start gap-3"><Sparkles className="mt-0.5 h-4 w-4 text-primary" aria-hidden /> Advanced context</li>
									<li className="flex items-start gap-3"><Sparkles className="mt-0.5 h-4 w-4 text-primary" aria-hidden /> Priority support</li>
								</ul>
								<div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
									<Button size="lg" className="w-full" onClick={() => handleUpgrade(billingPeriod)} aria-label={`Upgrade to Pro (${billingPeriod})`}>
										Upgrade to Pro
									</Button>
									<Button size="lg" variant="outline" className="w-full" onClick={() => handleUpgrade(billingPeriod === 'monthly' ? 'annual' : 'monthly')} aria-label="Try opposite billing period">
										{billingPeriod === 'monthly' ? 'Go annual' : 'Go monthly'}
									</Button>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</section>

			{/* Comparison Table */}
			<section className="mx-auto max-w-6xl px-4 py-12 md:py-16">
				<h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Compare plans</h2>
				<div ref={tableRef} className="mt-6 overflow-hidden rounded-lg border bg-card shadow-sm">
					<table className="w-full text-sm">
						<thead className="bg-muted/40 text-left">
							<tr>
								<th className="px-4 py-3">Feature</th>
								<th className="px-4 py-3">Free</th>
								<th className="px-4 py-3">Pro</th>
							</tr>
						</thead>
						<tbody>
							<tr className="border-t">
								<td className="px-4 py-3">Generations</td>
								<td className="px-4 py-3">5/day</td>
								<td className="px-4 py-3">Unlimited</td>
							</tr>
							<tr className="border-t">
								<td className="px-4 py-3">Prompts</td>
								<td className="px-4 py-3">20/day</td>
								<td className="px-4 py-3">Unlimited</td>
							</tr>
							<tr className="border-t">
								<td className="px-4 py-3">Private repos</td>
								<td className="px-4 py-3"><X className="h-4 w-4 text-rose-500" aria-hidden /></td>
								<td className="px-4 py-3"><Check className="h-4 w-4 text-green-600" aria-hidden /></td>
							</tr>
							<tr className="border-t">
								<td className="px-4 py-3">Context quality</td>
								<td className="px-4 py-3">Basic</td>
								<td className="px-4 py-3">Advanced</td>
							</tr>
							<tr className="border-t">
								<td className="px-4 py-3">Support</td>
								<td className="px-4 py-3">Community</td>
								<td className="px-4 py-3">Priority</td>
							</tr>
						</tbody>
					</table>
				</div>
			</section>

			{/* FAQ */}
			<section className="mx-auto max-w-4xl px-4 pb-24">
				<h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Frequently asked questions</h2>
				<div className="mt-6 divide-y rounded-lg border bg-card shadow-sm">
					<details className="group p-4" role="group">
						<summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left font-medium outline-none transition hover:text-foreground">
							<span>Can I switch between monthly and annual later?</span>
							<span className="transition group-open:rotate-180">▾</span>
						</summary>
						<p className="mt-2 text-sm text-muted-foreground">Yes. You can change billing anytime; changes prorate automatically.</p>
					</details>
					<details className="group p-4" role="group">
						<summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left font-medium outline-none transition hover:text-foreground">
							<span>Do you offer refunds?</span>
							<span className="transition group-open:rotate-180">▾</span>
						</summary>
						<p className="mt-2 text-sm text-muted-foreground">If something goes wrong, contact support within 7 days and we will help.</p>
					</details>
					<details className="group p-4" role="group">
						<summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left font-medium outline-none transition hover:text-foreground">
							<span>Is my code secure?</span>
							<span className="transition group-open:rotate-180">▾</span>
						</summary>
						<p className="mt-2 text-sm text-muted-foreground">Pro supports private repositories with secure processing and strict isolation.</p>
					</details>
					<details className="group p-4" role="group">
						<summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left font-medium outline-none transition hover:text-foreground">
							<span>What payment methods are supported?</span>
							<span className="transition group-open:rotate-180">▾</span>
						</summary>
						<p className="mt-2 text-sm text-muted-foreground">Major cards via Stripe. Invoices for annual on request.</p>
					</details>
				</div>
			</section>

			{/* Sticky CTA */}
			<div className="sticky bottom-4 z-10 mx-auto flex w-full max-w-3xl items-center justify-center px-4">
				<div className="flex w-full items-center justify-between gap-3 rounded-xl border bg-background/80 p-3 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/60">
					<div className="text-sm text-muted-foreground">
						<span className="font-medium text-foreground">Ready to level up?</span>
						<span className="ml-2">Get Pro for {priceLabel}/{priceUnit}.</span>
					</div>
					<Button size="lg" onClick={() => handleUpgrade(billingPeriod)} aria-label={`Upgrade to Pro (${billingPeriod}) from sticky bar`}>
						Upgrade to Pro
					</Button>
				</div>
			</div>
		</main>
	);
}


