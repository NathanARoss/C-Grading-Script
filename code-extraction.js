javascript: (function () {
  let documentText = "";
  var pages = document.getElementsByClassName("Page-container");
  for (const page of pages) {
    var textLayer = page.getElementsByClassName("textLayer")[0];
    let highestTop = 0;
    if (textLayer.firstChild) {
      highestTop = parseFloat(textLayer.firstChild.style.top);
    }
    let line = "";
    for (const node of textLayer.childNodes) {
      const top = parseFloat(node.style.top);
      if (top > highestTop + 5) {
        highestTop = top;
        documentText += line.trimStart() + '\n';
        console.log("top:", top, "highestTop:", highestTop, "added line:", line);
        line = "";
      } else {
        console.log("top:", top, "highestTop:", highestTop, line);
      }
      const nodeText = node.firstChild.nodeValue.replace(/“|”/g, '"').replace(/[^\x00-\x7F]/g, "");
      if (nodeText.length === 0) { continue; }
      if (line.length > 0 && !line.match(/([\s({\\]$)|(^\s*#include\s*<)/) && !nodeText.match(/^[ )};\]]/)) {
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
    if (!line.includes("//")) {
      while (!line.match(/[;(){}] *$/)) {
        line += " " + lines[++i];
      }
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
    const copiedMsg = document.createElement("span");
    copiedMsg.appendChild(document.createTextNode("Code has been copied to clipboard.  The page will return to the previous URL in 5 seconds"));
    document.body.appendChild(copiedMsg);

    const timer = setTimeout(function(){history.back()}, 5000);
    const cancelBtn = document.createElement("button");
    cancelBtn.innerText = "Stay on Page";
    cancelBtn.style.float = "right";
    cancelBtn.onclick = function(){
      clearTimeout(timer);
      copiedMsg.innerText = "Code has been copied to clipboard.";
      cancelBtn.disabled = true;
    };
    document.body.appendChild(cancelBtn);

    const originalViewBtn = document.createElement("button");
    originalViewBtn.innerText = "Exit raw code view";
    originalViewBtn.style.float = "right";
    originalViewBtn.onclick = function(){
      document.body.removeChild(copiedMsg);
      document.body.removeChild(cancelBtn);
      document.body.removeChild(originalViewBtn);
      document.body.removeChild(rawText);

      const app = document.getElementById("App");
      app.style.visibility = "";
    };
    document.body.appendChild(originalViewBtn);
    
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
