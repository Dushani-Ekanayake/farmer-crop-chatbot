AI Farmer Assistant Chatbot
A single-file, highly responsive web application designed to provide immediate, knowledgeable assistance to farmers and agricultural enthusiasts. It acts as an AI assistant, utilizing Google's Gemini API for multimodal interaction (text, voice, and image analysis) and grounded advice.

🚀 Key Features
Multimodal Q&A: Ask questions via text, voice (Speech-to-Text), or by uploading an image.

Image Analysis: Upload photos of your crops. The AI analyzes the image for pests, diseases, or nutrient deficiencies, offering immediate, visual-based actionable advice.

Real-Time Grounding: Uses Google Search grounding to provide the most current information on market prices, weather impacts, and treatment recommendations.

Voice Output (TTS): The AI's responses can be read aloud using the Gemini Text-to-Speech API.

Voice Input (STT): Use the microphone button to dictate your query, enabling hands-free operation in the field.

Responsive Design: Optimized using Tailwind CSS for excellent usability on both mobile devices and desktop screens.

🛠️ Prerequisites & Setup
To run this application, you need:

A Modern Web Browser: Chrome, Firefox, Safari, or Edge.

A Gemini API Key: Required to connect to the Google Gemini models.

🔒 Security Warning: API Key
CRITICAL: Do not push your personal API key to a public GitHub repository.

Before committing your code:

Open the farmer_ai_chatbot.html file.

**Find the const apiKey line in the <script> block.

**Replace your personal key with an empty string: const apiKey = "";

**Instruct users/contributors to obtain their own key and insert it for local testing.

🏃 How to Run
* Since this is a single, self-contained HTML file:

* Create File: Create a new file named farmer_ai_chatbot.html and paste the code into it.

* Open in Browser: Double-click the file or use VS Code's "Open with Live Server" extension.

The chat interface will load instantly.

⚙️ Technology Stack
Frontend: HTML5, JavaScript (Vanilla JS)

Styling: Tailwind CSS (via CDN)

Generative AI Core:

Text/Multimodal: gemini-2.5-flash-preview-05-20

Text-to-Speech (TTS): gemini-2.5-flash-preview-tts

Input/Output: Browser's native SpeechRecognition API (STT).

📝 Troubleshooting
Voice Input Disabled: Your browser may not support the native Speech-to-Text API. Use the keyboard to input queries instead.

API Connection Errors: If the assistant returns an error message, ensure you have inserted a valid API key into the script block.
