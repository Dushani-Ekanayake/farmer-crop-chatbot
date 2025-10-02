Agri-Gemini: AI Farmer Assistant Chatbot
Agri-Gemini is a single-file, highly responsive web application designed to provide immediate, knowledgeable assistance to farmers and agricultural enthusiasts. It acts as an AI assistant, utilizing Google's Gemini API for multimodal interaction (text, voice, and image analysis) and grounded advice.

🚀 Features
This application combines several advanced features into a single, portable HTML file:

Multimodal Q&A: Ask questions via text, voice (Speech-to-Text), or by uploading an image.

Image Analysis: Upload photos of your crops. The AI prioritizes analyzing the image for pests, diseases, or nutrient deficiencies, offering immediate, visual-based actionable advice.

Real-Time Grounding: Uses Google Search grounding to provide the most current information on market prices, weather impacts, and treatment recommendations.

Text-to-Speech (TTS): The AI's responses can be read aloud using the Gemini TTS API, providing an accessible and hands-free experience.

Speech-to-Text (STT): Use the microphone button to dictate your query, making it easy to use while working in the field.

Responsive Design: Optimized using Tailwind CSS for excellent usability on both mobile devices and desktop screens.

🛠️ Prerequisites
To run this application successfully, you only need two things:

A Modern Web Browser: Chrome, Firefox, Safari, or Edge.

A Gemini API Key: The application is hardcoded with a placeholder key. For production use, you would need a valid API key from Google AI Studio.

🏃 How to Run
Since this is a self-contained HTML file, running the application is straightforward:

Save the Code: Copy the content of the farmer_ai_chatbot.html file.

Create File: Create a new file named farmer_ai_chatbot.html (or any .html name) and paste the copied code into it.

Open in Browser: Double-click the file to open it in your web browser.

The chat interface will load instantly, and you can begin interacting with the Agri-Gemini assistant immediately.

⚙️ Technology Stack
Frontend: HTML5, JavaScript (Vanilla JS)

Styling: Tailwind CSS (via CDN)

Generative AI Core:

Text/Multimodal: gemini-2.5-flash-preview-05-20 (used with Google Search grounding)

Text-to-Speech (TTS): gemini-2.5-flash-preview-tts

Input/Output:

Speech-to-Text (STT): Browser's native SpeechRecognition API (webkit/standard).

📝 Troubleshooting
Voice Input Button Disabled: Your browser does not support the native Speech-to-Text API. Use the keyboard to input queries instead.

API Connection Errors: If the assistant returns an error message, the hardcoded API key may have expired or reached its quota limits. You will need to update the const apiKey = "..." line in the script block with a new, valid key.
