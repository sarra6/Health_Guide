/* ============================================
   chatUI.js — Chat Interface Component
   ============================================ */

let currentSessionId = null;

async function newChatSession() {
  try {
    const res = await fetch(`${API_BASE}/chat/session`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ title: 'Health Consultation', category: 'general' })
    });
    const data = await res.json();
    if (data.sessionId) {
      currentSessionId = data.sessionId;
      clearChatMessages();
      appendMessage('assistant', '✅ New session started. How can I help you today?');
    }
  } catch (e) {
    console.error('Failed to create session:', e);
  }
}

async function sendChatMessage() {
  const input = document.getElementById('chatInput');
  const message = input.value.trim();
  if (!message) return;

  input.value = '';
  input.style.height = 'auto';
  appendMessage('user', message);
  showTypingIndicator();

  try {
    // Create session if none exists
    if (!currentSessionId) {
      const sessionRes = await fetch(`${API_BASE}/chat/session`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ title: message.substring(0, 50) })
      });
      const sessionData = await sessionRes.json();
      currentSessionId = sessionData.sessionId;
    }

    const res = await fetch(`${API_BASE}/chat/message`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ sessionId: currentSessionId, message })
    });
    const data = await res.json();

    removeTypingIndicator();

    if (data.response) {
      appendMessage('assistant', data.response);

      // Show triage if urgent/emergency
      if (data.triage && data.triage.triage !== 'routine') {
        showTriageAlert(data.triage);
      }
    } else {
      appendMessage('assistant', data.error || 'Sorry, something went wrong. Please try again.');
    }
  } catch (e) {
    removeTypingIndicator();
    appendMessage('assistant', '❌ Connection error. Please ensure the server is running.');
  }
}

function handleChatKey(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendChatMessage();
  }
}

function autoResize(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 120) + 'px';
}

function appendMessage(role, content) {
  const container = document.getElementById('chatMessages');
  const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const div = document.createElement('div');
  div.className = `message ${role}`;
  div.innerHTML = `
    <div class="message-bubble">${formatMessageContent(content)}</div>
    <div class="message-time">${role === 'assistant' ? '🤖 HealthGuide AI • ' : ''}${now}</div>
  `;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

function formatMessageContent(text) {
  // Basic markdown-like formatting
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>');
}

function showTypingIndicator() {
  const container = document.getElementById('chatMessages');
  const div = document.createElement('div');
  div.className = 'message assistant';
  div.id = 'typingIndicator';
  div.innerHTML = `
    <div class="message-bubble" style="display:flex;gap:6px;align-items:center;padding:14px 18px">
      <span style="width:8px;height:8px;background:var(--muted);border-radius:50%;animation:bounce 1s infinite"></span>
      <span style="width:8px;height:8px;background:var(--muted);border-radius:50%;animation:bounce 1s infinite 0.2s"></span>
      <span style="width:8px;height:8px;background:var(--muted);border-radius:50%;animation:bounce 1s infinite 0.4s"></span>
    </div>
    <style>@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}</style>
  `;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

function removeTypingIndicator() {
  const el = document.getElementById('typingIndicator');
  if (el) el.remove();
}

function showTriageAlert(triage) {
  const container = document.getElementById('chatMessages');
  const div = document.createElement('div');
  div.style.cssText = 'width:100%;margin:4px 0';
  div.innerHTML = `<div class="triage-alert triage-${triage.triage}">${triage.message}</div>`;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

function clearChatMessages() {
  const container = document.getElementById('chatMessages');
  container.innerHTML = '';
}
