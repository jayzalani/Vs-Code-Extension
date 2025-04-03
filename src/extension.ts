import * as vscode from 'vscode';
import axios from 'axios';


let chatPanel: vscode.WebviewPanel | undefined;

// Helper function to get config
function getConfig(key: string): any {
  return vscode.workspace.getConfiguration('vscode-local-assistant').get(key);
}

export function activate(context: vscode.ExtensionContext) {
  console.log('VS Code Local Assistant is now active');

  // Register command to open chat panel
  let openPanelCommand = vscode.commands.registerCommand('vscode-local-assistant.openPanel', () => {
    if (chatPanel) {
      chatPanel.reveal(vscode.ViewColumn.Beside);
    } else {
      createChatPanel(context);
    }
  });

  // Register command to generate code
  let generateCodeCommand = vscode.commands.registerCommand('vscode-local-assistant.generateCode', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showInformationMessage('No active editor');
      return;
    }

    const userPrompt = await vscode.window.showInputBox({
      prompt: 'What code would you like to generate?',
      placeHolder: 'E.g., Create a function to sort an array of objects by a property'
    });

    if (!userPrompt) return;

    // Get current file language
    const fileName = editor.document.fileName;
    const fileExtension = fileName.split('.').pop() || '';
    let language = getLanguageFromExtension(fileExtension);

    // Show progress indicator
    vscode.window.withProgress({
      location: vscode.ProgressLocation.Notification,
      title: 'Generating code...',
      cancellable: false
    }, async (progress) => {
      try {
        const prompt = `Generate code in ${language} for: ${userPrompt}
        Only provide the code, no explanations.`;
        
        const codeResult = await queryModel(prompt);
        
        // Extract code from markdown if needed
        const codeMatch = codeResult.match(/```(?:\w+)?\s*([\s\S]*?)```/);
        const codeToInsert = codeMatch ? codeMatch[1].trim() : codeResult;
        
        // Insert at cursor position
        editor.edit(editBuilder => {
          editBuilder.insert(editor.selection.active, codeToInsert);
        });
      } catch (error) {
        vscode.window.showErrorMessage(`Code generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    });
  });

  // Register command to explain selected code
  let explainCodeCommand = vscode.commands.registerCommand('vscode-local-assistant.explainCode', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showInformationMessage('No active editor');
      return;
    }

    const selection = editor.selection;
    if (selection.isEmpty) {
      vscode.window.showInformationMessage('No code selected');
      return;
    }

    const selectedText = editor.document.getText(selection);
    const fileName = editor.document.fileName;
    const fileExtension = fileName.split('.').pop() || '';
    let language = getLanguageFromExtension(fileExtension);

    if (!chatPanel) {
      createChatPanel(context);
    } else {
      chatPanel.reveal(vscode.ViewColumn.Beside);
    }

    // Add message to chat
    chatPanel?.webview.postMessage({
      type: 'addUserMessage',
      content: `Explain this ${language} code:\n\`\`\`${language}\n${selectedText}\n\`\`\``
    });

    // Generate response
    try {
      const prompt = `Explain the following ${language} code in detail, including what it does, any important patterns or techniques used, and potential improvements:
      
      \`\`\`${language}
      ${selectedText}
      \`\`\`
      
      Provide a clear and concise explanation that would help someone understand this code.`;
      
      const explanation = await queryModel(prompt);
      
      // Send to webview
      chatPanel?.webview.postMessage({
        type: 'addAssistantMessage',
        content: explanation
      });
    } catch (error) {
      vscode.window.showErrorMessage(`Code explanation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      chatPanel?.webview.postMessage({
        type: 'addSystemMessage',
        content: `Error: ${error instanceof Error ? error.message : 'Failed to generate explanation'}`
      });
    }
  });

  // Register tree view
  const provider = new ChatViewProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('local-assistant.chatView', provider)
  );

  context.subscriptions.push(openPanelCommand, generateCodeCommand, explainCodeCommand);
}

function createChatPanel(context: vscode.ExtensionContext) {
  // Create and show panel
  chatPanel = vscode.window.createWebviewPanel(
    'localAssistantChat',
    'Local Assistant Chat',
    vscode.ViewColumn.Beside,
    {
      enableScripts: true,
      retainContextWhenHidden: true
    }
  );

  // Set the webview's HTML content
  chatPanel.webview.html = getChatWebviewContent();

  // Handle messages from webview
  chatPanel.webview.onDidReceiveMessage(async message => {
    if (message.type === 'userMessage') {
      try {
        // Add loading indicator
        chatPanel?.webview.postMessage({
          type: 'addLoadingIndicator'
        });
        
        // Query the model
        const response = await queryModel(message.content);
        
        // Send response back to webview
        chatPanel?.webview.postMessage({
          type: 'addAssistantMessage',
          content: response
        });
      } catch (error) {
        console.error('Error querying model:', error);
        chatPanel?.webview.postMessage({
          type: 'addSystemMessage',
          content: `Error: ${error instanceof Error ? error.message : 'Failed to generate response'}`
        });
      }
    }
  }, undefined, context.subscriptions);

  // Reset panel reference when the panel is closed
  chatPanel.onDidDispose(() => {
    chatPanel = undefined;
  }, null, context.subscriptions);
}

async function queryModel(prompt: string): Promise<string> {
  const endpoint = getConfig('modelEndpoint');
  const model = getConfig('modelName');
  const maxTokens = getConfig('maxTokens');
  
  console.log(`Querying model ${model} with prompt length ${prompt.length}`);
  
  try {
    const response = await axios.post(`${endpoint}/api/generate`, {
      model: model,
      prompt: prompt,
      stream: false,
      max_tokens: maxTokens
    });
    
    if (response.data && response.data.response) {
      return response.data.response;
    }
    
    throw new Error('No response data from model');
  } catch (error) {
    console.error('Error querying model:', error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(`API Error (${error.response.status}): ${JSON.stringify(error.response.data)}`);
    }
    throw error;
  }
}

function getLanguageFromExtension(extension: string): string {
  // Map file extensions to language names
  const extensionToLanguage: Record<string, string> = {
    'js': 'JavaScript',
    'ts': 'TypeScript',
    'py': 'Python',
    'java': 'Java',
    'c': 'C',
    'cpp': 'C++',
    'cs': 'C#',
    'go': 'Go',
    'rb': 'Ruby',
    'php': 'PHP',
    'html': 'HTML',
    'css': 'CSS',
    'json': 'JSON',
    'md': 'Markdown',
    'sh': 'Shell',
    'rs': 'Rust',
    'swift': 'Swift',
    'kt': 'Kotlin',
    'dart': 'Dart'
  };
  
  return extensionToLanguage[extension] || extension || 'code';
}

function getChatWebviewContent() {
  return `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Local Assistant Chat</title>
    <style>
      body {
        font-family: var(--vscode-font-family);
        padding: 0;
        margin: 0;
        color: var(--vscode-editor-foreground);
        background-color: var(--vscode-editor-background);
      }
      .container {
        display: flex;
        flex-direction: column;
        height: 100vh;
        max-width: 100%;
        box-sizing: border-box;
      }
      .messages {
        flex: 1;
        overflow-y: auto;
        padding: 1rem;
      }
      .message {
        margin-bottom: 1rem;
        padding: 0.8rem;
        border-radius: 0.4rem;
        max-width: 90%;
      }
      .user {
        align-self: flex-end;
        background-color: var(--vscode-button-background);
        color: var(--vscode-button-foreground);
        margin-left: auto;
      }
      .assistant {
        background-color: var(--vscode-editor-inactiveSelectionBackground);
        color: var(--vscode-editor-foreground);
      }
      .system {
        background-color: var(--vscode-errorForeground);
        color: white;
        opacity: 0.8;
      }
      .input-container {
        display: flex;
        padding: 1rem;
        background-color: var(--vscode-editor-background);
        border-top: 1px solid var(--vscode-widget-border);
      }
      .input {
        flex: 1;
        padding: 0.8rem;
        border: 1px solid var(--vscode-input-border);
        background-color: var(--vscode-input-background);
        color: var(--vscode-input-foreground);
        border-radius: 0.4rem;
        outline: none;
        resize: none;
        min-height: 60px;
        font-family: var(--vscode-font-family);
      }
      .send-button {
        margin-left: 0.5rem;
        padding: 0.5rem 1rem;
        background-color: var(--vscode-button-background);
        color: var(--vscode-button-foreground);
        border: none;
        border-radius: 0.4rem;
        cursor: pointer;
        align-self: flex-end;
      }
      .send-button:hover {
        background-color: var(--vscode-button-hoverBackground);
      }
      .loading {
        display: flex;
        padding: 1rem;
        font-style: italic;
        color: var(--vscode-descriptionForeground);
      }
      .loading::after {
        content: "...";
        animation: loading 1.5s infinite;
        width: 1em;
        text-align: left;
      }
      pre {
        background-color: var(--vscode-textBlockQuote-background);
        padding: 0.8rem;
        border-radius: 0.4rem;
        overflow-x: auto;
      }
      code {
        font-family: var(--vscode-editor-font-family);
        font-size: var(--vscode-editor-font-size);
      }
      @keyframes loading {
        0% { content: "."; }
        33% { content: ".."; }
        66% { content: "..."; }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="messages" id="messages">
        <div class="message assistant">
          Hello! I'm your local coding assistant. How can I help you today?
        </div>
      </div>
      <div class="input-container">
        <textarea class="input" id="user-input" placeholder="Type your question or code request here..." rows="3"></textarea>
        <button class="send-button" id="send-button">Send</button>
      </div>
    </div>

    <script>
      (function() {
        const vscode = acquireVsCodeApi();
        const messagesContainer = document.getElementById('messages');
        const userInput = document.getElementById('user-input');
        const sendButton = document.getElementById('send-button');

        // Function to add a message to the chat
        function addMessage(content, type) {
          const messageElement = document.createElement('div');
          messageElement.className = 'message ' + type;
          
          // If it's an assistant message, render markdown
          if (type === 'assistant') {
            // We're using a simple markdown parser here
            // Replace code blocks
            let formattedContent = content.replace(/\`\`\`(\\w*)(\\n)?([\\s\\S]*?)\`\`\`/g, (match, lang, newline, code) => {
              return '<pre><code class="language-' + lang + '">' + code.trim() + '</code></pre>';
            });
            
            // Replace inline code
            formattedContent = formattedContent.replace(/\`([^\`]+)\`/g, '<code>$1</code>');
            
            // Replace line breaks
            formattedContent = formattedContent.replace(/\\n/g, '<br>');
            
            messageElement.innerHTML = formattedContent;
          } else {
            // For user/system messages, just escape HTML and keep line breaks
            const escapedContent = content
              .replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#039;')
              .replace(/\\n/g, '<br>');
            
            messageElement.innerHTML = escapedContent;
          }
          
          messagesContainer.appendChild(messageElement);
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }

        // Add a loading indicator
        function addLoadingIndicator() {
          const loadingElement = document.createElement('div');
          loadingElement.className = 'message assistant loading';
          loadingElement.id = 'loading-indicator';
          loadingElement.innerText = 'Thinking';
          messagesContainer.appendChild(loadingElement);
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }

        // Remove the loading indicator
        function removeLoadingIndicator() {
          const loadingElement = document.getElementById('loading-indicator');
          if (loadingElement) {
            loadingElement.remove();
          }
        }

        // Send user message
        function sendMessage() {
          const message = userInput.value.trim();
          if (!message) return;
          
          // Add user message to the chat
          addMessage(message, 'user');
          
          // Clear input
          userInput.value = '';
          
          // Send message to extension
          vscode.postMessage({
            type: 'userMessage',
            content: message
          });
        }

        // Handle send button click
        sendButton.addEventListener('click', sendMessage);

        // Handle Enter key (with Shift+Enter for new line)
        userInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
          }
        });

        // Handle messages from the extension
        window.addEventListener('message', (event) => {
          const message = event.data;
          
          switch (message.type) {
            case 'addUserMessage':
              addMessage(message.content, 'user');
              break;
            case 'addAssistantMessage':
              removeLoadingIndicator();
              addMessage(message.content, 'assistant');
              break;
            case 'addSystemMessage':
              removeLoadingIndicator();
              addMessage(message.content, 'system');
              break;
            case 'addLoadingIndicator':
              addLoadingIndicator();
              break;
          }
        });

        // Focus input when the webview is loaded
        userInput.focus();
      }());
    </script>
  </body>
  </html>`;
}

// Chat View 
class ChatViewProvider implements vscode.WebviewViewProvider {
  constructor(private readonly _extensionUri: vscode.Uri) {}

  resolveWebviewView(webviewView: vscode.WebviewView): void {
    webviewView.webview.options = {
      enableScripts: true
    };

    webviewView.webview.html = getChatWebviewContent();

    // Handle messages 
    webviewView.webview.onDidReceiveMessage(async (message) => {
      if (message.type === 'userMessage') {
        try {
          // Add loading indicator
          webviewView.webview.postMessage({
            type: 'addLoadingIndicator'
          });
          
          // Query the model
          const response = await queryModel(message.content);
          
          // Send response back to webview
          webviewView.webview.postMessage({
            type: 'addAssistantMessage',
            content: response
          });
        } catch (error) {
          console.error('Error querying model:', error);
          webviewView.webview.postMessage({
            type: 'addSystemMessage',
            content: `Error: ${error instanceof Error ? error.message : 'Failed to generate response'}`
          });
        }
      }
    });
  }
}

export function deactivate() {}