"use strict";

exports.__esModule = true;
function createCallToIncrementalDOMMethod(t, method, args) {
  return t.expressionStatement(t.callExpression(t.identifier("IncrementalDOM." + method), args));
}

function isCompatTag(tagName) {
  return tagName && /^[a-z]|\-/.test(tagName);
}

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
    args.push(createCallToIncrementalDOMMethod(t, "text", [t.literal(str)]));
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

    if (t.isJSXExpressionContainer(child)) {
      child = createCallToIncrementalDOMMethod(t, "text", [child]);
    }
    if (t.isJSXEmptyExpression(child)) continue;

    elems.push(child);
  }

  return elems;
}

exports["default"] = function (_ref3) {
  var Plugin = _ref3.Plugin;
  var t = _ref3.types;

  return new Plugin("incremental-dom", {
    visitor: {
      JSXExpressionContainer: function JSXExpressionContainer(node) {
        return node.expression;
      },

      JSXOpeningElement: function JSXOpeningElement(node, parent) {
        parent.children = buildChildren(t, parent);
        var tagName = node.name.name;

        if (isCompatTag(tagName)) {
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
              key = attr.value;
            } else {
              attrs.push(t.literal(attr.name.name), attr.value);
            }
          }

          if (key || attrs.length) {
            args.push(key || t.literal(null));
          }

          if (attrs.length) {
            args.push(t.literal(null));
            args = args.concat(attrs);
          }

          return createCallToIncrementalDOMMethod(t, node.selfClosing ? "elementVoid" : "elementOpen", args);
        } else {
          var customProps = [];
          for (var _iterator2 = node.attributes, _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : _iterator2[Symbol.iterator]();;) {
            var _ref2;

            if (_isArray2) {
              if (_i2 >= _iterator2.length) break;
              _ref2 = _iterator2[_i2++];
            } else {
              _i2 = _iterator2.next();
              if (_i2.done) break;
              _ref2 = _i2.value;
            }

            var attr = _ref2;

            customProps.push(t.property("init", t.identifier(attr.name.name), attr.value));
          }
          var callArgs = customProps.length ? [t.objectExpression(customProps)] : [];

          return t.expressionStatement(t.callExpression(t.identifier(tagName), callArgs));
        }
      },

      JSXClosingElement: function JSXClosingElement(node) {
        if (isCompatTag(node.name.name)) {
          return createCallToIncrementalDOMMethod(t, "elementClose", [t.literal(node.name.name)]);
        } else {
          this.dangerouslyRemove();
        }
      },

      JSXElement: {
        exit: function exit(node) {
          var childExpressions = node.children.reduce(function (acc, child) {
            return acc.concat(child.expressions || child.expression);
          }, []);

          var expressions = [node.openingElement.expression].concat(childExpressions);

          if (node.closingElement) {
            expressions.push(node.closingElement.expression);
          }

          return t.sequenceExpression(expressions);
        }
      }
    }
  });
};

module.exports = exports["default"];