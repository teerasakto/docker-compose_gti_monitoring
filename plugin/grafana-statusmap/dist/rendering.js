'use strict';

System.register(['lodash', 'jquery', 'moment', 'app/core/utils/kbn', 'app/core/core', 'app/core/utils/ticks', 'd3', './libs/d3-scale-chromatic/index', './tooltip'], function (_export, _context) {
  "use strict";

  var _, $, moment, kbn, appEvents, contextSrv, tickStep, getScaledDecimals, getFlotTickSize, d3, d3ScaleChromatic, StatusHeatmapTooltip, MIN_CARD_SIZE, CARD_H_SPACING, CARD_V_SPACING, CARD_ROUND, DATA_RANGE_WIDING_FACTOR, DEFAULT_X_TICK_SIZE_PX, DEFAULT_Y_TICK_SIZE_PX, X_AXIS_TICK_PADDING, Y_AXIS_TICK_PADDING, MIN_SELECTION_WIDTH;

  function link(scope, elem, attrs, ctrl) {
    var data = void 0,
        cardsData = void 0,
        timeRange = void 0,
        panel = void 0,
        heatmap = void 0;

    // $heatmap is JQuery object, but heatmap is D3
    var $heatmap = elem.find('.status-heatmap-panel');
    var tooltip = new StatusHeatmapTooltip($heatmap, scope);

    var width = void 0,
        height = void 0,
        yScale = void 0,
        xScale = void 0,
        chartWidth = void 0,
        chartHeight = void 0,
        chartTop = void 0,
        chartBottom = void 0,
        yAxisWidth = void 0,
        xAxisHeight = void 0,
        cardVSpacing = void 0,
        cardHSpacing = void 0,
        cardRound = void 0,
        cardWidth = void 0,
        cardHeight = void 0,
        colorScale = void 0,
        opacityScale = void 0,
        mouseUpHandler = void 0,
        xGridSize = void 0,
        yGridSize = void 0;

    var yOffset = 0;

    var selection = {
      active: false,
      x1: -1,
      x2: -1
    };

    var padding = { left: 0, right: 0, top: 0, bottom: 0 },
        margin = { left: 25, right: 15, top: 10, bottom: 20 },
        dataRangeWidingFactor = DATA_RANGE_WIDING_FACTOR;

    ctrl.events.on('render', function () {
      render();
    });

    function setElementHeight() {
      try {
        var height = ctrl.height || panel.height || ctrl.row.height;
        if (_.isString(height)) {
          height = parseInt(height.replace('px', ''), 10);
        }

        height -= panel.legend.show ? 32 : 10; // bottom padding and space for legend. Change margin in .status-heatmap-color-legend !

        $heatmap.css('height', height + 'px');

        return true;
      } catch (e) {
        // IE throws errors sometimes
        return false;
      }
    }

    function getYAxisWidth(elem) {
      var axis_text = elem.selectAll(".axis-y text").nodes();
      var max_text_width = _.max(_.map(axis_text, function (text) {
        // Use SVG getBBox method
        return text.getBBox().width;
      }));

      return max_text_width;
    }

    function getXAxisHeight(elem) {
      var axis_line = elem.select(".axis-x line");
      if (!axis_line.empty()) {
        var axis_line_position = parseFloat(elem.select(".axis-x line").attr("y2"));
        var canvas_width = parseFloat(elem.attr("height"));
        return canvas_width - axis_line_position;
      } else {
        // Default height
        return 30;
      }
    }

    function addXAxis() {
      // Scale timestamps to cards centers
      scope.xScale = xScale = d3.scaleTime().domain([timeRange.from, timeRange.to]).range([xGridSize / 2, chartWidth - xGridSize / 2]);

      var ticks = chartWidth / DEFAULT_X_TICK_SIZE_PX;
      var grafanaTimeFormatter = grafanaTimeFormat(ticks, timeRange.from, timeRange.to);
      var timeFormat = void 0;
      var dashboardTimeZone = ctrl.dashboard.getTimezone();
      if (dashboardTimeZone === 'utc') {
        timeFormat = d3.utcFormat(grafanaTimeFormatter);
      } else {
        timeFormat = d3.timeFormat(grafanaTimeFormatter);
      }

      var xAxis = d3.axisBottom(xScale).ticks(ticks).tickFormat(timeFormat).tickPadding(X_AXIS_TICK_PADDING).tickSize(chartHeight);

      var posY = chartTop;
      var posX = yAxisWidth;

      heatmap.append("g").attr("class", "axis axis-x").attr("transform", "translate(" + posX + "," + posY + ")").call(xAxis);

      // Remove horizontal line in the top of axis labels (called domain in d3)
      heatmap.select(".axis-x").select(".domain").remove();
    }

    // divide chart height by ticks for cards drawing
    function getYScale(ticks) {
      var range = [];
      var step = chartHeight / ticks.length;
      // svg has y=0 on the top, so top card should have a minimal value in range
      range.push(step);
      for (var i = 1; i < ticks.length; i++) {
        range.push(step * (i + 1));
      }
      return d3.scaleOrdinal().domain(ticks).range(range);
    }

    // divide chart height by ticks with offset for ticks drawing
    function getYAxisScale(ticks) {
      var range = [];
      var step = chartHeight / ticks.length;
      // svg has y=0 on the top, so top tick should have a minimal value in range
      range.push(yOffset);
      for (var i = 1; i < ticks.length; i++) {
        range.push(step * i + yOffset);
      }
      return d3.scaleOrdinal().domain(ticks).range(range);
    }

    function addYAxis() {
      var ticks = _.uniq(_.map(data, function (d) {
        return d.target;
      }));

      // Set default Y min and max if no data
      if (_.isEmpty(data)) {
        ticks = [''];
      }

      if (panel.yAxisSort == 'a → z') {
        ticks.sort(function (a, b) {
          return a.localeCompare(b, 'en', { ignorePunctuation: false, numeric: true });
        });
      } else if (panel.yAxisSort == 'z → a') {
        ticks.sort(function (b, a) {
          return a.localeCompare(b, 'en', { ignorePunctuation: false, numeric: true });
        });
      }

      var yAxisScale = getYAxisScale(ticks);
      scope.yScale = yScale = getYScale(ticks);

      var yAxis = d3.axisLeft(yAxisScale).tickValues(ticks).tickSizeInner(0 - width).tickPadding(Y_AXIS_TICK_PADDING);

      heatmap.append("g").attr("class", "axis axis-y").call(yAxis);

      // Calculate Y axis width first, then move axis into visible area
      var posY = margin.top;
      var posX = getYAxisWidth(heatmap) + Y_AXIS_TICK_PADDING;
      heatmap.select(".axis-y").attr("transform", "translate(" + posX + "," + posY + ")");

      // Remove vertical line in the right of axis labels (called domain in d3)
      heatmap.select(".axis-y").select(".domain").remove();
      heatmap.select(".axis-y").selectAll(".tick line").remove();
    }

    // Wide Y values range and adjust to bucket size
    function wideYAxisRange(min, max, tickInterval) {
      var y_widing = (max * (dataRangeWidingFactor - 1) - min * (dataRangeWidingFactor - 1)) / 2;
      var y_min = void 0,
          y_max = void 0;

      if (tickInterval === 0) {
        y_max = max * dataRangeWidingFactor;
        y_min = min - min * (dataRangeWidingFactor - 1);
        tickInterval = (y_max - y_min) / 2;
      } else {
        y_max = Math.ceil((max + y_widing) / tickInterval) * tickInterval;
        y_min = Math.floor((min - y_widing) / tickInterval) * tickInterval;
      }

      // Don't wide axis below 0 if all values are positive
      if (min >= 0 && y_min < 0) {
        y_min = 0;
      }

      return { y_min: y_min, y_max: y_max };
    }

    function tickValueFormatter(decimals) {
      var scaledDecimals = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

      var format = panel.yAxis.format;
      return function (value) {
        return kbn.valueFormats[format](value, decimals, scaledDecimals);
      };
    }

    // Create svg element, add axes and
    // calculate sizes for cards drawing
    function addHeatmapCanvas() {
      var heatmap_elem = $heatmap[0];

      width = Math.floor($heatmap.width()) - padding.right;
      height = Math.floor($heatmap.height()) - padding.bottom;

      if (heatmap) {
        heatmap.remove();
      }

      heatmap = d3.select(heatmap_elem).append("svg").attr("width", width).attr("height", height);

      chartHeight = height - margin.top - margin.bottom;
      chartTop = margin.top;
      chartBottom = chartTop + chartHeight;

      cardHSpacing = panel.cards.cardHSpacing !== null ? panel.cards.cardHSpacing : CARD_H_SPACING;
      cardVSpacing = panel.cards.cardVSpacing !== null ? panel.cards.cardVSpacing : CARD_V_SPACING;
      cardRound = panel.cards.cardRound !== null ? panel.cards.cardRound : CARD_ROUND;

      // calculate yOffset for YAxis
      yGridSize = Math.floor(chartHeight / cardsData.yBucketSize);
      cardHeight = yGridSize ? yGridSize - cardVSpacing : 0;
      yOffset = cardHeight / 2;

      addYAxis();

      yAxisWidth = getYAxisWidth(heatmap) + Y_AXIS_TICK_PADDING;
      chartWidth = width - yAxisWidth - margin.right;

      // we need to fill chartWidth with xBucketSize cards.
      xGridSize = chartWidth / (cardsData.xBucketSize + 1);
      cardWidth = xGridSize - cardHSpacing;

      addXAxis();
      xAxisHeight = getXAxisHeight(heatmap);

      if (!panel.yAxis.show) {
        heatmap.select(".axis-y").selectAll("line").style("opacity", 0);
      }

      if (!panel.xAxis.show) {
        heatmap.select(".axis-x").selectAll("line").style("opacity", 0);
      }
    }

    function addHeatmap() {
      addHeatmapCanvas();

      var maxValue = panel.color.max || cardsData.maxValue;
      var minValue = panel.color.min || cardsData.minValue;

      if (panel.color.mode !== 'discrete') {
        colorScale = getColorScale(maxValue, minValue);
      }
      setOpacityScale(maxValue);

      var cards = heatmap.selectAll(".status-heatmap-card").data(cardsData.cards);
      cards.append("title");
      cards = cards.enter().append("rect").attr("cardId", function (c) {
        return c.id;
      }).attr("x", getCardX).attr("width", getCardWidth).attr("y", getCardY).attr("height", getCardHeight).attr("rx", cardRound).attr("ry", cardRound).attr("class", "bordered status-heatmap-card").style("fill", getCardColor).style("stroke", getCardColor).style("stroke-width", 0)
      //.style("stroke-width", getCardStrokeWidth)
      //.style("stroke-dasharray", "3,3")
      .style("opacity", getCardOpacity);

      var $cards = $heatmap.find(".status-heatmap-card");
      $cards.on("mouseenter", function (event) {
        tooltip.mouseOverBucket = true;
        highlightCard(event);
      }).on("mouseleave", function (event) {
        tooltip.mouseOverBucket = false;
        resetCardHighLight(event);
      });

      ctrl.events.emit('render-complete', {
        "chartWidth": chartWidth
      });
    }

    function highlightCard(event) {
      var color = d3.select(event.target).style("fill");
      var highlightColor = d3.color(color).darker(2);
      var strokeColor = d3.color(color).brighter(4);
      var current_card = d3.select(event.target);
      tooltip.originalFillColor = color;
      current_card.style("fill", highlightColor).style("stroke", strokeColor).style("stroke-width", 1);
    }

    function resetCardHighLight(event) {
      d3.select(event.target).style("fill", tooltip.originalFillColor).style("stroke", tooltip.originalFillColor).style("stroke-width", 0);
    }

    function getColorScale(maxValue) {
      var minValue = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

      var colorScheme = _.find(ctrl.colorSchemes, { value: panel.color.colorScheme });
      var colorInterpolator = d3ScaleChromatic[colorScheme.value];
      var colorScaleInverted = colorScheme.invert === 'always' || colorScheme.invert === 'dark' && !contextSrv.user.lightTheme;

      if (maxValue == minValue) maxValue = minValue + 1;

      var start = colorScaleInverted ? maxValue : minValue;
      var end = colorScaleInverted ? minValue : maxValue;

      return d3.scaleSequential(colorInterpolator).domain([start, end]);
    }

    function setOpacityScale(maxValue) {
      if (panel.color.colorScale === 'linear') {
        opacityScale = d3.scaleLinear().domain([0, maxValue]).range([0, 1]);
      } else if (panel.color.colorScale === 'sqrt') {
        opacityScale = d3.scalePow().exponent(panel.color.exponent).domain([0, maxValue]).range([0, 1]);
      }
    }

    function getCardX(d) {
      var x = void 0;
      // cx is the center of the card. Card should be placed to the left.
      var cx = xScale(d.x);

      if (cx - cardWidth / 2 < 0) {
        x = yAxisWidth + cardHSpacing / 2;
      } else {
        x = yAxisWidth + cx - cardWidth / 2;
      }

      return x;
    }

    // xScale returns card center. Adjust cardWidth in case of overlaping.
    function getCardWidth(d) {
      var w = void 0;
      var cx = xScale(d.x);

      if (cx < cardWidth / 2) {
        // Center should not exceed half of card.
        // Cut card to the left to prevent overlay of y axis.
        var cutted_width = cx - cardHSpacing / 2 + cardWidth / 2;
        w = cutted_width > 0 ? cutted_width : 0;
      } else if (chartWidth - cx < cardWidth / 2) {
        // Cut card to the right to prevent overlay of right graph edge.
        w = cardWidth / 2 + (chartWidth - cx - cardHSpacing / 2);
      } else {
        w = cardWidth;
      }

      // Card width should be MIN_CARD_SIZE at least
      w = Math.max(w, MIN_CARD_SIZE);

      return w;
    }

    function getCardY(d) {
      return yScale(d.y) + chartTop - cardHeight - cardVSpacing / 2;
    }

    function getCardHeight(d) {
      var ys = yScale(d.y);
      var y = ys + chartTop - cardHeight - cardVSpacing / 2;
      var h = cardHeight;

      // Cut card height to prevent overlay
      if (y < chartTop) {
        h = ys - cardVSpacing / 2;
      } else if (ys > chartBottom) {
        h = chartBottom - y;
      } else if (y + cardHeight > chartBottom) {
        h = chartBottom - y;
      }

      // Height can't be more than chart height
      h = Math.min(h, chartHeight);
      // Card height should be MIN_CARD_SIZE at least
      h = Math.max(h, MIN_CARD_SIZE);

      return h;
    }

    function getCardColor(d) {
      if (panel.color.mode === 'opacity') {
        return panel.color.cardColor;
      } else if (panel.color.mode === 'spectrum') {
        return colorScale(d.value);
      } else if (panel.color.mode === 'discrete') {
        return ctrl.discreteHelper.getBucketColor(d.values);
      }
    }

    function getCardOpacity(d) {
      if (panel.nullPointMode === 'as empty' && d.value == null) {
        return 0;
      }
      if (panel.color.mode === 'opacity') {
        return opacityScale(d.value);
      } else {
        return 1;
      }
    }

    function getCardStrokeWidth(d) {
      if (panel.color.mode === 'discrete') {
        return '1';
      }
      return '0';
    }

    /////////////////////////////
    // Selection and crosshair //
    /////////////////////////////

    // Shared crosshair and tooltip
    appEvents.on('graph-hover', function (event) {
      drawSharedCrosshair(event.pos);
    }, scope);

    appEvents.on('graph-hover-clear', function () {
      clearCrosshair();
    }, scope);

    function onMouseDown(event) {
      selection.active = true;
      selection.x1 = event.offsetX;

      mouseUpHandler = function mouseUpHandler() {
        onMouseUp();
      };

      $(document).one("mouseup", mouseUpHandler);
    }

    function onMouseUp() {
      $(document).unbind("mouseup", mouseUpHandler);
      mouseUpHandler = null;
      selection.active = false;

      var selectionRange = Math.abs(selection.x2 - selection.x1);
      if (selection.x2 >= 0 && selectionRange > MIN_SELECTION_WIDTH) {
        var timeFrom = xScale.invert(Math.min(selection.x1, selection.x2) - yAxisWidth - xGridSize / 2);
        var timeTo = xScale.invert(Math.max(selection.x1, selection.x2) - yAxisWidth - xGridSize / 2);

        ctrl.timeSrv.setTime({
          from: moment.utc(timeFrom),
          to: moment.utc(timeTo)
        });
      }

      clearSelection();
    }

    function onMouseLeave() {
      appEvents.emit('graph-hover-clear');
      clearCrosshair();
    }

    function onMouseMove(event) {
      if (!heatmap) {
        return;
      }

      if (selection.active) {
        // Clear crosshair and tooltip
        clearCrosshair();
        tooltip.destroy();

        selection.x2 = limitSelection(event.offsetX);
        drawSelection(selection.x1, selection.x2);
      } else {
        emitGraphHoverEvet(event);
        drawCrosshair(event.offsetX);
        tooltip.show(event); //, data);
      }
    }

    function emitGraphHoverEvet(event) {
      var x = xScale.invert(event.offsetX - yAxisWidth - xGridSize / 2).valueOf();
      var y = yScale(event.offsetY);
      var pos = {
        pageX: event.pageX,
        pageY: event.pageY,
        x: x, x1: x,
        y: y, y1: y,
        panelRelY: null
      };

      // Set minimum offset to prevent showing legend from another panel
      pos.panelRelY = Math.max(event.offsetY / height, 0.001);

      // broadcast to other graph panels that we are hovering
      appEvents.emit('graph-hover', { pos: pos, panel: panel });
    }

    function limitSelection(x2) {
      x2 = Math.max(x2, yAxisWidth);
      x2 = Math.min(x2, chartWidth + yAxisWidth);
      return x2;
    }

    function drawSelection(posX1, posX2) {
      if (heatmap) {
        heatmap.selectAll(".status-heatmap-selection").remove();
        var selectionX = Math.min(posX1, posX2);
        var selectionWidth = Math.abs(posX1 - posX2);

        if (selectionWidth > MIN_SELECTION_WIDTH) {
          heatmap.append("rect").attr("class", "status-heatmap-selection").attr("x", selectionX).attr("width", selectionWidth).attr("y", chartTop).attr("height", chartHeight);
        }
      }
    }

    function clearSelection() {
      selection.x1 = -1;
      selection.x2 = -1;

      if (heatmap) {
        heatmap.selectAll(".status-heatmap-selection").remove();
      }
    }

    function drawCrosshair(position) {
      if (heatmap) {
        heatmap.selectAll(".status-heatmap-crosshair").remove();

        var posX = position;
        posX = Math.max(posX, yAxisWidth);
        posX = Math.min(posX, chartWidth + yAxisWidth);

        heatmap.append("g").attr("class", "status-heatmap-crosshair").attr("transform", "translate(" + posX + ",0)").append("line").attr("x1", 1).attr("y1", chartTop).attr("x2", 1).attr("y2", chartBottom).attr("stroke-width", 1);
      }
    }

    // map time to X
    function drawSharedCrosshair(pos) {
      if (heatmap && ctrl.dashboard.graphTooltip !== 0) {
        var posX = xScale(pos.x) + yAxisWidth;
        drawCrosshair(posX);
      }
    }

    function clearCrosshair() {
      if (heatmap) {
        heatmap.selectAll(".status-heatmap-crosshair").remove();
      }
    }

    function render() {
      data = ctrl.data;
      panel = ctrl.panel;
      timeRange = ctrl.range;
      cardsData = ctrl.cardsData;

      if (!data || !cardsData || !setElementHeight()) {
        return;
      }

      // Draw default axes and return if no data
      if (_.isEmpty(cardsData.cards)) {
        addHeatmapCanvas();
        return;
      }

      addHeatmap();
      scope.yAxisWidth = yAxisWidth;
      scope.xAxisHeight = xAxisHeight;
      scope.chartHeight = chartHeight;
      scope.chartWidth = chartWidth;
      scope.chartTop = chartTop;
    }

    // Register selection listeners
    $heatmap.on("mousedown", onMouseDown);
    $heatmap.on("mousemove", onMouseMove);
    $heatmap.on("mouseleave", onMouseLeave);
  }

  _export('default', link);

  function grafanaTimeFormat(ticks, min, max) {
    if (min && max && ticks) {
      var range = max - min;
      var secPerTick = range / ticks / 1000;
      var oneDay = 86400000;
      var oneYear = 31536000000;

      if (secPerTick <= 45) {
        return "%H:%M:%S";
      }
      if (secPerTick <= 7200 || range <= oneDay) {
        return "%H:%M";
      }
      if (secPerTick <= 80000) {
        return "%m/%d %H:%M";
      }
      if (secPerTick <= 2419200 || range <= oneYear) {
        return "%m/%d";
      }
      return "%Y-%m";
    }

    return "%H:%M";
  }
  return {
    setters: [function (_lodash) {
      _ = _lodash.default;
    }, function (_jquery) {
      $ = _jquery.default;
    }, function (_moment) {
      moment = _moment.default;
    }, function (_appCoreUtilsKbn) {
      kbn = _appCoreUtilsKbn.default;
    }, function (_appCoreCore) {
      appEvents = _appCoreCore.appEvents;
      contextSrv = _appCoreCore.contextSrv;
    }, function (_appCoreUtilsTicks) {
      tickStep = _appCoreUtilsTicks.tickStep;
      getScaledDecimals = _appCoreUtilsTicks.getScaledDecimals;
      getFlotTickSize = _appCoreUtilsTicks.getFlotTickSize;
    }, function (_d) {
      d3 = _d.default;
    }, function (_libsD3ScaleChromaticIndex) {
      d3ScaleChromatic = _libsD3ScaleChromaticIndex;
    }, function (_tooltip) {
      StatusHeatmapTooltip = _tooltip.StatusHeatmapTooltip;
    }],
    execute: function () {
      MIN_CARD_SIZE = 5;
      CARD_H_SPACING = 2;
      CARD_V_SPACING = 2;
      CARD_ROUND = 0;
      DATA_RANGE_WIDING_FACTOR = 1.2;
      DEFAULT_X_TICK_SIZE_PX = 100;
      DEFAULT_Y_TICK_SIZE_PX = 50;
      X_AXIS_TICK_PADDING = 10;
      Y_AXIS_TICK_PADDING = 5;
      MIN_SELECTION_WIDTH = 2;
    }
  };
});
//# sourceMappingURL=rendering.js.map
