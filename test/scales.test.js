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
      var s = scales.linear([10, 50], [0, 100], 'y');
      _testLinear(s);
    });

    it('extends the domain if only 1 value', function () {
      var s = scales.linear([10, 10], [0, 100], 'y');
      expect(s.domain()).to.be.eql([5, 15]);
      s = scales.linear([100, 100], [0, 100], 'y');
      expect(s.domain()).to.be.eql([88, 112], 'uses scaled padding');
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
      expect(s(10)).to.be.eql(7); // would be 2 on linear
      expect(s(100)).to.be.eql(31); // would be 20 on linear
      expect(s(400)).to.be.eql(77); // would be 80 on linear
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
      _testOrdinal(s.x);
      _testLinear(s.y);
    });
  });

}());
