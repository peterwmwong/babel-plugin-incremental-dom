export default function ({ Plugin, types: t }) {
  return new Plugin("incremental-dom", {
    visitor: {
      JSXOpeningElement(node) {
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
      },

      // visitor.JSXElement = {
      //   exit(node, parent, scope, file) {
      //     var nodes = [];
      //     var visitor = {};
      //
      //     visitor.JSXElement = function(node) {
      //       nodes.push(node.openingElement, node.closingElement);
      //     };
      //
      //     this.traverse(parent, visitor, scope, nodes);
      //
      //     this.parentPath.replaceWithMultiple(body);
      //   }
      // };

      JSXElement(node, parent, scope, file) {
        this.parentPath.replaceWithMultiple([
          node.openingElement,
          node.closingElement
        ]);
      }
    }
  });
}
