function getInsertionPoint(zIndex) {
  return _.chain(_.range(zIndex, 10)).reverse().map(function (z) {
    return 'g[data-index="' + z + '"]';
  }).value().join(', ');
}

function colorClass(el, i) {
  var c = el.getAttribute('class');
  return ((c !== null) ? c.replace(/color\d+/g, '') : '') + ' color' + i;
}

_visutils = {
  getInsertionPoint: getInsertionPoint,
  colorClass: colorClass
};
