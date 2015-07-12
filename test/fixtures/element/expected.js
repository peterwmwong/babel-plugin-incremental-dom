"use strict";

IncrementalDOM.elementOpen("div");IncrementalDOM.text("foo");IncrementalDOM.elementClose("div");;
IncrementalDOM.elementOpen("div");IncrementalDOM.text(123 + "bar");IncrementalDOM.elementClose("div");;
