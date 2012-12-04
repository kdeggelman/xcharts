(function () {
  var line = _vis.line;

  function enter(self, storage, className, data, callbacks) {
    var circles;

    line.enter(self, storage, className, data, callbacks);

    circles = storage.lineContainers.selectAll('circle')
      .data(function (d) {
        return d.data;
      }, function (d) {
        return d.x;
      });

    circles.enter().append('circle')
      .style('opacity', 0)
      .attr('cx', storage.lineX)
      .attr('cy', storage.lineY)
      .attr('r', 5)
      .on('mouseover', callbacks.mouseover)
      .on('mouseout', callbacks.mouseout)
      .on('click', callbacks.click);

    storage.lineCircles = circles;
  }

  function update(self, storage, timing) {
    line.update.apply(null, _.toArray(arguments));

    storage.lineCircles.transition().duration(timing)
      .style('opacity', 1)
      .attr('cx', storage.lineX)
      .attr('cy', storage.lineY);
  }

  function exit(self, storage) {
    storage.lineCircles.exit()
      .remove();
    line.exit.apply(null, _.toArray(arguments));
  }

  function destroy(self, storage, timing) {
    line.destroy.apply(null, _.toArray(arguments));
    if (!storage.lineCircles) {
      return;
    }
    storage.lineCircles.transition().duration(timing)
      .style('opacity', 0);
  }

  _vis['line-dotted'] = {
    enter: enter,
    update: update,
    exit: exit,
    destroy: destroy
  };
}());
