// Script to set GitHub repository secrets using the GitHub API
// Uses tweetnacl for encryption as required by the GitHub Secrets API

const https = require('https');
const crypto = require('crypto');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO = 'manishtarjan2/MarkatVerse';

const secrets = {
  VERCEL_TOKEN: process.env.VERCEL_TOKEN,
  VERCEL_ORG_ID: process.env.VERCEL_ORG_ID,
  VERCEL_FRONTEND_PROJECT_ID: process.env.VERCEL_FRONTEND_PROJECT_ID,
  VERCEL_BACKEND_PROJECT_ID: process.env.VERCEL_BACKEND_PROJECT_ID,
};

function apiRequest(method, path, body) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: path,
      method: method,
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'MarkatVerse-Deploy-Setup',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    };
    if (body) {
      options.headers['Content-Type'] = 'application/json';
    }
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: data ? JSON.parse(data) : null });
        } catch {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function getPublicKey() {
  const res = await apiRequest('GET', `/repos/${REPO}/actions/secrets/public-key`);
  if (res.status !== 200) {
    throw new Error(`Failed to get public key: ${res.status} ${JSON.stringify(res.data)}`);
  }
  return res.data;
}

function encryptSecret(publicKeyBase64, secretValue) {
  const publicKeyBytes = Buffer.from(publicKeyBase64, 'base64');
  const secretBytes = Buffer.from(secretValue);

  // Use crypto.diffieHellman with X25519 for libsodium sealed box emulation
  // Actually, GitHub uses libsodium sealed boxes. Let's use tweetnacl via a simpler approach.
  // Since we can't easily do libsodium in vanilla Node, let's install tweetnacl
  try {
    const tweetnacl = require('tweetnacl');
    const encrypted = tweetnacl.sealedbox
      ? tweetnacl.sealedbox.seal(secretBytes, publicKeyBytes)
      : null;
    if (encrypted) return Buffer.from(encrypted).toString('base64');
  } catch {}

  // Fallback: use libsodium-wrappers
  try {
    const sodium = require('libsodium-wrappers');
    // sodium is async
    return null; // will handle below
  } catch {}

  return null;
}

async function encryptSecretWithSodium(publicKeyBase64, secretValue) {
  const sodium = require('libsodium-wrappers');
  await sodium.ready;
  const publicKeyBytes = sodium.from_base64(publicKeyBase64, sodium.base64_variants.ORIGINAL);
  const secretBytes = sodium.from_string(secretValue);
  const encrypted = sodium.crypto_box_seal(secretBytes, publicKeyBytes);
  return sodium.to_base64(encrypted, sodium.base64_variants.ORIGINAL);
}

async function setSecret(name, value, publicKey) {
  let encryptedValue = encryptSecret(publicKey.key, value);
  if (!encryptedValue) {
    encryptedValue = await encryptSecretWithSodium(publicKey.key, value);
  }

  const res = await apiRequest('PUT', `/repos/${REPO}/actions/secrets/${name}`, {
    encrypted_value: encryptedValue,
    key_id: publicKey.key_id,
  });

  if (res.status === 201 || res.status === 204) {
    console.log(`✅ Secret "${name}" set successfully`);
  } else {
    console.log(`❌ Failed to set "${name}": ${res.status} ${JSON.stringify(res.data)}`);
  }
}

async function main() {
  if (!GITHUB_TOKEN) {
    console.error('❌ GITHUB_TOKEN environment variable is required.');
    console.error('   Create one at: https://github.com/settings/tokens/new');
    console.error('   Required scope: "repo" (Full control of private repositories)');
    console.error('   Then run: $env:GITHUB_TOKEN="your_token"; node set-secrets.js');
    process.exit(1);
  }

  console.log('🔑 Fetching repository public key...');
  const publicKey = await getPublicKey();
  console.log(`   Key ID: ${publicKey.key_id}`);

  console.log('\\n📦 Setting secrets...');
  for (const [name, value] of Object.entries(secrets)) {
    await setSecret(name, value, publicKey);
  }

  console.log('\\n✅ All done! Auto-deploy is now configured.');
  console.log('   Push to main → GitHub Actions → Vercel Deploy (frontend + backend)');
}

main().catch(console.error);
