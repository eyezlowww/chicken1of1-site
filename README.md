# Chicken1of1 - UFC Sports Cards & Live Breaks

A production-ready Next.js website for UFC sports card trading and live breaks. Built with Next.js 14, TypeScript, and Tailwind CSS.

## 🚀 Features

- **Modern Stack**: Next.js 14 with App Router, TypeScript, Tailwind CSS
- **SEO Optimized**: Complete meta tags, Open Graph, Twitter Cards, JSON-LD schema
- **Performance**: Lighthouse score ≥90, lazy loading, optimized images
- **Responsive**: Mobile-first design from 360px up
- **Accessibility**: Semantic HTML, ARIA labels, keyboard navigation
- **Dark Theme**: High-contrast design optimized for card breaking content

## 📁 Project Structure

```
chicken1of1-site/
├── app/                    # Next.js 14 App Router
│   ├── (pages)/           # Route groups
│   │   ├── about/
│   │   ├── faq/
│   │   ├── gallery/
│   │   ├── links/
│   │   ├── live/
│   │   ├── contact/
│   │   └── legal/
│   ├── api/
│   │   └── health/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   ├── robots.ts
│   └── sitemap.ts
├── components/            # Reusable React components
├── content/              # JSON content files
├── public/               # Static assets
├── .env.example          # Environment variables template
└── README.md
```

## 🛠️ Setup & Development

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd chicken1of1-site
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` with your actual values:
   ```env
   # Site Configuration
   NEXT_PUBLIC_SITE_URL=https://chicken1of1.com

   # Analytics (optional)
   NEXT_PUBLIC_GA4_ID=G-XXXXXXXXXX
   NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX

   # Chat Widget (choose one)
   NEXT_PUBLIC_CHAT_PROVIDER=crisp
   NEXT_PUBLIC_CRISP_WEBSITE_ID=your-crisp-id
   # OR
   NEXT_PUBLIC_CHAT_PROVIDER=tidio
   NEXT_PUBLIC_TIDIO_PUBLISHABLE_KEY=your-tidio-key

   # Social Links (optional - defaults provided)
   NEXT_PUBLIC_INSTAGRAM_URL=https://www.instagram.com/chicken1of1
   NEXT_PUBLIC_WHATNOT_URL=https://www.whatnot.com/s/muoENH2W
   NEXT_PUBLIC_FANATICS_URL=https://www.fanatics.live/shops/chicken1of1
   NEXT_PUBLIC_MMAROOKIES_URL=https://www.mmarookies.com
   ```

4. **Start development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open in browser**
   Visit [http://localhost:3000](http://localhost:3000)

### Development Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
npm run format       # Format code with Prettier
```

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repository
   - Configure environment variables
   - Deploy

3. **Add Custom Domain**
   - In Vercel dashboard, go to Project Settings → Domains
   - Add your domain (e.g., chicken1of1.com)
   - Configure DNS according to Vercel's instructions

### DNS Configuration (GoDaddy)

1. **Login to GoDaddy**
   - Go to Domain Manager → DNS Management

2. **Add DNS Records**
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com

   Type: A
   Name: @
   Value: 76.76.21.21
   ```

3. **Wait for Propagation**
   - DNS changes can take up to 48 hours
   - Check status at [whatsmydns.net](https://whatsmydns.net)

## 🎨 Customization

### Content Updates

- **Instagram Posts**: Edit `content/instagram.json`
- **FAQ Items**: Edit `content/faq.json`
- **Testimonials**: Edit `content/testimonials.json`

### Images

Replace placeholder images in `public/gallery/`:
- `hit-1.jpg` through `hit-12.jpg` - Gallery images
- `instagram-1.jpg` through `instagram-8.jpg` - Instagram feed
- `about-hero.jpg` - About page hero image
- `og-image.png` - Social media preview (1200x630px)

### Brand Colors

Edit colors in `tailwind.config.ts`:
```typescript
colors: {
  primary: {
    // Your brand colors
  }
}
```

## 🔧 Integrations

### Analytics Setup

**Google Analytics 4**
1. Create GA4 property at [analytics.google.com](https://analytics.google.com)
2. Add `NEXT_PUBLIC_GA4_ID` to environment variables

**Google Tag Manager**
1. Create GTM container at [tagmanager.google.com](https://tagmanager.google.com)
2. Add `NEXT_PUBLIC_GTM_ID` to environment variables

### Chat Widget Setup

**Crisp**
1. Sign up at [crisp.chat](https://crisp.chat)
2. Get Website ID from settings
3. Set `NEXT_PUBLIC_CHAT_PROVIDER=crisp` and `NEXT_PUBLIC_CRISP_WEBSITE_ID`

**Tidio**
1. Sign up at [tidio.com](https://tidio.com)
2. Get Publishable Key from settings
3. Set `NEXT_PUBLIC_CHAT_PROVIDER=tidio` and `NEXT_PUBLIC_TIDIO_PUBLISHABLE_KEY`

### E-commerce Ready

The site includes commented examples for:

**Shopify Buy Button**
```javascript
// Uncomment in components/EmbedCard.tsx
const shopifyBuyButton = `
  <div id='product-component-1234567890'></div>
  <script>/* Shopify Buy Button code */</script>
`;
```

**Stripe Payment Links**
```javascript
// Example usage
const stripeLink = "https://buy.stripe.com/your-payment-link";
```

## 📊 SEO & Performance

### Built-in SEO Features

- ✅ Semantic HTML structure
- ✅ Meta titles and descriptions
- ✅ Open Graph tags
- ✅ Twitter Cards
- ✅ JSON-LD structured data (Organization, Website, FAQ)
- ✅ XML sitemap
- ✅ Robots.txt
- ✅ Canonical URLs

### Performance Optimizations

- ✅ Next.js Image optimization
- ✅ Font optimization (Inter via next/font)
- ✅ Static generation
- ✅ Lazy loading
- ✅ No layout shift (CLS)
- ✅ Reduced motion support

### SEO Validation

Test your SEO setup:
- [Rich Results Test](https://search.google.com/test/rich-results)
- [PageSpeed Insights](https://pagespeed.web.dev/)
- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)

## 📋 Next Steps

### Content Tasks

- [ ] Replace placeholder images with actual card photos
- [x] Update Instagram feed with real posts (Elfsight widget configured)
- [x] Customize FAQ content for your specific breaks
- [ ] Add real testimonials from customers
- [x] Update About page with your story

### Technical Tasks

- [x] Set up Google Analytics/GTM
- [x] Competitive analysis of 9+ top card breaking websites
- [x] Updated About section with authentic company story
- [x] Customized FAQ content with UFC-specific answers and collector wisdom
- [ ] Configure chat widget (Crisp or Tidio)
- [ ] Test contact form functionality
- [ ] Optimize images for web (WebP format recommended)
- [ ] Set up automated backups

### Business Tasks

- [ ] Connect Shopify/Stripe for e-commerce
- [ ] Set up Instagram oEmbed integration
- [ ] Configure live streaming embeds
- [ ] Plan content calendar for social media
- [ ] Create email newsletter signup

### Legal Tasks

- [ ] Review terms of service with legal counsel
- [ ] Ensure privacy policy compliance
- [ ] Update shipping policies for your location
- [ ] Set up business licenses if required

## 🛡️ Security

- HTTPS enforced via Vercel
- Environment variables for sensitive data
- No hardcoded secrets in code
- Security headers configured
- Input sanitization on forms

## 📞 Support

Need help with setup or customization?

- 📧 Email: [your-email@domain.com]
- 💬 GitHub Issues: Create an issue in this repository
- 📚 Documentation: [Next.js Docs](https://nextjs.org/docs)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Built with ❤️ for the UFC card breaking community. Bauk Bauk Baby!**