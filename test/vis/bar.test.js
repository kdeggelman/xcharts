(function () {

  var bar = xChart.getVis('bar'),
    container = '#chart',
    mData = {
      main: [{
        label: 'Foobar',
        data: [
          { x: 1, y: -1 },
          { x: 2, y: 2 }
        ],
        className: 'foo_bar'
      }],
      xScale: 'ordinal',
      yScale: 'linear'
    };

  beforeEach(function () {
    $('#scratch').find(container).remove().end()
      .append('<div id="chart" style="height: 100px" />');
  });

  describe('postUpdateScale()', function () {
    it('creates self.xScale2', function () {
      var self = {
        xScale: d3.scale.ordinal([0, 1]).rangeRoundBands([0, 100], 0.25)
      };

      bar.postUpdateScale(self, null, [0, 1], null);
      expect(self.xScale2.domain()).to.be.eql([0, 1]);
      expect(self.xScale2.rangeBand()).to.be(132);
    });
  });

  describe('enter()', function () {
    var chart;

    before(function () {
      chart = new xChart('bar', mData, container);
    });

    it('creates storage.barGroups', function () {
      expect(chart._mainStorage.barGroups).to.not.be(undefined);
    });

    it('creates storage.bars', function () {
      expect(chart._mainStorage.bars).to.not.be(undefined);
    });

    it('adds attribute data-index="2"', function () {
      var g = chart._g.select('g.bar');
      expect(g.attr('data-index')).to.be('2');
    });

    it('draws below and above yZero', function () {
      var first = chart._g.select('rect:first-child'),
        last = chart._g.select('rect:last-child');
      expect(first.attr('height')).to.be('15');
      expect(first.attr('y')).to.be(chart.yZero.toString());
      expect(last.attr('height')).to.be('30');
      expect(last.attr('y')).to.be((chart.yZero - 30).toString());
    });

    it('adds event listeners to rects', function () {
      var first = chart._g.select('rect:first-child');
      expect(first.on('mouseover')).to.be.a('function');
      expect(first.on('mouseout')).to.be.a('function');
      expect(first.on('click')).to.be.a('function');
    });
  });

  describe('update()', function () {
    var chart;

    before(function () {
      chart = new xChart('bar', mData, container);
      chart.setData(mData = {
        main: [{
          label: 'Foobar',
          data: [
            { x: 1, y: -1 },
            { x: 2, y: 2 },
            { x: 3, y: 2 },
            { x: 4, y: -1 }
          ],
          className: 'foo_bar'
        }],
        xScale: 'ordinal',
        yScale: 'linear'
      });
    });

    it('draws below and above yZero', function () {
      var first = chart._g.select('rect:nth-child(2)'),
        last = chart._g.select('rect:nth-child(3)');
      expect(first.attr('height')).to.be('30');
      expect(first.attr('y')).to.be('15');
      expect(last.attr('height')).to.be('30');
      expect(last.attr('y')).to.be((chart.yZero - 30).toString());
    });
  });

  describe('exit()', function () {
    // TODO
  });

  describe('destroy()', function () {
    // TODO
  });
}());
