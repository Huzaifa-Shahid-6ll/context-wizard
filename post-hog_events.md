# Full Analytics Coverage Plan

## Scope

Implement all 126 listed events. Use frontend for interaction/UX events; use backend for completion/failure where accuracy matters (auth, billing, subscriptions).

## Conventions

- Event names: snake_case (as provided)
- Properties: snake_case keys, pass only required fields
- Init: keep `posthog-js`, autocapture off, use `trackEvent`

## Frontend Instrumentation

- Landing (`src/app/page.tsx`)
- pricing_table_viewed, pricing_card_clicked(plan_type)
- feature_card_clicked(feature_name), testimonial_viewed
- faq_item_clicked(question_id), footer_link_clicked(link_name)
- signup_button_clicked(location), signin_button_clicked(location)
- demo_video_completed
- Navbar/Footer components (e.g., `components/landing/*`, `components/ui/*`)
- footer_link_clicked(link_name) on all footer anchors
- Pricing (`src/app/pricing/page.tsx`)
- free_plan_card_viewed, pro_plan_card_viewed
- Auth entry points (buttons/links across app)
- signup_button_clicked(location), signin_button_clicked(location)
- Dashboard (`src/app/dashboard/page.tsx`)
- github_url_pasted, generation_processing, preview_opened/closed
- file_previewed(file_name)
- History (`src/app/dashboard/history/page.tsx` or equivalent)
- history_page_viewed, history_filtered(filter_type), history_sorted(sort_by)
- history_item_clicked(generation_id), history_download_clicked(generation_id)
- history_delete_clicked(generation_id), history_delete_confirmed, history_empty_state_viewed
- Prompt Studio and builders (cursor/prompt UIs)
- prompt_studio_viewed, cursor_builder_opened
- cursor_builder_step_completed(step_number), cursor_builder_submitted(tech_stack, feature_count)
- cursor_prompts_generated(prompt_count, tech_stack), cursor_prompts_downloaded
- generic_prompt_* (opened, template_selected, generated(word_count, tone), copied)
- image_prompt_* (opened, style_selected, generated(platform, style), copied)
- output_predictor_* (opened, requested, completed(confidence_score))
- prompt_copied_to_clipboard(prompt_type, prompt_id), prompt_saved_to_history, prompt_deleted
- Settings/Preferences (`src/app/settings/*` if present)
- settings_page_viewed, preferences_updated(preference_type)
- theme_changed(theme), notification_settings_changed
- account_deleted_clicked, account_deletion_confirmed
- Integrations (`src/app/integrations/*`)
- github_token_added/removed, private_repo_accessed
- api_key_generated/revoked
- Error/Support (global error boundary, UI links)
- error_displayed(error_type, error_message, page), error_retry_clicked
- support_link_clicked, faq_viewed, terms_page_viewed, privacy_page_viewed
- contact_form_opened, contact_form_submitted
- Engagement & Session (layout and route transitions)
- session_started, session_ended(duration_minutes)
- page_viewed(page_name), feature_discovered(feature_name)
- tooltip_viewed(tooltip_id), onboarding_completed/skipped
- Viral/Sharing
- share_button_clicked(platform), referral_link_generated/shared
- invite_sent(method), social_proof_viewed(testimonial_id)
- Mobile placeholders (if mobile surfaces exist)
- mobile_app_opened, mobile_navigation_used, mobile_download_attempted, tablet_view_accessed

## Backend Instrumentation (accuracy-critical)

- Stripe Webhooks `src/app/api/webhooks/stripe/route.ts`
- payment_completed(plan, amount, currency)
- subscription_created/updated/canceled
- invoice_viewed/downloaded (if webhook events, else capture on GET/Download endpoints)
- Stripe API endpoints
- payment_initiated (already), manage_billing_clicked, billing_page_viewed, billing_redirected_to_clerk
- Auth completions
- Clerk webhooks (or server session callbacks) for signup_completed/failed(error_type), signin_completed/failed(error_type), first_session_started, signout_clicked
- Limits/Quota (Convex)
- On limit checks/mutations: free_limit_reached(limit_type), free_limit_warning_shown(remaining_count), quota_viewed(used, remaining, limit), daily_reset_occurred, pro_unlimited_accessed

## Cross-cutting

- Extend `trackEvent` with small helpers per category for consistent props
- Add a tiny `trackPageView('name')` wrapper
- Guard against double-firing on route transitions; debounce paste event for github_url_pasted