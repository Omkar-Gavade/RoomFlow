/**
 * Email template service — ARCHITECTURE.md §6.
 * Compiles Handlebars templates from templates/emails/, caches compiled fns.
 * Pure rendering; no transport concern (that stays in email.service).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import Handlebars from 'handlebars';

const TEMPLATE_DIR = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  'templates',
  'emails'
);

const cache = new Map();

/**
 * Render a template by name (with or without .hbs) using the given data.
 * @returns {string} HTML
 */
export function renderTemplate(name, data = {}) {
  let compiled = cache.get(name);
  if (!compiled) {
    const file = path.join(TEMPLATE_DIR, name.endsWith('.hbs') ? name : `${name}.hbs`);
    const source = fs.readFileSync(file, 'utf8');
    compiled = Handlebars.compile(source);
    cache.set(name, compiled);
  }
  return compiled(data);
}

export default { renderTemplate };
