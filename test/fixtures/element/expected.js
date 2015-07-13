"use strict";

IncrementalDOM.elementVoid("input");;
IncrementalDOM.elementOpen("div");IncrementalDOM.text("foo");IncrementalDOM.elementClose("div");;
IncrementalDOM.elementOpen("div");IncrementalDOM.text(123 + "bar");IncrementalDOM.elementClose("div");;
