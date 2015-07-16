"use strict";

IncrementalDOM.elementVoid("input");
IncrementalDOM.elementOpen("div"), IncrementalDOM.text("foo"), IncrementalDOM.elementClose("div");
IncrementalDOM.elementOpen("div"), IncrementalDOM.text(123 + "bar"), IncrementalDOM.elementClose("div");

var jsx = (IncrementalDOM.elementOpen("div"), IncrementalDOM.elementClose("div"));

function render() {
  return (IncrementalDOM.elementOpen("div"), IncrementalDOM.elementClose("div"));
}
