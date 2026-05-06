Set objShell = CreateObject("WScript.Shell")
objShell.CurrentDirectory = objShell.ExpandEnvironmentStrings("%USERPROFILE%") & "\Desktop\design-case-library"
objShell.Run "cmd /c npx electron .", 0, False
