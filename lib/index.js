"use strict";

exports.__esModule = true;

exports["default"] = function (_ref2) {
  var Plugin = _ref2.Plugin;
  var t = _ref2.types;

  var visitor = {};

  visitor.JSXOpeningElement = {
    exit: function exit(node, parent, scope, file) {
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
    }
  };

  visitor.JSXClosingElement = {
    exit: function exit(node, parent, scope, file) {
      return t.expressionStatement(t.callExpression(t.identifier("elementClose"), [t.literal(node.name.name)]));
    }
  };

  return new Plugin("incremental-dom", { visitor: visitor });
};

module.exports = exports["default"];