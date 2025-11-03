# Sentinel Documentation

Documentation website for the Sentinel PrestaShop security module, built with [Docusaurus](https://docusaurus.io/).

## 🌐 Live Site

The documentation is available at: `https://your-username.github.io/sentinel-docs/`

## 🚀 Local Development

### Prerequisites

- Node.js >= 20.0
- npm

### Installation

```bash
npm install
```

### Start Development Server

```bash
npm start
```

This command starts a local development server and opens a browser window. Most changes are reflected live without restarting the server.

The site will be available at `http://localhost:3000/sentinel-docs/`

### Build for Production

```bash
npm run build
```

This command generates static content into the `build` directory.

### Serve Production Build Locally

```bash
npm run serve
```

## 🌍 Internationalization

The documentation is available in two languages:

- **English** (default): `/docs`
- **French**: `/fr/docs`

### Adding Translations

To translate a documentation page:

1. Create the French version in `i18n/fr/docusaurus-plugin-content-docs/current/`
2. Use the same file structure as the English version
3. Translate the content

Example:
```
docs/intro.md → i18n/fr/docusaurus-plugin-content-docs/current/intro.md
```

### UI Translations

UI elements (navbar, footer) are translated in:
- `i18n/fr/docusaurus-theme-classic/navbar.json`
- `i18n/fr/docusaurus-theme-classic/footer.json`

## 📦 Deployment

### GitHub Pages (Automatic)

The site is automatically deployed to GitHub Pages when you push to the `main` branch.

**Setup:**

1. Go to your repository **Settings > Pages**
2. Under **Source**, select **GitHub Actions**
3. Push to `main` branch - the deployment will start automatically

### Manual Deployment

To deploy manually:

```bash
npm run build
# Then upload the build/ directory to your hosting
```

## 📝 Configuration

### Update Site Information

Edit `docusaurus.config.ts`:

```typescript
{
  title: 'Sentinel',
  url: 'https://your-username.github.io',
  baseUrl: '/sentinel-docs/',
  organizationName: 'your-username',
  projectName: 'sentinel-docs',
}
```

**Important:** Replace `your-username` with your actual GitHub username.

### Update Navigation

Edit `sidebars.ts` to modify the documentation structure:

```typescript
const sidebars: SidebarsConfig = {
  docsSidebar: [
    'intro',
    'installation',
    // ... add more pages
  ],
};
```

## 📂 Project Structure

```
sentinel-docs/
├── .github/workflows/
│   └── deploy.yml          # GitHub Actions deployment workflow
├── docs/                    # English documentation
│   ├── intro.md
│   ├── installation.md
│   └── features/
│       ├── threat-detection.md
│       └── security-logs.md
├── i18n/fr/                # French translations
│   └── docusaurus-plugin-content-docs/
│       └── current/        # Same structure as docs/
├── src/                    # Custom components and pages
├── static/                 # Static assets (images, etc.)
├── docusaurus.config.ts   # Site configuration
├── sidebars.ts            # Sidebar structure
└── package.json           # Dependencies
```

## 🛠️ Common Tasks

### Add a New Documentation Page

1. Create a new Markdown file in `docs/`:
   ```bash
   touch docs/my-new-page.md
   ```

2. Add front matter:
   ```markdown
   ---
   sidebar_position: 3
   ---
   
   # My New Page
   
   Content here...
   ```

3. Add it to `sidebars.ts` if needed

4. Create French translation in `i18n/fr/docusaurus-plugin-content-docs/current/`

### Add Images

1. Place images in `static/img/`
2. Reference them in Markdown:
   ```markdown
   ![Alt text](/img/my-image.png)
   ```

### Update Theme Colors

Edit `src/css/custom.css`:

```css
:root {
  --ifm-color-primary: #7c3aed;  /* Purple for Sentinel */
}
```

## 🔧 Troubleshooting

### Build fails

Clear cache and rebuild:
```bash
npm run clear
npm run build
```

### Links not working locally

Make sure you're using relative links:
```markdown
[Link](./other-page.md)  ✅
[Link](/docs/other-page)  ❌ (won't work with baseUrl)
```

## 📄 License

This documentation is part of the Sentinel project, licensed under the Academic Free License (AFL 3.0).

## 🤝 Contributing

Contributions are welcome! To contribute to the documentation:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

For documentation improvements:
- Fix typos
- Improve explanations
- Add examples
- Translate to additional languages
