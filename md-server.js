import express from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3300;
const mdDocsPath = path.join(__dirname, 'public' , 'markdown-files');

app.use(cors({ 
  origin: [
    'https://alisafari-it.github.io', 
    'http://localhost:5173'
  ] 
}));

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
}

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

app.get('/api/files', (req, res) => {
  try {
    const folderStructure = getFileTreeForViewer(mdDocsPath);
    res.json(folderStructure);
  } catch (error) {
    console.error('Error getting file tree:', error);
    res.status(500).json({ error: 'Failed to read file tree' });
  }
});

// Function to create file tree in the format expected by the markdown viewer component
function getFileTreeForViewer(dirPath, relativePath = '') {
  const items = fs.readdirSync(dirPath);
  const result = [];

  for (const item of items) {
    const itemPath = path.join(dirPath, item);
    const stats = fs.statSync(itemPath);
    const itemRelativePath = path.join(relativePath, item).replace(/\\/g, '/');
    const id = itemRelativePath; // Use path as ID

    if (stats.isDirectory()) {
      result.push({
        id,
        name: item,
        path: itemRelativePath,
        type: 'directory',
        children: getFileTreeForViewer(itemPath, itemRelativePath)
      });
    } else if (item.endsWith('.md')) {
      result.push({
        id,
        name: item,
        path: itemRelativePath,
        type: 'file'
      });
    }
  }

  return result;
}

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

// API to serve markdown files with path parameter (for compatibility with the client)
app.get('/api/content/*', (req, res) => {
  try {
    // Extract the path from the URL (everything after /api/content/)
    const requestPath = req.path.substring('/api/content/'.length);
    const filePath = path.join(mdDocsPath, requestPath);
    
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      res.send(content); // Send raw content as text, not JSON
    } else {
      res.status(404).json({ error: 'File not found' });
    }
  } catch (error) {
    console.error('Error reading file:', error);
    res.status(500).json({ error: 'Failed to read file' });
  }
});

// API to get directory details with file sizes (NEW in v1.5.0)
app.get('/api/directory-details', (req, res) => {
  try {
    const directoryPath = req.query.path || '';
    const fullPath = path.join(mdDocsPath, directoryPath);
    
    if (!fs.existsSync(fullPath) || !fs.statSync(fullPath).isDirectory()) {
      return res.status(404).json({ error: 'Directory not found' });
    }

    const directoryDetails = getDirectoryDetails(fullPath, directoryPath);
    res.json(directoryDetails);
  } catch (error) {
    console.error('Error reading directory details:', error);
    res.status(500).json({ error: 'Failed to read directory details' });
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
        type: 'directory',
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

// Helper functions for directory details (NEW in v1.5.0)
function getDirectoryDetails(dirPath, relativePath = '') {
  const items = fs.readdirSync(dirPath);
  const children = [];
  
  for (const item of items) {
    const itemPath = path.join(dirPath, item);
    const stats = fs.statSync(itemPath);
    const itemRelativePath = path.join(relativePath, item).replace(/\\/g, '/');
    
    if (stats.isDirectory()) {
      const folderSize = calculateFolderSize(itemPath);
      const itemCount = countItemsInFolder(itemPath);
      
      children.push({
        name: item,
        path: itemRelativePath,
        type: 'directory',
        size: folderSize,
        lastModified: stats.mtime.toISOString(),
        itemCount: itemCount
      });
    } else if (item.endsWith('.md')) {
      children.push({
        name: item,
        path: itemRelativePath,
        type: 'file',
        size: stats.size,
        lastModified: stats.mtime.toISOString(),
        extension: path.extname(item).substring(1)
      });
    }
  }
  
  return {
    name: path.basename(dirPath) || 'root',
    path: relativePath,
    type: 'directory',
    children: children
  };
}

function calculateFolderSize(folderPath) {
  let totalSize = 0;
  
  function traverse(currentPath) {
    try {
      const items = fs.readdirSync(currentPath);
      
      for (const item of items) {
        const itemPath = path.join(currentPath, item);
        const stats = fs.statSync(itemPath);
        
        if (stats.isDirectory()) {
          traverse(itemPath);
        } else {
          totalSize += stats.size;
        }
      }
    } catch (error) {
      // Skip directories we can't read
      console.warn('Could not read directory:', currentPath, error.message);
    }
  }
  
  traverse(folderPath);
  return totalSize;
}

function countItemsInFolder(folderPath) {
  let count = 0;
  
  function traverse(currentPath) {
    try {
      const items = fs.readdirSync(currentPath);
      count += items.length;
      
      for (const item of items) {
        const itemPath = path.join(currentPath, item);
        const stats = fs.statSync(itemPath);
        
        if (stats.isDirectory()) {
          traverse(itemPath);
        }
      }
    } catch (error) {
      // Skip directories we can't read
      console.warn('Could not read directory:', currentPath, error.message);
    }
  }
  
  traverse(folderPath);
  return count;
}

// Catch-all route to handle client-side routing
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    // Exclude API routes
    if (!req.path.startsWith('/api/')) {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    }
  });
}

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📁 Serving markdown files from: ${mdDocsPath}`);
  console.log(`🌐 API endpoints available at http://localhost:${PORT}/api/`);
});
