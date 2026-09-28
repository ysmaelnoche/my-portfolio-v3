import { Plane } from '@/components/plane/Plane';
import { portfolio } from '@/content/portfolio';
import { siteUrl } from '@/content/site';

function personJsonLd() {
  const sameAs = portfolio.links.map((l) => l.href).filter((h) => /^https?:\/\//.test(h));
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: portfolio.name,
    ...(portfolio.fullName ? { alternateName: portfolio.fullName } : {}),
    jobTitle: portfolio.role,
    description: portfolio.intro,
    ...(portfolio.email ? { email: `mailto:${portfolio.email}` } : {}),
    url: siteUrl(),
    ...(portfolio.school ? { alumniOf: { '@type': 'CollegeOrUniversity', name: portfolio.school } } : {}),
    knowsAbout: portfolio.skills.flatMap((g) => g.items),
    ...(sameAs.length ? { sameAs } : {}),
  };
}

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd()).replace(/</g, '\\u003c') }}
      />
      <Plane data={portfolio} />
    </>
  );
}
