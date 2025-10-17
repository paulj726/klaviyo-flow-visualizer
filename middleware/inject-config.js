/**
 * Config Injection Middleware
 * Injects Supabase configuration into HTML pages
 */

const fs = require('fs').promises;
const path = require('path');

/**
 * Middleware to inject Supabase config into HTML files
 * Adds a <script> tag before </head> with window.SUPABASE_URL and window.SUPABASE_ANON_KEY
 */
function injectConfig() {
  return async (req, res, next) => {
    // Only process HTML file requests
    if (!req.path.endsWith('.html') && req.path !== '/') {
      return next();
    }

    try {
      // Determine which HTML file to serve
      let htmlFile;
      if (req.path === '/') {
        htmlFile = 'index.html';
      } else {
        htmlFile = req.path.substring(1); // Remove leading slash
      }

      const filePath = path.join(__dirname, '..', htmlFile);

      // Read the HTML file
      let html = await fs.readFile(filePath, 'utf8');

      // Create config injection script
      const configScript = `
  <script>
    // Supabase configuration injected by server
    window.SUPABASE_URL = '${process.env.NEXT_PUBLIC_SUPABASE_URL}';
    window.SUPABASE_ANON_KEY = '${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}';
  </script>
`;

      // Inject before </head> tag
      html = html.replace('</head>', `${configScript}</head>`);

      // Send modified HTML
      res.setHeader('Content-Type', 'text/html');
      res.send(html);
    } catch (error) {
      // If file doesn't exist or error reading, pass to next middleware
      next();
    }
  };
}

module.exports = injectConfig;
