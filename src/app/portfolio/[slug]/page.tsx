import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import codeRabbitLogo from '@/public/assets/images/coderabbit-logo-light.svg';

type PortfolioDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return Array.from({ length: 6 }, (_, i) => ({
    slug: `${i}`,
  }));
}

export async function generateMetadata(
  props: PortfolioDetailPageProps
): Promise<Metadata> {
  const { slug } = await props.params;
  const t = await getTranslations({ namespace: 'PortfolioSlug' });

  return {
    title: t('meta_title', { slug }),
    description: t('meta_description', { slug }),
  };
}

export default async function PortfolioDetail(props: PortfolioDetailPageProps) {
  const { slug } = await props.params;
  const t = await getTranslations({ namespace: 'PortfolioSlug' });

  return (
    <>
      <h1 className="capitalize">{t('header', { slug })}</h1>
      <p>{t('content')}</p>

      <div className="mt-5 text-center text-sm">
        {`${t('code_review_powered_by')} `}
        <a
          className="text-blue-700 hover:border-b-2 hover:border-blue-700"
          href="https://www.coderabbit.ai?utm_source=next_js_starter&utm_medium=github&utm_campaign=next_js_starter_oss_2025"
        >
          CodeRabbit
        </a>
      </div>

      <a href="https://www.coderabbit.ai?utm_source=next_js_starter&utm_medium=github&utm_campaign=next_js_starter_oss_2025">
        <Image
          className="mx-auto mt-2"
          src={codeRabbitLogo}
          alt="CodeRabbit"
          width={130}
        />
      </a>
    </>
  );
}

export const dynamicParams = false;
