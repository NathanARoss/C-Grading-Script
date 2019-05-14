javascript: (function () {
  let documentText = "";
  var pages = document.getElementsByClassName("Page-container");

  function getLeftEdge(node) {
    return node.getBoundingClientRect().left + (parseFloat(node.style.paddingLeft) || 0);
  }

  function getRightEdge(node) {
    return node.getBoundingClientRect().right - (parseFloat(node.style.paddingRight) || 0);
  }

  function getTopEdge(node) {
    return node.getBoundingClientRect().top + (parseFloat(node.style.paddingTop) || 0);
  }

  function getBottomEdge(node) {
    return node.getBoundingClientRect().bottom - (parseFloat(node.style.paddingBottom) || 0);
  }

  for (const page of pages) {
    var textLayer = page.getElementsByClassName("textLayer")[0];
    let rightEdge = 0;
    let bottomEdge = 0;
    let line = "";

    if (textLayer.firstChild) {
      bottomEdge = getBottomEdge(textLayer.firstChild);
      rightEdge = getRightEdge(textLayer.firstChild);
    }

    for (const node of textLayer.childNodes) {
      if (!node.firstChild) {
        continue;
      }

      const topEdge = getTopEdge(node);

      if (topEdge - 1 > bottomEdge) {
        const newBottom = getBottomEdge(node);
        const gap = newBottom - bottomEdge;
        const lineHeight = newBottom - topEdge;
        bottomEdge = newBottom;
        documentText += line.trimStart() + '\n'.repeat(Math.round(gap / lineHeight));
        line = "";
      } else if (getLeftEdge(node) - 1 > rightEdge) {
        line += " ";
      }

      const nodeText = node.firstChild.nodeValue;
      const sterilizedText = nodeText.replace(/“|”/g, '"').replace(/[^\x00-\x7F]/g, "");
      line += sterilizedText;
      rightEdge = getRightEdge(node);
    }
    documentText += line.trimStart() + '\n';
  }

  const code = documentText.match(/#include[\s\S]*\}/)[0];
  const formattedLines = [];
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

    /* match comments that spill onto the next line and page headers (people's names) */
    const appearsToBeCode = line.match(/[\#\/=;{}<>]|^ *(int|float|double|short|char|void|while|do|if|for)\b/);
    if (!appearsToBeCode) {
      formattedLines.push(getIndent(indentation) + "//" + line);
      continue;
    }

    /* add the next lines to the current line if the current line doesn't end with a typical line ending symbol */
    /* this effectively fixes lines that experience line wrapping */
    while (!line.match(/([;(){}])|(\*\/) *$|^#|\/\//)) {
      line += " " + lines[++i];
    }

    const openBracketCount = (line.match(/\{/g) || []).length;
    let closeBracketCount = (line.match(/\}/g) || []).length;
    if (line.startsWith("}")) {
      --indentation;
      --closeBracketCount;
    }

    formattedLines.push(getIndent(indentation) + line);
    indentation += openBracketCount - closeBracketCount;
  }

  const formattedCode = formattedLines.join('\n') + "\n";
  navigator.clipboard.writeText(formattedCode);

  let rawText = document.getElementById("nathan-ross-extracted-code");
  if (!rawText) {
    const copiedMsg = document.createElement("span");
    copiedMsg.appendChild(document.createTextNode("Code has been copied to clipboard.  The page will close in 3 seconds"));
    document.body.appendChild(copiedMsg);

    const timer = setTimeout(close, 3000);
    const cancelBtn = document.createElement("button");
    cancelBtn.innerText = "Stay on Page";
    cancelBtn.style.float = "right";
    cancelBtn.onclick = function (event) {
      event.stopPropagation();
      clearTimeout(timer);
      copiedMsg.innerText = "Code has been copied to clipboard.";
      cancelBtn.disabled = true;
    };
    document.body.appendChild(cancelBtn);

    const originalViewBtn = document.createElement("button");
    originalViewBtn.innerText = "Exit raw code view";
    originalViewBtn.style.float = "right";
    originalViewBtn.onclick = function (event) {
      event.stopPropagation();
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