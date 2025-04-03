# VS Code Local Assistant

## Overview
VS Code Local Assistant is a powerful extension designed to assist developers with code generation, explanation, and chat-based interactions. It integrates with a locally hosted AI model, allowing users to generate and understand code directly within Visual Studio Code.

## Features
- **Code Generation**: Generate code snippets based on user prompts.
- **Code Explanation**: Select code in the editor to get detailed explanations.
- **Interactive Chat Panel**: Open a side panel to interact with the assistant.
- **Supports Multiple Languages**: Detects file type and generates explanations accordingly.

## Installation
1. Download the extension by clonning this repository.
2. Open VS Code and navigate to `Extensions` (`Ctrl+Shift+X`).
3. After clonning the repo Install the requirements, You will need to download DeepSeek model using LLama you download any level of model ranging from
   1.5 Billion paramaters to highest qulaity depending on your system I have trained it on 7Billion and 1.5 Billion Parameters model.
5. Click `Install` on the VS Code Local Assistant.
6. Reload or restart VS Code to activate the extension.

## Usage
## This will take some Time depending on your System Configurations.![Screenshot 2025-04-03 123827](https://github.com/user-attachments/assets/c4848268-31da-4a9b-be1e-bf2aede3c417)

### 1. Open the Chat Panel
- Use the command palette (`Ctrl+Shift+P`) and search for `Local Assistant: Open Panel`.
- The chat window will open in a new side panel.
![Screenshot 2025-04-03 124000](https://github.com/user-attachments/assets/7cba6489-5663-47c7-8665-1259063b785e)

### 2. Generate Code
- Open the command palette (`Ctrl+Shift+P`).
- Select `Local Assistant: Generate Code`.
- Enter a prompt (e.g., "Create a function to sort an array of objects by a property").
- The generated code will be inserted into the editor at the cursor position.
![Screenshot 2025-04-03 124054](https://github.com/user-attachments/assets/0539d95a-93a0-48e2-8a13-65a44945edd6)

### 3. Explain Code
- Select a block of code in the editor.
- Open the command palette (`Ctrl+Shift+P`).
- Choose `Local Assistant: Explain Code`.
- The explanation will appear in the chat panel.


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
- LLama

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

## Future Scope 
1. I am trying it to be more flexible and researching ways how can we use it Without even downloading the Deepseek model which Offcourse required Internet to connect to some Cloud platorm
   which will destroy the Original Problem Statement of Offline Assistant, Any suggestion Are highly welcome!

## Contributing
Contributions are welcome! Please open an issue or submit a pull request if you'd like to improve the extension.

## Contact
For any questions or issues, feel free to reach out via GitHub Issues or email at jayzalani34@gmail.com


