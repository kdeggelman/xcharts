require(['../build/xcharts.js'], function (xChart) {
  var data = {
      "main": [
        {
          "label": "Foo",
          "data": [
            {
              "x": "2012-08-09T07:00:00",
              "y": 68
            },
            {
              "x": "2012-08-10T07:00:00",
              "y": 295
            },
            {
              "x": "2012-08-11T07:00:00",
              "y": 339
            },
          ],
          "className": ".foo"
        }
      ],
      "xScale": "ordinal",
      "yScale": "linear",
      "comp": [
        {
          "label": "Foo Target",
          "data": [
            {
              "x": "2012-08-09T07:00:00",
              "y": 288
            },
            {
              "x": "2012-08-10T07:00:00",
              "y": 407
            },
            {
              "x": "2012-08-11T07:00:00",
              "y": 459
            }
          ],
          "className": ".comp.comp_foo",
          "type": "line"
        }
      ]
    },
    chart = new xChart('bar', data, '#myChart');
});
