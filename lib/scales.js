var local = this,
  defaultSpacing = 0.25;

function _getDomain(data, axis) {
  return _.chain(data)
    .pluck('data')
    .flatten()
    .pluck(axis)
    .uniq()
    .filter(function (d) {
      return d !== undefined && d !== null;
    })
    .value()
    .sort(d3.ascending);
}

function ordinal(data, axis, bounds, spacing) {
  spacing = spacing || defaultSpacing;
  var domain = _getDomain(data, axis);
  return d3.scale.ordinal()
    .domain(domain)
    .rangeRoundBands(bounds, spacing);
}

function linear(extents, bounds, axis) {
  return d3.scale.linear()
    .domain(extents)
    .nice()
    .rangeRound(bounds);
}

function exponential(extents, bounds, axis) {
  return d3.scale.pow()
    .exponent(0.65)
    .domain(extents)
    .nice()
    .rangeRound(bounds);
}

function time(extents, bounds) {
  return d3.time.scale()
    .domain(_.map(extents, function (d) { return new Date(d); }))
    .range(bounds);
}

function _extendDomain(domain, axis) {
  var min = domain[0],
    max = domain[1],
    diff,
    e;

  if (min === max) {
    e = Math.max(Math.round(min / 10), 4);
    min -= e;
    max += e;
  }

  diff = max - min;
  min = (min) ? min - (diff / 10) : min;
  min = (domain[0] > 0) ? Math.max(min, 0) : min;
  max = (max) ? max + (diff / 10) : max;
  max = (domain[1] < 0) ? Math.min(max, 0) : max;

  return [min, max];
}

function _getExtents(options, data, xType, yType) {
  var extents,
    nData = _.chain(data)
      .pluck('data')
      .flatten()
      .value();

  extents = {
    x: d3.extent(nData, function (d) { return d.x; }),
    y: d3.extent(nData, function (d) { return d.y; })
  };

  _.each([xType, yType], function (type, i) {
    var axis = (i) ? 'y' : 'x',
      extended;
    extents[axis] = d3.extent(nData, function (d) { return d[axis]; });
    if (type === 'ordinal') {
      return;
    }

    _.each([axis + 'Min', axis + 'Max'], function (minMax, i) {
      if (type !== 'time') {
        extended = _extendDomain(extents[axis]);
      }

      if (options.hasOwnProperty(minMax) && options[minMax] !== null) {
        extents[axis][i] = options[minMax];
      } else if (type !== 'time') {
        extents[axis][i] = extended[i];
      }
    });
  });

  return extents;
}

function xy(self, data, xType, yType) {
  var o = self._options,
    extents = _getExtents(o, data, xType, yType),
    scales = {},
    horiz = [o.axisPaddingLeft, self._width],
    vert = [self._height, o.axisPaddingTop],
    xScale,
    yScale;

  _.each([xType, yType], function (type, i) {
    var axis = (i === 0) ? 'x' : 'y',
      bounds = (i === 0) ? horiz : vert;
    switch (type) {
    case 'ordinal':
      scales[axis] = ordinal(data, axis, bounds);
      break;
    case 'linear':
      scales[axis] = linear(extents[axis], bounds, axis);
      break;
    case 'exponential':
      scales[axis] = exponential(extents[axis], bounds, axis);
      break;
    case 'time':
      scales[axis] = time(extents[axis], bounds);
      break;
    }
  });

  return scales;
}

var _scales = {
  ordinal: ordinal,
  linear: linear,
  exponential: exponential,
  time: time,
  xy: xy
};
