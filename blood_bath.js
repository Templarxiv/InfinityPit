require('./all_units.js');
require('./simulate.js');

var json = 'all_units_p.json';
var fs = require('fs');
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

if (fs.exists(json)) fs.unlink(json);
fs.writeFileSync(json, JSON.stringify(all_units));
