# College Portal Scraper Frontend

This is the frontend web interface for the College Portal Scraper application. It provides a user-friendly interface for scraping college portal data and uploading it to Supabase.

## Features

- User-friendly form for entering credentials and selecting data to scrape
- Real-time job status updates
- Progress tracking
- Results display
- Responsive design with Tailwind CSS

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example` and fill in your API details
4. Start the development server:
   ```bash
   npm start
   ```

## Building for Production

To build the application for production:

```bash
npm run build
```

This will create a `build` folder with the production-ready application.

## Deployment

### Vercel

1. Connect your GitHub repository to Vercel
2. Set environment variables in the Vercel dashboard
3. Deploy

### GitHub Pages

1. Update the `package.json` file with your GitHub Pages URL:
   ```json
   {
     "homepage": "https://yourusername.github.io/college-portal-scraper"
   }
   ```
2. Install the `gh-pages` package:
   ```bash
   npm install --save-dev gh-pages
   ```
3. Add deployment scripts to `package.json`:
   ```json
   {
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d build"
     }
   }
   ```
4. Update the `.env` file with your deployed backend URL:
   ```
   REACT_APP_API_URL=https://your-backend-url.onrender.com
   ```
5. Deploy to GitHub Pages:
   ```bash
   npm run deploy
   ```

### Important Configuration for GitHub Pages

When deploying to GitHub Pages, you need to ensure your backend CORS settings allow requests from your GitHub Pages domain. Update your backend CORS configuration to include your GitHub Pages URL:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://yourusername.github.io"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```
