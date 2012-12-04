({
  baseUrl: "../lib",
  optimize: "none",
  name: "../node_modules/almond/almond",
  include: ["chart"],
  out: "../build/xcharts.js",
  paths: {
    lodash: "../node_modules/lodash/lodash.min"
  },
  wrap: {
    startFile: "../scripts/wrap-start.js",
    endFile: "../scripts/wrap-end.js"
  }
})
