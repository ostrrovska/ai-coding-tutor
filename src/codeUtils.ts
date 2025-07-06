import * as vscode from 'vscode';

export async function insertCodeToActiveEditor(code: string) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showErrorMessage('No active text editor found');
        return;
    }

    await editor.edit(editBuilder => {
        const position = editor.selection.active;
        editBuilder.insert(position, code);
    });
}