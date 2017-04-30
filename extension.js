var vscode = require('vscode');
var fs = require('fs');

var enabled = false;
var activeEditor;

var config;
var configPath = vscode.extensions.getExtension("davidhouchin.whitespace-plus").extensionPath + '/config.json';
var configUri = vscode.Uri.file(configPath);
var configWatcher = vscode.workspace.createFileSystemWatcher(configPath);

var modes = ["all", "trailing"];

var elements = [];

function activate(context) {
    // Subscribe to change events from the config file
    configWatcher.onDidChange(event => {
        loadConfig(configPath);
    });

    // Initial configuration load
    loadConfig(configPath);

    // Are we set to go automatically?
    if (config.autoStart) {enableUpdates();}

    // Main toggle method
    var disposable1 = vscode.commands.registerCommand('extension.toggleWhitespacePlus', function () {
        // If already enabled, clean the decorations and then disable
        if (enabled) {
            cleanDecorations();
            enabled = false;
            return;
        }

        // Otherwise, let's go!
        enableUpdates();
    });

    context.subscriptions.push(disposable1);
    
    // Show a quick pick menu to change the display mode
    var disposable2 = vscode.commands.registerCommand('extension.toggleWhitespacePlusMode', function () {
        vscode.window.showQuickPick(modes).then(function(selection){
            cleanDecorations();
            
            setMode(selection);

            if (enabled) {updateDecorations();}
        });
    });

    context.subscriptions.push(disposable2);

    // Open the config file
    var disposable3 = vscode.commands.registerCommand('extension.configWhitespacePlus', function () {
        vscode.workspace.openTextDocument(configUri).then( function(document) {vscode.window.showTextDocument(document)});
    });
    
    context.subscriptions.push(disposable3);
    
    // Starts the decorator updating
    function enableUpdates() {
        // Start the update cycle
        activeEditor = vscode.window.activeTextEditor;
        if (activeEditor) {
            enabled = true;
            triggerUpdate();
        }
        
        // Also trigger an update on changing the editor
        vscode.window.onDidChangeActiveTextEditor(editor => {
            activeEditor = editor;
            if (editor) {
                triggerUpdate();
            }
        }, null, context.subscriptions);
        
        // And when modifying the document
        vscode.workspace.onDidChangeTextDocument(event => {
            if (activeEditor && event.document === activeEditor.document) {
                triggerUpdate();
            }
        }, null, context.subscriptions);
        
        // And when changing the selection or moving the cursor
        vscode.window.onDidChangeTextEditorSelection(event => {
            if (activeEditor && event.textEditor === activeEditor) {
                triggerUpdate();
            }
        }, null, context.subscriptions);
        
        // Set timeout for updating decorations
        var timeout = null;
        function triggerUpdate() {
            if (timeout) {
                clearTimeout(timeout);
            }
            timeout = setTimeout(updateDecorations, config.refreshRate);
        }
    }

    // Reads editor text, and updates decorators on page
    function updateDecorations() {
        if ((!activeEditor) || (!enabled)) {
            return;
        }

        // Create decorators if they don't already exist
        createDecorations();

        var text = activeEditor.document.getText();
        var decChars = [];
        var match;

        // For each element, find all patterns in the text and create decorators
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
                if (activeEditor.selection.active.isEqual(endPos)
                    && cur.enabled == 'unlessCursorAtEndOfPattern') {
                    continue;
                } else if (activeEditor.selection.active.isAfterOrEqual(startPos)
                    && activeEditor.selection.active.isBeforeOrEqual(endPos)
                    && cur.enabled == 'unlessCursorWithinPattern') {
                    continue;
                } else if (startPos.line == activeEditor.selection.active.line
                    && cur.enabled == 'unlessCursorOnSameLine') {
                    continue;
                }
                decChars[idx].chars.push(range);
            }
        });

        // Apply decorators to the editor
        decChars.forEach(function(cur) {
            activeEditor.setDecorations(cur.decorator, cur.chars);
        });
    }

    // Load config from config path then cleans and updates decorations
    function loadConfig(filePath) {
        config = JSON.parse(fs.readFileSync(filePath).toString());
        cleanDecorations();
        setMode(config.mode);
        updateDecorations();
    }

    // First deletes elements, then checks mode for trailing element only, or all other elements
    function setMode(mode) {
        elements.length = 0;                 
        
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

    // Create decorators for the window
    function createDecorations() {
        elements.forEach(function(cur) {
            if (cur.decorator == null) {
                cur.decorator = vscode.window.createTextEditorDecorationType(cur.style);
            }
        });
    }

    // Clean decorators from the window
    function cleanDecorations() {
        elements.forEach(function(cur) {
            if (cur.decorator != null) {
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
