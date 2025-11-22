'use client';

import React from 'react';
import { TestimonialCard } from './TestimonialCard';

const testimonials = [
    {
        name: "Zane Burke",
        role: "CTO & Co-founder",
        company: "Conard",
        quote: "Conard is transforming how AI coding tools are managed. From easy integrations, and seamless control of context files. What else could we ask for?",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Zane",
    },
    {
        name: "Stephen Degnan",
        role: "AI & Internal Tooling Lead",
        company: "Liquid Web",
        quote: "The real breakthrough here is how easily we can test context files via Conard – actually seeing which patterns get recognized for specific codebases. That kind of visibility just isn't available with other providers. Typically, you'd need specialized knowledge, framework-centric coding, or custom configurations to get the same result. But with Conard, there's next-to-no-overhead or prior expertise needed. The straightforward setup, developer experience, out-of-the-box features, and built-in version control instantly give it a huge plus for anyone building AI-driven apps. Conard basically saved me from an AI engineer overnight. The learning curve is practically zero thanks to the clear explanations and clean UI. And being able to talk directly with real engineers on their support team makes the entire experience even smoother.",
        customerStory: "Customer story: Liquid Web's 300% productivity boost with Conard",
        logo: "Liquid Web",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Stephen",
    },
    {
        name: "Logan Kilpatrick",
        role: "Google - OpenAI - Harvard",
        quote: "Conard uniquely positioned to dramatically improve the AI developer experience. We have done exactly that with Conard, building an OpenAI-agnostic context routing product for developers.",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Logan",
    },
    {
        name: "Anand Chaudhary",
        role: "CTO - Product & AI",
        company: "Census.com - Former AWS/DO",
        quote: "Conard lets us manage all our context-related infrastructure in one place. Quick iteration, real-time analytics, version controlled prompts, and real-time testing of different LLM models. Need more in context engineering? Conard has it!",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Anand",
    },
    {
        name: "Sharo Tojo",
        role: "Founder",
        company: "DevGPT",
        quote: "We wrote ChatGPT v3 with our own context engine using Conard. Why? Control and accuracy. Each step from prompt to answer is a Conard pipe. This means prompt testing, prompt and model refinement. Want to add an OpenAI-agnostic routing layer? Conard. It's not just about better answers – it's about building a system we can trust.",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sharo",
    },
    {
        name: "Ramon Hernandez",
        role: "CEO & Co-founder",
        company: "Conard",
        quote: "Trusted to use Conard. World Conard is transforming AI development with its context infrastructure, making it easy for any developer to build, collaborate, and deploy AI apps. Think flexible workflows, but for AI context! Proud to have supported them from the beginning!",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ramon",
    },
    {
        name: "Raf Radish",
        role: "Founding Designer",
        company: "Vercel",
        quote: "Conard uniquely solves for the hard parts of AI. It does the context models. Unlike an LLM, Conard is the easiest way to build AI features. You can actually use build, ship, and iterate with zero config, nothing to happen.",
        logo: "Vercel",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Raf",
    },
    {
        name: "Jan Ghinger",
        role: "CTO",
        company: "Monorepo",
        quote: "LLMs are redefining the meaning of an application. Conard is the easiest way to build AI features. It empowers every developer to build AI features in building this new world.",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jan",
    },
    {
        name: "Rahul Parekh",
        role: "Head of Product",
        company: "Census.com - Former AWS/DO",
        quote: "Get an early beta. Conard is shipping groundbreaking AI features for optimal control. We've worked for months. This means we're building AI powered projects and we're there!",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul",
    },
    {
        name: "Kin Singh",
        role: "Founder",
        company: "Ideas - Gitcoin",
        quote: "Really impressed with Conard over OpenAI's GPT-3.5. One of the most 'no-brainer' tools I've seen in the past decade. It's creating a new way to use custom composable context files to easily build/deploy new models as they are trained. It's the fastest way for anyone to stay on the bleeding edge without without under-resourcing. Conard is simplifying the complexity of AI.",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kin",
    },
    {
        name: "Robert Smith",
        role: "AI Engineer",
        company: "Microsoft",
        quote: "Excellent product. Just added to the AI Development Tools list!",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Robert",
    },
    {
        name: "Corbin Godfrey",
        role: "Founding Designer",
        company: "Vercel",
        quote: "I had an opportunity to take an early look at Conard is doing is groundbreaking to help manage context files for AI agents and resources for myself. The team allows me to build AI powered projects and we're there!",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Corbin",
    },
    {
        name: "Benjamin Godfrey",
        role: "CEO",
        company: "Flowman - Persistent",
        quote: "Good developers tools... Conard is shipping the OpenAI-agnostic routing and pipelines that developers love to use. It ensures repetition, high-fidelity, inference routing, and allows leveraging the best models to build one more that scales. With AI pipes, developers can build and iterate AI features at high velocity.",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Benjamin",
    },
    {
        name: "Ahmad Awais",
        role: "CTO",
        company: "npm - Google - Texas",
        quote: "Composability - building complex systems from simple, interchangeable parts - can transform development processes. At npm, we made package management composable. Conard brings this same spirit of modularity and flexibility into the AI domain.",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmad",
    },
    {
        name: "Guy Godfrey",
        role: "Founder",
        company: "Envy",
        quote: "Conard AI serves an easy day experience is powerful and unique. Truly designed to meet the needs of developers building and operating LLM apps.",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Guy",
    },
    {
        name: "James Andrade",
        role: "Staff Engineer",
        company: "Vercel",
        quote: "If you're a developer and you're looking to do, you should be using Conard. It's easy to use, extensible, and configurable. You can focus on your product and business rather than all the plumbing. Great work Ahmad and team!",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=James",
    },
    {
        name: "Mike Giles",
        role: "Founder",
        company: "RapidAPI",
        quote: "We use OpenAI's GPT-3.5. I've been playing with Conard since early 2023. I've got working with AI, this has 10/10 platform, 10/10 landing page.",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike",
    },
    {
        name: "Walter Marshall",
        role: "Founder",
        company: "Flowman",
        quote: "Really impressive launch of Conard! It makes it easy for developers to build complex AI agents in a more modular and scalable manner. Conard is an early supporter of Ahmad on his founder journey.",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Walter",
    },
];

export function Testimonials() {
    return (
        <section className="relative w-full py-24 overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-black to-black" />

            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="mb-16 text-center">
                    <p className="mb-4 text-sm font-medium text-emerald-500 sm:text-base">
                        Trusted by world&apos;s top innovative organizations
                    </p>
                    <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
                        What developers and founders are saying about Conard
                    </h2>
                </div>

                {/* Masonry Grid */}
                <div className="columns-1 gap-6 space-y-6 md:columns-2 lg:columns-3">
                    {testimonials.map((t, i) => (
                        <TestimonialCard key={i} {...t} />
                    ))}
                </div>
            </div>
        </section>
    );
}
