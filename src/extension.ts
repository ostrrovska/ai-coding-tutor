import * as vscode from 'vscode';
import ollama from 'ollama';
import { insertCodeToActiveEditor } from './codeUtils';

export function activate(context: vscode.ExtensionContext) {
    console.log('✅ Extension activated');
    try {
        const provider = new DeepChatViewProvider(context);
        context.subscriptions.push(
            vscode.window.registerWebviewViewProvider('deepchatView', provider)
        );
    } catch (err) {
        console.error('❌ Error in activate:', err);
    }
}

class DeepChatViewProvider implements vscode.WebviewViewProvider {
    constructor(private readonly context: vscode.ExtensionContext) {}
    
    resolveWebviewView(webviewView: vscode.WebviewView) {
        console.log('📦 resolveWebviewView called');
        webviewView.webview.options = {
            enableScripts: true
        };

        webviewView.webview.html = getWebviewContent();

        webviewView.webview.onDidReceiveMessage(async (message: any) => {
            switch (message.command) {
                case 'chat':
                    await this.handleChatCommand(webviewView, message.text);
                    break;
                case 'insertCode':
                    await insertCodeToActiveEditor(message.code);
                    break;
            }
        });
    }

    private async handleChatCommand(webviewView: vscode.WebviewView, userPrompt: string) {
        let responseText = '';

        try {
            const streamResponse = await ollama.chat({
                model: 'deepseek-coder:6.7b',
                messages: [{ role: 'user', content: userPrompt }],
                stream: true
            });

            for await (const part of streamResponse) {
                responseText += part.message.content;
                webviewView.webview.postMessage({ 
                    command: 'chatResponse', 
                    text: responseText,
                    hasCode: containsCode(responseText)
                });
            }
        } catch (err) {
            webviewView.webview.postMessage({ 
                command: 'chatResponse', 
                text: `Error: ${err}`,
                hasCode: false
            });
        }
    }
}

function containsCode(text: string): boolean {
    // simple check for code blocks/potentially will create issues while parsing
    return text.includes('```') && text.split('```').length > 2;
}

function getWebviewContent(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: sans-serif; margin: 1rem; }
        #prompt { width: 100%; box-sizing: border-box; }
        #response { 
            border: 1px solid #ccc; 
            margin-top: 1rem; 
            padding: 0.5rem; 
            min-height: 2rem; 
            white-space: pre-wrap;
        }
        .code-container {
            margin: 0.5rem 0;
        }
        .code-block {
            background-color: #f5f5f5;
            padding: 0.5rem;
            border-radius: 4px;
            margin-bottom: 0.25rem;
            overflow-x: auto;
        }
        .insert-btn-container {
            text-align: right;
            margin-bottom: 1rem;
        }
        .insert-btn {
            background: #0078d4;
            color: white;
            border: none;
            border-radius: 2px;
            padding: 0.25rem 0.5rem;
            cursor: pointer;
        }
        .insert-btn:hover {
            background: #006cbd;
        }
    </style>
</head>
<body>
    <h2>Deep VS Code Extension</h2>
    <textarea id="prompt" rows="3" placeholder="Ask something..."></textarea><br />
    <button id="askBtn">Ask</button>
    <div id="response"></div>
    <script>
        const vscode = acquireVsCodeApi();
        document.getElementById('askBtn').addEventListener('click', () => {
            const text = document.getElementById('prompt').value;
            vscode.postMessage({ command: 'chat', text });
        });

        window.addEventListener('message', event => {
            const { command, text, hasCode } = event.data;
            if (command === 'chatResponse') {
                const responseEl = document.getElementById('response');
                
                if (hasCode) {
                    let processedText = text;
                    const codeBlocks = [];
                    
                    processedText = processedText.replace(/\\\`\\\`\\\`[\\s\\S]*?\\\`\\\`\\\`/g, (match) => {
                        const code = match.replace(/\\\`\\\`\\\`[^\\n]*\\n/, '').replace(/\\n\\\`\\\`\\\`$/, '');
                        const id = 'code-' + Math.random().toString(36).substr(2, 9);
                        codeBlocks.push({ id, code });
                        return '<div class="code-container">' +
                            '<div class="code-block"><pre>' + code + '</pre></div>' +
                            '<div class="insert-btn-container">' +
                            '<button class="insert-btn" data-id="' + id + '">Insert Code</button>' +
                            '</div></div>';
                    });
                    
                    responseEl.innerHTML = processedText;
                    
                    document.querySelectorAll('.insert-btn').forEach(btn => {
                        btn.addEventListener('click', (e) => {
                            const id = e.target.getAttribute('data-id');
                            const codeBlock = codeBlocks.find(b => b.id === id);
                            if (codeBlock) {
                                vscode.postMessage({ 
                                    command: 'insertCode', 
                                    code: codeBlock.code 
                                });
                            }
                        });
                    });
                } else {
                    responseEl.innerText = text;
                }
            }
        });
    </script>
</body>
</html>`;
}

export function deactivate() {}
