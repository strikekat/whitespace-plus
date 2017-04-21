# Whitespace-Plus
This extension visibly marks all whitespace characters in the active document.  
You can set the extension to display all whitespace characters, or only trailing ones.  

I originally created this to work around issues with VS Code's whitespace rendering, but these have been resolved.  
This can still be utilized to customize how you want whitespace or other custom patterns to be shown.  
By modifying the configuration, you can add new patterns to be marked, customize the look of the highlights, set the default display mode, and modify the update rate.

## Options
Set these options in the config.json file through **whitespace+ config**:  
  
Set **mode** to *"all"* or *"trailing"* to change the default mode when the extension starts.  
Set **autoStart** to true to start highlighting patterns automatically after opening a file.

The trailing whitespace section supports 4 options for displaying trailing whitespace, by modifying the **enabled** property:  
*"unlessCursorAtEndOfPattern"*: This is the default behavior. Display trailing whitespace unless the cursor is at the end of the line.  
*"unlessCursorWithinPattern"*: Display trailing whitespace unless the cursor is inside of it.  
*"unlessCursorOnSameLine"*: Display trailing whitespace unless the cursor is located on the same line as it.  
*"false"*: This just replicates the old behavior of never hiding the trailing whitespace highlighting. The "false" is just there for technical reasons - It will still enable/activate when you switch the mode.  

## Commands
**whitespace+ toggle**: Toggle the display of the extension.  
**whitespace+ mode**: Change the display mode from either trailing or all characters.  
**whitespace+ config**: Open the configuration file.
   
## Contributing
For any bugs or suggestions, please file an issue on [GitHub](https://www.github.com/davidhouchin/whitespace-plus).  
Future plans involve optimizing and cleaning up the way that decorators are updated and displayed.
         
## License
[MIT](https://github.com/davidhouchin/whitespace-plus/blob/master/LICENSE)