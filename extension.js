var vscode = require('vscode');
var fs = require('fs');

var enabled = false;
var activeEditor;

var config;
var configPath = vscode.extensions.getExtension("davidhouchin.whitespace-plus").extensionPath + '\\config.json';
var configUri = vscode.Uri.file(configPath);

var modes = ["all", "trailing"];

var elements = [];

function activate(context) {
    loadConfig(configPath);

    var disposable1 = vscode.commands.registerCommand('extension.toggleWhitespacePlus', function () {
        if (enabled) {
            cleanDecorations();
            enabled = false;
            return;
        }

        activeEditor = vscode.window.activeTextEditor;
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
            timeout = setTimeout(updateDecorations, config.refreshRate);
        }
    });

    context.subscriptions.push(disposable1);
    
    var disposable2 = vscode.commands.registerCommand('extension.toggleWhitespacePlusMode', function () {
        vscode.window.showQuickPick(modes).then(function(selection){
            cleanDecorations();
            elements.length = 0;
            
            setMode(selection);

            if (enabled) {updateDecorations();}
        });
    });

    context.subscriptions.push(disposable2);

    var disposable3 = vscode.commands.registerCommand('extension.configWhitespacePlus', function () {
        vscode.workspace.openTextDocument(configUri).then( function(document) {vscode.window.showTextDocument(document)});
    });
    
    context.subscriptions.push(disposable3);
    
    function updateDecorations() {
          if ((!activeEditor) || (!enabled)) {
            return;
        }

        createDecorations();

        var text = activeEditor.document.getText();
        var decChars = [];
        var match;

        elements.forEach(function(cur, idx) {
            var regex = RegExp(cur.pattern, 'gm');
            decChars[idx] = {
                "chars": [],
                "decorator": cur.decorator
            };
            while (match = regex.exec(text)) {
                var startPos = activeEditor.document.positionAt(match.index);
                var endPos = activeEditor.document.positionAt(match.index + match[0].length);
                var range = {range: new vscode.Range(startPos, endPos)};
                decChars[idx].chars.push(range);
            }
        });

        decChars.forEach(function(cur) {
            activeEditor.setDecorations(cur.decorator, cur.chars);
        });
    }

    function loadConfig(filePath) {
        config = JSON.parse(fs.readFileSync(filePath).toString());

        setMode(config.mode);

        createDecorations();
    }

    function setMode(mode) {
        if (mode == "trailing") {
                config.elements.forEach(function(cur) {
                    if (cur.name == "trailing") {elements.push(cur)};
                });
            } else {
                config.elements.forEach(function(cur) {
                    if (cur.enabled) {elements.push(cur)};
                });
            }
    }

    function createDecorations() {
        elements.forEach(function(cur) {
            if (cur.decorator == null) {
                cur.decorator = vscode.window.createTextEditorDecorationType(cur.style);
            }
        });
    }

    function cleanDecorations() {
        elements.forEach(function(cur) {
            if (cur.decoration != null) {
                cur.decorator.dispose();
                cur.decorator = null;
            }
        });
    }
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
