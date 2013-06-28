var emptyData = [[]],
  defaults = {
    // User interaction callbacks
    mouseover: function (data, i) {},
    mouseout: function (data, i) {},
    click: function (data, i) {},

    // Padding between the axes and the contents of the chart
    axisPaddingTop: 0,
    axisPaddingRight: 0,
    axisPaddingBottom: 5,
    axisPaddingLeft: 20,

    // Padding around the edge of the chart (space for axis labels, etc)
    paddingTop: 0,
    paddingRight: 0,
    paddingBottom: 20,
    paddingLeft: 60,

    // Axis tick formatting
    tickHintX: 10,
    tickFormatX: function (x) { return x; },
    tickHintY: 10,
    tickFormatY: function (y) { return y; },

    // Min/Max Axis Values
    xMin: null,
    xMax: null,
    yMin: null,
    yMax: null,

    // Pre-format input data
    dataFormatX: function (x) { return x; },
    dataFormatY: function (y) { return y; },

    unsupported: function (selector) {
      d3.select(selector).text('SVG is not supported on your browser');
    },

    // Callback functions if no data
    empty: function (self, selector, d) {},
    notempty: function (self, selector) {},

    timing: 750,

    // Line interpolation
    interpolation: 'monotone',

    // Data sorting
    sortX: function (a, b) {
      return (!a.x && !b.x) ? 0 : (a.x < b.x) ? -1 : 1;
    }
  };

// What/how should the warning/error be presented?
function svgEnabled() {
  var d = document;
  return (!!d.createElementNS &&
    !!d.createElementNS('http://www.w3.org/2000/svg', 'svg').createSVGRect);
}

/**
 * Creates a new chart
 *
 * @param string type       The drawing type for the main data
 * @param array data        Data to render in the chart
 * @param string selector   CSS Selector for the parent element for the chart
 * @param object options    Optional. See `defaults` for options
 *
 * Examples:
 *    var data = {
 *        "main": [
 *          {
 *            "label": "Foo",
 *            "data": [
 *              {
 *                "x": "2012-08-09T07:00:00.522Z",
 *                "y": 68
 *              },
 *              {
 *                "x": "2012-08-10T07:00:00.522Z",
 *                "y": 295
 *              },
 *              {
 *                "x": "2012-08-11T07:00:00.522Z",
 *                "y": 339
 *              },
 *            ],
 *            "className": ".foo"
 *          }
 *        ],
 *        "xScale": "ordinal",
 *        "yScale": "linear",
 *        "comp": [
 *          {
 *            "label": "Foo Target",
 *            "data": [
 *              {
 *                "x": "2012-08-09T07:00:00.522Z",
 *                "y": 288
 *              },
 *              {
 *                "x": "2012-08-10T07:00:00.522Z",
 *                "y": 407
 *              },
 *              {
 *                "x": "2012-08-11T07:00:00.522Z",
 *                "y": 459
 *              }
 *            ],
 *            "className": ".comp.comp_foo",
 *            "type": "line-arrowed"
 *          }
 *        ]
 *      },
 *      myChart = new Chart('bar', data, '#chart');
 *
 */
function xChart(type, data, selector, options) {
  var self = this,
    resizeLock;

  self._options = options = _.defaults(options || {}, defaults);

  if (svgEnabled() === false) {
    return options.unsupported(selector);
  }

  self._selector = selector;
  self._container = d3.select(selector);
  self._drawSvg();
  self._mainStorage = {};
  self._compStorage = {};

  data = _.clone(data);
  if (type && !data.type) {
    data.type = type;
  }

  self.setData(data);

  d3.select(window).on('resize.for.' + selector, function () {
    if (resizeLock) {
      clearTimeout(resizeLock);
    }
    resizeLock = setTimeout(function () {
      resizeLock = null;
      self._resize();
    }, 500);
  });
}

/**
 * Add a visualization type
 *
 * @param string type   Unique key/name used with setType
 * @param object vis    object map of vis methods
 */
xChart.setVis = function (type, vis) {
  if (_vis.hasOwnProperty(type)) {
    throw 'Cannot override vis type "' + type + '".';
  }
  _vis[type] = vis;
};

/**
 * Get a clone of a visualization
 * Useful for extending vis functionality
 *
 * @param string type   Unique key/name of the vis
 */
xChart.getVis = function (type) {
  if (!_vis.hasOwnProperty(type)) {
    throw 'Vis type "' + type + '" does not exist.';
  }

  return _.clone(_vis[type]);
};

xChart.visutils = _visutils;
xChart.scales = _scales;

_.defaults(xChart.prototype, {
  /**
   * Set or change the drawing type for the main data.
   *
   * @param string type   Must be an available drawing type
   *
   */
  setType: function (type, skipDraw) {
    var self = this;

    if (self._type && type === self._type) {
      return;
    }

    if (!_vis.hasOwnProperty(type)) {
      throw 'Vis type "' + type + '" is not defined.';
    }

    if (self._type) {
      self._destroy(self._vis, self._mainStorage);
    }

    self._type = type;
    self._vis = _vis[type];
    if (!skipDraw) {
      self._draw();
    }
  },

  /**
   * Set and update the data for the chart. Optionally skip drawing.
   *
   * @param object data       New data. See new xChart example for format
   *
   */
  setData: function (data) {
    var self = this,
      o = self._options,
      nData = _.clone(data);

    if (!data.hasOwnProperty('main')) {
      throw 'No "main" key found in given chart data.';
    }

    switch (data.type) {
    case 'bar':
      // force the xScale to be ordinal
      data.xScale = 'ordinal';
      break;
    case undefined:
      data.type = self._type;
      break;
    }

    o.xMin = (isNaN(parseInt(data.xMin, 10))) ? o.xMin : data.xMin;
    o.xMax = (isNaN(parseInt(data.xMax, 10))) ? o.xMax : data.xMax;
    o.yMin = (isNaN(parseInt(data.yMin, 10))) ? o.yMin : data.yMin;
    o.yMax = (isNaN(parseInt(data.yMax, 10))) ? o.yMax : data.yMax;

    if (self._vis) {
      self._destroy(self._vis, self._mainStorage);
    }

    self.setType(data.type, true);

    function _mapData(set) {
      var d = _.map(_.clone(set.data), function (p) {
        var np = _.clone(p);
        if (p.hasOwnProperty('x')) {
          np.x = o.dataFormatX(p.x);
        }
        if (p.hasOwnProperty('y')) {
          np.y = o.dataFormatY(p.y);
        }
        return np;
      }).sort(o.sortX);
      return _.extend(_.clone(set), { data: d });
    }

    nData.main = _.map(nData.main, _mapData);
    self._mainData = nData.main;
    self._xScaleType = nData.xScale;
    self._yScaleType = nData.yScale;

    if (nData.hasOwnProperty('comp')) {
      nData.comp = _.map(nData.comp, _mapData);
      self._compData = nData.comp;
    } else {
      self._compData = [];
    }

    self._draw();
  },

  /**
   * Change the scale of an axis
   *
   * @param string axis   Name of an axis. One of 'x' or 'y'
   * @param string type   Name of the scale type
   *
   */
  setScale: function (axis, type) {
    var self = this;

    switch (axis) {
    case 'x':
      self._xScaleType = type;
      break;
    case 'y':
      self._yScaleType = type;
      break;
    default:
      throw 'Cannot change scale of unknown axis "' + axis + '".';
    }

    self._draw();
  },

  /**
   * Create the SVG element and g container. Resize if necessary.
   */
  _drawSvg: function () {
    var self = this,
      c = self._container,
      options = self._options,
      width = parseInt(c.style('width').replace('px', ''), 10),
      height = parseInt(c.style('height').replace('px', ''), 10),
      svg,
      g,
      gScale;

    svg = c.selectAll('svg')
      .data(emptyData);

    svg.enter().append('svg')
      // Inherit the height and width from the parent element
      .attr('height', height)
      .attr('width', width)
      .attr('class', 'xchart');

    svg.transition()
      .attr('width', width)
      .attr('height', height);

    g = svg.selectAll('g')
      .data(emptyData);

    g.enter().append('g')
      .attr(
        'transform',
        'translate(' + options.paddingLeft + ',' + options.paddingTop + ')'
      );

    gScale = g.selectAll('g.scale')
      .data(emptyData);

    gScale.enter().append('g')
      .attr('class', 'scale');

    self._svg = svg;
    self._g = g;
    self._gScale = gScale;

    self._height = height - options.paddingTop - options.paddingBottom -
      options.axisPaddingTop - options.axisPaddingBottom;
    self._width = width - options.paddingLeft - options.paddingRight -
      options.axisPaddingLeft - options.axisPaddingRight;
  },

  /**
   * Resize the visualization
   */
  _resize: function (event) {
    var self = this;

    self._drawSvg();
    self._draw();
  },

  /**
   * Draw the x and y axes
   */
  _drawAxes: function () {
    if (this._noData) {
      return;
    }
    var self = this,
      o = self._options,
      t = self._gScale.transition().duration(o.timing),
      xTicks = o.tickHintX,
      yTicks = o.tickHintY,
      bottom = self._height + o.axisPaddingTop + o.axisPaddingBottom,
      zeroLine = d3.svg.line().x(function (d) { return d; }),
      zLine,
      zLinePath,
      xAxis,
      xRules,
      yAxis,
      yRules,
      labels;

    xRules = d3.svg.axis()
      .scale(self.xScale)
      .ticks(xTicks)
      .tickSize(-self._height)
      .tickFormat(o.tickFormatX)
      .orient('bottom');

    xAxis = self._gScale.selectAll('g.axisX')
      .data(emptyData);

    xAxis.enter().append('g')
      .attr('class', 'axis axisX')
      .attr('transform', 'translate(0,' + bottom + ')');

    xAxis.call(xRules);

    labels = self._gScale.selectAll('.axisX g')[0];
    if (labels.length > (self._width / 80)) {
      labels.sort(function (a, b) {
        var r = /translate\(([^,)]+)/;
        a = a.getAttribute('transform').match(r);
        b = b.getAttribute('transform').match(r);
        return parseFloat(a[1], 10) - parseFloat(b[1], 10);
      });

      d3.selectAll(labels)
        .filter(function (d, i) {
          return i % (Math.ceil(labels.length / xTicks) + 1);
        })
        .remove();
    }

    yRules = d3.svg.axis()
      .scale(self.yScale)
      .ticks(yTicks)
      .tickSize(-self._width - o.axisPaddingRight - o.axisPaddingLeft)
      .tickFormat(o.tickFormatY)
      .orient('left');

    yAxis = self._gScale.selectAll('g.axisY')
      .data(emptyData);

    yAxis.enter().append('g')
      .attr('class', 'axis axisY')
      .attr('transform', 'translate(0,0)');

    t.selectAll('g.axisY')
      .call(yRules);

    // zero line
    zLine = self._gScale.selectAll('g.axisZero')
      .data([[]]);

    zLine.enter().append('g')
      .attr('class', 'axisZero');

    zLinePath = zLine.selectAll('line')
      .data([[]]);

    zLinePath.enter().append('line')
      .attr('x1', 0)
      .attr('x2', self._width + o.axisPaddingLeft + o.axisPaddingRight)
      .attr('y1', self.yZero)
      .attr('y2', self.yZero);

    zLinePath.transition().duration(o.timing)
      .attr('y1', self.yZero)
      .attr('y2', self.yZero);
  },

  /**
   * Update the x and y scales (used when drawing)
   *
   * Optional methods in drawing types:
   *    preUpdateScale
   *    postUpdateScale
   *
   * Example implementation in vis type:
   *
   *    function postUpdateScale(self, scaleData, mainData, compData) {
   *      self.xScale2 = d3.scale.ordinal()
   *        .domain(d3.range(0, mainData.length))
   *        .rangeRoundBands([0, self.xScale.rangeBand()], 0.08);
   *    }
   *
   */
  _updateScale: function () {
    var self = this,
      _unionData = function () {
        return _.union(self._mainData, self._compData);
      },
      scaleData = _unionData(),
      vis = self._vis,
      scale,
      min;

    delete self.xScale;
    delete self.yScale;
    delete self.yZero;

    if (vis.hasOwnProperty('preUpdateScale')) {
      vis.preUpdateScale(self, scaleData, self._mainData, self._compData);
    }

    // Just in case preUpdateScale modified
    scaleData = _unionData();
    scale = _scales.xy(self, scaleData, self._xScaleType, self._yScaleType);

    self.xScale = scale.x;
    self.yScale = scale.y;

    min = self.yScale.domain()[0];
    self.yZero = (min > 0) ? self.yScale(min) : self.yScale(0);

    if (vis.hasOwnProperty('postUpdateScale')) {
      vis.postUpdateScale(self, scaleData, self._mainData, self._compData);
    }
  },

  /**
   * Create (Enter) the elements for the vis
   *
   * Required method
   *
   * Example implementation in vis type:
   *
   *    function enter(self, data, callbacks) {
   *      var foo = self._g.selectAll('g.foobar')
   *        .data(data);
   *      foo.enter().append('g')
   *        .attr('class', 'foobar');
   *      self.foo = foo;
   *    }
   */
  _enter: function (vis, storage, data, className) {
    var self = this,
      callbacks = {
        click: self._options.click,
        mouseover: self._options.mouseover,
        mouseout: self._options.mouseout
      };
    self._checkVisMethod(vis, 'enter');
    vis.enter(self, storage, className, data, callbacks);
  },

  /**
   * Update the elements opened by the select method
   *
   * Required method
   *
   * Example implementation in vis type:
   *
   *    function update(self, timing) {
   *      self.bars.transition().duration(timing)
   *        .attr('width', self.xScale2.rangeBand())
   *        .attr('height', function (d) {
   *          return self.yScale(d.y);
   *        });
   *    }
   */
  _update: function (vis, storage) {
    var self = this;
    self._checkVisMethod(vis, 'update');
    vis.update(self, storage, self._options.timing);
  },

  /**
   * Remove or transition out the elements that no longer have data
   *
   * Required method
   *
   * Example implementation in vis type:
   *
   *    function exit(self) {
   *      self.bars.exit().remove();
   *    }
   */
  _exit: function (vis, storage) {
    var self = this;
    self._checkVisMethod(vis, 'exit');
    vis.exit(self, storage, self._options.timing);
  },

  /**
   * Destroy the current vis type (transition to new type)
   *
   * Required method
   *
   * Example implementation in vis type:
   *
   *    function destroy(self, timing) {
   *      self.bars.transition().duration(timing)
   *        attr('height', 0);
   *      delete self.bars;
   *    }
   */
  _destroy: function (vis, storage) {
    var self = this;
    self._checkVisMethod(vis, 'destroy');
    try {
      vis.destroy(self, storage, self._options.timing);
    } catch (e) {}
  },

  /**
   * Draw the visualization
   */
  _draw: function () {
    var self = this,
      o = self._options,
      comp,
      compKeys;

    self._noData = _.flatten(_.pluck(self._mainData, 'data')
      .concat(_.pluck(self._compData, 'data'))).length === 0;

    self._updateScale();
    self._drawAxes();

    self._enter(self._vis, self._mainStorage, self._mainData, '.main');
    self._exit(self._vis, self._mainStorage);
    self._update(self._vis, self._mainStorage);

    comp = _.chain(self._compData).groupBy(function (d) {
      return d.type;
    });
    compKeys = comp.keys();

    // Find old comp vis items and remove any that no longer exist
    _.each(self._compStorage, function (d, key) {
      if (-1 === compKeys.indexOf(key).value()) {
        var vis = _vis[key];
        self._enter(vis, d, [], '.comp.' + key.replace(/\W+/g, ''));
        self._exit(vis, d);
      }
    });

    comp.each(function (d, key) {
      var vis = _vis[key], storage;
      if (!self._compStorage.hasOwnProperty(key)) {
        self._compStorage[key] = {};
      }
      storage = self._compStorage[key];
      self._enter(vis, storage, d, '.comp.' + key.replace(/\W+/g, ''));
      self._exit(vis, storage);
      self._update(vis, storage);
    });

    if (self._noData) {
      o.empty(self, self._selector, self._mainData);
    } else {
      o.notempty(self, self._selector);
    }
  },

  /**
   * Ensure drawing method exists
   */
  _checkVisMethod: function (vis, method) {
    var self = this;
    if (!vis[method]) {
      throw 'Required method "' + method + '" not found on vis type "' +
        self._type + '".';
    }
  }
});
