(function () {

  var zIndex = 3,
    selector = 'g.line',
    insertBefore = _visutils.getInsertionPoint(zIndex);

  function enter(self, storage, className, data, callbacks) {
    var inter = self._options.interpolation,
      x = function (d, i) {
        if (!self.xScale2 && !self.xScale.rangeBand) {
          return self.xScale(new Date(d.x));
        }
        return self.xScale(d.x) + (self.xScale.rangeBand() / 2);
      },
      y = function (d) { return self.yScale(d.y); },
      line = d3.svg.line()
        .x(x)
        .interpolate(inter),
      area = d3.svg.area()
        .x(x)
        .y1(self.yZero)
        .interpolate(inter),
      container,
      fills,
      paths;

    function datum(d) {
      return [d.data];
    }

    container = self._g.selectAll(selector + className)
      .data(data, function (d) {
        return d.className;
      });

    container.enter().insert('g', insertBefore)
      .attr('data-index', zIndex)
      .attr('class', function (d, i) {
        var cl = _.uniq((className + d.className).split('.')).join(' ');
        return cl + ' line ' + _visutils.colorClass(this, i);
      });

    fills = container.selectAll('path.fill')
      .data(datum);

    fills.enter().append('path')
      .attr('class', 'fill')
      .style('opacity', 0)
      .attr('d', area.y0(y));

    paths = container.selectAll('path.line')
      .data(datum);

    paths.enter().append('path')
      .attr('class', 'line')
      .style('opacity', 0)
      .attr('d', line.y(y));

    storage.lineContainers = container;
    storage.lineFills = fills;
    storage.linePaths = paths;
    storage.lineX = x;
    storage.lineY = y;
    storage.lineA = area;
    storage.line = line;
  }

  function update(self, storage, timing) {
    storage.lineContainers
      .attr('class', function (d, i) {
        return _visutils.colorClass(this, i);
      });

    storage.lineFills.transition().duration(timing)
      .style('opacity', 1)
      .attr('d', storage.lineA.y0(storage.lineY));

    storage.linePaths.transition().duration(timing)
      .style('opacity', 1)
      .attr('d', storage.line.y(storage.lineY));
  }

  function exit(self, storage) {
    storage.linePaths.exit()
      .style('opacity', 0)
      .remove();
    storage.lineFills.exit()
      .style('opacity', 0)
      .remove();

    storage.lineContainers.exit()
      .remove();
  }

  function destroy(self, storage, timing) {
    storage.linePaths.transition().duration(timing)
      .style('opacity', 0);
    storage.lineFills.transition().duration(timing)
      .style('opacity', 0);
  }

  _vis.line = {
    enter: enter,
    update: update,
    exit: exit,
    destroy: destroy
  };
}());
