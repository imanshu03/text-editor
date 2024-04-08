import React, { useEffect, useRef, useState } from "react";

const TextEditor = ({ config }) => {
  const [HTML, setHTML] = useState(null);
  const editorRef = useRef();
  const offsetRef = useRef({
    previousAnchorOffset: null,
    previousFocusOffset: null,
  });

  const parseTextContent = (textContent) => {
    const wordsToBeParsed = Object.keys(config);
    wordsToBeParsed.forEach((word) => {
      const regex = new RegExp(word, "img");
      textContent = textContent.replaceAll(regex, (...args) =>
        config[args[0].toLowerCase()](args[0])
      );
    });
    return textContent;
  };

  const handleInput = (e) => {
    const { innerText } = e.target;
    const selection = window.getSelection();
    const textSegments = extractTextSegments(e.target);
    let anchorOffset = null;
    let focusOffset = null;
    let currentIndex = 0;
    textSegments.forEach(({ text, node }) => {
      if (selection.anchorNode.isSameNode(node)) {
        anchorOffset = currentIndex + selection.anchorOffset;
      }
      if (selection.focusNode.isSameNode(node)) {
        focusOffset = currentIndex + selection.focusOffset;
      }
      currentIndex += text.length;
    });
    offsetRef.current = {
      previousAnchorOffset: anchorOffset,
      previousFocusOffset: focusOffset,
    };
    setHTML(parseTextContent(innerText));
  };

  const extractTextSegments = (element) => {
    const segments = [];
    Array.from(element.childNodes).forEach((node) => {
      switch (node.nodeType) {
        case Node.TEXT_NODE:
          segments.push({ text: node.nodeValue, node });
          break;
        case Node.ELEMENT_NODE:
          segments.splice(segments.length, 0, ...extractTextSegments(node));
          break;
        default:
          break;
      }
    });
    return segments;
  };

  useEffect(() => {
    if (HTML) {
      const { previousAnchorOffset, previousFocusOffset } = offsetRef.current;
      const selection = window.getSelection();
      if (previousAnchorOffset && previousFocusOffset) {
        let anchorNode = editorRef.current,
          focusNode = editorRef.current,
          anchorOffset = 0,
          focusOffset = 0,
          currentIndex = 0;
        const textSegments = extractTextSegments(editorRef.current);
        textSegments.forEach(({ text, node }) => {
          const startIndex = currentIndex;
          const endIndex = startIndex + text.length;
          if (
            startIndex <= previousAnchorOffset &&
            previousAnchorOffset <= endIndex
          ) {
            anchorOffset = previousAnchorOffset - startIndex;
            anchorNode = node;
          }
          if (
            startIndex <= previousFocusOffset &&
            previousFocusOffset <= endIndex
          ) {
            focusOffset = previousFocusOffset - startIndex;
            focusNode = node;
          }
          currentIndex += text.length;
        });
        selection.setBaseAndExtent(
          anchorNode,
          anchorOffset,
          focusNode,
          focusOffset
        );
      } else {
        const range = document.createRange();
        range.setStart(editorRef.current, editorRef.current.childNodes.length);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [HTML]);

  return (
    <div
      id="text-editor"
      contentEditable
      onInput={handleInput}
      ref={editorRef}
      role="textbox"
      dangerouslySetInnerHTML={{ __html: HTML }}
    ></div>
  );
};

export default TextEditor;
