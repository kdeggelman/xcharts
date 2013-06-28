(function () {

  var scales = xChart.scales,
    data = [
      {
        label: 'foobar',
        data: [
          { x: new Date(2012, 1, 2), y: 50 },
          { x: new Date(2012, 1, 7), y: 20 }
        ],
        className: 'foobar'
      },
      {
        label: 'foobar',
        data: [
          { x: new Date(2012, 1, 2), y: 50 },
          { x: new Date(2012, 1, 4), y: 10 }
        ],
        className: 'foobar'
      }
    ];

  function _testOrdinal(s) {
    expect(s.domain()).to.be.eql([
      new Date(2012, 1, 2),
      new Date(2012, 1, 4),
      new Date(2012, 1, 7)
    ]);
    expect(s(new Date(2012, 1, 2))).to.be(9);
    expect(s.rangeBand()).to.be(23);
  }

  describe('Ordinal', function () {
    it('returns an ordinal scale', function () {
      var s = scales.ordinal(data, 'x', [0, 100]);
      _testOrdinal(s);
    });
  });

  function _testLinear(s) {
    expect(s.domain()).to.be.eql([0, 60],
      'pads by (min - (diff / 10)) then .nice()');
  }

  describe('Linear', function () {
    it('returns a linear scale', function () {
      var s = scales.linear([0, 60], [0, 100], 'y');
      _testLinear(s);
    });

    it('does not round values', function () {
      var s = scales.linear([1.1, 2.1], [0, 100], 'x');
      expect(s(1.4)).to.not.equal(s(1.1));
      expect(s(1.9)).to.not.equal(s(2.1));
    });
  });

  describe('Exponential', function () {
    it('returns an exponential scale', function () {
      var s = scales.exponential([0, 500], [0, 100], 'y');
      expect(s(10)).to.be.eql(8); // would be 2 on linear
      expect(s(100)).to.be.eql(35); // would be 20 on linear
      expect(s(400)).to.be.eql(86); // would be 80 on linear
    });
  });

  describe('Time', function () {
    // TODO: unused
  });

  describe('xy', function () {
    it('returns multiple types', function () {
      var foo = {
          _options: {
            axisPaddingLeft: 0,
            axisPaddingRight: 0
          },
          _width: 100,
          _height: 100
        },
        s = scales.xy(foo, data, 'ordinal', 'linear');
      window.a = s;
      _testOrdinal(s.x);
      _testLinear(s.y);
    });

    it('uses xMin, xMax, yMin, and yMax in options', function () {
      var foo = {
          _options: {
            xMin: -1,
            xMax: 20,
            yMin: 10,
            yMax: 40
          },
          _width: 100,
          _height: 100
        },
        data = [
          { data: [ { x: 1, y: 50 }, { x: 1, y: 20 } ] },
          { data: [ { x: 2, y: 50 }, { x: 2, y: 10 } ] }
        ],
        sOrdinal,
        sLinear,
        sTime,
        zeroMins;

      sOrdinal = scales.xy(foo, data, 'ordinal', 'ordinal');
      expect(sOrdinal.x.domain()).to.eql([1, 2]);
      expect(sOrdinal.y.domain()).to.eql([10, 20, 50]);

      sLinear = scales.xy(foo, data, 'linear', 'linear');
      expect(sLinear.x.domain()).to.eql([foo._options.xMin, foo._options.xMax]);
      expect(sLinear.y.domain()).to.eql([foo._options.yMin, foo._options.yMax]);

      zeroMins = {
        _options: {
          xMin: 0,
          xMax: 20,
          yMin: 0,
          yMax: 40
        },
        _width: 100,
        _height: 100
      };
      sLinear = scales.xy(zeroMins, data, 'linear', 'linear');
      expect(sLinear.x.domain()).to.eql([zeroMins._options.xMin,
        zeroMins._options.xMax]);
      expect(sLinear.y.domain()).to.eql([zeroMins._options.yMin,
        zeroMins._options.yMax]);

      foo._options = {
        xMin: new Date(2012, 1, 1),
        xMax: new Date(2012, 10, 1),
        yMin: new Date(2012, 2, 1),
        yMax: new Date(2012, 11, 1)
      };
      data = [
        { data: [ { x: new Date(), y: new Date() },
          { x: new Date(), y: new Date() } ] },
        { data: [ { x: new Date(), y: new Date() },
          { x: new Date(), y: new Date() } ] }
      ];
      sTime = scales.xy(foo, data, 'time', 'time');
      expect(sTime.x.domain()).to.eql([foo._options.xMin, foo._options.xMax]);
      expect(sTime.y.domain()).to.eql([foo._options.yMin, foo._options.yMax]);
    });
  });

}());
