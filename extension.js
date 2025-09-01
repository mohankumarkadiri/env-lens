const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

let envVars = {};

/**
 * Load .env file into envVars map
 * @param {string} root
 */
function loadEnv(root) {
	envVars = {};
	const fullPath = path.join(root, ".env");
	if (!fs.existsSync(fullPath)) {
		console.log(`⚠️ No .env found in ${root}`);
		return;
	}

	try {
		const data = fs.readFileSync(fullPath, 'utf-8');
		data.split(/\r?\n/).forEach(line => {
			const match = line.match(/^([^=]+)=(.*)$/);
			if (!match) return;
			const key = match[1].trim();
			const value = match[2]?.trim() ?? "";
			if (key) envVars[key] = value;
		});
		console.log(`✅ Loaded ${Object.keys(envVars).length} env vars from ${fullPath}`);
	} catch (err) {
		console.error("Failed to read .env:", err);
	}
}

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	const workspaceFolders = vscode.workspace.workspaceFolders;
	if (!workspaceFolders) return;

	const workspaceFullPath = workspaceFolders[0].uri.fsPath;
	loadEnv(workspaceFullPath);

	// Watch for changes in .env file and reload
	const watcher = vscode.workspace.createFileSystemWatcher(
		new vscode.RelativePattern(workspaceFullPath, ".env")
	);

	watcher.onDidChange(() => loadEnv(workspaceFullPath));
	watcher.onDidCreate(() => loadEnv(workspaceFullPath));
	watcher.onDidDelete(() => { envVars = {}; });

	context.subscriptions.push(watcher);

	const disposable = vscode.languages.registerHoverProvider(
		[{ language: 'javascript' }, { language: 'typescript' }],
		{
			provideHover(document, position) {
				const range = document.getWordRangeAtPosition(
					position,
					/process\.env\.[A-Z0-9_]+/i
				);
				if (!range) return;

				const code = document.getText(range);
				const parts = code.split(".");
				if (parts.length < 3) return;

				const varName = parts[2];
				const varValue = envVars[varName];

				let hoverText = `⚠️ **${varName}** not found in .env`;

				if (varValue !== undefined) {
					hoverText = `🔑 **${varName}** = \`${varValue}\``
				}
				return new vscode.Hover(hoverText);
			}
		}
	);

	context.subscriptions.push(disposable);
}

function deactivate() { }

module.exports = {
	activate,
	deactivate
};