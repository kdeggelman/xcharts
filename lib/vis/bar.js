(function () {
  var zIndex = 2,
    selector = 'g.bar',
    insertBefore = _visutils.getInsertionPoint(zIndex);

  function postUpdateScale(self, scaleData, mainData, compData) {
    self.xScale2 = d3.scale.ordinal()
      .domain(d3.range(0, mainData.length))
      .rangeRoundBands([0, self.xScale.rangeBand()], 0.08);
  }

  function enter(self, storage, className, data, callbacks) {
    var barGroups, bars,
      yZero = self.yZero;

    barGroups = self._g.selectAll(selector + className)
      .data(data, function (d) {
        return d.className;
      });

    barGroups.enter().insert('g', insertBefore)
      .attr('data-index', zIndex)
      .style('opacity', 0)
      .attr('class', function (d, i) {
        var cl = _.uniq((className + d.className).split('.')).join(' ');
        return cl + ' bar ' + _visutils.colorClass(this, i);
      })
      .attr('transform', function (d, i) {
        return 'translate(' + self.xScale2(i) + ',0)';
      });

    bars = barGroups.selectAll('rect')
      .data(function (d) {
        return d.data;
      }, function (d) {
        return d.x;
      });

    bars.enter().append('rect')
      .attr('width', 0)
      .attr('rx', 3)
      .attr('ry', 3)
      .attr('x', function (d) {
        return self.xScale(d.x) + (self.xScale2.rangeBand() / 2);
      })
      .attr('height', function (d) {
        return Math.abs(yZero - self.yScale(d.y));
      })
      .attr('y', function (d) {
        return (d.y < 0) ? yZero : self.yScale(d.y);
      })
      .on('mouseover', callbacks.mouseover)
      .on('mouseout', callbacks.mouseout)
      .on('click', callbacks.click);

    storage.barGroups = barGroups;
    storage.bars = bars;
  }

  function update(self, storage, timing) {
    var yZero = self.yZero;

    storage.barGroups
      .attr('class', function (d, i) {
        return _visutils.colorClass(this, i);
      })
      .transition().duration(timing)
      .style('opacity', 1)
      .attr('transform', function (d, i) {
        return 'translate(' + self.xScale2(i) + ',0)';
      });

    storage.bars.transition().duration(timing)
      .attr('width', self.xScale2.rangeBand())
      .attr('x', function (d) {
        return self.xScale(d.x);
      })
      .attr('height', function (d) {
        return Math.abs(yZero - self.yScale(d.y));
      })
      .attr('y', function (d) {
        return (d.y < 0) ? yZero : self.yScale(d.y);
      });
  }

  function exit(self, storage, timing) {
    storage.bars.exit()
      .transition().duration(timing)
      .attr('width', 0)
      .remove();
    storage.barGroups.exit()
      .transition().duration(timing)
      .style('opacity', 0)
      .remove();
  }

  function destroy(self, storage, timing) {
    var band = (self.xScale2) ? self.xScale2.rangeBand() / 2 : 0;
    delete self.xScale2;
    storage.bars
      .transition().duration(timing)
      .attr('width', 0)
      .attr('x', function (d) {
        return self.xScale(d.x) + band;
      });
  }

  _vis.bar = {
    postUpdateScale: postUpdateScale,
    enter: enter,
    update: update,
    exit: exit,
    destroy: destroy
  };
}());
