# VS Code Local Assistant

## Overview
VS Code Local Assistant is a powerful extension designed to assist developers with code generation, explanation, and chat-based interactions. It integrates with a locally hosted AI model, allowing users to generate and understand code directly within Visual Studio Code.

## Features
- **Code Generation**: Generate code snippets based on user prompts.
- **Code Explanation**: Select code in the editor to get detailed explanations.
- **Interactive Chat Panel**: Open a side panel to interact with the assistant.
- **Supports Multiple Languages**: Detects file type and generates explanations accordingly.

## Installation
1. Download the extension from the VS Code Marketplace (or clone this repository).
2. Open VS Code and navigate to `Extensions` (`Ctrl+Shift+X`).
3. Click `Install` on the VS Code Local Assistant.
4. Reload or restart VS Code to activate the extension.

## Usage
### 1. Open the Chat Panel
- Use the command palette (`Ctrl+Shift+P`) and search for `Local Assistant: Open Panel`.
- The chat window will open in a new side panel.

### 2. Generate Code
- Open the command palette (`Ctrl+Shift+P`).
- Select `Local Assistant: Generate Code`.
- Enter a prompt (e.g., "Create a function to sort an array of objects by a property").
- The generated code will be inserted into the editor at the cursor position.

### 3. Explain Code
- Select a block of code in the editor.
- Open the command palette (`Ctrl+Shift+P`).
- Choose `Local Assistant: Explain Code`.
- The explanation will appear in the chat panel.

## Configuration
This extension uses a locally hosted AI model for responses. You can configure the model settings in your `settings.json` file:
```json
{
  "vscode-local-assistant.modelEndpoint": "http://localhost:5000",
  "vscode-local-assistant.modelName": "deepseek-coder",
  "vscode-local-assistant.maxTokens": 500
}
```

## Supported Languages
- JavaScript
- TypeScript
- Python
- Java
- C / C++
- C#
- Go
- Ruby
- PHP
- HTML / CSS
- JSON / Markdown
- Shell (Bash, PowerShell)
- Rust
- Swift
- Kotlin
- Dart

## Development
### Prerequisites
- Node.js and npm installed
- VS Code installed

### Steps to Build
1. Clone the repository:
   ```sh
   git clone https://github.com/your-repo/vscode-local-assistant.git
   cd vscode-local-assistant
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Run the extension in VS Code:
   ```sh
   npm run compile
   code .
   ```
4. Press `F5` to launch a new VS Code window with the extension loaded.

## License
This project is licensed under the MIT License.

## Contributing
Contributions are welcome! Please open an issue or submit a pull request if you'd like to improve the extension.

## Contact
For any questions or issues, feel free to reach out via GitHub Issues or email at jayzalani34@gmail.com


