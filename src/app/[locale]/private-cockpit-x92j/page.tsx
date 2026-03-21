import SecretCockpit from '@/components/SecretCockpit';

export const dynamicParams = false;
export async function generateStaticParams() {
    return [{ locale: 'en' }, { locale: 'ja' }];
}

export default async function Page() {
    return <SecretCockpit />;
}
