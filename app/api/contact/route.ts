import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 3 requests per 10 minutes per IP
    const ip = getClientIp(request)
    const rateLimitResult = rateLimit(ip, { maxRequests: 3, windowMs: 10 * 60 * 1000 })

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil(rateLimitResult.resetIn / 1000)),
          },
        }
      )
    }

    const body = await request.json()
    const { name, email, subject, message, website } = body

    // Honeypot: bots fill hidden fields, humans don't. Silently succeed so bots don't adapt.
    if (website) {
      return NextResponse.json({ message: 'Message sent successfully!' }, { status: 200 })
    }

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Subject must be one of the valid dropdown options — blocks bots using custom values
    const validSubjects = ['Break Inquiry', 'Product Request', 'Partnership', 'Technical Issue', 'General Question']
    if (!validSubjects.includes(subject)) {
      return NextResponse.json(
        { error: 'Invalid subject selection' },
        { status: 400 }
      )
    }

    // Block email header injection attempts in name/message fields
    const injectionPattern = /email:|subject:|cc:|bcc:|content-type:|to:|from:/i
    if (injectionPattern.test(name) || injectionPattern.test(message)) {
      return NextResponse.json(
        { error: 'Invalid content detected' },
        { status: 400 }
      )
    }

    // Message must contain at least 3 words — catches random-character spam
    if (message.trim().split(/\s+/).length < 3) {
      return NextResponse.json(
        { error: 'Please provide a more detailed message (at least a few words).' },
        { status: 400 }
      )
    }

    // Name must be at least 2 characters and not contain URLs
    if (name.trim().length < 2 || /https?:\/\//i.test(name)) {
      return NextResponse.json(
        { error: 'Please enter a valid name.' },
        { status: 400 }
      )
    }

    // Send email using Resend
    const emailContent = `
New contact form submission from ${name}

Email: ${email}
Subject: ${subject}

Message:
${message}

---
Sent from Chicken1of1 Contact Form
Time: ${new Date().toLocaleString()}
    `.trim()

    await resend.emails.send({
      from: 'Contact Form <noreply@chicken1of1.com>',
      to: ['hello@chicken1of1.com'],
      subject: `[Contact Form] ${subject}`,
      text: emailContent,
      replyTo: email,
    })

    // Send confirmation email to user
    await resend.emails.send({
      from: 'Chicken1of1 <noreply@chicken1of1.com>',
      to: [email],
      subject: 'Thanks for contacting Chicken1of1!',
      text: `Hey ${name}!

Thanks for reaching out to us! We've received your message about "${subject}" and we'll get back to you within 24 hours.

For the fastest response, you can also DM us on Instagram @chicken1of1.

Bauk Bauk Baby!
The Chicken1of1 Team

---
Your original message:
${message}`,
    })

    return NextResponse.json(
      { message: 'Message sent successfully!' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Failed to send message. Please try again.' },
      { status: 500 }
    )
  }
}