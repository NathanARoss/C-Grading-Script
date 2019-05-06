javascript: (function () {
  let documentText = "";
  var pages = document.getElementsByClassName("Page-container");
  for (const page of pages) {
    var textLayer = page.getElementsByClassName("textLayer")[0];
    let highestTop = 0;
    if (textLayer.firstChild) {
      highestTop = parseFloat(textLayer.firstChild.style.top); }
      let line = ""; for (const node of textLayer.childNodes) {
        const top = parseFloat(node.style.top);
        if (top > highestTop + 10) {
          highestTop = top;
          documentText += line.trimStart() + '\n';
          line = "";
        }
        const nodeText = node.firstChild.nodeValue.replace(/“|”/g, '"').replace(/[^\x00-\x7F]/g, "");
        if (nodeText.length === 0) { continue; }
        if (line.length > 0 && !line.match(/([\s({]$)|(^\s*#include\s*<)/) && !nodeText.match(/^[ )};\]]/)) {
          line += " ";
        } else {
          const prevChar = !line.match(/([\s({]$)|(^\s*#include\s*<)/);
          const firstChar = !nodeText.match(/^[ )};\]]/);
        }
        line += nodeText;
      }
      documentText += line.trimStart() + '\n';
  }
  
  let code = documentText.match(/#include[\s\S]*\}/)[0];
  let formattedLines = [];
  let indentation = 0;
  
  function getIndent(level) {
    return " ".repeat(level * 4);
  }
  
  const lines = code.split('\n');
  for (let i = 0; i < lines.length; ++i) {
    let line = lines[i];
    if (line.length === 0) {
      formattedLines.push("");
      continue;
    }
    if (line.match(/^#|^\/\//)) {
      if (line.startsWith("//") && !lines[i - 1].match(/^\/\/|\{$/)) {
        formattedLines.push("");
      }
      formattedLines.push(getIndent(indentation) + line);
      continue;
    }
    const appearsToBeCode = line.match(/[\#\/=;{}<>]|^ *(int|float|double|short|char|void|while|do|if|for)\b/);
    if (!appearsToBeCode) {
      formattedLines.push(getIndent(indentation) + "//" + line);
      continue;
    }
    /* add the next lines to the current line if the current line doesn't end with a typical line ending symbol*/
    while (!line.match(/[;(){}] *$/)) {
      line += " " + lines[++i];
    }
    const openBracketCount = (line.match(/\{/g) || []).length;
    let closeBracketCount = (line.match(/\}/g) || []).length;
    if (line.startsWith("}")) {
      --indentation;
      --closeBracketCount;
    }
    
    line = getIndent(indentation) + line;
    
    /* add newlines before function definitions for readibility */
    if (indentation === 0 && (line.match(/.{3,}\{$/) || lines[i + 1] === "{")) {
      formattedLines.push("");
    }
    
    formattedLines.push(line);
    indentation += openBracketCount - closeBracketCount;
  }
  
  let formattedCode = formattedLines.join('\n') + "\n";
  
  navigator.clipboard.writeText(formattedCode);
  
  let rawText = document.getElementById("nathan-ross-extracted-code");
  if (!rawText) {
    const copiedMsg = document.createElement("p");
    copiedMsg.appendChild(document.createTextNode("Code has been copied to clipboard."));
    document.body.appendChild(copiedMsg);
    
    rawText = document.createElement("textarea");
    rawText.id = "nathan-ross-extracted-code";
    rawText.style.width = "100%";
    rawText.style.height = "calc(100% - 4em)";
    rawText.style.whiteSpace = "pre";
    rawText.style.fontFamily = "monospace";
    document.body.appendChild(rawText);
    
    const app = document.getElementById("App");
    app.style.visibility = "hidden";
  }
  
  rawText.innerHTML = "";
  rawText.appendChild(document.createTextNode(formattedCode));
})();