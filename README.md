# Chicken1of1 - UFC Sports Cards & Live Breaks

A production-ready Next.js website for UFC sports card trading and live breaks. Built with Next.js 14, TypeScript, and Tailwind CSS.

## 🚀 Features

### **Core Technical Stack**
- **Modern Framework**: Next.js 14 with App Router, TypeScript, Tailwind CSS
- **Performance Optimized**: Lighthouse score ≥90, lazy loading, optimized images, enhanced caching
- **SEO Excellence**: Complete meta tags, Open Graph, Twitter Cards, enhanced JSON-LD schemas
- **Responsive Design**: Mobile-first from 360px up with enhanced UX polish
- **Accessibility**: WCAG compliant with semantic HTML, ARIA labels, keyboard navigation
- **Dark Theme**: High-contrast design optimized for card breaking content

### **Advanced Features Implemented**
- ✅ **Real Testimonial Screenshots** - Authentic Whatnot customer reviews with modal gallery
- ✅ **Authentic Gallery Content** - Real UFC card descriptions for Cards #1-6 with detailed information
- ✅ **FAQ Search System** - Real-time search with suggestions and no-results states
- ✅ **Professional Contact Form** - Server-side email integration with Resend API
- ✅ **Loading States & UX Polish** - Spinners, skeleton loaders, micro-interactions
- ✅ **Enhanced Navigation** - Active states, hover effects, proper focus management
- ✅ **Error Handling** - ErrorBoundary components and toast notifications
- ✅ **Enhanced SEO** - LocalBusiness structured data, comprehensive meta optimization
- ✅ **Security Headers** - Performance and security optimizations via next.config.js
- ✅ **Instagram Integration** - Ready for Elfsight widget configuration
- ✅ **Analytics Ready** - GA4/GTM setup with privacy considerations
- ✅ **Chat Widget Infrastructure** - Crisp/Tidio ready with environment configuration

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
│   ├── ErrorBoundary.tsx  # Error handling component
│   ├── LoadingSpinner.tsx # Reusable loading component
│   ├── SkeletonLoader.tsx # Loading skeleton components
│   ├── Toast.tsx          # Notification system
│   ├── PageTransition.tsx # Page transition effects
│   ├── SearchableFAQ.tsx  # FAQ with search functionality
│   ├── ContactForm.tsx    # Enhanced contact form
│   ├── Header.tsx         # Navigation with accessibility
│   ├── Footer.tsx         # Footer with semantic structure
│   └── Nav.tsx            # Enhanced navigation component
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

   # Email Integration (Contact Form)
   RESEND_API_KEY=your-resend-api-key
   RESEND_FROM_EMAIL=hello@chicken1of1.com
   CONTACT_TO_EMAIL=hello@chicken1of1.com

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

### Quality Assurance

**Before deploying, always run:**
```bash
npm run build        # Ensure clean production build
npm run lint         # Check code quality
npm run type-check   # Verify TypeScript compliance
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
- `hit-1.jpg` through `hit-6.jpg` - ✅ **Gallery images with authentic descriptions**
- `hit-7.jpg` through `hit-12.jpg` - Pending authentic card details
- `instagram-1.jpg` through `instagram-8.jpg` - Instagram feed
- `about-hero.jpg` - About page hero image
- `og-image.png` - Social media preview (1200x630px)
- `testimonials/whatnot-reviews-1.jpg, 2.jpg, 3.jpg` - ✅ **Real customer review screenshots**

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

### Enhanced SEO Features

- ✅ **Semantic HTML structure** with proper heading hierarchy
- ✅ **Enhanced meta optimization** with dynamic titles and descriptions
- ✅ **Open Graph tags** with custom 1200x630 branded banner
- ✅ **Twitter Cards** with proper image optimization
- ✅ **JSON-LD structured data** - Organization, LocalBusiness, Website, Service schemas
- ✅ **XML sitemap** with realistic priorities and change frequencies
- ✅ **Enhanced robots.txt** with AI bot blocking and crawl optimization
- ✅ **Canonical URLs** with proper domain management
- ✅ **Resource preloading** for critical performance paths

### Performance & Security Optimizations

- ✅ **Next.js Image optimization** with WebP support and lazy loading
- ✅ **Font optimization** (Inter via next/font) with preload strategies
- ✅ **Static generation** with ISR for dynamic content
- ✅ **Enhanced caching strategies** via HTTP headers and CDN optimization
- ✅ **Security headers** - CSP, HSTS, X-Frame-Options, referrer policies
- ✅ **No layout shift (CLS)** with proper image dimensions and skeleton loaders
- ✅ **Reduced motion support** with accessibility preferences
- ✅ **DNS prefetch** for external resources and performance optimization

### SEO Validation

Test your SEO setup:
- [Rich Results Test](https://search.google.com/test/rich-results)
- [PageSpeed Insights](https://pagespeed.web.dev/)
- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)

## 📋 Implementation Status

### ✅ Recently Completed (Latest Development Session)

#### **Professional Error Pages & SEO Infrastructure**
- ✅ **Custom Error Pages** - Professional branded error pages (404, error, global-error, loading) with Chicken1of1 UFC-themed messaging
- ✅ **Custom 404 Page** - Features UFC fighter chicken image with "This Page Flew the Coop!" and helpful navigation
- ✅ **Google Search Console Verification** - Successfully verified domain, submitted sitemap, and indexed all key pages for SEO
- ✅ **Social Media Verification Infrastructure** - Added meta tags for Google, Facebook, Instagram, YouTube, TikTok verification
- ✅ **Comprehensive Favicon Setup** - Added favicon.ico, apple-touch-icon.png, icon.png, icon-192.png, icon-512.png for all devices
- ✅ **Testimonial Modal Fix** - Removed overlay text from testimonial screenshots for clean full-size viewing

#### **Previous Session: Content & Social Proof**
- ✅ **Real Testimonial Screenshots** - Replaced fake testimonials with authentic Whatnot customer review screenshots using TestimonialScreenshots.tsx component
- ✅ **Gallery Card Descriptions #1-6** - Updated with authentic card details (Jake Paul 1/1, The Rock, Payton Talbott, Max Holloway, Jon Jones, Anderson Silva)
- ✅ **Homepage/Gallery Sync** - Both pages show consistent card descriptions for seamless user experience
- ✅ **FAQ Search Functionality** - Real-time search with popular suggestions and no-results states
- ✅ **Loading States & UX Polish** - Loading spinners, skeleton loaders, micro-interactions, toast notifications
- ✅ **Enhanced Navigation** - Active states, hover effects, proper focus management
- ✅ **Professional Contact Form** - Server-side email integration with Resend API
- ✅ **Error Handling System** - ErrorBoundary components with fallback UI and retry functionality

#### **Previous Session: SEO & Technical Optimizations**
- ✅ **Enhanced Structured Data** - LocalBusiness, Service schemas with comprehensive business information
- ✅ **Performance Headers** - Caching strategies, security headers, resource optimization
- ✅ **Accessibility Improvements** - ARIA labels, keyboard navigation, screen reader support
- ✅ **Email Consolidation** - Unified hello@chicken1of1.com across all legal pages
- ✅ **Enhanced Robots.txt** - AI bot blocking and comprehensive crawl policies
- ✅ **Sitemap Optimization** - Realistic priorities and change frequencies for better SEO

### ✅ Previous Session Accomplishments

#### **Content & Brand Development**
- ✅ **Competitive Analysis** - Analyzed 9 top card breaking websites for market positioning
- ✅ **About Section Refresh** - Authentic company story with growth from 12 viewers to community focus
- ✅ **FAQ Content Overhaul** - UFC-specific answers with comprehensive new collector wisdom
- ✅ **Custom Open Graph Banner** - Professional 1200x630 branded banner for social media
- ✅ **Homepage Content Updates** - Welcoming community message and creative "Recent Hits to Bauk About" branding
- ✅ **Brand Voice Development** - "Bauk Bauk Baby" personality with educational focus

### 📌 High-Priority Next Tasks

#### **Immediate Implementation (1-7 days)**
- [ ] **Complete gallery cards #7-12** with authentic card details (Cards #1-6 completed)
- 🔄 **Configure chat widget** (Crisp) - integration ready, awaiting Website ID configuration
- [ ] **Test contact form functionality** and email notifications in production
- ✅ **Create professional error pages** - Custom 404, error, global-error, and loading pages implemented
- ✅ **Custom 404 page** - UFC fighter chicken image with branded messaging and navigation
- ✅ **Social media verification setup** - Meta tags added for Google, Facebook, Instagram, YouTube, TikTok

#### **Content & Media Updates (Need Assets)**
- [ ] **Replace placeholder images** with actual UFC card photos in WebP format
- ✅ **Real customer testimonials** - Implemented with Whatnot review screenshots in TestimonialScreenshots.tsx
- [ ] **Instagram oEmbed integration** - Better social proof than current Elfsight widget
- [ ] **Live streaming embeds** (Whatnot, Fanatics Live) for real-time engagement

#### **Phase 1 Business Features (1-30 days)**
- [ ] **Break scheduling system** - Calendar integration for upcoming breaks
- [ ] **UFC-specific break types** - Custom format components for different break styles
- [ ] **Email automation system** - Welcome series, break notifications, follow-ups
- [ ] **Connect Shopify/Stripe** for e-commerce functionality and payment processing
- [ ] **Email newsletter signup** system with segmentation capabilities

### 🎯 Competitive Advantages Achieved

1. **🥊 UFC/Combat Sports Authority** - Only dedicated specialist in the market
2. **🐔 Authentic Brand Personality** - "Bauk Bauk Baby" vs generic corporate competitors
3. **⚡ Modern Tech Stack** - Next.js 14 performance vs outdated competitor sites
4. **📱 Mobile-First Excellence** - Superior mobile UX with enhanced accessibility
5. **🎮 Community-Focused** - Authentic relationships vs purely transactional approach
6. **📚 Educational Focus** - Comprehensive new collector wisdom and protection
7. **🚀 Superior Performance** - Enhanced loading states, SEO, and technical optimization

### 🔮 Future Roadmap

#### **Phase 2 - Market Differentiation (30-60 days)**
- [ ] **Hit tracking dashboard** for customer collections
- [ ] **UFC event integration** with fight schedules and predictions
- [ ] **Fighter performance bonuses** based on UFC results
- [ ] **Community challenges** and engagement features
- [ ] **Loyalty/rewards system** for repeat customers

#### **Phase 3 - Market Domination (60-90 days)**
- [ ] **Subscription service** for regular break participants
- [ ] **Custom break requests** for specific cards or fighters
- [ ] **Progressive Web App** features for mobile app experience
- [ ] **Mobile app development** for iOS and Android
- [ ] **Advanced collection management** tools for customers

### 📞 Business Development Tasks

- [ ] **Content calendar planning** for consistent social media presence
- [ ] **Legal review** - Terms of service, privacy policy, shipping policies
- [ ] **Business licenses** setup if required for your location
- [ ] **Automated backup system** for content and customer data
- [ ] **About Us compilation video** creation (when ready)

## 🛡️ Security & Compliance

### Security Features
- ✅ **HTTPS enforced** via Vercel with automatic SSL certificates
- ✅ **Environment variables** for all sensitive data (API keys, tokens)
- ✅ **No hardcoded secrets** in codebase with proper .env management
- ✅ **Enhanced security headers** - CSP, HSTS, X-Frame-Options, referrer policies
- ✅ **Input sanitization** on contact forms with server-side validation
- ✅ **Rate limiting ready** for API endpoints and form submissions
- ✅ **AI bot protection** in robots.txt to prevent unauthorized crawling

### Privacy & Compliance
- ✅ **Privacy-first analytics** setup with GA4 and GTM
- ✅ **GDPR considerations** in data collection and processing
- ✅ **Email consolidation** with unified hello@chicken1of1.com contact system
- ✅ **Transparent data policies** in legal pages with clear privacy practices

## 📞 Support & Resources

### Development Support
- 📧 **Technical Email**: hello@chicken1of1.com
- 💬 **GitHub Issues**: Create an issue in this repository for bugs or feature requests
- 📚 **Documentation**: [Next.js Docs](https://nextjs.org/docs) | [Tailwind CSS](https://tailwindcss.com/docs)
- 🛠️ **Tools Used**: TypeScript, Vercel, Resend, GA4, GTM

### Business Resources
- 🎯 **Live Site**: https://chicken1of1.com
- 📱 **Social Media**: [@chicken1of1](https://www.instagram.com/chicken1of1)
- 📺 **Streaming**: [Whatnot](https://www.whatnot.com/s/muoENH2W) | [Fanatics Live](https://www.fanatics.live/shops/chicken1of1)
- 🃏 **Educational**: [MMA Rookies](https://www.mmarookies.com) | [130point.com](https://130point.com) | [cardladder.com](https://cardladder.com)

### Development Context
**Built by**: Senior full-stack engineer with focus on UFC/combat sports market domination
**Approach**: Mobile-first, accessibility-focused, SEO-optimized, community-driven
**Philosophy**: Educational over sales, authentic over corporate, performance over popularity

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Built with ❤️ for the UFC card breaking community. Bauk Bauk Baby!**