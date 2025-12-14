import { useEffect, useState } from 'react';
import { ArrowRight, Shield, Zap, Globe, Wallet, Lock } from 'lucide-react';

interface LandingPageProps {
    onEnterApp: () => void;
}

// Animated floating particles
function FloatingParticles() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
                <div
                    key={i}
                    className="absolute rounded-full bg-emerald-500/20"
                    style={{
                        width: Math.random() * 10 + 5 + 'px',
                        height: Math.random() * 10 + 5 + 'px',
                        left: Math.random() * 100 + '%',
                        top: Math.random() * 100 + '%',
                        animation: `float ${5 + Math.random() * 10}s ease-in-out infinite`,
                        animationDelay: `${Math.random() * 5}s`,
                    }}
                />
            ))}
        </div>
    );
}

export function LandingPage({ onEnterApp }: LandingPageProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-emerald-500/30 overflow-hidden">
            {/* Custom CSS Animations */}
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.3; }
                    50% { transform: translateY(-20px) rotate(180deg); opacity: 0.8; }
                }
                @keyframes pulse-glow {
                    0%, 100% { box-shadow: 0 0 20px rgba(16, 185, 129, 0.3); }
                    50% { box-shadow: 0 0 40px rgba(16, 185, 129, 0.6); }
                }
                @keyframes slide-up {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes slide-in-left {
                    from { opacity: 0; transform: translateX(-50px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                @keyframes gradient-shift {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                @keyframes glow-pulse {
                    0%, 100% { opacity: 0.5; }
                    50% { opacity: 1; }
                }
                .animate-slide-up { animation: slide-up 0.8s ease-out forwards; }
                .animate-slide-up-delay-1 { animation: slide-up 0.8s ease-out 0.1s forwards; opacity: 0; }
                .animate-slide-up-delay-2 { animation: slide-up 0.8s ease-out 0.2s forwards; opacity: 0; }
                .animate-slide-up-delay-3 { animation: slide-up 0.8s ease-out 0.3s forwards; opacity: 0; }
                .animate-slide-up-delay-4 { animation: slide-up 0.8s ease-out 0.4s forwards; opacity: 0; }
                .animate-pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
                .gradient-animate { 
                    background-size: 200% 200%;
                    animation: gradient-shift 3s ease infinite;
                }
            `}</style>

            {/* Floating Particles Background */}
            <FloatingParticles />

            {/* Navbar */}
            <nav className="fixed w-full z-50 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center animate-pulse-glow">
                            <Zap className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold tracking-tight">ATOMIC-GIG</span>
                    </div>
                    <div className="flex items-center gap-6 text-sm font-medium text-neutral-400">
                        <a href="#features" className="hover:text-white transition-colors hover:scale-105 transform duration-200">Features</a>
                        <a href="#how-it-works" className="hover:text-white transition-colors hover:scale-105 transform duration-200">How it Works</a>
                        <button
                            onClick={onEnterApp}
                            className="bg-white text-black px-4 py-2 rounded-full hover:bg-emerald-400 hover:text-black transition-all font-semibold hover:scale-105 transform duration-200 hover:shadow-lg hover:shadow-emerald-500/30"
                        >
                            Launch App
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-40 pb-32 overflow-hidden">
                {/* Animated Background Gradients */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-emerald-500/20 rounded-full blur-[120px] -z-10 animate-pulse" style={{ animationDuration: '4s' }} />
                <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-blue-500/10 rounded-full blur-[100px] -z-10 animate-pulse" style={{ animationDuration: '6s' }} />
                <div className="absolute top-1/2 left-0 w-[600px] h-[400px] bg-purple-500/5 rounded-full blur-[80px] -z-10 animate-pulse" style={{ animationDuration: '5s' }} />

                <div className="max-w-7xl mx-auto px-6 text-center">
                    {/* Live Badge */}
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-medium mb-10 ${isVisible ? 'animate-slide-up' : 'opacity-0'}`}>
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        Live on Ergo Mainnet
                    </div>

                    {/* Main Headline */}
                    <h1 className={`text-5xl md:text-8xl font-bold tracking-tight mb-8 leading-[1.1] ${isVisible ? 'animate-slide-up-delay-1' : 'opacity-0'}`}>
                        <span className="text-white">
                            The Future of
                        </span>
                        <br />
                        <span className="text-emerald-400">
                            Decentralized Work
                        </span>
                    </h1>

                    <p className={`text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto mb-12 leading-relaxed ${isVisible ? 'animate-slide-up-delay-2' : 'opacity-0'}`}>
                        Connect, collaborate, and transact with <span className="text-emerald-400 font-semibold">absolute trust</span>.
                        Atomic-Gig leverages smart contracts to ensure fair payments
                        and verifiable reputation for every gig.
                    </p>

                    {/* CTA Buttons */}
                    <div className={`flex flex-col md:flex-row items-center justify-center gap-6 ${isVisible ? 'animate-slide-up-delay-3' : 'opacity-0'}`}>
                        <button
                            onClick={onEnterApp}
                            className="group relative px-8 py-4 bg-emerald-600 hover:bg-emerald-500 rounded-lg font-semibold transition-all hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] hover:scale-105 transform duration-300 animate-pulse-glow"
                        >
                            <div className="flex items-center gap-2">
                                Start Working Now
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-300" />
                            </div>
                        </button>
                        <button className="px-8 py-4 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 hover:border-emerald-500/50 rounded-lg font-semibold transition-all hover:scale-105 transform duration-200">
                            Read Whitepaper
                        </button>
                    </div>

                    {/* Stats */}
                    <div className={`mt-20 pt-10 border-t border-white/5 grid grid-cols-1 md:grid-cols-3 gap-8 ${isVisible ? 'animate-slide-up-delay-4' : 'opacity-0'}`}>
                        <div className="group hover:scale-110 transition-transform duration-300">
                            <div className="text-4xl font-bold text-emerald-400">$0.00</div>
                            <div className="text-sm text-neutral-500 uppercase tracking-wider mt-1 group-hover:text-emerald-400 transition-colors">Platform Fees</div>
                        </div>
                        <div className="group hover:scale-110 transition-transform duration-300">
                            <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Trustless</div>
                            <div className="text-sm text-neutral-500 uppercase tracking-wider mt-1 group-hover:text-blue-400 transition-colors">Escrow System</div>
                        </div>
                        <div className="group hover:scale-110 transition-transform duration-300">
                            <div className="text-4xl font-bold text-white">Global</div>
                            <div className="text-sm text-neutral-500 uppercase tracking-wider mt-1 group-hover:text-white transition-colors">Talent Pool</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="py-24 bg-neutral-900/30">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-4">
                            <span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">Why Atomic-Gig?</span>
                        </h2>
                        <p className="text-neutral-400">Built for the gig economy of tomorrow.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Shield className="w-6 h-6 text-emerald-400" />}
                            title="Smart Contract Escrow"
                            description="Funds are locked in a smart contract and only released when the work is verified. No middlemen, no disputes."
                            delay={0}
                        />
                        <FeatureCard
                            icon={<Globe className="w-6 h-6 text-blue-400" />}
                            title="Universal Reputation"
                            description="Your reputation travels with you. Build a verifiable work history on-chain that you truly own."
                            delay={1}
                        />
                        <FeatureCard
                            icon={<Wallet className="w-6 h-6 text-purple-400" />}
                            title="Instant Crypto Payments"
                            description="Get paid instantly in ERG or stablecoins. No banking delays, no chargebacks, global reach."
                            delay={2}
                        />
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section id="how-it-works" className="py-24 border-t border-white/5">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent">Workflow Simplified</h2>
                            <div className="space-y-8">
                                <Step
                                    number="01"
                                    title="Create or Find a Gig"
                                    text="Clients post gigs with clear requirements and budget. Workers browse and apply."
                                    color="emerald"
                                />
                                <Step
                                    number="02"
                                    title="Lock Funds in Escrow"
                                    text="Client deposits funds into the Atomic Escrow contract. Work begins safely."
                                    color="blue"
                                />
                                <Step
                                    number="03"
                                    title="Complete & Verify"
                                    text="Worker submits deliverables. Client reviews. Funds are released automatically."
                                    color="purple"
                                />
                            </div>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-0 bg-emerald-500/20 blur-[80px] rounded-full animate-pulse" />
                            <div className="relative bg-neutral-900 border border-neutral-800 rounded-2xl p-8 shadow-2xl hover:border-emerald-500/50 transition-all duration-500 hover:scale-105">
                                {/* Mock UI Card */}
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center animate-pulse-glow">
                                            <Lock className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <div className="font-semibold">Escrow Contract</div>
                                            <div className="text-xs text-green-500 flex items-center gap-1">
                                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                                Active • 500 ERG Locked
                                            </div>
                                        </div>
                                    </div>
                                    <div className="px-3 py-1 rounded-full bg-neutral-800 text-xs text-neutral-400 font-mono">
                                        #83dj...29s
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="h-2 bg-neutral-800 rounded w-3/4 animate-pulse"></div>
                                    <div className="h-2 bg-neutral-800 rounded w-1/2 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                                    <div className="h-2 bg-neutral-800 rounded w-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                                </div>
                                <div className="mt-6 flex gap-3">
                                    <div className="flex-1 h-10 bg-emerald-600/20 border border-emerald-500/30 rounded flex items-center justify-center text-emerald-400 text-sm font-medium animate-pulse-glow">
                                        ✓ Funds Secured
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/5 to-transparent"></div>
                <div className="max-w-3xl mx-auto px-6 relative">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white via-emerald-300 to-white bg-clip-text text-transparent">Ready to start?</h2>
                    <p className="text-neutral-400 mb-10">
                        Join the decentralized workforce today. No fees, no borders, just work.
                    </p>
                    <button
                        onClick={onEnterApp}
                        className="px-10 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-lg font-bold rounded-full hover:from-emerald-400 hover:to-emerald-500 transition-all shadow-lg hover:shadow-emerald-500/50 hover:-translate-y-2 transform duration-300 animate-pulse-glow"
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
                        <a href="#" className="hover:text-emerald-400 transition-colors">Twitter</a>
                        <a href="#" className="hover:text-emerald-400 transition-colors">GitHub</a>
                        <a href="#" className="hover:text-emerald-400 transition-colors">Discord</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function FeatureCard({ icon, title, description, delay }: { icon: React.ReactNode, title: string, description: string, delay: number }) {
    return (
        <div
            className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-emerald-500/50 transition-all duration-500 group hover:scale-105 hover:shadow-xl hover:shadow-emerald-500/10"
            style={{ animationDelay: `${delay * 0.1}s` }}
        >
            <div className="mb-4 p-3 bg-neutral-800 rounded-lg inline-block group-hover:bg-emerald-500/20 transition-all duration-300 group-hover:scale-110">
                {icon}
            </div>
            <h3 className="text-xl font-bold mb-2 group-hover:text-emerald-400 transition-colors">{title}</h3>
            <p className="text-neutral-400 leading-relaxed group-hover:text-neutral-300 transition-colors">
                {description}
            </p>
        </div>
    )
}

function Step({ number, title, text, color }: { number: string, title: string, text: string, color: string }) {
    const colorClasses: Record<string, string> = {
        emerald: 'text-emerald-500 border-emerald-500/30 hover:border-emerald-500',
        blue: 'text-blue-500 border-blue-500/30 hover:border-blue-500',
        purple: 'text-purple-500 border-purple-500/30 hover:border-purple-500',
    };

    return (
        <div className={`flex gap-4 p-4 rounded-lg border border-neutral-800 hover:bg-neutral-900/50 transition-all duration-300 hover:scale-105 ${colorClasses[color]}`}>
            <div className={`text-2xl font-mono font-bold ${colorClasses[color].split(' ')[0]}`}>{number}</div>
            <div>
                <h3 className="text-lg font-bold mb-1">{title}</h3>
                <p className="text-neutral-400">{text}</p>
            </div>
        </div>
    )
}
