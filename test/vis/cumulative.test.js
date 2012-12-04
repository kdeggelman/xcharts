(function () {
  var container = '#chart',
    mData = {
      main: [{
        label: 'Foobar',
        data: [
          { x: 1, y: 1 },
          { x: 2, y: 2 },
          { x: 3, y: 3 }
        ],
        className: 'foo_line'
      }],
      xScale: 'ordinal',
      yScale: 'linear',
      comp: [{
        label: 'barfoo',
        data: [
          { x: 1, y: 2 },
          { x: 2, y: 3 }
        ],
        className: 'bar_line',
        type: 'line'
      }]
    };

  beforeEach(function () {
    $('#scratch').find(container).remove().end()
      .append('<div id="chart" style="height: 100px; width: 100px;" />');
  });

  describe('preUpdateScale()', function () {
    var chart;

    before(function () {
      $('#scratch').find(container).remove().end()
        .append('<div id="chart" style="height: 100px; width: 100px;" />');
      chart = new xChart('cumulative', mData, container);
    });

    it('backs up original data', function () {
      expect(chart.cumulativeOMainData[0].data[1].y).to.be(2);
      expect(chart.cumulativeOMainData[0].data[2].y).to.be(3);
      expect(chart.cumulativeOCompData[0].data[1].y).to.be(3);
    });

    it('accumulates y-values', function () {
      expect(chart._mainData[0].data[1].y).to.be(3);
      expect(chart._mainData[0].data[2].y).to.be(6);
      expect(chart._compData[0].data[1].y).to.be(5);
    });

    it('preserves original data on .y0', function () {
      expect(chart._mainData[0].data[1].y0).to.be(2);
      expect(chart._mainData[0].data[2].y0).to.be(3);
      expect(chart._compData[0].data[1].y0).to.be(3);
    });
  });

  describe('destroy()', function () {
    var chart;

    before(function () {
      $('#scratch').find(container).remove().end()
        .append('<div id="chart" style="height: 100px; width: 100px;" />');
      chart = new xChart('cumulative', mData, container);
    });

    it('deletes self.cumulativeOMainData and self.cumulativeOCompData',
      function () {
        chart._destroy(chart._vis, chart._mainStorage);
        expect(chart.hasOwnProperty('cumulativeOMainData')).to.be(false);
        expect(chart.hasOwnProperty('cumulativeOCompData')).to.be(false);
      });

    it('resets original data', function () {
      expect(chart._mainData[0].data[1].y).to.be(2);
      expect(chart._mainData[0].data[2].y).to.be(3);
      expect(chart._compData[0].data[1].y).to.be(3);
    });
  });
}());
