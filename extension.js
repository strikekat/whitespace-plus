// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
var vscode = require('vscode');
var fs = require('fs');

var enabled = false;

var configPath = vscode.extensions.getExtension("davidhouchin.whitespace-plus").extensionPath + '\\config.json';
var configUri = vscode.Uri.file(configPath);

var whitespaceDecorationSpace, whitespaceDecorationTab, whitespaceDecorationNewline;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    loadConfig(configPath);

    var disposable1 = vscode.commands.registerCommand('extension.toggleWhitespacePlus', function () {
        
        if (enabled) {
            cleanDecorations();
            enabled = false;
            return;
        }

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
    
    var disposable2 = vscode.commands.registerCommand('extension.toggleWhitespacePlusMode', function () {

    });

    context.subscriptions.push(disposable2);

    var disposable3 = vscode.commands.registerCommand('extension.configWhitespacePlus', function () {
        vscode.workspace.openTextDocument(configUri).then( function(document) {vscode.window.showTextDocument(document)});
    });
    
    context.subscriptions.push(disposable3);
    
    function loadConfig(filePath) {
        var cfg = JSON.parse(fs.readFileSync(filePath).toString());

        //TODO: We need to allow highlighted elements to be configurable
        whitespaceDecorationSpace = cfg.elements[0].style;
        whitespaceDecorationTab = cfg.elements[1].style;
        whitespaceDecorationNewline = cfg.elements[2].style;
    }

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
