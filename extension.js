// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
var vscode = require('vscode');

var enabled = false;

var appearanceSpace = {
    borderWidth: '1px',
    borderRadius: '2px',
    borderStyle: 'solid',
    light: {
        backgroundColor: 'rgba(58, 70, 101, 0.3)',
        borderColor: 'rgba(58, 70, 101, 0.4)'
    },
    dark: {
        backgroundColor: 'rgba(117, 141, 203, 0.3)',
        borderColor: 'rgba(117, 141, 203, 0.4)'
    }
};

var appearanceTab = {
    borderWidth: '1px',
    borderRadius: '2px',
    borderStyle: 'solid',
    light: {
        backgroundColor: 'rgba(170, 53, 53, 0.3)',
        borderColor: 'rgba(170, 53, 53, 0.4)'
    },
    dark: {
        backgroundColor: 'rgba(223, 97, 97, 0.3)',
        borderColor: 'rgba(223, 97, 97, 0.4)'
    }
}

var appearanceNewline = {
    borderWidth: '1px',
    borderRadius: '2px',
    borderStyle: 'solid',
    light: {
        borderColor: 'rgba(38, 150, 38, 0.4)'
    },
    dark: {
        borderColor: 'rgba(85, 215, 85, 0.4)'
    }
}

var whitespaceDecorationSpace, whitespaceDecorationTab, whitespaceDecorationNewline;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    var disposable1 = vscode.commands.registerCommand('extension.enableWhitespacePlus', function () {
        
        var activeEditor = vscode.window.activeTextEditor;
        if (activeEditor) {
            enabled = true;
            triggerUpdate();
        }
        
        vscode.window.onDidChangeActiveTextEditor(editor => {
            activeEditor = editor;
            if (editor) {
                triggerUpdate();
            }
        }, null, context.subscriptions);
        
        vscode.workspace.onDidChangeTextDocument(event => {
            if (activeEditor && event.document === activeEditor.document) {
                triggerUpdate();
            }
        }, null, context.subscriptions);
        
        var timeout = null;
        function triggerUpdate() {
            if (timeout) {
                clearTimeout(timeout);
            }
            timeout = setTimeout(updateDecorations, 100);
        }
        
        function updateDecorations() {
            if ((!activeEditor) || (!enabled)) {
                return;
            }
            
            if (whitespaceDecorationSpace == null) {whitespaceDecorationSpace = vscode.window.createTextEditorDecorationType(appearanceSpace);}
            if (whitespaceDecorationTab == null) {whitespaceDecorationTab = vscode.window.createTextEditorDecorationType(appearanceTab);}
            if (whitespaceDecorationNewline == null) {whitespaceDecorationNewline = vscode.window.createTextEditorDecorationType(appearanceNewline);}
            
            var regExSpace = /\s/g;
            var regExTab = /\t/g;
            var regExNewline = /\n/g;
            var text = activeEditor.document.getText();
            var whitespaceSpaceChars = [];
            var whitespaceTabChars = [];
            var whitespaceNewlineChars = [];
            
            var match;
            while (match = regExSpace.exec(text)) {
                var startPos = activeEditor.document.positionAt(match.index);
                var endPos = activeEditor.document.positionAt(match.index + match[0].length);
                var decoration = {range: new vscode.Range(startPos, endPos)};
                whitespaceSpaceChars.push(decoration);
            }
            while (match = regExTab.exec(text)) {
                var startPos = activeEditor.document.positionAt(match.index);
                var endPos = activeEditor.document.positionAt(match.index + match[0].length);
                var decoration = {range: new vscode.Range(startPos, endPos)};
                whitespaceTabChars.push(decoration);
            }
            while (match = regExNewline.exec(text)) {
                var startPos = activeEditor.document.positionAt(match.index);
                var endPos = activeEditor.document.positionAt(match.index + match[0].length);
                var decoration = {range: new vscode.Range(startPos, endPos)};
                whitespaceNewlineChars.push(decoration);
            }
        
            activeEditor.setDecorations(whitespaceDecorationSpace, whitespaceSpaceChars);
            activeEditor.setDecorations(whitespaceDecorationTab, whitespaceTabChars);
            activeEditor.setDecorations(whitespaceDecorationNewline, whitespaceNewlineChars);
        }
    });

    context.subscriptions.push(disposable1);
    
    var disposable2 = vscode.commands.registerCommand('extension.disableWhitespacePlus', function () {
        cleanDecorations();
        enabled = false;
    });
    
    context.subscriptions.push(disposable2);
    
    function cleanDecorations() {
        if (whitespaceDecorationSpace != null) {whitespaceDecorationSpace.dispose(); whitespaceDecorationSpace = null;}
        if (whitespaceDecorationTab != null) {whitespaceDecorationTab.dispose(); whitespaceDecorationTab = null;}
        if (whitespaceDecorationNewline != null) {whitespaceDecorationNewline.dispose(); whitespaceDecorationNewline = null;}
    }
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
