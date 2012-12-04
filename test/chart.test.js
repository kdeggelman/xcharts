(function () {
  function cleanup() {
    $('#scratch').find('#chart').remove().end().append('<div id="chart" />');
  }

  var container = '#chart',
    mData = {
      main: [{
        label: 'Foobar',
        data: [
          { x: 1, y: 1 },
          { x: 2, y: 2 }
        ],
        className: 'foo_bar'
      }],
      xScale: 'ordinal',
      yScale: 'linear'
    };

  describe('Public API', function () {

    beforeEach(cleanup);
    afterEach(cleanup);

    describe('new xChart()', function () {
      it('throws on bad type argument', function () {
        expect(function () {
          var c = new xChart('foo', mData, container);
        }).to.throwException(/Vis type "foo" is not defined/);
      });

      it('requires data', function () {
        expect(function () {
          var c = new xChart('bar', {}, container);
        }).to.throwException(/No "main" key found in given chart data/);
      });

      it('has default options', function () {
        var c = new xChart('bar', mData, container);
        expect(c._options).to.eql({
          // expect eql fails on separate function definitions
          mouseover: c._options.mouseover,
          mouseout: c._options.mouseout,
          click: c._options.click,
          tickFormatX: c._options.tickFormatX,
          tickFormatY: c._options.tickFormatY,
          dataFormatX: c._options.dataFormatX,
          dataFormatY: c._options.dataFormatY,
          unsupported: c._options.unsupported,
          empty: c._options.empty,
          notempty: c._options.notempty,
          // on with the rest
          axisPaddingTop: 0,
          axisPaddingRight: 0,
          axisPaddingBottom: 5,
          axisPaddingLeft: 20,
          paddingTop: 0,
          paddingRight: 0,
          paddingBottom: 20,
          paddingLeft: 60,
          tickHintX: 10,
          tickHintY: 10,
          timing: 750,
          interpolation: 'monotone'
        });
      });

      it('allows overriding with options argument', function () {
        var c = new xChart('bar', mData, container, {
          paddingLeft: 0,
          interpolation: 'cardinal'
        });

        expect(c._options.paddingLeft).to.be(0);
        expect(c._options.interpolation).to.be('cardinal');
        expect(c._options.tickHintX).to.be(10);
      });

      it('creates an svg element', function () {
        $('#chart').width(40).height(40);
        var c = new xChart('bar', mData, container, {
            paddingLeft: 14,
            paddingTop: 12
          }),
          svg = $(container + ' svg');

        expect(svg.length).to.be(1);
        expect(parseInt(svg.attr('width'), 10)).to.be(40);
        expect(parseInt(svg.attr('height'), 10)).to.be(40);
        expect(svg.attr('class')).to.be('xchart');

        expect($('g', svg).attr('transform')).to.be('translate(14,12)');

        expect(c._vis).to.not.be(undefined);
      });

      it('adds event listener to window resize event', function () {
        var c = new xChart('bar', mData, container);
        expect(d3.select(window).on('resize')).to.be.a('function');
      });

      it('data vis type is not overridden by type argument', function () {
        var d = _.extend({}, mData, { type: 'line' }),
          c = new xChart('bar', d, container);
        expect(c._type).to.be('line');
      });
    });

    describe('callback options', function () {
      describe('unsupported', function () {
        it('is called if svg is not supported', function () {
          var i = 0,
            o = document.createElementNS,
            c;

          // temporarily override the method that returns the ability to
          // create an svg rect element
          document.createElementNS = function () {
            return {};
          };
          c = new xChart('bar', mData, container, {
            unsupported: function (selector) {
              i = 1;
              expect(selector).to.be(container);
            }
          });

          // !important: reset createElementNS before possible failure
          document.createElementNS = o;
          expect(i).to.be(1);
        });
      });

      describe('empty', function () {
        it('is called if there is no data', function () {
          var i = 0,
            c = new xChart('bar', {
              main: [{
                label: 'Foobar',
                data: [],
                className: 'foo_bar'
              }],
              xScale: 'ordinal',
              yScale: 'linear'
            },
              container,
              {
                empty: function (self, selector, d) {
                  i = 1;
                  // Passes the data to the callback
                  expect(selector).to.be(container);
                  expect(d[0].label).to.be('Foobar');
                  expect(d[0].className).to.be('foo_bar');
                }
              });
          expect(i).to.be(1);
        });
      });

      describe('notempty', function () {
        it('`notempty` option called if there is data', function () {
          var i = 0,
            c = new xChart('bar', mData, container, {
              notempty: function (self, selector) {
                i = 1;
                expect(selector).to.be(container);
              }
            });
          expect(i).to.be(1);

          i = 0;
          c = new xChart('bar', {
            main: [{
              label: 'Foobar',
              data: [],
              className: 'foo_bar'
            }],
            comp: [{
              label: 'blah',
              type: 'line',
              data: mData.main[0].data,
              className: 'blah'
            }],
            xScale: 'ordinal',
            yScale: 'linear'
          }, container, {
            notempty: function (self, selector) {
              i = 1;
            }
          });
          expect(i).to.be(1);
        });
      });
    });

    describe('setData(data)', function () {
      it('sorts the input data by x-value', function () {
        var data = {
            main: [{
              label: 'Foobar',
              data: [
                { x: 2, y: 3 },
                { x: 3, y: 2 },
                { x: 1, y: 4 },
                { x: 0, y: 1 },
              ],
              className: 'foo_bar'
            }],
            xScale: 'ordinal',
            yScale: 'linear',
            comp: [{
              label: 'Foobar',
              data: [
                { x: 2, y: 3 },
                { x: 1, y: 2 },
                { x: 3, y: 4 },
                { x: 0, y: 1 },
              ],
              type: 'line',
              className: 'foo_bar'
            }],
          },
          c = new xChart('bar', data, container);

        expect(c._mainData[0].data[0]).to.be.eql({ x: 0, y: 1 });
        expect(c._mainData[0].data[1]).to.be.eql({ x: 1, y: 4 });
        expect(c._mainData[0].data[2]).to.be.eql({ x: 2, y: 3 });
        expect(c._mainData[0].data[3]).to.be.eql({ x: 3, y: 2 });

        expect(c._compData[0].data[0]).to.be.eql({ x: 0, y: 1 });
        expect(c._compData[0].data[1]).to.be.eql({ x: 1, y: 2 });
        expect(c._compData[0].data[2]).to.be.eql({ x: 2, y: 3 });
        expect(c._compData[0].data[3]).to.be.eql({ x: 3, y: 4 });
      });

      it('sets compData to an empty array if not provided', function () {
        var c = new xChart('bar', mData, container);
        expect(c._compData).to.be.eql([]);
      });

      it('pre-formats data from options', function () {
        var c = new xChart('bar', mData, container, {
          dataFormatX: function (x) {
            return x + 'taco';
          },
          dataFormatY: function (y) {
            return y * 10;
          }
        });

        expect(c._mainData[0].data[0]).to.be.eql({ x: '1taco', y: 10 });
        expect(c._mainData[0].data[1]).to.be.eql({ x: '2taco', y: 20 });
      });
    });

    describe('setType(type)', function () {
      it('throws on undefined type', function () {
        var chart = new xChart('bar', mData, container);
        expect(function () {
          chart.setType('foobar');
        }).to.throwException(/Vis type "foobar" is not defined/);
      });

      it('updates the chart type', function () {
        var chart = new xChart('line', mData, container);
        chart.setType('bar');
        expect(chart._type).to.be('bar');
      });

      it('redraws the chart', function () {
        var chart = new xChart('line', mData, container),
          count = 0;

        chart._draw = function () {
          count += 1;
        };

        chart.setType('bar');
        expect(count).to.be(1);
      });
    });

    describe('setScale(axis, type)', function () {
      var chart;

      beforeEach(function () {
        chart = new xChart('bar', mData, container);
      });

      it('updates the correct axis', function () {
        chart.setScale('y', 'exponential');
        expect(chart._yScaleType).to.be('exponential');
      });

      it('redraws the chart', function () {
        var count = 0;
        chart._draw = function () {
          count += 1;
        };
        chart.setScale('y', 'exponential');
        expect(count).to.be(1);
      });

      it('throws on unknown axis', function () {
        expect(function () {
          chart.setScale('tacos', 'burritos');
        }).to.throwException(/Cannot change scale of unknown axis/);
      });
    });

  });

  describe('xChart methods', function () {
    describe('xChart.getVis(name)', function () {
      var chart;

      beforeEach(function () {
        chart = new xChart('line', mData, container);
      });

      it('throws if the vis type does not exist', function () {
        expect(function () {
          xChart.getVis('foobar');
        }).to.throwException(/Vis type "foobar" does not exist/);
      });
    });

    describe('xChart.setVis(name, vis)', function () {
      var chart;

      beforeEach(function () {
        chart = new xChart('line', mData, container);
      });

      it('allows you to add a vis', function () {
        var vis = {
          enter: function () {},
          update: function () {},
          exit: function () {},
          destroy: function () {},
        };
        xChart.setVis('tacos', vis);
        // This should throw, if 'tacos' is not a vis type
        chart.setType('tacos');
      });

      it('throws if you try to override a default', function () {
        expect(function () {
          xChart.setVis('line', {});
        }).to.throwException(/Cannot override vis type "line"\./);
      });
    });
  });

  describe('_draw()', function () {
    var chart;

    function _checkxChartMethod(method) {
      return function () {
        expect(function () {
          chart['_' + method]({});
        }).to.throwException(/Required method/);
      };
    }

    function _callxChartMethod(method) {
      return function () {
        var count = 0,
          foo = {};
        foo[method] = function () { count += 1; };
        chart['_' + method](foo);
        expect(count).to.be(1);
      };
    }

    beforeEach(function () {
      cleanup();
      chart = new xChart('bar', mData, container);
    });
    afterEach(cleanup);

    describe('_updateScale()', function () {
      it('sets xScale, yScale, and yZero', function () {
        delete chart.xScale;
        delete chart.yScale;
        delete chart.yZero;
        chart._updateScale();
        expect(chart.xScale).to.not.be(null);
        expect(chart.yScale).to.not.be(null);
        expect(chart.yZero).to.not.be(null);
      });

      it('finds scale from both main and comp data', function () {
        var data = {
          main: [{
            label: 'Foobar',
            data: [
              { x: 1, y: 1 },
              { x: 2, y: 2 }
            ],
            className: 'foo_bar'
          }],
          xScale: 'ordinal',
          yScale: 'linear',
          comp: [{
            label: 'blah',
            data: [
              { x: 6, y: 5 }
            ],
            type: 'line',
            className: 'blah'
          }]
        };
        chart = new xChart('bar', data, container);
        // NOTE: yScale is padded
        expect(chart.yScale.domain()[0]).to.be(0);
        expect(chart.yScale.domain()[1]).to.be(6);
        expect(chart.xScale.domain()).to.be.eql([1, 2, 6]);
      });

      it('calls preUpdateScale() if set', function () {
        var o = chart._vis.preUpdateScale,
          count = 0;
        chart._vis.preUpdateScale = function () {
          count = _.toArray(arguments).length;
        };
        chart._updateScale();
        expect(count).to.be(4);
        if (o) {
          chart._vis.preUpdateScale = o;
        } else {
          delete chart._vis.preUpdateScale;
        }
      });

      it('calls postUpdateScale() if set', function () {
        var o = chart._vis.postUpdateScale,
          count = 0;
        chart._vis.postUpdateScale = function () {
          count = _.toArray(arguments).length;
        };
        chart._updateScale();
        expect(count).to.be(4);
        if (o) {
          chart._vis.postUpdateScale = o;
        } else {
          delete chart._vis.postUpdateScale;
        }
      });
    });

    describe('_drawAxes()', function () {
      it('formats the ticks according to options', function () {
        var c = new xChart('bar', mData, container, {
          tickFormatX: function (x) {
            return x + 'taco';
          },
          tickFormatY: function (y) {
            return y + 'burrito';
          }
        });

        d3.selectAll('#chart .axisX text').each(function (d) {
          expect((/^\d+taco$/).test(d3.select(this).text())).to.be(true);
        });
        d3.selectAll('#chart .axisY text').each(function (d) {
          expect((/\d+burrito$/).test(d3.select(this).text())).to.be(true);
        });
      });
    });

    describe('_enter()', function () {
      it('checks chart method', _checkxChartMethod('enter'));
      it('calls chart method', _callxChartMethod('enter'));
    });

    describe('_update()', function () {
      it('checks chart method', _checkxChartMethod('update'));
      it('calls chart method', _callxChartMethod('update'));
    });

    describe('_exit()', function () {
      it('checks chart method', _checkxChartMethod('exit'));
      it('calls chart method', _callxChartMethod('exit'));
    });

    describe('_destroy()', function () {
      it('checks chart method', _checkxChartMethod('destroy'));
      it('calls chart method', _callxChartMethod('destroy'));
    });
  });

  describe('_resize()', function () {
    var chart;

    beforeEach(function () {
      chart = new xChart('bar', mData, container);
    });

    it('sets the svg size', function () {
      var count = 0;
      chart._drawSvg = function () {
        count += 1;
      };
      chart._resize();
      expect(count).to.be(1);
    });

    it('redraws', function () {
      var count = 0;
      chart._draw = function () {
        count += 1;
      };
      chart._resize();
      expect(count).to.be(1);
    });
  });
}());
