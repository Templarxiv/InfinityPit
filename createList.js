var asset_url = "src/assets";
var json = 'all_units.json';
var fs = require('fs');

//return an array of objects according to key, value, or key and value matching
function getObjects(obj, key, val) {
  var objects = [];
  for (var i in obj) {
    if (!obj.hasOwnProperty(i)) continue;
    if (typeof obj[i] == 'object') {
      objects = objects.concat(getObjects(obj[i], key, val));
    } else
      //if key matches and value matches or if key matches and value is not passed (eliminating the case where key matches but passed value does not)
      if (i == key && obj[i] == val || i == key && val == '') { //
        objects.push(obj);
      } else if (obj[i] == val && key == '') {
      //only add if the object is not already in the array
      if (objects.lastIndexOf(obj) == -1) {
        objects.push(obj);
      }
    }
  }
  return objects;
}


if (fs.exists(json)) fs.unlink(json);
var arr = [];
var superWeapons = ["Viral", "Sniper", "K1", "HMG", "Plasma", "Missile"];
var mediumWeapons = ["Spitfire", "MULTI", "Rocket", "Mines", "Panzerfaust"];
var parseJSON = function (data) {
  data.forEach(function (unit) {
    unit.perfiles[0].opciones.forEach(function (element) {
      var newUnit = {};
      newUnit.Id = parseInt(element.id);
      newUnit.RaceID = parseInt(unit.idFaccion);
      newUnit.Name = element.nombre + " " + element.CD;
      newUnit.BS = parseInt(unit.perfiles[0].atributos.CD);
      newUnit.W = parseInt(unit.perfiles[0].atributos.H);
      newUnit.ARM = parseInt(unit.perfiles[0].atributos.BLI);
      newUnit.BTS = parseInt(unit.perfiles[0].atributos.PB);
      newUnit.Ability = unit.perfiles[0].equipo_habs;
      newUnit.Weapon = element.CD;
      newUnit.COST = parseInt(element.puntos);
      newUnit.AbilityText = "";
      if (element.link_perfil != "0") {
        var prefil = getObjects(data, 'id', element.link_perfil)
        console.log(prefil[0].puntos);
        newUnit.COST -= parseInt(prefil[0].puntos);
      }
      newUnit.RealCost = newUnit.COST;
      var modbs = 0;
      var abSplit = newUnit.Ability.split("|").filter(v => {
        return v != ""
      });
      modbs += abSplit.length / 2;
      var mods = JSON.parse(fs.readFileSync(asset_url + "/mods.json", 'utf8'));
      mods.forEach(function (element) {
        if (abSplit.length > 0 && abSplit.includes(element.Id + "")) {
          newUnit.AbilityText += " " + element.Name;
          modbs += element.Value;
          newUnit.RealCost -= element.Value;
        }
      }, this);
      superWeapons.forEach(function (element) {
        if (newUnit.Weapon.includes(element)) {
          newUnit.RealCost -= 5;
          modbs += 3;
        }
      }, this);
      mediumWeapons.forEach(function (element) {
        if (newUnit.Weapon.includes(element)) {
          newUnit.RealCost -= 3;
          modbs += 1;
        }
      }, this);

      if (newUnit.Weapon == "") {
        modbs -= 10;
        newUnit.RealCost += 100;
      }
      newUnit.RealCost -= (newUnit.ARM + (newUnit.W - 1) * 6 + (newUnit.BS - 10));

      newUnit.modBS = modbs;
      var HP = 1 * (1 + 0.1 * newUnit.ARM) + (newUnit.W - 1) * 0.7 * (1 + 0.1 * newUnit.ARM);
      var BS = 1 + 0.2 * (newUnit.BS + newUnit.modBS - 10);
      newUnit.Power = Math.round(HP * BS * 100) / 100;
      newUnit.Effectivity = Math.round(newUnit.COST / newUnit.Power * 100) / 100;
      if (newUnit.Effectivity < 1) newUnit.Effectivity = 100;
      arr.push(newUnit);
    }, this);
  });
}

var files = fs.readdirSync(asset_url + "/JSON");

files.forEach(function (file, index) {
  var data = fs.readFileSync(asset_url + "/JSON/" + file, 'utf8')
  parseJSON(JSON.parse(data));
  console.log(file);
});
console.log(arr.length);
fs.writeFileSync(json, JSON.stringify(arr));
