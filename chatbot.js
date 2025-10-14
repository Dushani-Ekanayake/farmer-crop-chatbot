// NOTE: The API key is included here for local execution.
const apiKey = "";// your api key 
const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
const ttsApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`;

const SYSTEM_PROMPT = "You are Agri-Gemini, a friendly, professional, and knowledgeable AI assistant specializing in crop science, farm management, sustainable agriculture, and current market trends. If an image is provided (e.g., a photo of a crop), prioritize analyzing the image for disease, pest, or nutrient deficiency, and offer actionable advice based on the visual evidence. Always use the Google Search tool for grounding your advice on market prices, current weather impacts, or the latest control recommendations. Keep responses concise, practical, and focused on helping the farmer make better decisions. Use metric units unless imperial is specified.";
const sampleRate = 16000;
let base64ImageData = null;
let currentAudio = null;
let recognition = null;
let isListening = false;

// --- 1. EMBEDDED CSS (from style.css) ---
const embeddedCSS = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap');
    
    html, body {
        margin: 0;
        padding: 0;
        height: 100%;
    }

    body {
        font-family: 'Inter', sans-serif;
        background-color: #f7fdee; /* Light agriculture theme */
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1rem;
    }
    /* Custom scrollbar for chat window */
    #chat-window::-webkit-scrollbar {
        width: 8px;
    }
    #chat-window::-webkit-scrollbar-thumb {
        background-color: #a7f3d0; /* Light green */
        border-radius: 4px;
    }
`;

// --- 2. EMBEDDED HTML (from index.html body structure) ---
const chatAppHTML = `
    <div class="w-full max-w-2xl bg-white shadow-2xl rounded-xl flex flex-col h-[90vh] overflow-hidden" id="main-chat-container">
        
        <header class="p-4 bg-green-700 text-white rounded-t-xl shadow-md">
            <h1 class="text-2xl font-bold flex items-center">
                <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 10c0 1.105 2.239 2 5 2s5-.895 5-2m-2 4h-2M7 12h10l-2 3h-6l-2-3z"></path></svg>
                AI Assistant
            </h1>
            <p class="text-sm opacity-80">Speak, type, or upload an image for immediate farm advice.</p>
        </header>

        <div id="chat-window" class="flex-grow p-4 overflow-y-auto space-y-4">
            </div>

        <div class="p-4 border-t border-gray-200">
            <div id="image-preview-container" class="mb-3 hidden">
                <div class="relative w-32 h-32 rounded-lg border-2 border-dashed border-gray-400 p-1">
                    <img id="image-preview" class="w-full h-full object-cover rounded-md" alt="Uploaded image preview">
                    <button type="button" id="remove-image" class="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-red-500 text-white rounded-full p-1 leading-none shadow-md hover:bg-red-600 transition">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
            </div>
            
            <form id="chat-form" class="flex space-x-3 items-center">
                <label for="image-upload" class="cursor-pointer p-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition duration-150 shadow-md">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-7-5h2M4 20h16a2 2 0 002-2V6a2 2 0 00-2-2H4a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                </label>
                <input type="file" id="image-upload" accept="image/jpeg, image/png" class="hidden">

                <button type="button" id="voice-input-button" title="Start voice command"
                        class="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-150 shadow-md disabled:bg-gray-400">
                    <svg id="mic-icon" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7v0a7 7 0 01-7-7v0M12 4v0M12 4v0a3 3 0 00-3 3v4a3 3 0 006 0V7a3 3 0 00-3-3zM4 11h16"></path></svg>
                </button>

                <input type="text" id="user-input" placeholder="Type or speak your agricultural query..."
                       class="flex-grow p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 transition duration-150"
                       required autocomplete="off">
                       
                <button type="submit" id="send-button"
                        class="px-5 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition duration-150 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center shadow-lg">
                    <span id="button-text">Send</span>
                    <svg id="loading-spinner" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white hidden" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </button>
            </form>
        </div>

        <div id="status-message" class="hidden p-2 text-sm text-center bg-red-100 text-red-600"></div>
    </div>
`;

// --- 3. DOM Element References (declared globally, assigned in init) ---
let chatWindow, chatForm, userInput, sendButton, buttonText, loadingSpinner, statusMessage, 
    imageUpload, imagePreview, imagePreviewContainer, removeImageButton, voiceInputButton, micIcon;


// --- TTS/PCM Utility Functions (same as previous script) ---
function base64ToArrayBuffer(base64) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

function pcmToWav(pcm16, sampleRate) {
    const numChannels = 1;
    const bitsPerSample = 16;
    const blockAlign = numChannels * (bitsPerSample / 8);
    const byteRate = sampleRate * blockAlign;
    const dataSize = pcm16.length * 2; 

    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);
    let offset = 0;

    function writeString(str) {
        for (let i = 0; i < str.length; i++) {
            view.setUint8(offset++, str.charCodeAt(i));
        }
    }

    writeString('RIFF'); view.setUint32(offset, 36 + dataSize, true); offset += 4;
    writeString('WAVE'); offset += 4;
    writeString('fmt '); view.setUint32(offset, 16, true); offset += 4;
    view.setUint16(offset, 1, true); offset += 2; 
    view.setUint16(offset, numChannels, true); offset += 2;
    view.setUint32(offset, sampleRate, true); offset += 4;
    view.setUint32(offset, byteRate, true); offset += 4;
    view.setUint16(offset, blockAlign, true); offset += 2;
    view.setUint16(offset, bitsPerSample, true); offset += 2;
    writeString('data'); view.setUint32(offset, dataSize, true); offset += 4;

    const pcmView = new DataView(pcm16.buffer);
    for (let i = 0; i < pcm16.length; i++) {
        view.setInt16(offset, pcmView.getInt16(i * 2, true), true);
        offset += 2;
    }

    return new Blob([view], { type: 'audio/wav' });
}

async function generateTTSAndPlay(text, button) {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.remove();
        currentAudio = null;
        button.innerHTML = '<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"></path></svg>'; 
        return;
    }

    button.disabled = true;
    button.innerHTML = '<svg class="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>';

    try {
        const payload = {
            contents: [{ parts: [{ text: text }] }],
            generationConfig: {
                responseModalities: ["AUDIO"],
                speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } } }
            },
            model: "gemini-2.5-flash-preview-tts"
        };

        const options = {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
        };
        
        const response = await fetchWithBackoff(ttsApiUrl, options);
        const result = response;

        const part = result?.candidates?.[0]?.content?.parts?.[0];
        const audioData = part?.inlineData?.data;

        if (audioData) {
            const pcmData = base64ToArrayBuffer(audioData);
            const pcm16 = new Int16Array(pcmData);
            const wavBlob = pcmToWav(pcm16, sampleRate);
            const audioUrl = URL.createObjectURL(wavBlob);

            const audio = new Audio(audioUrl);
            currentAudio = audio;

            audio.onplay = () => {
                button.innerHTML = '<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1.555-5.668A1 1 0 018 11V9a1 1 0 011.555-.832l3 2a1 1 0 010 1.664l-3-2zM12 10a1 1 0 011 1v2a1 1 0 11-2 0v-2a1 1 0 011-1z" clip-rule="evenodd"></path></svg>'; // Pause Icon
                button.disabled = false;
            };
            audio.onended = () => {
                currentAudio = null;
                button.innerHTML = '<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"></path></svg>'; // Play Icon
                button.disabled = false;
            };
            audio.onerror = (e) => {
                console.error("Audio playback error:", e);
                showStatus("Error playing audio.", true);
                button.innerHTML = '<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"></path></svg>';
                button.disabled = false;
            }
            audio.play();

        } else {
            showStatus("TTS service failed to return audio data.", true);
            button.innerHTML = '<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"></path></svg>';
            button.disabled = false;
        }

    } catch (error) {
        console.error("TTS API Call Failed:", error);
        showStatus("TTS API Call Failed. Check console.", true);
        button.innerHTML = '<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"></path></svg>';
        button.disabled = false;
    }
}


// --- General Utility and API Handling Functions (same as previous script) ---
function showStatus(message, isError = true) {
    statusMessage.textContent = message;
    statusMessage.className = `p-2 text-sm text-center ${isError ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`;
    statusMessage.classList.remove('hidden');
    setTimeout(() => {
        statusMessage.classList.add('hidden');
    }, 5000);
}

function toggleLoading(isLoading) {
    sendButton.disabled = isLoading;
    userInput.disabled = isLoading;
    if (isLoading) {
        buttonText.classList.add('hidden');
        loadingSpinner.classList.remove('hidden');
    } else {
        buttonText.classList.remove('hidden');
        loadingSpinner.classList.add('hidden');
    }
}

async function fetchWithBackoff(url, options, maxRetries = 5) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await fetch(url, options);
            if (response.status === 429 && i < maxRetries - 1) {
                const delay = Math.pow(2, i) * 1000 + Math.random() * 1000;
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            }
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`API Error: ${response.status} - ${errorData.error.message || response.statusText}`);
            }
            return response.json();
        } catch (error) {
            if (i === maxRetries - 1) {
                throw error; 
            }
            const delay = Math.pow(2, i) * 1000 + Math.random() * 1000;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

function addMessage(text, sender, sources = [], imageSrc = null) {
    const messageContainer = document.createElement('div');
    messageContainer.className = `flex ${sender === 'user' ? 'justify-end' : 'justify-start'}`;

    const messageContentWrapper = document.createElement('div');
    messageContentWrapper.className = `flex ${sender === 'user' ? 'flex-row-reverse' : 'flex-row'} items-end max-w-xs md:max-w-md`;

    const messageBubble = document.createElement('div');
    messageBubble.className = `p-3 rounded-xl shadow-md flex flex-col`;

    if (sender === 'user') {
        messageBubble.classList.add('bg-green-600', 'text-white', 'rounded-tl-xl', 'rounded-bl-xl');
    } else {
        messageBubble.classList.add('bg-green-100', 'text-gray-800', 'rounded-tr-xl', 'rounded-br-xl');
    }

    if (imageSrc && sender === 'user') {
        const img = document.createElement('img');
        img.src = imageSrc;
        img.className = 'w-32 h-32 object-cover rounded-md mb-2 border border-gray-300';
        messageBubble.appendChild(img);
    }

    let htmlText = text;
    htmlText = htmlText.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, linkText, url) => {
        return `<a href="${url}" target="_blank" class="${sender === 'user' ? 'text-white underline hover:text-gray-200' : 'text-green-700 underline hover:text-green-900'}">${linkText}</a>`;
    });
    htmlText = htmlText.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    htmlText = htmlText.replace(/\*([^*]+)\*\*/g, '<em>$1</em>');
    
    messageBubble.innerHTML += `<p class="whitespace-pre-wrap">${htmlText}</p>`;

    if (sources && sources.length > 0) {
        const sourcesDiv = document.createElement('div');
        sourcesDiv.className = 'mt-2 pt-2 border-t border-green-200 text-xs text-gray-500 italic';
        
        let uniqueSources = [];
        const seenUris = new Set();
        sources.forEach(source => {
            if (source.uri && !seenUris.has(source.uri)) {
                uniqueSources.push(source);
                seenUris.add(source.uri);
            }
        });

        if (uniqueSources.length > 0) {
            sourcesDiv.innerHTML = '<strong>Sources:</strong> ' + uniqueSources.map((source, index) =>
                `<a href="${source.uri}" target="_blank" class="text-green-600 hover:underline" title="${source.title}">${index + 1}</a>`
            ).join(', ');
            messageBubble.appendChild(sourcesDiv);
        }
    }

    if (sender === 'bot') {
        const playButton = document.createElement('button');
        playButton.className = 'ml-2 p-1 text-green-700 hover:text-green-900 transition disabled:text-gray-400';
        playButton.title = 'Listen to response';
        playButton.innerHTML = '<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"></path></svg>';
        
        playButton.addEventListener('click', () => {
            generateTTSAndPlay(text, playButton);
        });
        
        messageContentWrapper.appendChild(messageBubble);
        messageContentWrapper.appendChild(playButton);
        messageContainer.appendChild(messageContentWrapper);

    } else {
        messageContainer.appendChild(messageBubble);
    }

    chatWindow.appendChild(messageContainer);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}


// --- 4. Initialization and Event Listener Setup ---

function initializeChatbot() {
    const appContainer = document.getElementById('chatbot-app-container');
    if (!appContainer) {
        console.error("Chatbot container not found. Make sure index.html has <div id='chatbot-app-container'></div>");
        return;
    }

    // Inject CSS
    const style = document.createElement('style');
    style.textContent = embeddedCSS;
    document.head.appendChild(style);

    // Inject HTML
    appContainer.innerHTML = chatAppHTML;
    
    // Assign DOM elements
    chatWindow = document.getElementById('chat-window');
    chatForm = document.getElementById('chat-form');
    userInput = document.getElementById('user-input');
    sendButton = document.getElementById('send-button');
    buttonText = document.getElementById('button-text');
    loadingSpinner = document.getElementById('loading-spinner');
    statusMessage = document.getElementById('status-message');
    imageUpload = document.getElementById('image-upload');
    imagePreview = document.getElementById('image-preview');
    imagePreviewContainer = document.getElementById('image-preview-container');
    removeImageButton = document.getElementById('remove-image');
    voiceInputButton = document.getElementById('voice-input-button');
    micIcon = document.getElementById('mic-icon');


    // Add Initial Message
    const initialMessageText = `Welcome, farmer! How can I assist with your farm management today? Try asking: "What are the latest market prices for corn?" or "How do I treat early blight in tomatoes?"`;
    const initialBotMessageHTML = `
        <div class="flex justify-start">
            <div class="flex items-end max-w-xs md:max-w-md">
                <div class="bg-green-100 text-green-800 p-3 rounded-tr-xl rounded-b-xl max-w-xs md:max-w-md shadow" id="initial-message-bubble">
                    <p class="font-medium">Welcome, farmer! How can I assist with your farm management today?</p>
                    <p class="text-xs mt-1 opacity-70">Try asking: "What are the latest market prices for corn?" or "How do I treat early blight in tomatoes?"</p>
                </div>
                <button type="button" class="ml-2 p-1 text-green-700 hover:text-green-900 transition disabled:text-gray-400" title="Listen to response" id="initial-play-button">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"></path></svg>
                </button>
            </div>
        </div>
    `;
    chatWindow.innerHTML = initialBotMessageHTML;

    // Attach Initial Message TTS Listener
    document.getElementById('initial-play-button').addEventListener('click', (e) => {
        generateTTSAndPlay(initialMessageText, e.currentTarget);
    });

    // Setup Event Listeners
    setupImageListeners();
    setupVoiceRecognition();
    setupFormSubmission();
}

function setupImageListeners() {
    imageUpload.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                base64ImageData = reader.result.split(',')[1];
                imagePreview.src = reader.result;
                imagePreviewContainer.classList.remove('hidden');
            };
            reader.readAsDataURL(file);
        }
    });

    removeImageButton.addEventListener('click', () => {
        base64ImageData = null;
        imageUpload.value = null;
        imagePreview.src = '';
        imagePreviewContainer.classList.add('hidden');
    });
}

function setupVoiceRecognition() {
    if (window.SpeechRecognition || window.webkitSpeechRecognition) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            isListening = true;
            voiceInputButton.classList.add('ring-4', 'ring-blue-300');
            micIcon.classList.add('animate-pulse');
            userInput.placeholder = "Listening... Speak your query now.";
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            userInput.value = transcript;
            recognition.stop();
            document.getElementById('chat-form').dispatchEvent(new Event('submit')); 
        };

        recognition.onend = () => {
            isListening = false;
            voiceInputButton.classList.remove('ring-4', 'ring-blue-300');
            micIcon.classList.remove('animate-pulse');
            userInput.placeholder = "Type or speak your agricultural query...";
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            if (event.error !== 'no-speech' && event.error !== 'aborted') {
                showStatus(`Voice input error: ${event.error}`, true);
            }
            isListening = false;
        };

        voiceInputButton.addEventListener('click', () => {
            if (isListening) {
                recognition.stop();
            } else {
                recognition.start();
            }
        });
    } else {
        voiceInputButton.disabled = true;
        voiceInputButton.title = "Voice input not supported in this browser.";
    }
}

function setupFormSubmission() {
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userQuery = userInput.value.trim();

        if (userQuery === "" && !base64ImageData) {
            showStatus("Please enter a question or upload an image.", false);
            return;
        }
        
        const displayImageSrc = imagePreview.src;
        const payloadImage = base64ImageData; 
        const finalDisplayImageSrc = payloadImage ? displayImageSrc : null;
        
        addMessage(userQuery, 'user', [], finalDisplayImageSrc);
        
        userInput.value = '';
        base64ImageData = null;
        imageUpload.value = null;
        imagePreview.src = '';
        imagePreviewContainer.classList.add('hidden');

        toggleLoading(true);

        try {
            const chatParts = [];
            
            if (payloadImage) {
                chatParts.push({
                    inlineData: { mimeType: "image/jpeg", data: payloadImage }
                });
            }
            
            if (userQuery) {
                chatParts.push({ text: userQuery });
            }
            
            const payload = {
                contents: [{ parts: chatParts }],
                tools: [{ "google_search": {} }],
                systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
            };

            const options = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            };

            const result = await fetchWithBackoff(apiUrl, options);

            const candidate = result.candidates?.[0];
            let botResponseText = "Sorry, I couldn't get a clear answer from the model. Please try rephrasing your question.";
            let sources = [];

            if (candidate && candidate.content?.parts?.[0]?.text) {
                botResponseText = candidate.content.parts[0].text;

                const groundingMetadata = candidate.groundingMetadata;
                if (groundingMetadata && groundingMetadata.groundingAttributions) {
                    sources = groundingMetadata.groundingAttributions
                        .map(attribution => ({
                            uri: attribution.web?.uri,
                            title: attribution.web?.title,
                        }))
                        .filter(source => source.uri && source.title);
                }
            }

            addMessage(botResponseText, 'bot', sources);

        } catch (error) {
            console.error("Gemini API Call Failed:", error);
            addMessage("I apologize, but there was an error connecting to the AI assistant. This is common if the API key is incorrect or limits are hit.", 'bot');
            showStatus(`Failed to get response: ${error.message}`);
        } finally {
            toggleLoading(false);
            userInput.focus();
        }
    });
}

// Start the application when the script loads

document.addEventListener('DOMContentLoaded', initializeChatbot);
