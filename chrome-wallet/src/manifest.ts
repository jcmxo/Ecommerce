import type { Manifest } from './types';

const manifest: Manifest = {
  manifest_version: 3,
  name: 'CodeCrypto Wallet',
  version: '1.0.0',
  description: 'Ethereum Wallet Chrome Extension',
  permissions: ['storage', 'notifications'],
  host_permissions: ['<all_urls>'],
  content_security_policy: {
    extension_pages: "script-src 'self'; object-src 'self';"
  },
  background: {
    service_worker: 'background.js',
    type: 'module',
  },
  action: {
    default_popup: 'index.html',
    default_icon: {
      16: 'icon16.png',
      48: 'icon48.png',
      128: 'icon128.png',
    },
  },
  content_scripts: [
    {
      matches: ['<all_urls>'],
      js: ['content-script.js'],
      run_at: 'document_start',
      all_frames: true,
    },
  ],
  web_accessible_resources: [
    {
      resources: ['inject.js'],
      matches: ['<all_urls>'],
    },
  ],
  icons: {
    16: 'icon16.png',
    48: 'icon48.png',
    128: 'icon128.png',
  },
};

export default manifest;

