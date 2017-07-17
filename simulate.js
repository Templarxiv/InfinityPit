var json = 'all_units.json';
// var fs = require('fs');

var Roll = x => {
  var rnd = Math.random();
  return Math.floor(rnd * 20 + 1);
}

var shoot = (burst, bs, enemyBS) => {
  var shoots = [];
  var crits = 0;
  for (var i = 0; i < burst; i++) {
    var roll = Roll();
    if (roll < bs) shoots.push(roll);
    if (roll == bs) crits++;
  }

  var enemyHit = 0;
  var enemyCrit = 0;
  var roll = Roll();
  if (roll < enemyBS) enemyHit = roll;
  if (roll == enemyBS) enemyCrit++;


  var critDMG = crits - enemyCrit;
  if (critDMG > 0) {
    reactiveUnit.W -= 1;
  }
  if (critDMG < 0) {
    activeUnit.W -= 1;
    return 0;
  }

  var successShots = 0;
  for (var i = 0; i <= shoots.length; i++) {
    if (enemyHit < shoots[i]) successShots++;
    if (enemyHit > shoots[i]) successShots--;
  }
  return successShots;
}

var dmg = (dmg, arm) => {
  var dmg = Roll() <= (dmg - arm) ? 1 : 0;
  return dmg;
}

var weaponClass = (name, range, dmg, burst) => {
  var s = {};
  s.name = name;
  s.range = range;
  s.dmg = dmg;
  s.burst = burst;
  return s;
}
var weapons = [];

weapons.push(weaponClass("Shotgun", [3, 0, -3, -100, -100, -100], 13, 2));
weapons.push(weaponClass("Boarding Shotgun", [6, 0, -3, -100, -100, -100], 14, 2));
weapons.push(weaponClass("Submachine", [3, 0, -3, -6, -100, -100, -100], 13, 3));
weapons.push(weaponClass("Rifle", [0, 3, -3, -3, -6, -6], 13, 3));
weapons.push(weaponClass("CombiRifle", [3, 3, -3, -3, -6, -6], 13, 3));
weapons.push(weaponClass("Spitfire", [0, 3, 3, -3, -6, -6], 14, 4));
weapons.push(weaponClass("Sniper", [-3, 0, 3, 3, 3, 3, -3, -3], 15, 2));
weapons.push(weaponClass("Mk12", [0, 3, 3, -3, -6, -6, -100, -100, -100], 15, 3));
weapons.push(weaponClass("HMG", [-3, 0, 3, 3, -3, -3, -100, -100, -100], 15, 4));


var activeUnit;
var reactiveUnit;


var bsMod = (u1, u2) => {
  var bs = 0;
  if (u1.AbilityText.includes("Optical Disruption") || u1.Name.includes("Optical Disruption")) bs -= 6;
  if (u1.AbilityText.includes("Sapper") || u1.Name.includes("Sapper")) bs -= 3;
  if (u1.AbilityText.includes("MIMETISM") || u1.Name.toUpperCase().includes("MIMETISM")) bs -= 3;
  if (u1.AbilityText.includes("TO CAMOUFLAGE") || u1.Name.toUpperCase().includes("TO CAMOUFLAGE")) bs -= 6;
  if (u1.AbilityText.includes("Nanoscreen") || u1.Name.includes("Nanoscreen")) bs -= 3;

  if (u2.AbilityText.includes("MULTISPECTRAL VISOR L2") || u2.Name.toUpperCase().includes("MULTISPECTRAL VISOR L2") || u2.Name.toUpperCase().includes("MULTISPECTRAL VISOR L3")) {
    bs = 0;
  }
  if (u2.AbilityText.includes("MULTISPECTRAL VISOR L1") || u2.Name.toUpperCase().includes("MULTISPECTRAL VISOR L1")) {
    bs += 3;
  }
  if (bs > 0) bs = 0;

  return bs;
}

var turn = (range) => {
  var weapon1 = weaponClass("Default", [3, 0, -3, -3, -6, -100, -100, -100], 13, 3);
  var weapon2 = weaponClass("Default", [3, 0, -3, -3, -6, -100, -100, -100], 13, 3);

  weapons.forEach(function (el) {
    if (activeUnit.Name.includes(el.name)) weapon1 = el;
    if (reactiveUnit.Name.includes(el.name)) weapon2 = el;
  }, this);

  var burst = weapon1.burst;

  var activeModBS = bsMod(activeUnit, reactiveUnit);
  var reactiveModBS = bsMod(reactiveUnit, activeUnit);

  var bs = activeUnit.BS + weapon1.range[range] + reactiveModBS;
  // if (!weapon1.range[range]) bs = 0;
  var enemyBS = reactiveUnit.BS + weapon2.range[range] + activeModBS;
  // if (!weapon2.range[range]) enemyBS = 0;

  if (bs < 1 && enemyBS < 1) {
    activeUnit.W = 0;
    reactiveUnit.W = 0;
    return;
  };

  var hits = shoot(burst, bs, enemyBS)

  var dmg1 = weapon1.dmg;
  var dmg2 = weapon2.dmg;

  if (reactiveUnit.Name.includes("AP ")) activeUnit.ARM = Math.round(activeUnit.ARM / 2);
  if (activeUnit.Name.includes("AP ")) reactiveUnit.ARM = Math.round(reactiveUnit.ARM / 2);

  if (activeUnit.Name.includes("K1 ")) {
    reactiveUnit.ARM = 0;
    dmg1 = 12;
  }
  if (reactiveUnit.Name.includes("K1 ")) {
    activeUnit.ARM = 0;
    dmg2 = 12;
  }

  if (activeUnit.Name.includes("Viral ") && hits > 0) {
    reactiveUnit.ARM = reactiveUnit.BTS;
    hits = hits * 2;
  }
  if (reactiveUnit.Name.includes("Viral ") && hits < 0) {
    activeUnit.ARM = activeUnit.BTS;
    hits = hits * 2;
  }
  if (activeUnit.Name.includes("Plasma ") && hits > 0) {
    hits = hits * 2;
  }
  if (reactiveUnit.Name.includes("Plasma ") && hits < 0) {
    hits = hits * 2;
  }

  if (reactiveUnit.Name.includes("Viral ") || reactiveUnit.Name.includes("Sniper ") &&
    activeUnit.W == 1 && activeUnit.AbilityText.includes("NO WOUND INCAPACITATION")) {
    activeUnit.W = 0;
  }
  if (activeUnit.Name.includes("Viral ") || activeUnit.Name.includes("Sniper ") &&
    reactiveUnit.W == 1 && reactiveUnit.AbilityText.includes("NO WOUND INCAPACITATION")) {
    reactiveUnit.W = 0;
  }

  if (hits > 0) {
    for (var i = 0; i < hits; i++) {
      reactiveUnit.W -= dmg(dmg1, reactiveUnit.ARM);
    }
  }
  if (hits < 0) activeUnit.W -= dmg(dmg2, activeUnit.ARM);
}

var addWAb = (u) => {
  if (u.AbilityText.includes("Regeneration")) u.W += 1;
  if (u.AbilityText.includes("NO WOUND INCAPACITATION")) u.W += 1;
  if (u.AbilityText.includes("Symbiont Armor")) u.W += 1;
}

simulate = (u1, u2, ranges, amount, forUi) => {
  var winsU1 = 0;
  var winsU2 = 0;

  // var text = u1.Name + " cost=" + u1.COST + " vs " + u2.Name + " cost=" + u2.COST;

  var i_ranges = [];
  for (var b = 0; b < ranges.length; b++) {
    if (ranges[b])
      i_ranges.push(b);
  }

  var curRange = 0;
  for (var i = 0; i < amount / 2; i++) {
    activeUnit = Object.create(u1);
    reactiveUnit = Object.create(u2);
    addWAb(activeUnit);
    addWAb(reactiveUnit);
    while (activeUnit.W > 0 && reactiveUnit.W > 0) {
      turn(i_ranges[curRange]);
    }
    curRange++;
    if (curRange == i_ranges.length) curRange = 0;

    if (activeUnit.W <= 0)
      winsU2++;
    if (reactiveUnit.W <= 0)
      winsU1++;
  }
  for (var i = 0; i < amount / 2; i++) {
    activeUnit = Object.create(u2);
    reactiveUnit = Object.create(u1);
    addWAb(activeUnit);
    addWAb(reactiveUnit);

    while (activeUnit.W > 0 && reactiveUnit.W > 0) {
      turn(i_ranges[curRange]);
    }
    curRange++;
    if (curRange == i_ranges.length) curRange = 0;
    if (activeUnit.W <= 0)
      winsU1++;
    if (reactiveUnit.W <= 0)
      winsU2++;
  }
  // text += winsU1 + "/" + winsU2 + "(" + Math.floor(winsU1 / (winsU1 + winsU2) * 100) + "/" + Math.floor(winsU2 / (winsU1 + winsU2) * 100) + "%)"
  // console.log(text);
  if (forUi)
    return winsU1 + "/" + winsU2 + "(" + Math.floor(winsU1 / (winsU1 + winsU2) * 100) + "/" + Math.floor(winsU2 / (winsU1 + winsU2) * 100) + "%)";
  else return winsU1 / (winsU1 + winsU2);
}
// var data = fs.readFileSync(json, 'utf8')

//2238 sakiel , 2262 Clipsos , 2232 kamael
//2283 nikoul 2251 Gao-TarosHMG
//2290 Rasail 3038 SukuelHMG
//2150 Achilles
