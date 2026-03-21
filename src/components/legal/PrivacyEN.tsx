import React from 'react';
import { ShieldAlert } from 'lucide-react';

export const PrivacyEN = () => (
    <div className="space-y-12 text-sm leading-relaxed text-slate-400 font-medium">
        <section className="space-y-4">
            <h2 className="text-lg font-bold text-white tracking-widest flex items-center gap-2">
                <span className="text-emerald-500 font-mono">01.</span> Collection of Personal Information
            </h2>
            <p>
                Synapse Capital (hereinafter "this site"), in operating the intelligence services provided, may collect the following information for the purposes of improving user experience and maintaining site security.
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4 marker:text-emerald-500">
                <li>Access log information (IP address, browser type, access date and time, etc.)</li>
                <li>Usage data through Cookies and local storage.</li>
                <li>Information voluntarily provided at the time of inquiry (email address, etc.)</li>
            </ul>
        </section>

        <section className="space-y-4">
            <h2 className="text-lg font-bold text-white tracking-widest flex items-center gap-2">
                <span className="text-emerald-500 font-mono">02.</span> Purpose of Use of Collected Information
            </h2>
            <p>
                Collected information will be used only for the following purposes:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4 marker:text-emerald-500">
                <li>To prevent rate limiting and unauthorized use of AI analysis features (position checker, etc.).</li>
                <li>To improve this site and develop new intelligence features.</li>
                <li>To respond to inquiries from users.</li>
            </ul>
        </section>

        <section className="space-y-4">
            <h2 className="text-lg font-bold text-white tracking-widest flex items-center gap-2">
                <span className="text-emerald-500 font-mono">03.</span> Provision of Personal Information to Third Parties
            </h2>
            <p>
                This site will not provide or disclose personal information to third parties without prior consent, except in cases based on laws and regulations or when there is a legitimate reason such as responding to unauthorized access. However, in inference processing by AI models (Google Gemini, OpenRouter, etc.), data such as inputted ticket information is sent via API. The sent data does not include personal information that directly identifies the user.
            </p>
        </section>

        <section className="space-y-4">
            <h2 className="text-lg font-bold text-white tracking-widest flex items-center gap-2">
                <span className="text-emerald-500 font-mono">04.</span> Disclaimers and Security
            </h2>
            <div className="p-4 bg-red-900/10 border border-red-500/20 rounded-xl mt-4">
                <div className="flex items-start gap-3">
                    <ShieldAlert size={20} className="text-red-500 shrink-0 mt-0.5" />
                    <div className="space-y-2 text-red-200/80">
                        <p>This site is a tool intended for providing financial information and AI-based analysis, and does not provide any investment advice.</p>
                        <p>While we take the utmost care regarding the timeliness and accuracy of the data, this site assumes no responsibility for any damage resulting from the use of the information on this site. Investment decisions must be made at your own risk.</p>
                    </div>
                </div>
            </div>
        </section>

        <section className="space-y-4">
            <h2 className="text-lg font-bold text-white tracking-widest flex items-center gap-2">
                <span className="text-emerald-500 font-mono">05.</span> Access Analysis Tools
            </h2>
            <p>
                This site uses access analysis tools to collect traffic data. This traffic data is collected anonymously and does not identify individuals. You can refuse collection by disabling Cookies, so please check your browser settings.
            </p>
        </section>

        <section className="space-y-4">
            <h2 className="text-lg font-bold text-white tracking-widest flex items-center gap-2">
                <span className="text-emerald-500 font-mono">06.</span> Changes to the Privacy Policy
            </h2>
            <p>
                This site may change this policy without notice due to changes in laws and regulations or updates to service content. The changed policy shall take effect when it is posted on this site.
            </p>
        </section>

        <section className="space-y-4 pt-8 border-t border-slate-800/50">
            <h2 className="text-lg font-bold text-white tracking-widest flex items-center gap-2">
                <span className="text-emerald-500 font-mono">07.</span> Contact Information
            </h2>
            <p>
                For inquiries regarding this policy or consultations regarding the handling of personal information, please contact the following email address:
            </p>
            <p className="text-emerald-400 font-mono mt-2">
                <a href="mailto:info@agent-frontier.jp" className="hover:underline">info@agent-frontier.jp</a>
            </p>
        </section>
    </div>
);
