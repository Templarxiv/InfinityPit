var jsonData = all_units;
var startSimulation = () => {
  var ranges = [document.getElementById("8").checked, document.getElementById("16").checked, document.getElementById("24").checked, document.getElementById("32").checked, document.getElementById("48").checked];
  var u1 = jsonData.find(x => x.Name == document.getElementById("first_unit").value);
  var u2 = jsonData.find(x => x.Name == document.getElementById("second_unit").value);
  document.getElementById("stats_first").innerHTML = "BS: " + u1.BS + "\nW: " + u1.W + "\nARM: " + u1.ARM + "\nBTS: " + u1.BTS + "\nAbility: " + u1.AbilityText + "\nCost: " + u1.COST;
  document.getElementById("stats_second").innerHTML = "BS: " + u2.BS + "\nW: " + u2.W + "\nARM: " + u2.ARM + "\nBTS: " + u2.BTS + "\nAbility: " + u2.AbilityText + "\nCost: " + u2.COST;
  document.getElementById("status").innerHTML = simulate(u1, u2, ranges, 3000, true);
}

var finalData = $.map(jsonData, function (item) {
  return {
    label: item.Name,
    value: item.Name
  }
});

$(function () {
  $("#first_unit").autocomplete({
    minLength: 2,
    source: function (request, response) {
      var results = $.ui.autocomplete.filter(finalData, request.term);
      response(results.slice(0, 10));
    }
  })
});

$(function () {
  $("#second_unit").autocomplete({
    minLength: 2,
    source: function (request, response) {
      var results = $.ui.autocomplete.filter(finalData, request.term);
      response(results.slice(0, 10));
    }
  })
});
