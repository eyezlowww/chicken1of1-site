import { NextResponse } from 'next/server'

const INDEXNOW_KEY = 'd62255ca6fd35e20d0f95d379afa729d'
const SITE_URL = 'https://www.chicken1of1.com'

// All pages to submit
const ALL_PAGES = [
  '/',
  '/live/',
  '/gallery/',
  '/faq/',
  '/about/',
  '/contact/',
  '/sell-to-us/',
  '/links/',
  '/legal/terms/',
  '/legal/privacy/',
]

export async function POST() {
  try {
    const urls = ALL_PAGES.map(page => `${SITE_URL}${page}`)

    // Submit to IndexNow (Bing/Yandex/others)
    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        host: 'www.chicken1of1.com',
        key: INDEXNOW_KEY,
        keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
        urlList: urls,
      }),
    })

    if (response.ok || response.status === 200 || response.status === 202) {
      return NextResponse.json({
        success: true,
        message: 'URLs submitted to IndexNow',
        urls: urls,
        status: response.status
      })
    } else {
      const errorText = await response.text()
      return NextResponse.json({
        success: false,
        error: errorText,
        status: response.status
      }, { status: response.status })
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'IndexNow API - POST to submit all pages',
    key: INDEXNOW_KEY,
    keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
    pages: ALL_PAGES.map(page => `${SITE_URL}${page}`),
  })
}
