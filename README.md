🧠 DeepChat: Python Tutor for VS Code

Extension link : https://marketplace.visualstudio.com/items?itemName=KaterynaOstrovska.deepchat-python-tutoring

Category: AI, Python, Education

Bring the power of AI-based Python tutoring directly into your VS Code sidebar. DeepChat is your intelligent mentor — here to review, refactor, and explain your Python code step-by-step using a powerful locally running LLM.

✨ Features


✅ Ask questions about Python programming.

✅ Get detailed feedback and explanations for your code.

✅ Refactor and improve code with just one click.

✅ Inline code insertion with Insert Code button.

✅ On-demand Check Code feature to analyze your current editor content.

All powered by Ollama running the DeepSeek Coder model locally — no API keys, no cloud dependencies.

🛠 Requirements

Before using the extension, make sure you have:

1. 🐳 Ollama installed
   
Ollama is required to run the local LLM.

Installation:

macOS:

brew install ollama

Windows / Linux:

Visit https://ollama.com/download and follow the instructions for your OS.

2. 🤖 Pull the DeepSeek Coder model
   
This extension uses deepseek-coder:6.7b.

Run the following command in your terminal:

>> ollama pull deepseek-coder:6.7b

Wait until the model is fully downloaded before starting the extension.

🚀 Getting Started

Open your Python project in VS Code.

Install the extention from the marketplace.

Start asking questions, or press "Check Code" to check your code from the open editor.

Use "Insert Code" button to easily add the AI-generated suggestions.

💡 Usage Tips

The extension works best with Python code.

You can ask it things like:

"Can you explain how to use Flask?"

"Explain this error"

"Is this the best way to do X in Python?"

Ensure Ollama is running in the background before using the extension.

📄 License

MIT License — free to use, modify, and improve!

