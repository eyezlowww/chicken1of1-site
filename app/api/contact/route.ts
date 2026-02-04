import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, subject, message } = body

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
      to: ['chicken1of1info@gmail.com'],
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