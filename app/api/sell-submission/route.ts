import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface ProductItem {
  product: string
  format: string
  quantity: number
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { products, condition, priceExpectation, notes, name, email, phone, preferredContact, instagram } = body

    // Validate required fields
    if (!products || !products.length || !name || !email) {
      return NextResponse.json(
        { error: 'Products, name, and email are required' },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Format product list
    const productList = products
      .map((p: ProductItem, i: number) => `  ${i + 1}. ${p.product} (${p.format}) x${p.quantity}`)
      .join('\n')

    const emailContent = `
New Sell Submission from ${name}

PRODUCTS:
${productList}

CONDITION: ${condition || 'Not specified'}
PRICE EXPECTATION: ${priceExpectation || 'Not specified'}
NOTES: ${notes || 'None'}

CONTACT INFO:
Name: ${name}
Email: ${email}
Phone: ${phone || 'Not provided'}
Preferred Contact: ${preferredContact || 'Email'}
Instagram: ${instagram || 'Not provided'}

---
Sent from Chicken1of1 Sell To Us Form
Time: ${new Date().toLocaleString()}
    `.trim()

    await resend.emails.send({
      from: 'Sell Submission <noreply@chicken1of1.com>',
      to: ['hello@chicken1of1.com'],
      subject: `[Sell Submission] ${name} - ${products.length} product(s)`,
      text: emailContent,
      replyTo: email,
    })

    // Send confirmation to submitter
    await resend.emails.send({
      from: 'Chicken1of1 <noreply@chicken1of1.com>',
      to: [email],
      subject: 'We received your sell submission - Chicken1of1',
      text: `Hey ${name}!

Thanks for submitting your products to us! We've received your submission and will review it within 24 hours.

We'll reach out via ${preferredContact || 'email'} with our offer.

For the fastest response, you can also DM us on Instagram @chicken1of1.

Bauk Bauk Baby!
The Chicken1of1 Team`,
    })

    return NextResponse.json(
      { message: 'Submission received! We will review and reach out within 24 hours.' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Sell submission error:', error)
    return NextResponse.json(
      { error: 'Failed to submit. Please try again.' },
      { status: 500 }
    )
  }
}
