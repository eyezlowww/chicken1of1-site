// Node.js script to generate Open Graph image
const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');

async function generateOGImage() {
    // Create canvas (1200x630 for Open Graph)
    const canvas = createCanvas(1200, 630);
    const ctx = canvas.getContext('2d');

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 1200, 630);
    gradient.addColorStop(0, '#000000');
    gradient.addColorStop(1, '#1a1a1a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1200, 630);

    // Logo circle background
    ctx.beginPath();
    ctx.arc(280, 315, 160, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.fill();

    // Simplified chicken logo
    // Black circle for head/body
    ctx.beginPath();
    ctx.arc(280, 315, 120, 0, Math.PI * 2);
    ctx.fillStyle = '#000000';
    ctx.fill();

    // White belly
    ctx.beginPath();
    ctx.ellipse(280, 335, 85, 65, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    // Eye
    ctx.beginPath();
    ctx.arc(295, 285, 12, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    // Comb (red)
    ctx.beginPath();
    ctx.moveTo(260, 240);
    ctx.lineTo(290, 230);
    ctx.lineTo(280, 260);
    ctx.closePath();
    ctx.fillStyle = '#dc2626';
    ctx.fill();

    // Wattle (red)
    ctx.beginPath();
    ctx.ellipse(315, 305, 8, 15, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#dc2626';
    ctx.fill();

    // "1 of 1" text on logo
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#dc2626';
    ctx.textAlign = 'center';
    ctx.fillText('1 of 1', 280, 395);

    // Main title
    ctx.font = 'bold 72px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.fillText('Chicken1of1', 480, 240);

    // Subtitle
    ctx.font = '600 42px Arial';
    ctx.fillStyle = '#e5e5e5';
    ctx.fillText('UFC Sports Cards & Live Breaks', 480, 310);

    // Tagline
    ctx.font = 'bold 48px Arial';
    ctx.fillStyle = '#dc2626';
    ctx.fillText('Bauk Bauk Baby', 480, 390);

    // Accent text
    ctx.font = '500 18px Arial';
    ctx.fillStyle = '#666666';
    ctx.textAlign = 'right';
    ctx.fillText('Live on Whatnot & Fanatics Live', 1120, 580);

    // Save the image
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync('./public/og-image.png', buffer);

    console.log('✅ Open Graph image generated: ./public/og-image.png (1200x630)');
}

// Run if canvas is available, otherwise provide instructions
try {
    generateOGImage();
} catch (error) {
    console.log('⚠️ Canvas module not available. To generate the image:');
    console.log('1. Install canvas: npm install canvas');
    console.log('2. Run: node generate-og-image.js');
    console.log('\nAlternatively, open create-og-banner.html in your browser and download the image.');
}