"use strict";
var FfWebcheck = require("./ffwebcheck.js");
var ko = require("knockout");
var ffWebcheck = new FfWebcheck();
ko.applyBindings(ffWebcheck);
