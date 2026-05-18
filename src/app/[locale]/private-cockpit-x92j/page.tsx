import type { Metadata } from 'next';
import SecretCockpit from '@/components/SecretCockpit';
import CockpitLogin from '@/components/CockpitLogin';
import { isCockpitAuthed } from '@/lib/cockpit-auth';

export const metadata: Metadata = {
    robots: { index: false, follow: false },
};

export async function generateStaticParams() {
    return [{ locale: 'en' }, { locale: 'ja' }];
}

export default async function Page(props: { params: Promise<{ locale: string }> }) {
    const { locale } = await props.params;

    if (!(await isCockpitAuthed())) {
        return <CockpitLogin locale={locale} />;
    }

    return <SecretCockpit />;
}
