// src/utils/templateRenderer.js

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Renders an HTML template by replacing placeholders with actual values
 * @param {string} templateName - Name of the template file (without .html extension)
 * @param {Object} data - Object containing key-value pairs for template replacement
 * @returns {string} - Rendered HTML string
 */
export function renderTemplate(templateName, data = {}) {
  const templatePath = join(__dirname, '..', 'views', `${templateName}.html`);
  
  try {
    let template = readFileSync(templatePath, 'utf-8');
    
    // Replace all placeholders in the format {{KEY}} with their values
    for (const [key, value] of Object.entries(data)) {
      const placeholder = new RegExp(`{{${key}}}`, 'g');
      template = template.replace(placeholder, value !== undefined && value !== null ? String(value) : '');
    }
    
    return template;
  } catch (error) {
    throw new Error(`Failed to render template ${templateName}: ${error.message}`);
  }
}
