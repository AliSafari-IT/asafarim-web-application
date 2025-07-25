# Tutorial: Build a Beautiful Markdown Viewer with @asafarim/complete-md-viewer

Transform your markdown files into a professional documentation website! This tutorial will walk you through creating a stunning markdown viewer that displays your documentation with an interactive file tree, beautiful themes, collapsible sidebar, and responsive design.

## 🎯 What You'll Build

By the end of this tutorial, you'll have:

- 📱 A **responsive markdown viewer** that works on desktop, tablet, and mobile
- 🌳 **Interactive file tree navigation** with professional collapsible sidebar
- 🎨 **Light/dark themes** with smooth transitions and consistent styling
- 📂 **Directory browsing** with file sizes and metadata
- 📄 **YAML front matter support** for rich document metadata
- 🚀 **Production-ready** documentation site

## 📋 Prerequisites

Before we start, make sure you have:

- **Node.js** (version 16 or higher) installed
- **npm** or **pnpm** package manager
- Basic knowledge of **React** and **JavaScript/TypeScript**
- Your **markdown files** ready to display

## 🏗️ Step 1: Set Up Your Project

### Create the Project Directory

```bash
mkdir my-markdown-viewer
cd my-markdown-viewer
```

### Initialize Your Project

```bash
npm init -y
```

### Install Required Dependencies

```bash
# Core dependencies
npm install @asafarim/complete-md-viewer react react-dom react-router-dom
npm install express cors

# Development dependencies  
npm install --save-dev @types/react @types/react-dom @vitejs/plugin-react
npm install --save-dev typescript vite concurrently
```

## 📄 Step 2: Configure Your Project

### Create `package.json` Scripts

Update your `package.json` with these scripts:

```json
{
  "name": "my-markdown-viewer",
  "version": "1.0.0", 
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "serve": "node server.js",
    "start": "concurrently \"npm run serve\" \"npm run dev\""
  }
}
```

### Create `vite.config.ts`

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
});
```

### Create `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true
  },
  "include": ["src"]
}
```

## 🌐 Step 3: Create the Backend Server

Create `server.js` to serve your markdown files:

```javascript
import express from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3300;
const mdDocsPath = path.join(__dirname, 'markdown-files');

app.use(cors({ origin: 'http://localhost:5173' }));

// API to return folder structure
app.get('/api/folder-structure', (req, res) => {
  try {
    const folderStructure = getFolderStructure(mdDocsPath);
    res.json({ nodes: folderStructure });
  } catch (error) {
    console.error('Error getting folder structure:', error);
    res.status(500).json({ error: 'Failed to read folder structure' });
  }
});

// API to serve markdown files
app.get('/api/file', (req, res) => {
  try {
    const filePath = path.join(mdDocsPath, req.query.path);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      res.json({ content });
    } else {
      res.status(404).json({ error: 'File not found' });
    }
  } catch (error) {
    console.error('Error reading file:', error);
    res.status(500).json({ error: 'Failed to read file' });
  }
});

function getFolderStructure(dirPath, relativePath = '') {
  const items = fs.readdirSync(dirPath);
  const result = [];

  for (const item of items) {
    const itemPath = path.join(dirPath, item);
    const stats = fs.statSync(itemPath);
    const itemRelativePath = path.join(relativePath, item).replace(/\\/g, '/');

    if (stats.isDirectory()) {
      result.push({
        name: item,
        path: itemRelativePath,
        type: 'folder',
        children: getFolderStructure(itemPath, itemRelativePath)
      });
    } else if (item.endsWith('.md')) {
      result.push({
        name: item,
        path: itemRelativePath,
        type: 'file'
      });
    }
  }

  return result;
}

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📁 Serving markdown files from: ${mdDocsPath}`);
});
```

## ⚛️ Step 4: Create the React Application

### Create `index.html`

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My Markdown Viewer</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### Create `src/main.tsx`

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### Create `src/App.tsx`

```tsx
import { useState, useEffect } from 'react';
import { HashRouter } from 'react-router-dom';
import { MarkdownContent, ThemeProvider } from '@asafarim/complete-md-viewer';
import '@asafarim/complete-md-viewer/dist/style.css';

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem('smv-theme') as 'light' | 'dark' | null;
    return savedTheme || 'light';
  });

  const toggleTheme = () => {
    setTheme(prevTheme => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      localStorage.setItem('smv-theme', newTheme);
      return newTheme;
    });
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <ThemeProvider theme={theme} toggleTheme={toggleTheme}>
      <div className={`app ${theme}`}>
        <HashRouter future={{ v7_startTransition: true }}>
          <MarkdownContent 
            apiBaseUrl="http://localhost:3300" 
            showHomePage={true}
            hideFileTree={false}
          />
        </HashRouter>
      </div>
    </ThemeProvider>
  );
}

export default App;
```

### Create `src/index.css`

```css
:root {
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;
}

body {
  margin: 0;
  min-width: 320px;
  min-height: 100vh;
}

#root {
  width: 100%;
  margin: 0 auto;
}

.app {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
}
```

### Create `src/vite-env.d.ts`

```typescript
/// <reference types="vite/client" />

declare module '@asafarim/complete-md-viewer' {
  import { ComponentType, ReactNode } from 'react';
  
  export interface MarkdownContentProps {
    apiBaseUrl?: string;
    showHomePage?: boolean;
    hideFileTree?: boolean;
    hideHeader?: boolean;
    hideFooter?: boolean;
    sidebarCollapsed?: boolean; // Control initial sidebar state
  }
  
  export interface ThemeProviderProps {
    theme: 'light' | 'dark';
    toggleTheme?: () => void;
    children: ReactNode;
  }
  
  export const MarkdownContent: ComponentType<MarkdownContentProps>;
  export const ThemeProvider: ComponentType<ThemeProviderProps>;
}

declare module '@asafarim/complete-md-viewer/dist/style.css' {}
```

## 📁 Step 5: Prepare Your Markdown Content

### Create the Content Directory

```bash
mkdir markdown-files
```

### Create a Sample README.md

Create `markdown-files/README.md`:

```markdown
---
title: "Welcome to My Documentation"
description: "A beautiful markdown documentation site"
author: "Your Name"
date: "2025-01-22"
category: "Documentation"
tags:
  - documentation
  - markdown
  - tutorial
---

# Welcome to My Documentation! 📚

This is your new markdown documentation site built with @asafarim/complete-md-viewer.

## Features

- 🌳 **Interactive File Tree**: Navigate through your documentation with collapsible sidebar
- 📱 **Responsive Design**: Works on all devices  
- 🎨 **Theme Support**: Light and dark modes with consistent styling
- 📄 **YAML Front Matter**: Rich document metadata

## Getting Started

Click on any file in the tree to view its content. Try switching between light and dark themes using the toggle button!
```

### Add Your Existing Markdown Files

Copy your existing markdown files into the `markdown-files` directory. Organize them in folders as needed.

## 🚀 Step 6: Run Your Documentation Site

### Start Both Servers

```bash
npm start
```

This will start:

- **Backend server** at <http://localhost:3300>
- **Frontend application** at <http://localhost:5173>

### View Your Documentation

Open your browser and visit <http://localhost:5173>

You should see:

- Your file tree on the left side
- Your README content in the main area
- Theme toggle in the header
- Responsive design that works on mobile

## 🎨 Step 7: Customize Your Site

### Modify Themes

Edit `src/index.css` to customize colors:

```css
:root {
  /* Light theme */
  --bg-color-light: #ffffff;
  --text-color-light: #333333;
  --accent-primary-light: #2196f3;
  
  /* Dark theme */
  --bg-color-dark: #1e1e1e;
  --text-color-dark: #e0e0e0;
  --accent-primary-dark: #64b5f6;
}
```

### Configure Display Options

Modify `MarkdownContent` props in `src/App.tsx`:

```tsx
<MarkdownContent 
  apiBaseUrl="http://localhost:3300"
  showHomePage={true}     // Show homepage when no file selected
  hideFileTree={false}    // Show/hide the file tree sidebar
  hideHeader={false}      // Show/hide header with theme toggle
  hideFooter={false}      // Show/hide footer
  sidebarCollapsed={true} // Start with sidebar collapsed (professional UI)
/>
```

## 📦 Step 8: Deploy Your Site

### Build for Production

```bash
npm run build
```

### Deploy Options

#### Option 1: GitHub Pages

1. Build your project: `npm run build`
2. Deploy the `dist` folder to GitHub Pages
3. Deploy your backend to Heroku, Vercel, or Railway

#### Option 2: Self-Hosting

1. Upload your built files to your web server
2. Run the Node.js backend on your server
3. Update the `apiBaseUrl` to point to your backend

## 🔧 Advanced Features

### YAML Front Matter

Add rich metadata to your markdown files:

```markdown
---
title: "API Documentation"
description: "Complete API reference"
author: "Your Name"
date: "2025-01-22"
category: "API"
tags: ["api", "reference"]
toc: true
---

# Your content here...
```

### Directory Browsing

When users click on folders, they'll see:

- List, grid, or detailed view options
- File sizes and modification dates
- Search and filtering capabilities

### Mobile Responsiveness  

The viewer automatically adapts to:

- **Desktop**: Professional collapsible sidebar with toggle button
- **Tablet**: Compressed sidebar with easy toggle
- **Mobile**: Collapsible overlay sidebar optimized for touch

## 🎉 Congratulations

You've successfully created a beautiful markdown documentation site! Your viewers can now:

- 📖 **Browse** your documentation with an intuitive file tree
- 🎨 **Switch themes** for comfortable reading
- 📱 **Access content** on any device
- 🔍 **Navigate easily** through your organized content
- 📑 **Maximize content space** with the professional collapsible sidebar

## 🔧 Final Working Solution (Important!)

After troubleshooting routing issues, here's the **correct App.tsx implementation** that ensures proper file routing:

```tsx
import { useState, useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { MarkdownContent, ThemeProvider } from '@asafarim/complete-md-viewer';
import '@asafarim/complete-md-viewer/dist/style.css';

function App() {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('smv-theme') as 'light' | 'dark' | null;
    return savedTheme || 'light';
  });
  
  // Control sidebar collapsed state (true = collapsed by default for professional UI)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  const toggleTheme = () => {
    setTheme(prevTheme => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      localStorage.setItem('smv-theme', newTheme);
      return newTheme;
    });
  };
  
  const toggleSidebar = () => {
    setSidebarCollapsed(prev => !prev);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <ThemeProvider theme={theme} toggleTheme={toggleTheme}>
      <div className={`app ${theme}`}>
        <HashRouter>
          <Routes>
            <Route 
              path="/*" 
              element={
                <MarkdownContent 
                  apiBaseUrl="http://localhost:3300" 
                  showHomePage={true}
                  hideFileTree={false}
                  sidebarCollapsed={sidebarCollapsed}
                />
              } 
            />
          </Routes>
        </HashRouter>
      </div>
    </ThemeProvider>
  );
}

export default App;
```

### 🎯 Key Points for Success

1. **React Router Structure**: Use `Routes` and `Route` with `path="/*"` to capture all routes
2. **Component Hierarchy**: `ThemeProvider` → `HashRouter` → `Routes` → `Route` → `MarkdownContent`
3. **Import Requirements**: Import `Routes` and `Route` from `react-router-dom`
4. **URL Routing**: The package uses `useParams` internally to get file paths from URLs
5. **Sidebar Control**: Use `sidebarCollapsed` prop to control the initial state of the sidebar
6. **Theme Management**: Use `ThemeProvider` to manage light/dark theme with consistent styling

This structure enables:

- `http://localhost:5173/` → Shows README.md (home page)
- `http://localhost:5173/#/changelogs/CHANGELOG.md` → Shows CHANGELOG.md content
- `http://localhost:5173/#/folder/file.md` → Shows any specific file content

## 💡 Next Steps

- Add more markdown files to expand your documentation
- Customize the styling to match your brand
- Deploy to production for others to access
- Consider adding search functionality or additional features
- Experiment with sidebar collapsed/expanded states for different user experiences
- Add custom controls for toggling the sidebar state
- Implement user preferences to remember sidebar state between sessions

Happy documenting! 🚀
