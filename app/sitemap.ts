import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  // Hardcode www to ensure sitemap always uses canonical www URLs
  const baseUrl = 'https://www.chicken1of1.com'
  const currentDate = new Date()

  // Calculate specific last modified dates for better SEO
  const getLastModified = (daysAgo: number) => {
    const date = new Date()
    date.setDate(date.getDate() - daysAgo)
    return date
  }

  return [
    {
      url: `${baseUrl}/`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/live/`,
      lastModified: currentDate,
      changeFrequency: 'hourly',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/gallery/`,
      lastModified: getLastModified(2),
      changeFrequency: 'daily',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/faq/`,
      lastModified: getLastModified(7),
      changeFrequency: 'weekly',
      priority: 0.80,
    },
    {
      url: `${baseUrl}/about/`,
      lastModified: getLastModified(14),
      changeFrequency: 'monthly',
      priority: 0.75,
    },
    {
      url: `${baseUrl}/contact/`,
      lastModified: getLastModified(30),
      changeFrequency: 'monthly',
      priority: 0.70,
    },
    {
      url: `${baseUrl}/sell-to-us/`,
      lastModified: getLastModified(7),
      changeFrequency: 'weekly',
      priority: 0.80,
    },
    {
      url: `${baseUrl}/links/`,
      lastModified: getLastModified(30),
      changeFrequency: 'monthly',
      priority: 0.65,
    },
    {
      url: `${baseUrl}/legal/terms/`,
      lastModified: getLastModified(90),
      changeFrequency: 'yearly',
      priority: 0.30,
    },
    {
      url: `${baseUrl}/legal/privacy/`,
      lastModified: getLastModified(90),
      changeFrequency: 'yearly',
      priority: 0.30,
    },
  ]
}