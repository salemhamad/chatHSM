const http = require('http');
const { PrismaClient } = require('@prisma/client');

const API_BASE = 'http://localhost:3001/api';
const prisma = new PrismaClient();

async function makeRequest(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = `${API_BASE}${path}`;
    const parsedUrl = new URL(url);
    
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname + parsedUrl.search,
      method: method,
      headers: headers,
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            resolve(data);
          }
        } else {
          reject(new Error(`Request failed with status ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function testSseChat(conversationId, message, token) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(`${API_BASE}/ai/chat`);
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    };

    const req = http.request(options, (res) => {
      let fullResponse = '';
      res.on('data', (chunk) => {
        const lines = chunk.toString().split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const parsed = JSON.parse(line.substring(6));
              if (parsed.type === 'chunk') {
                fullResponse += parsed.content;
              }
            } catch (e) {
              // Ignore line parsing errors
            }
          }
        }
      });
      res.on('end', () => {
        resolve(fullResponse.trim());
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.write(JSON.stringify({ conversationId, message }));
    req.end();
  });
}

async function run() {
  console.log('--- STARTING ZERO-LAZINESS PROTOCOL VERIFICATION ---');
  let token;
  let conversationId;
  let userId;

  try {
    // 1. Register a test user (defaults to FREE)
    const email = `testtier-${Date.now()}@example.com`;
    console.log(`Registering user: ${email}...`);
    const registerRes = await makeRequest('POST', '/auth/register', {
      email: email,
      password: 'TestPassword123!',
      displayName: 'Tier Tester',
    });
    
    userId = registerRes.user.id;
    token = registerRes.tokens.accessToken;
    console.log(`✔ User registered with ID: ${userId} (Default Plan: FREE)`);

    // 2. Create a conversation
    console.log('Creating conversation...');
    const convRes = await makeRequest('POST', '/conversations', { title: 'Tier Test Chat' }, token);
    conversationId = convRes.id;
    console.log(`✔ Created conversation ID: ${conversationId}`);

    // 3. Test FREE tier response
    console.log('\n--- Test 1: Testing FREE Tier response ---');
    console.log('Sending message: "Write a JSON storage helper"...');
    const replyFree = await testSseChat(conversationId, 'Write a JSON storage helper', token);
    console.log('Assistant response contains SafeStorage?', replyFree.includes('SafeStorage'));

    if (!replyFree.includes('SafeStorage')) {
      console.log('✔ Test 1 PASSED: FREE tier returns standard mock details without Rule 31.31.');
    } else {
      console.error('❌ Test 1 FAILED: Zero-Laziness was active on FREE tier.');
    }

    // 4. Update plan to PRO directly in SQLite using Prisma Client
    console.log('\nUpdating user plan to PRO in SQLite database...');
    await prisma.user.update({
      where: { id: userId },
      data: { plan: 'PRO' },
    });
    console.log('✔ User plan updated to PRO.');

    // 5. Test PRO tier response (triggers Zero-Laziness Rule 31.31)
    console.log('\n--- Test 2: Testing PRO Tier response (Rule 31.31) ---');
    console.log('Sending message: "Write a JSON storage helper"...');
    const replyPro = await testSseChat(conversationId, 'Write a JSON storage helper', token);
    
    const containsSafeStorage = replyPro.includes('SafeStorage');
    const isFullImplementation = replyPro.includes('simpleB64Compress') && replyPro.includes('export class SafeStorage');

    if (containsSafeStorage && isFullImplementation) {
      console.log('✔ Test 2 PASSED: PRO tier correctly triggers Zero-Laziness Protocol.');
      console.log('Preview of complete compilation (Rule 31.31) compliance:\n');
      console.log(replyPro.slice(0, 300) + '...\n');
    } else {
      console.error('❌ Test 2 FAILED: PRO tier did not trigger Zero-Laziness Protocol.');
    }

    // 6. Cleanup user
    console.log('\nCleaning up database...');
    await prisma.user.delete({ where: { id: userId } });
    console.log('✔ User deleted.');

  } catch (error) {
    console.error('❌ ERROR DURING TIER VERIFICATION:', error);
  } finally {
    await prisma.$disconnect();
  }
  console.log('--- TIER VERIFICATION COMPLETE ---');
}

run();
