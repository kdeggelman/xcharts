if (typeof define === 'function' && define.amd && typeof define.amd === 'object') {
  define(function () {
    return xChart;
  });
  return;
}

window.xChart = xChart;

}());
