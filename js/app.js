"use strict";
var FfWebcheck = require("./models.js");
var ko = require("knockout");
var ffWebcheck = new FfWebcheck();
ko.applyBindings(ffWebcheck);
