// Real-time chat functionality with Firebase
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, doc, setDoc } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-firestore.js";
import { app } from "./firebase-config.js";

const db = getFirestore(app);
let currentClass = null;
let messagesListener = null;
let presenceRef = null;

// Initialize chat when page loads
window.addEventListener('load', async () => {
    // Get class info from sessionStorage
    const classInfoStr = sessionStorage.getItem('currentClass');
    if (!classInfoStr) {
        alert('No class information found. Please join a class first.');
        // Redirect based on current page or default
        window.location.href = 'student.html';
        return;
    }

    try {
        currentClass = JSON.parse(classInfoStr);
        console.log('Current class:', currentClass);

        // Update header if elements exist
        updateHeader();

        // Set up user presence
        await setupPresence();

        // Start listening to messages
        loadMessages();

        // Focus input
        const messageInput = document.getElementById('messageInput');
        if (messageInput) {
            messageInput.focus();
        }

    } catch (error) {
        console.error('Error initializing chat:', error);
        alert('Error loading class information. Please try joining again.');
        window.location.href = 'student.html';
    }
});

// Update header with class information
function updateHeader() {
    const header = document.querySelector('header');
    if (header && currentClass) {
        header.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                <div>
                    <div style="font-size: 18px; font-weight: bold;">${currentClass.className}</div>
                    <div style="font-size: 12px; opacity: 0.9;">Code: ${currentClass.classCode}</div>
                </div>
                <div style="text-align: right; font-size: 12px;">
                    <div>${currentClass.userName}</div>
                    <div>(${currentClass.userRole})</div>
                    <button onclick="leaveClass()" style="margin-top: 5px; padding: 4px 8px; background-color: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 10px;">Leave</button>
                </div>
            </div>
        `;
    }
}

// Set up user presence tracking
async function setupPresence() {
    if (!currentClass) return;

    try {
        const presenceCollection = collection(db, 'presence', currentClass.classId, 'users');
        presenceRef = doc(presenceCollection, currentClass.userName);

        // Set user as online
        await setDoc(presenceRef, {
            userName: currentClass.userName,
            role: currentClass.userRole,
            lastSeen: serverTimestamp(),
            isOnline: true
        });

        console.log('User presence set successfully');
    } catch (error) {
        console.error('Error setting up presence:', error);
    }
}

// Load and listen to messages in real-time
function loadMessages() {
    if (!currentClass) return;

    try {
        const messagesCollection = collection(db, 'messages', currentClass.classId, 'chat');
        const messagesQuery = query(messagesCollection, orderBy('timestamp', 'asc'));

        // Listen for real-time updates
        messagesListener = onSnapshot(messagesQuery, (snapshot) => {
            const chatContainer = document.getElementById('chat');
            if (!chatContainer) return;

            // Clear existing messages
            chatContainer.innerHTML = '';

            // Add all messages
            snapshot.forEach((doc) => {
                const messageData = doc.data();
                createMessageElement(messageData);
            });

            // Scroll to bottom
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }, (error) => {
            console.error('Error loading messages:', error);
        });

        console.log('Message listener set up successfully');
    } catch (error) {
        console.error('Error setting up message listener:', error);
    }
}

// Create message element in the chat
function createMessageElement(messageData) {
    const chatContainer = document.getElementById('chat');
    if (!chatContainer || !messageData) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = 'message';

    // Determine message styling
    const isOwnMessage = messageData.userName === currentClass.userName;
    const isTeacher = messageData.userRole === 'teacher';

    // Add appropriate classes
    if (isOwnMessage) {
        // Own messages stay on the right with default styling
    } else if (isTeacher) {
        messageDiv.classList.add('teacher');
    } else {
        // Other students' messages
        messageDiv.classList.add('student');
    }

    // Format timestamp
    const timestamp = messageData.timestamp?.toDate();
    const timeString = timestamp ? timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now';

    // Create message content
    if (isOwnMessage) {
        // Simple layout for own messages
        messageDiv.innerHTML = `
            <div style="font-size: 12px; color: #666; margin-bottom: 2px; text-align: right;">
                ${timeString}
            </div>
            <div>${messageData.message}</div>
        `;
    } else {
        // Show username for other users' messages
        messageDiv.innerHTML = `
            <div style="font-size: 12px; font-weight: bold; color: ${isTeacher ? '#e91e63' : '#1a73e8'}; margin-bottom: 2px;">
                ${messageData.userName} 
                <span style="font-size: 10px; font-weight: normal; color: #666; margin-left: 5px;">
                    ${timeString}
                </span>
            </div>
            <div>${messageData.message}</div>
        `;
    }

    chatContainer.appendChild(messageDiv);
}

// Send message function
async function sendMessage() {
    const input = document.getElementById('messageInput');
    const sendBtn = document.querySelector('button');

    if (!input || !currentClass) return;

    const message = input.value.trim();
    if (message === '') return;

    // Disable button temporarily
    if (sendBtn) {
        sendBtn.disabled = true;
        sendBtn.textContent = 'Sending...';
    }

    try {
        const messagesCollection = collection(db, 'messages', currentClass.classId, 'chat');
        await addDoc(messagesCollection, {
            message: message,
            userName: currentClass.userName,
            userRole: currentClass.userRole,
            timestamp: serverTimestamp(),
            classId: currentClass.classId
        });

        // Clear input
        input.value = '';
        input.focus();

        console.log('Message sent successfully');
    } catch (error) {
        console.error('Error sending message:', error);
        alert('Failed to send message. Please try again.');
    } finally {
        // Re-enable button
        if (sendBtn) {
            sendBtn.disabled = false;
            sendBtn.textContent = 'Send';
        }
    }
}

// Leave class function
async function leaveClass() {
    if (!confirm('Are you sure you want to leave this class?')) {
        return;
    }

    try {
        // Clean up listeners
        if (messagesListener) {
            messagesListener();
        }

        // Set user as offline
        if (presenceRef) {
            await setDoc(presenceRef, {
                userName: currentClass.userName,
                role: currentClass.userRole,
                lastSeen: serverTimestamp(),
                isOnline: false
            });
        }

        // Clear session storage
        sessionStorage.removeItem('currentClass');

        // Redirect based on user role
        if (currentClass.userRole === 'teacher') {
            window.location.href = 'class.html';
        } else {
            window.location.href = 'student.html';
        }
    } catch (error) {
        console.error('Error leaving class:', error);
        // Still redirect even if there's an error
        sessionStorage.removeItem('currentClass');
        window.location.href = 'student.html';
    }
}

// Handle Enter key press
document.addEventListener('DOMContentLoaded', () => {
    const messageInput = document.getElementById('messageInput');
    if (messageInput) {
        messageInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }
});

// Clean up on page unload
window.addEventListener('beforeunload', async () => {
    if (messagesListener) {
        messagesListener();
    }

    if (presenceRef && currentClass) {
        try {
            await setDoc(presenceRef, {
                userName: currentClass.userName,
                role: currentClass.userRole,
                lastSeen: serverTimestamp(),
                isOnline: false
            });
        } catch (error) {
            console.error('Error updating presence on unload:', error);
        }
    }
});

// Make functions globally available
window.sendMessage = sendMessage;
window.leaveClass = leaveClass;