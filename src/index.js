
function cleanJSXElementLiteralChild(t, child, args) {
  var lines = child.value.split(/\r\n|\n|\r/);

  var lastNonEmptyLine = 0;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].match(/[^ \t]/)) {
      lastNonEmptyLine = i;
    }
  }

  var str = "";

  for (let i = 0; i < lines.length; i++) {
    var line = lines[i];

    var isFirstLine = i === 0;
    var isLastLine = i === lines.length - 1;
    var isLastNonEmptyLine = i === lastNonEmptyLine;

    // replace rendered whitespace tabs with spaces
    var trimmedLine = line.replace(/\t/g, " ");

    // trim whitespace touching a newline
    if (!isFirstLine) {
      trimmedLine = trimmedLine.replace(/^[ ]+/, "");
    }

    // trim whitespace touching an endline
    if (!isLastLine) {
      trimmedLine = trimmedLine.replace(/[ ]+$/, "");
    }

    if (trimmedLine) {
      if (!isLastNonEmptyLine) {
        trimmedLine += " ";
      }

      str += trimmedLine;
    }
  }

  if(str) {
    args.push(
      t.expressionStatement(
        t.callExpression(t.identifier("text"), [t.literal(str)])
      )
    );
  }
}

function buildChildren(t, node) {
  var elems = [];

  for (var i = 0; i < node.children.length; i++) {
    var child = node.children[i];

    if (t.isLiteral(child) && typeof child.value === "string") {
      cleanJSXElementLiteralChild(t, child, elems);
      continue;
    }

    if (t.isJSXExpressionContainer(child)) child = child.expression;
    if (t.isJSXEmptyExpression(child)) continue;

    elems.push(child);
  }

  return elems;
}


export default function ({ Plugin, types: t }) {
  return new Plugin("incremental-dom", {
    visitor: {
      JSXOpeningElement(node, parent) {
        parent.children = buildChildren(t, parent);

        let args = [t.literal(node.name.name)];
        let key = null;
        let attrs = [];

        for (let attr of node.attributes) {
          if (attr.name.name === "key") {
            key = attr.value.value;
          } else {
            attrs.push(
              t.literal(attr.name.name),
              t.literal(attr.value.value)
            );
          }
        }

        if (key || attrs.length) {
          args.push(t.literal(key));
        }

        if (attrs.length) {
          args.push(t.literal(null));
          args = args.concat(attrs);
        }

        return t.expressionStatement(
          t.callExpression(t.identifier("elementOpen"), args)
        );
      },

      JSXClosingElement(node) {
        return t.expressionStatement(
          t.callExpression(
            t.identifier("elementClose"), [
            t.literal(node.name.name)
          ])
        );
      }
    }
  });
}
