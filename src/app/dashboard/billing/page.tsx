'use client';

import * as React from 'react';
import { useUser } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Check, CreditCard, Activity, ArrowRight, Calendar, DollarSign, Loader2 } from 'lucide-react';
import { initPostHog, trackEvent } from '@/lib/analytics';

export default function BillingPage() {
    React.useEffect(() => {
        initPostHog();
        trackEvent('billing_page_viewed');
    }, []);
	const { user } = useUser();
	const userId = user?.id ?? null;
	const userStats = useQuery(api.users.getUserStats, userId ? { userId } : 'skip');

	const isLoading = userId != null && userStats === undefined; // convex returns undefined while loading
	const isPro = !!userStats?.isPro;

	const handleUpgrade = async () => {
		try {
            trackEvent('upgrade_button_clicked', { location: 'billing_page' });
            trackEvent('payment_initiated');
			const response = await fetch('/api/stripe/checkout', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ billingPeriod: 'monthly' }),
			});
			const { url } = await response.json();
			if (!response.ok || !url) throw new Error('Missing checkout URL');
			window.location.href = url;
		} catch (error) {
			console.error(error);
			toast.error('Failed to start checkout');
            trackEvent('payment_failed', { error_type: 'checkout_start' });
		}
	};

	const handleManageBilling = async () => {
		try {
            trackEvent('manage_billing_clicked');
			const response = await fetch('/api/stripe/portal', { method: 'POST' });
			const { url } = await response.json();
			if (!response.ok || !url) throw new Error('Missing portal URL');
			window.location.href = url;
		} catch (error) {
			console.error(error);
			toast.error('Failed to open customer portal');
		}
	};

	const handleCancel = async () => {
		try {
			const confirmed = window.confirm('Are you sure you want to cancel your subscription?');
			if (!confirmed) return;
			const response = await fetch('/api/stripe/cancel', { method: 'POST' });
			if (!response.ok) throw new Error('Cancel failed');
			toast.success('Subscription cancellation submitted');
			await handleManageBilling();
		} catch (error) {
			console.error(error);
			toast.error('Failed to cancel subscription');
		}
	};

	return (
		<div className="mx-auto max-w-6xl p-4 md:p-8">
			<div className="mb-6">
				<h1 className="text-2xl font-bold tracking-tight md:text-3xl">Billing</h1>
				<p className="text-sm text-muted-foreground">Manage your plan, usage, and invoices.</p>
			</div>

			<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
				{/* Current Plan */}
				<Card className="shadow-sm">
					<CardHeader>
						<CardTitle>Current Plan</CardTitle>
						<CardDescription>Your subscription status and actions</CardDescription>
					</CardHeader>
					<CardContent>
						{isLoading ? (
							<div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Loading...</div>
						) : isPro ? (
							<div>
								<div className="flex items-center gap-2">
									<Badge className="bg-primary text-primary-foreground">Pro</Badge>
									<span className="text-sm text-muted-foreground">Active subscription</span>
								</div>
								<div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
									<Button onClick={handleManageBilling} aria-label="Manage billing" className="w-full">
										<CreditCard className="mr-2 h-4 w-4" aria-hidden /> Manage billing
									</Button>
									<Button variant="outline" onClick={handleCancel} aria-label="Cancel subscription" className="w-full">
										Cancel subscription
									</Button>
								</div>
							</div>
						) : (
							<div>
								<div className="flex items-center gap-2">
									<Badge variant="secondary">Free</Badge>
									<span className="text-sm text-muted-foreground">Limited access</span>
								</div>
								<ul className="mt-4 space-y-2 text-sm">
									<li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-600" aria-hidden /> 5 generations/day</li>
									<li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-600" aria-hidden /> 20 prompts/day</li>
									<li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-600" aria-hidden /> Public repos only</li>
								</ul>
								<Button className="mt-4" onClick={handleUpgrade} aria-label="Upgrade to Pro">
									Upgrade to Pro <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
								</Button>
							</div>
						)}
					</CardContent>
				</Card>

				{/* Usage Stats */}
				<Card className="shadow-sm">
					<CardHeader>
						<CardTitle>Usage</CardTitle>
                        <CardDescription>Today&apos;s usage and totals</CardDescription>
					</CardHeader>
					<CardContent>
						{isLoading ? (
							<div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Loading...</div>
						) : (
							<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
								<div className="rounded-lg border p-4">
									<div className="text-xs text-muted-foreground">Generations today</div>
									<div className="mt-1 text-lg font-semibold">{userStats?.generationsToday ?? 0}</div>
								</div>
								<div className="rounded-lg border p-4">
									<div className="text-xs text-muted-foreground">Prompts today</div>
									<div className="mt-1 text-lg font-semibold">{userStats?.promptsToday ?? 0}</div>
								</div>
								<div className="rounded-lg border p-4">
									<div className="text-xs text-muted-foreground">Total usage</div>
									<div className="mt-1 text-lg font-semibold">{(userStats?.totalGenerations ?? 0) + (userStats?.totalPrompts ?? 0)}</div>
								</div>
							</div>
						)}
					</CardContent>
				</Card>
			</div>

			{/* Pro-only subscription details */}
			{!isLoading && isPro && (
				<div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
					<Card className="shadow-sm">
						<CardHeader>
							<CardTitle>Subscription Details</CardTitle>
							<CardDescription>Your upcoming billing information</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-3">
								<div className="flex items-center justify-between">
									<div className="text-sm text-muted-foreground flex items-center gap-2"><Calendar className="h-4 w-4" aria-hidden /> Next billing</div>
									<div className="text-sm font-medium">{formatDate(userStats?.nextBillingDate)}</div>
								</div>
								<Separator />
								<div className="flex items-center justify-between">
									<div className="text-sm text-muted-foreground flex items-center gap-2"><DollarSign className="h-4 w-4" aria-hidden /> Amount</div>
									<div className="text-sm font-medium">{formatAmount(userStats?.amount)}</div>
								</div>
								<Separator />
								<div className="flex items-center justify-between">
									<div className="text-sm text-muted-foreground flex items-center gap-2"><CreditCard className="h-4 w-4" aria-hidden /> Payment method</div>
									<div className="text-sm font-medium">{userStats?.paymentMethodLast4 ? `•••• ${userStats.paymentMethodLast4}` : '—'}</div>
								</div>
								<div className="mt-4 flex flex-wrap gap-3">
									<Button onClick={handleManageBilling} aria-label="Open Stripe customer portal"><CreditCard className="mr-2 h-4 w-4" aria-hidden /> Manage billing</Button>
									<Button variant="outline" onClick={handleCancel} aria-label="Cancel subscription">Cancel subscription</Button>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className="shadow-sm">
						<CardHeader>
							<CardTitle>Billing History</CardTitle>
							<CardDescription>Download invoices and receipts</CardDescription>
						</CardHeader>
						<CardContent>
							<p className="text-sm text-muted-foreground">Open the Stripe customer portal to view your invoice history and receipts.</p>
							<Button className="mt-4" variant="outline" onClick={handleManageBilling} aria-label="Open invoices in Stripe portal">
								Open Customer Portal
							</Button>
						</CardContent>
					</Card>
				</div>
			)}

			{/* Free users: billing history access */}
			{!isLoading && !isPro && (
				<div className="mt-6">
					<Card className="shadow-sm">
						<CardHeader>
							<CardTitle>Billing History</CardTitle>
							<CardDescription>Invoices will appear after you upgrade</CardDescription>
						</CardHeader>
						<CardContent>
							<p className="text-sm text-muted-foreground">Upgrade to Pro to access invoices and manage billing via the Stripe customer portal.</p>
							<Button className="mt-4" onClick={handleUpgrade} aria-label="Upgrade to Pro from billing history">
								Upgrade to Pro
							</Button>
						</CardContent>
					</Card>
				</div>
			)}
			
			{/* Small system card */}
			<div className="mt-6">
				<Card className="shadow-sm">
					<CardHeader>
						<CardTitle className="flex items-center gap-2"><Activity className="h-4 w-4" aria-hidden /> Account</CardTitle>
						<CardDescription>User: {user?.primaryEmailAddress?.emailAddress ?? user?.username ?? user?.id ?? '—'}</CardDescription>
					</CardHeader>
				</Card>
			</div>
		</div>
	);
}

function formatDate(value?: string | number | Date): string {
	if (!value) return '—';
	try {
		const d = new Date(value);
		return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
	} catch {
		return '—';
	}
}

function formatAmount(cents?: number): string {
	if (cents == null) return '—';
	try {
		return `$${(cents / 100).toFixed(2)}`;
	} catch {
		return '—';
	}
}


