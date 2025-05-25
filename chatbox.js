function sendMessage() {
    const input = document.getElementById('messageInput');
    const message = input.value.trim();
    if (message === '') return;

    const messageDiv = document.createElement('div');
    messageDiv.className = 'message';
    messageDiv.innerText = message;

    document.getElementById('chat').appendChild(messageDiv);
    input.value = '';
    input.focus();
}