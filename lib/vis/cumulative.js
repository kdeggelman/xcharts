(function () {
  var line = _vis['line-dotted'];

  function enter(self, storage, className, data, callbacks) {
    line.enter(self, storage, className, data, callbacks);
  }

  function _accumulate_data(data) {
    function reduce(memo, num) {
      return memo + num.y;
    }

    var nData = _.map(data, function (set) {
      var i = set.data.length,
        d = _.clone(set.data);
      set = _.clone(set);
      while (i) {
        i -= 1;
        // Need to clone here, otherwise we are actually setting the same
        // data onto the original data set.
        d[i] = _.clone(set.data[i]);
        d[i].y0 = set.data[i].y;
        d[i].y = _.reduce(_.first(set.data, i), reduce, set.data[i].y);
      }
      return _.extend(set, { data: d });
    });

    return nData;
  }

  function _resetData(self) {
    if (!self.hasOwnProperty('cumulativeOMainData')) {
      return;
    }
    self._mainData = self.cumulativeOMainData;
    delete self.cumulativeOMainData;
    self._compData = self.cumulativeOCompData;
    delete self.cumulativeOCompData;
  }

  function preUpdateScale(self, data) {
    _resetData(self);
    self.cumulativeOMainData = self._mainData;
    self._mainData = _accumulate_data(self._mainData);
    self.cumulativeOCompData = self._compData;
    self._compData = _accumulate_data(self._compData);
  }

  function destroy(self, storage, timing) {
    _resetData(self);
    line.destroy.apply(null, _.toArray(arguments));
  }

  _vis.cumulative = {
    preUpdateScale: preUpdateScale,
    enter: enter,
    update: line.update,
    exit: line.exit,
    destroy: destroy
  };
}());
