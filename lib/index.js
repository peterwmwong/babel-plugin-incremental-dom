"use strict";

exports.__esModule = true;

function cleanJSXElementLiteralChild(t, child, args) {
  var lines = child.value.split(/\r\n|\n|\r/);

  var lastNonEmptyLine = 0;

  for (var i = 0; i < lines.length; i++) {
    if (lines[i].match(/[^ \t]/)) {
      lastNonEmptyLine = i;
    }
  }

  var str = "";

  for (var i = 0; i < lines.length; i++) {
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

  if (str) {
    args.push(t.expressionStatement(t.callExpression(t.identifier("text"), [t.literal(str)])));
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

exports["default"] = function (_ref2) {
  var Plugin = _ref2.Plugin;
  var t = _ref2.types;

  return new Plugin("incremental-dom", {
    visitor: {
      JSXOpeningElement: function JSXOpeningElement(node, parent) {
        parent.children = buildChildren(t, parent);

        var args = [t.literal(node.name.name)];
        var key = null;
        var attrs = [];

        for (var _iterator = node.attributes, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
          var _ref;

          if (_isArray) {
            if (_i >= _iterator.length) break;
            _ref = _iterator[_i++];
          } else {
            _i = _iterator.next();
            if (_i.done) break;
            _ref = _i.value;
          }

          var attr = _ref;

          if (attr.name.name === "key") {
            key = attr.value.value;
          } else {
            attrs.push(t.literal(attr.name.name), t.literal(attr.value.value));
          }
        }

        if (key || attrs.length) {
          args.push(t.literal(key));
        }

        if (attrs.length) {
          args.push(t.literal(null));
          args = args.concat(attrs);
        }

        return t.expressionStatement(t.callExpression(t.identifier("elementOpen"), args));
      },

      JSXClosingElement: function JSXClosingElement(node) {
        return t.expressionStatement(t.callExpression(t.identifier("elementClose"), [t.literal(node.name.name)]));
      }
    }
  });
};

module.exports = exports["default"];