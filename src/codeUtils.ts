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

export async function getCodeFromActiveEditor(): Promise<string> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showErrorMessage('No active text editor found');
        return '';
    }

    const document = editor.document;
    const selection = editor.selection;

    if (selection.isEmpty) {
        return document.getText();
    } else {
        return document.getText(selection);
    }
}