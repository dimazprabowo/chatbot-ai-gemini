
// Chatbot form variables
const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');
// Chatbot pop-up box variables
const openChatBtn = document.getElementById('open-chat-btn');
const closeChatBtn = document.getElementById('close-chat-btn');
const chatPopup = document.getElementById('chat-popup');

// Function to toggle the chat pop-up visibility
function toggleChat() {
  chatPopup.toggleAttribute('hidden');
}
openChatBtn.addEventListener('click', toggleChat);
closeChatBtn.addEventListener('click', toggleChat);

// Function to append messages to the chat box
function appendMessage(sender, text, messageElement = null) {
  let message;
  if (messageElement) {
    message = messageElement;
    message.textContent = text;
    message.classList.remove('thinking');
  } else {
    message = document.createElement('div');
    message.classList.add('message', sender);
    message.textContent = text;
    chatBox.appendChild(message);
  }

  // use marked.js to convert bot message from Markdown to HTML
  if (sender === 'bot') {
    message.innerHTML = marked.parse(text);
  } else {
    message.textContent = text;
  }
  // scroll to the newest/bottom of the chat box
  chatBox.scrollTop = chatBox.scrollHeight;
  return message;
}

// Event listener for form submission
form.addEventListener('submit', async function (e) {
  e.preventDefault();

  const userMessage = input.value.trim();
  if (!userMessage) return;

  appendMessage('user', userMessage);
  input.value = '';

  // show temporary "Thinking..." while load AI answer
  const thinkingMessageElement = appendMessage('bot', 'Gemini is thinking...', null);
  thinkingMessageElement.classList.add('thinking');

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: [{
          role: 'user',
          content: userMessage
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${ response.status }`);
    }

    const data = await response.json();

    // replace "Thinking..." message with AI's answer
    if (data.result) {
      appendMessage('bot', data.result, thinkingMessageElement);
    } else {
      appendMessage('bot', 'Sorry, no response received.', thinkingMessageElement);
    }

  } catch (error) {
    console.error('Failed to fetch AI response:', error);
    appendMessage('bot', 'Failed to get response from server.', thinkingMessageElement);
  }
});