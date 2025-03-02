import express from 'express';
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const app = express();
const port = 3000;

// Middleware to parse JSON
app.use(express.json());

// Folder to store screenshots
const screenshotsDir = path.join(process.cwd(), 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir);
}

// Route to handle screenshot requests
app.post('/screenshot', async (req, res) => {
    console.log('Request received:', req.body); // Debug request body
    const { url } = req.body;

    if (!url) {
        console.log('Missing URL in request');
        return res.status(400).json({ error: 'URL is required in the request body' });
    }

    try {
        // Launch Puppeteer
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 800 });

        // Navigate to the URL
        await page.goto(url, { waitUntil: 'networkidle2' });

        // Generate a unique filename
        const timestamp = Date.now();
        const screenshotPath = path.join(screenshotsDir, `screenshot-${timestamp}.png`);

        // Take a screenshot and save as a file
        await page.screenshot({ path: screenshotPath });

        // Close Puppeteer
        await browser.close();

        // Send URL of the saved screenshot
        res.json({ imageUrl: `./screenshots/screenshot-${timestamp}.png` });
    } catch (error) {
        console.error('Error occurred:', error);
        res.status(500).json({ error: 'An error occurred while taking the screenshot' });
    }
});

// Serve the screenshots folder statically
app.use('/screenshots', express.static(screenshotsDir));

// Fallback for undefined routes
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
