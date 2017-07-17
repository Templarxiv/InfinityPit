require('./all_units.js');
require('./simulate.js');

var json = 'all_units_p.json';
var fs = require('fs');

var calcP = () => {
  var a = 0;
  for (var index = 0; index < all_units.length; index++) {
    var u1 = all_units[index];
    console.log(u1.Name + " " + (index + 1) + " of " + all_units.length);
    var ranges = [false, true, true, true, false];
    var totalP = 0;
    all_units.forEach(function (u2) {
      totalP += simulate(u1, u2, ranges, 20, false);
      a++;
    }, this);
    totalP = totalP / a;
    a = 0;
    u1.P = (totalP * 100).toFixed(2);
    console.log(u1.P);
  }
}
var calcUnits = () => {
  var a = 0;
  for (var index = 0; index < all_units.length; index++) {
    var u1 = all_units[index];
    console.log(u1.Name + " " + (index + 1) + " of " + all_units.length);
    var ranges = [false, true, true, true, false];
    var accuracy = 200;
    var u2 = all_units.find(x => x.Name == "JAGUAR Chain Rifle, Smoke Grenades");
    u1.vsJAGUAR = (simulate(u1, u2, ranges, accuracy, false) * 100).toFixed(2);
    u2 = all_units.find(x => x.Name == "FUSILIER Combi Rifle");
    u1.vsFUSILIER = (simulate(u1, u2, ranges, accuracy, false) * 100).toFixed(2);
    u2 = all_units.find(x => x.Name == "NIKOUL Viral Sniper Rifle");
    u1.vsNIKOUL = (simulate(u1, u2, ranges, accuracy, false) * 100).toFixed(2);
    u2 = all_units.find(x => x.Name == "ACHILLES Spitfire, Nanopulser");
    u1.vsACHILLES = (simulate(u1, u2, ranges, accuracy, false) * 100).toFixed(2);
    var P = (Number(u1.vsJAGUAR) + Number(u1.vsFUSILIER) + Number(u1.vsNIKOUL) + Number(u1.vsACHILLES)) / 4;
    u1.P = P.toFixed(2);
    u1.Effectivity = Math.round((u1.P - 30) / u1.COST * 100);
  }
}
calcUnits();
if (fs.exists(json)) fs.unlink(json);
fs.writeFileSync(json, JSON.stringify(all_units));
