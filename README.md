🌾 Agri-Gemini – AI Assistant for Smart Farming

Agri-Gemini is a web-based AI assistant designed to help farmers and agriculture students get quick, reliable, and practical advice related to crop health, farm management, sustainable agriculture, and current market trends.

The assistant supports text input, voice input, image analysis, and text-to-speech (TTS), providing a modern and interactive user experience.

✨ Key Features

🌱 Agriculture-focused AI responses (crop science, pests, diseases, markets)

🖼️ Image upload for crop disease / deficiency analysis

🎙️ Voice input using browser speech recognition

🔊 Text-to-Speech playback of AI responses

🔍 Google Search grounding for up-to-date market and weather info

💬 Chat-style UI with a clean agriculture-themed design

📱 Responsive and mobile-friendly


🛠️ Technologies Used

HTML5 – Structure

CSS3 (embedded) – UI styling

JavaScript (Vanilla) – Logic and API handling

Google Gemini API – AI text, vision, and TTS

🚀 How to Run Locally

Clone the repository

git clone 


Open index.html in a browser

Add your Google Gemini API key in script.js:

const apiKey = "YOUR_API_KEY_HERE";


⚠️ Important:
Never expose real API keys in public repositories.
For production, use environment variables or a backend proxy.

🧠 System Prompt Design

The assistant is guided by a carefully designed system prompt:

Focuses only on agriculture

Prioritizes image analysis when an image is uploaded

Uses Google Search grounding for:

Market prices

Weather impacts

Latest control recommendations

Uses metric units by default

Keeps answers concise and actionable

🐞 Errors Faced & How They Were Fixed
1️⃣ API Key Errors (401 / 403)

Problem:
The app failed to fetch responses from Gemini.

Cause:

Missing or invalid API key

API quota exceeded

Fix:

Verified API key in Google AI Studio

Added clear error messages in the UI

Implemented fetchWithBackoff() with retry logic

2️⃣ Too Many Requests (429 Error)

Problem:
Frequent requests caused API throttling.

Cause:
Gemini API rate limits.

Fix:
Implemented exponential backoff:

await new Promise(resolve => setTimeout(resolve, delay));


This automatically retries requests with increasing delays.

3️⃣ Voice Input Not Working in Some Browsers

Problem:
Speech recognition failed or was unavailable.

Cause:
Web Speech API is not supported in all browsers.

Fix:

Added feature detection:

if (window.SpeechRecognition || window.webkitSpeechRecognition)


Disabled mic button if unsupported

Displayed user-friendly status messages

4️⃣ Image Not Displaying After Upload

Problem:
Uploaded images were not previewed.

Cause:
Incorrect handling of FileReader result.

Fix:

Converted image to Base64 correctly

Stored only the Base64 data for API payload

Used full Data URL for UI preview

5️⃣ Audio Playback Issues (TTS)

Problem:
TTS audio failed to play or overlapped.

Cause:
Multiple audio instances playing simultaneously.

Fix:

Managed a single global currentAudio

Stopped and cleaned previous audio before playing new one

Converted PCM audio to WAV format correctly

📸 Screenshots (Optional but Recommended)

Create an images/ folder and add screenshots:

## Screenshots

### Chat Interface
![Chat UI](images/chat-ui.png)

### Image Analysis
![Image Upload](images/image-analysis.png)

### Voice & TTS
![Voice Input](images/voice-tts.png)

🔮 Future Improvements

Multi-language support

Offline caching for frequent queries

Crop calendar reminders

Farmer location-based weather alerts

Backend proxy for secure API handling

Web Speech API – Voice input

Fetch API – Network requests
