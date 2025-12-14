import { ArrowRight, Shield, Zap, Globe, Wallet, Lock } from 'lucide-react';

interface LandingPageProps {
    onEnterApp: () => void;
}

export function LandingPage({ onEnterApp }: LandingPageProps) {
    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-emerald-500/30">
            {/* Navbar */}
            <nav className="fixed w-full z-50 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center">
                            <Zap className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold tracking-tight">ATOMIC-GIG</span>
                    </div>
                    <div className="flex items-center gap-6 text-sm font-medium text-neutral-400">
                        <a href="#features" className="hover:text-white transition-colors">Features</a>
                        <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
                        <button
                            onClick={onEnterApp}
                            className="bg-white text-black px-4 py-2 rounded-full hover:bg-neutral-200 transition-colors font-semibold"
                        >
                            Launch App
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-40 pb-32 overflow-hidden">
                {/* Background Gradients */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] -z-10" />
                <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-blue-500/5 rounded-full blur-[100px] -z-10" />

                <div className="max-w-7xl mx-auto px-6 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-medium mb-10">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        Live on Ergo Testnet
                    </div>

                    <h1 className="text-5xl md:text-8xl font-bold tracking-tight mb-8 leading-[1.1] bg-gradient-to-b from-white via-white to-neutral-500 bg-clip-text text-transparent">
                        The Future of <br />
                        Decentralized Work
                    </h1>

                    <p className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto mb-12 leading-relaxed">
                        Connect, collaborate, and transact with absolute trust.
                        Atomic-Gig leverages smart contracts to ensure fair payments
                        and verifiable reputation for every gig.
                    </p>

                    <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                        <button
                            onClick={onEnterApp}
                            className="group relative px-8 py-4 bg-emerald-600 hover:bg-emerald-500 rounded-lg font-semibold transition-all hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                        >
                            <div className="flex items-center gap-2">
                                Start Working Now
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </button>
                        <button className="px-8 py-4 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-lg font-semibold transition-all">
                            Read Whitepaper
                        </button>
                    </div>

                    {/* Stats / Social Proof */}
                    <div className="mt-20 pt-10 border-t border-white/5 grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div>
                            <div className="text-3xl font-bold text-white">$0.00</div>
                            <div className="text-sm text-neutral-500 uppercase tracking-wider mt-1">Platform Fees</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-white">Trustless</div>
                            <div className="text-sm text-neutral-500 uppercase tracking-wider mt-1">Escrow System</div>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-white">Global</div>
                            <div className="text-sm text-neutral-500 uppercase tracking-wider mt-1">Talent Pool</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="py-24 bg-neutral-900/30">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-4">Why Atomic-Gig?</h2>
                        <p className="text-neutral-400">Built for the gig economy of tomorrow.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Shield className="w-6 h-6 text-emerald-400" />}
                            title="Smart Contract Escrow"
                            description="Funds are locked in a smart contract and only released when the work is verified. No middlemen, no disputes."
                        />
                        <FeatureCard
                            icon={<Globe className="w-6 h-6 text-blue-400" />}
                            title="Universal Reputation"
                            description="Your reputation travels with you. Build a verifiable work history on-chain that you truly own."
                        />
                        <FeatureCard
                            icon={<Wallet className="w-6 h-6 text-purple-400" />}
                            title="Instant Crypto Payments"
                            description="Get paid instantly in ERG or stablecoins. No banking delays, no chargebacks, global reach."
                        />
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section id="how-it-works" className="py-24 border-t border-white/5">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold mb-6">Workflow Simplified</h2>
                            <div className="space-y-8">
                                <Step
                                    number="01"
                                    title="Create or Find a Gig"
                                    text=" Clients post gigs with clear requirements and budget. Workers browse and apply."
                                />
                                <Step
                                    number="02"
                                    title="Lock Funds in Escrow"
                                    text="Client deposits funds into the Atomic Escrow contract. Work begins safely."
                                />
                                <Step
                                    number="03"
                                    title="Complete & Verify"
                                    text="Worker submits deliverables. Client reviews. Funds are released automatically."
                                />
                            </div>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-0 bg-emerald-500/20 blur-[80px] rounded-full" />
                            <div className="relative bg-neutral-900 border border-neutral-800 rounded-2xl p-8 shadow-2xl">
                                {/* Mock UI Card */}
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center">
                                            <Lock className="w-5 h-5 text-emerald-500" />
                                        </div>
                                        <div>
                                            <div className="font-semibold">Escrow Contract</div>
                                            <div className="text-xs text-green-500">Active • 500 ERG Locked</div>
                                        </div>
                                    </div>
                                    <div className="px-3 py-1 rounded-full bg-neutral-800 text-xs text-neutral-400 font-mono">
                                        #83dj...29s
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="h-2 bg-neutral-800 rounded w-3/4"></div>
                                    <div className="h-2 bg-neutral-800 rounded w-1/2"></div>
                                    <div className="h-2 bg-neutral-800 rounded w-full"></div>
                                </div>
                                <div className="mt-6 flex gap-3">
                                    <div className="flex-1 h-10 bg-emerald-600/20 border border-emerald-500/30 rounded flex items-center justify-center text-emerald-400 text-sm font-medium">
                                        Funds Secured
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 text-center">
                <div className="max-w-3xl mx-auto px-6">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to start?</h2>
                    <p className="text-neutral-400 mb-10">
                        Join the decentralized workforce today. No fees, no borders, just work.
                    </p>
                    <button
                        onClick={onEnterApp}
                        className="px-10 py-4 bg-white text-black text-lg font-bold rounded-full hover:bg-neutral-200 transition-colors shadow-lg hover:shadow-xl hover:-translate-y-1 transform duration-200"
                    >
                        Launch App
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-white/10 py-12 bg-neutral-950">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-emerald-500" />
                        <span className="font-bold text-neutral-300">ATOMIC-GIG</span>
                    </div>
                    <div className="text-sm text-neutral-500">
                        © 2024 Atomic-Gig. Built on Ergo.
                    </div>
                    <div className="flex gap-6 text-sm text-neutral-400">
                        <a href="#" className="hover:text-white">Twitter</a>
                        <a href="#" className="hover:text-white">GitHub</a>
                        <a href="#" className="hover:text-white">Discord</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-emerald-500/50 transition-colors group">
            <div className="mb-4 p-3 bg-neutral-800 rounded-lg inline-block group-hover:bg-neutral-700 transition-colors">
                {icon}
            </div>
            <h3 className="text-xl font-bold mb-2">{title}</h3>
            <p className="text-neutral-400 leading-relaxed">
                {description}
            </p>
        </div>
    )
}

function Step({ number, title, text }: { number: string, title: string, text: string }) {
    return (
        <div className="flex gap-4">
            <div className="text-2xl font-mono font-bold text-neutral-600">{number}</div>
            <div>
                <h3 className="text-lg font-bold mb-1">{title}</h3>
                <p className="text-neutral-400">{text}</p>
            </div>
        </div>
    )
}
