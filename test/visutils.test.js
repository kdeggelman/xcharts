(function () {
  var utils = xChart.visutils;

  describe('getInsertionPoint', function () {
    it('returns a selection range from 9 to n', function () {
      expect(utils.getInsertionPoint(8))
        .to.be('g[data-index="9"], g[data-index="8"]');

      expect(utils.getInsertionPoint(7))
        .to.be('g[data-index="9"], g[data-index="8"], g[data-index="7"]');
    });
  });

  describe('colorClass', function () {
    var el;
    beforeEach(function () {
      el = $('<div />')[0];
    });

    it('does not error on null class', function () {
      expect(utils.colorClass(el, 3)).to.be(' color3');
    });

    it('returns the original class with the new color', function () {
      el.className = 'foo';
      expect(utils.colorClass(el, 2)).to.be('foo color2');
    });

    it('removes any previous color classes', function () {
      el.className = 'color383 foo color1';
      expect(utils.colorClass(el, 3)).to.be(' foo  color3');
    });
  });

}());
