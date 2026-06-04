const http = require('http');

const API_BASE = 'http://localhost:3001/api';

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
  console.log('--- STARTING RAG INTEGRATION VERIFICATION ---');
  let token;
  let conversationId;
  let factId;

  try {
    // 1. Register a test user
    const email = `testuser-${Date.now()}@example.com`;
    console.log(`Registering user: ${email}...`);
    const registerRes = await makeRequest('POST', '/auth/register', {
      email: email,
      password: 'TestPassword123!',
      displayName: 'Test Admin',
    });
    token = registerRes.tokens.accessToken;
    console.log('✔ Registration successful.');

    // 2. Create a conversation
    console.log('Creating conversation...');
    const convRes = await makeRequest('POST', '/conversations', { title: 'RAG Test Chat' }, token);
    conversationId = convRes.id;
    console.log(`✔ Created conversation ID: ${conversationId}`);

    // 3. Create a Direct Fact
    console.log('Creating Direct Fact in RAG knowledge base...');
    const factContent = 'The support phone number of SAHER SHAT is +966-500-000-000 and working hours are 9am-5pm.';
    const factRes = await makeRequest('POST', '/knowledge/facts', { content: factContent }, token);
    factId = factRes.id;
    console.log(`✔ Created Direct Fact (ID: ${factId})`);

    // 4. Test RAG Context Match
    console.log('\n--- Test 1: Query that matches the Direct Fact context ---');
    console.log('Sending message: "Can I have the phone number of SAHER SHAT?"...');
    const reply1 = await testSseChat(conversationId, 'Can I have the phone number of SAHER SHAT?', token);
    console.log('Assistant response:', reply1);
    
    const containsContext = 
      reply1.includes('+966-500-000-000') || 
      reply1.includes('9am-5pm') || 
      reply1.includes('سياق') ||
      reply1.includes('provided context') ||
      reply1.includes('attached document');

    if (containsContext) {
      console.log('✔ Test 1 PASSED: AI correctly retrieved context and replied.');
    } else {
      console.error('❌ Test 1 FAILED: AI did not include the retrieved facts in the output.');
    }

    // 5. Test RAG Context Guardrails (Out of Context Refusal)
    console.log('\n--- Test 2: Query that is out of context ---');
    console.log('Sending message: "What is the weather in Tokyo today?"...');
    const reply2 = await testSseChat(conversationId, 'What is the weather in Tokyo today?', token);
    console.log('Assistant response:', reply2);

    const isRefused = 
      reply2.includes('عذراً، يمكنني مساعدتك فقط في المواضيع المتعلقة بمحتوى هذه الصفحة.') ||
      reply2.includes('only assist you with topics related to the content');

    if (isRefused) {
      console.log('✔ Test 2 PASSED: Strict Context Guardrail triggered correctly.');
    } else {
      console.error('❌ Test 2 FAILED: AI did not refuse with the exact guardrail message.');
    }

    // 6. Test Identity & Greetings Bypass
    console.log('\n--- Test 3: Standard Greeting Bypass ---');
    console.log('Sending message: "السلام عليكم" (with RAG context active)...');
    const reply3 = await testSseChat(conversationId, 'السلام عليكم', token);
    console.log('Assistant response:', reply3);

    const isGreetingRes = reply3.includes('أهلاً بك') || reply3.includes('مساعدك الذكي SAHER SHAT');
    if (isGreetingRes) {
      console.log('✔ Test 3 PASSED: Greetings successfully bypassed the strict context rule.');
    } else {
      console.error('❌ Test 3 FAILED: AI failed to handle greetings smoothly.');
    }

    // 7. Cleanup Direct Fact
    console.log('\nCleaning up direct fact...');
    await makeRequest('DELETE', `/knowledge/facts/${factId}`, null, token);
    console.log('✔ Deleted Direct Fact.');

  } catch (error) {
    console.error('❌ ERROR DURING VERIFICATION:', error);
  }
  console.log('--- VERIFICATION COMPLETE ---');
}

run();
