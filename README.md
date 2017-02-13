# Whitespace-Plus
This extension visibly marks all whitespace characters in the active document.  
You can set the extension to display all whitespace characters, or only trailing ones.  

I originally created this to work around issues with VS Code's whitespace rendering, but these have been resolved.  
This can still be utilized to customize how you want whitespace or other custom patterns to be shown.  
By modifying the configuration, you can add new patterns to be marked, customize the look of the highlights, set the default display mode, and modify the update rate.  
Set **autoStart** to true to start highlighting patterns automatically after opening a file.

## Commands
**whitespace+ toggle**: Toggle the display of the extension.  
**whitespace+ mode**: Change the display mode from either trailing or all characters.  
**whitespace+ config**: Open the configuration file.

## Contributing
For any bugs or suggestions, please file an issue on [GitHub](https://www.github.com/davidhouchin/whitespace-plus).  
Future plans involve optimizing and cleaning up the way that decorators are updated and displayed.

## License
[MIT](https://github.com/davidhouchin/whitespace-plus/blob/master/LICENSE)