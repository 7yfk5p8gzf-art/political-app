const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const siteUrl = configuredSiteUrl.replace(/\/$/, '');
export const siteImageUrl = `${siteUrl}/og-image.jpg`;

export function absoluteUrl(path: string) {
  return `${siteUrl}${path.startsWith('/') ? path : `/${path}`}`;
}
