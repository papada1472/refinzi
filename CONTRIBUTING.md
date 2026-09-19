# Contributing to Refinzi 2.1.0 ⚡

Thank you for your interest in contributing to Refinzi! We are building an open-source, local-first prompt layer that runs as a cross-browser WebExtension (Manifest V3) inside ChatGPT, Claude, Gemini, and Perplexity.

## 🛠️ Development Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/papada1472/refinzi.git
   cd refinzi
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Build the extension packages** (Chrome, Edge, Firefox):
   ```bash
   npm run build
   ```

4. **Load the unpacked extension**:
   - Open `chrome://extensions/` (or `edge://extensions/`).
   - Enable **Developer mode**.
   - Click **Load unpacked** and select `dist/chrome/`.

5. **Run the test suite**:
   ```bash
   npm test
   ```

## 🏗️ Pull Request Guidelines

1. **Branch Naming**:
   - `feat/feature-name`
   - `fix/bug-description`
   - `docs/update-guide`
2. **Code Standards**:
   - Write clean, modular TypeScript / ES Modules.
   - Maintain client-side security: API keys stay inside the background service worker in `chrome.storage.local` and must never be exposed to page context.
   - Never add remote code, `eval`, or CDN-loaded scripts — Manifest V3 forbids them.
   - Ensure all Vitest unit tests pass (`npm test`) and `npm run typecheck` is clean.
3. **Commit Messages**: Follow [Conventional Commits](https://www.conventionalcommits.org/) (e.g., `feat: add mistral model switcher support`).

## 💬 Community & Discussions

Feel free to open an Issue or start a GitHub Discussion for new feature proposals, AI model requests, site-adapter support, or UI improvements!
