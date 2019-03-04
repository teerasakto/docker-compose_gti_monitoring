'use strict';

System.register(['app/plugins/sdk', 'jquery', 'jquery.flot', 'lodash', 'moment', './css/multistat-panel.css!', './external/d3'], function (_export, _context) {
	"use strict";

	var MetricsPanelCtrl, $, _, moment, d3, _createClass, MultistatPanelCtrl;

	function _classCallCheck(instance, Constructor) {
		if (!(instance instanceof Constructor)) {
			throw new TypeError("Cannot call a class as a function");
		}
	}

	function _possibleConstructorReturn(self, call) {
		if (!self) {
			throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
		}

		return call && (typeof call === "object" || typeof call === "function") ? call : self;
	}

	function _inherits(subClass, superClass) {
		if (typeof superClass !== "function" && superClass !== null) {
			throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
		}

		subClass.prototype = Object.create(superClass && superClass.prototype, {
			constructor: {
				value: subClass,
				enumerable: false,
				writable: true,
				configurable: true
			}
		});
		if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
	}

	return {
		setters: [function (_appPluginsSdk) {
			MetricsPanelCtrl = _appPluginsSdk.MetricsPanelCtrl;
		}, function (_jquery) {
			$ = _jquery.default;
		}, function (_jqueryFlot) {}, function (_lodash) {
			_ = _lodash.default;
		}, function (_moment) {
			moment = _moment.default;
		}, function (_cssMultistatPanelCss) {}, function (_externalD) {
			d3 = _externalD.default;
		}],
		execute: function () {
			_createClass = function () {
				function defineProperties(target, props) {
					for (var i = 0; i < props.length; i++) {
						var descriptor = props[i];
						descriptor.enumerable = descriptor.enumerable || false;
						descriptor.configurable = true;
						if ("value" in descriptor) descriptor.writable = true;
						Object.defineProperty(target, descriptor.key, descriptor);
					}
				}

				return function (Constructor, protoProps, staticProps) {
					if (protoProps) defineProperties(Constructor.prototype, protoProps);
					if (staticProps) defineProperties(Constructor, staticProps);
					return Constructor;
				};
			}();

			_export('PanelCtrl', MultistatPanelCtrl = function (_MetricsPanelCtrl) {
				_inherits(MultistatPanelCtrl, _MetricsPanelCtrl);

				/** @ngInject */
				function MultistatPanelCtrl($scope, $injector, alertSrv) {
					_classCallCheck(this, MultistatPanelCtrl);

					var _this = _possibleConstructorReturn(this, (MultistatPanelCtrl.__proto__ || Object.getPrototypeOf(MultistatPanelCtrl)).call(this, $scope, $injector));

					_this.alertSrv = alertSrv;

					var panelDefaults = {
						"BarPadding": 10,
						"BaseLineColor": "red",
						"BaseLineValue": 0,
						"DateTimeColName": "date",
						"DateFormat": "YYYY-MM-DD HH:mm:ss",
						"TooltipDateFormat": "YYYY-MM-DD HH:mm:ss",
						"FlashHighLimitBar": false,
						"FlashLowLimitBar": false,
						"HighAxisColor": "white",
						"HighBarColor": "rgb(120, 128, 0)",
						"HighLimitBarColor": "red",
						"HighLimitBarFlashColor": "orange",
						"HighLimitBarFlashTimeout": 1000,
						"HighLimitLineColor": "red",
						"HighLimitValue": 0.33,
						"HighSideMargin": 20,
						"Horizontal": false,
						"LabelColName": "sensor",
						"LabelNameFilter": "",
						"LabelColor": "white",
						"OutOfRangeLabelColor": "red",
						"GroupLabelColor": "white",
						"LabelFontSize": "100%",
						"GroupLabelFontSize": "200%",
						"LabelMargin": null,
						"LowAxisColor": "white",
						"LowBarColor": "teal",
						"LowLimitBarColor": "red",
						"LowLimitBarFlashColor": "orange",
						"LowLimitBarFlashTimeout": 200,
						"LowLimitLineColor": "red",
						"LowLimitValue": null,
						"LowSideMargin": 20,
						"MaxLineColor": "rgb(74, 232, 12)",
						"MaxLineValue": 1,
						"MinLineValue": 0,
						"RecolorHighLimitBar": true,
						"RecolorLowLimitBar": false,
						"ShowBaseLine": true,
						"ShowDate": false,
						"Aggregate": "last",
						"ShowHighLimitLine": true,
						"ShowLabels": true,
						"ShowGroupLabels": true,
						"ShowLeftAxis": true,
						"ShowLowLimitLine": false,
						"ShowMaxLine": false,
						"ShowMinLine": true,
						"ShowRightAxis": true,
						"ShowTooltips": true,
						"ShowValues": true,
						"SortColName": "value",
						"SortDirection": "ascending",
						"TZOffsetHours": 0,
						"ValueColName": "value",
						"ValueDecimals": 2,
						"ValueColor": "white",
						"ValueFontSize": "100%",
						"OddRowColor": "rgba(33, 33, 34, 0.92)",
						"EvenRowColor": "rgba(61, 61, 64, 0.78)",
						"GroupSortString": "",
						"GroupCols": 0,
						"GroupNameFilter": "",
						"ScaleFactor": 1.0,
						"ValuePosition": "top",
						"LableAngle": 0
					};

					var panel = {};
					var elem = {};
					var ctrl = {};

					_.defaults(_this.panel, panelDefaults);

					_this.events.on('render', _this.onRender.bind(_this));
					_this.events.on('data-received', _this.onDataReceived.bind(_this));
					_this.events.on('data-error', _this.onDataError.bind(_this));
					_this.events.on('init-edit-mode', _this.onInitEditMode.bind(_this));

					_this.className = 'michaeldmoore-multistat-panel-' + _this.panel.id;
					_this.svg = d3.select('.' + _this.className).append('svg');
					return _this;
				}

				_createClass(MultistatPanelCtrl, [{
					key: 'onDataError',
					value: function onDataError(err) {
						this.alertSrv.set('Multistat Data Error', err.data.message == 'Found no column named time' ? 'Time-Series queries not yet supported' : err.data.message, 'error', 5000);
						this.seriesList = [];
						this.data = [];
						this.render();
					}
				}, {
					key: 'onInitEditMode',
					value: function onInitEditMode() {
						this.metricNames = ['min', 'max', 'avg', 'current', 'total', 'name', 'first', 'delta', 'diff', 'range'];
						this.sortDirections = ['none', 'ascending', 'descending'];
						this.aggregations = ['all', 'last', 'first', 'mean', 'max', 'min'];
						this.fontSizes = ['20%', '30%', '50%', '70%', '80%', '100%', '110%', '120%', '150%', '170%', '200%', '250%', '300%', '350%', '400%'];
						this.valuePositions = ['bar base', 'bar end', 'top'];
						this.addEditorTab('Columns', 'public/plugins/michaeldmoore-multistat-panel/columns.html', 2);
						this.addEditorTab('Layout', 'public/plugins/michaeldmoore-multistat-panel/layout.html', 3);
						this.addEditorTab('Grouping', 'public/plugins/michaeldmoore-multistat-panel/grouping.html', 4);
						this.addEditorTab('Options', 'public/plugins/michaeldmoore-multistat-panel/options.html', 5);
						this.addEditorTab('Lines-and-Limits', 'public/plugins/michaeldmoore-multistat-panel/linesandlimits.html', 6);
					}
				}, {
					key: 'onDataReceived',
					value: function onDataReceived(data) {
						this.cols = [];
						if (data.length == 0) {
							this.elem.html("<div style='position:absolute;top:50%;text-align:center;font-size:0.875rem;'>No data to show</div>");
							this.data = data;
							this.rows = null;
							this.render();
						} else if (data[0].type == "table") {
							this.data = data[0];

							for (var _i = 0; _i < this.data.columns.length; _i++) {
								this.cols[_i] = this.data.columns[_i].text;
							}this.cols0 = [''].concat(this.cols);

							this.render();
						} else {
							this.alertSrv.set('Non-Table type data received', 'Multistat does not support Time Series data sets', 'error', 5000);
						}
					}
				}, {
					key: 'buildDateHtml',
					value: function buildDateHtml(dateTimeCol) {
						var $title = this.elem.closest('.panel-container').find('.panel-title');
						var $maxDate = $title.find('span.michaeldmoore-multistat-panel-maxDate');

						if ($maxDate.length == 0) $maxDate = $title.append('<span class="michaeldmoore-multistat-panel-maxDate"/>').children().last();

						if (dateTimeCol != -1 && this.panel.ShowDate) {
							var maxDate = this.rows[0][dateTimeCol];

							for (var _i2 = 1; _i2 < this.rows.length; _i2++) {
								if (maxDate < this.rows[_i2][dateTimeCol]) maxDate = this.rows[_i2][dateTimeCol];
							}

							var dd = moment(maxDate).add(this.panel.TZOffsetHours, 'h');

							if (this.panel.DateFormat.toUpperCase() == 'ELAPSED') $maxDate.text(dd.fromNow()).show();else $maxDate.text(dd.format(this.panel.DateFormat)).show();
						} else $maxDate.hide();
					}
				}, {
					key: 'onRender',
					value: function onRender() {
						if (this.data != null && this.data.rows != null) {
							var cols = this.cols;
							var dateTimeCol = -1;
							var labelCol = -1;
							var valueCol = 0;
							var sortCol = 0;
							var groupCol = -1;
							for (var _i3 = 0; _i3 < cols.length; _i3++) {
								if (cols[_i3] == this.panel.DateTimeColName) dateTimeCol = _i3;
								if (cols[_i3] == this.panel.LabelColName) labelCol = _i3;
								if (cols[_i3] == this.panel.ValueColName) valueCol = _i3;
								if (cols[_i3] == this.panel.SortColName) sortCol = _i3;
								if (cols[_i3] == this.panel.GroupColName) groupCol = _i3;
							}

							if (this.panel.LabelNameFilter.length > 0 && labelCol != -1) {
								var regex = new RegExp(this.panel.LabelNameFilter, "");
								this.matchingRows = [];
								for (var _i4 = 0; _i4 < this.data.rows.length; _i4++) {
									var dd = this.data.rows[_i4];
									var label = dd[labelCol];
									if (label.match(regex) != null) this.matchingRows.push(dd);
								}
							} else this.matchingRows = this.data.rows;

							if (this.panel.Aggregate != 'all' && labelCol != -1) {
								var oo = [];
								this.rows = [];
								switch (this.panel.Aggregate) {
									case 'first':
										this.rows = d3.nest().key(function (d) {
											return d[labelCol];
										}).rollup(function (d) {
											return d[0];
										}).entries(this.matchingRows).forEach(function (x) {
											oo.push(x.value);
										});
										this.rows = oo;
										break;

									case 'last':
										this.rows = d3.nest().key(function (d) {
											return d[labelCol];
										}).rollup(function (d) {
											return d[d.length - 1];
										}).entries(this.matchingRows).forEach(function (x) {
											oo.push(x.value);
										});
										this.rows = oo;
										break;

									case 'mean':
										this.rows = d3.nest().key(function (d) {
											return d[labelCol];
										}).rollup(function (d) {
											var dd = Object.values(Object.assign({}, d[d.length - 1]));
											dd[valueCol] = d3.mean(d, function (d) {
												return d[valueCol];
											});
											return dd;
										}).entries(this.matchingRows).forEach(function (x) {
											oo.push(x.value);
										});
										this.rows = Array.from(oo);
										break;

									case 'max':
										this.rows = d3.nest().key(function (d) {
											return d[labelCol];
										}).rollup(function (d) {
											var dd = Object.values(Object.assign({}, d[d.length - 1]));
											dd[valueCol] = d3.max(d, function (d) {
												return d[valueCol];
											});
											return dd;
										}).entries(this.matchingRows).forEach(function (x) {
											oo.push(x.value);
										});
										this.rows = Array.from(oo);
										break;

									case 'min':
										this.rows = d3.nest().key(function (d) {
											return d[labelCol];
										}).rollup(function (d) {
											var dd = Object.values(Object.assign({}, d[d.length - 1]));
											dd[valueCol] = d3.min(d, function (d) {
												return d[valueCol];
											});
											return dd;
										}).entries(this.matchingRows).forEach(function (x) {
											oo.push(x.value);
										});
										this.rows = Array.from(oo);
										break;
								}
							} else {
								this.rows = this.matchingRows;
							}

							this.elem.html("<svg class='" + this.className + "'  style='height:" + this.ctrl.height + "px; width:100%'></svg>");
							var $container = this.elem.find('.' + this.className);

							var h = $container.height();
							var w = $container.width() - 15;

							if (this.panel.SortDirection != "none") {
								var ascending = this.panel.SortDirection == "ascending";
								this.rows.sort(function (x, y) {
									var comp = x[sortCol] == y[sortCol] ? 0 : x[sortCol] > y[sortCol] ? 1 : -1;
									return ascending ? comp : -comp;
								});
							}

							this.buildDateHtml(dateTimeCol);

							var horizontal = this.panel.Horizontal;

							var labelMargin = $.isNumeric(this.panel.LabelMargin) && this.panel.LabelMargin >= 0 ? this.panel.LabelMargin : null;
							var lowSideMargin = this.panel.LowSideMargin >= 0 ? this.panel.LowSideMargin : 0;
							var highSideMargin = this.panel.HighSideMargin >= 0 ? this.panel.HighSideMargin : 0;

							this.svg.selectAll("rect.michaeldmoore-multistat-panel-bar.highflash").interrupt();
							this.svg.selectAll("rect.michaeldmoore-multistat-panel-bar.lowflash").interrupt();

							this.svg = d3.select('.' + this.className).append('svg');

							var id = this.panel.id;
							var barPadding = this.panel.BarPadding;
							var baseLineValue = this.panel.BaseLineValue;
							var minLineValue = this.panel.MinLineValue;
							var maxLineValue = this.panel.MaxLineValue;
							var highBarColor = this.panel.HighBarColor;
							var lowBarColor = this.panel.LowBarColor;
							var highLimitValue = this.panel.HighLimitValue;
							var HighLimitBarColor = this.panel.HighLimitBarColor;
							var HighLimitBarFlashColor = this.panel.HighLimitBarFlashColor;
							var HighLimitBarFlashTimeout = this.panel.HighLimitBarFlashTimeout;
							var recolorHighLimitBar = this.panel.RecolorHighLimitBar;
							var lowLimitValue = this.panel.LowLimitValue;
							var LowLimitBarColor = this.panel.LowLimitBarColor;
							var LowLimitBarFlashColor = this.panel.LowLimitBarFlashColor;
							var LowLimitBarFlashTimeout = this.panel.LowLimitBarFlashTimeout;
							var recolorLowLimitBar = this.panel.RecolorLowLimitBar;
							var flashHighLimitBar = this.panel.FlashHighLimitBar;
							var flashLowLimitBar = this.panel.FlashLowLimitBar;
							var showTooltips = this.panel.ShowTooltips;
							var DateTimeColName = this.panel.DateTimeColName;
							var DateFormat = this.panel.DateFormat;
							var TooltipDateFormat = this.panel.TooltipDateFormat;
							var ValueColName = this.panel.ValueColName;
							var ValueDecimals = this.panel.ValueDecimals;
							var OddRowColor = this.panel.OddRowColor;
							var EvenRowColor = this.panel.EvenRowColor;
							var TZOffsetHours = this.panel.TZOffsetHours;
							var GroupSortString = this.panel.GroupSortString;
							var GroupCols = this.panel.GroupCols;
							var GroupNameFilter = this.panel.GroupNameFilter;
							var ScaleFactor = Number(this.panel.ScaleFactor);
							var LabelColor = this.panel.LabelColor;
							var OutOfRangeLabelColor = this.panel.OutOfRangeLabelColor;
							var ValuePosition = this.panel.ValuePosition;

							var minValue = d3.min(this.rows, function (d) {
								return Number(d[valueCol]) * ScaleFactor;
							});
							if ($.isNumeric(minLineValue) == false) minLineValue = minValue;

							var maxValue = d3.max(this.rows, function (d) {
								return Number(d[valueCol]) * ScaleFactor;
							});
							if ($.isNumeric(maxLineValue) == false) maxLineValue = maxValue;

							if ($.isNumeric(baseLineValue) == false) baseLineValue = 0;

							if (minLineValue > baseLineValue) minLineValue = baseLineValue;

							if ($.isNumeric(lowLimitValue) && minLineValue > lowLimitValue) minLineValue = lowLimitValue;

							if (maxLineValue < baseLineValue) maxLineValue = baseLineValue;

							if ($.isNumeric(highLimitValue) && maxLineValue < highLimitValue) maxLineValue = highLimitValue;

							d3.select("body").append("div").attr("class", "michaeldmoore-multistat-panel-tooltip michaeldmoore-multistat-panel-tooltip-" + id).style("opacity", 0);

							var tooltipShow = function tooltipShow(d, c, id) {
								var tooltipDiv = d3.select(".michaeldmoore-multistat-panel-tooltip-" + id);
								tooltipDiv.transition().duration(200).style("opacity", 0.9);
								var html = "<table>";
								for (i = 0; i < d.length; i++) {
									var cc = c[i];
									var dd = d[i];

									if (cc == DateTimeColName) dd = moment(dd).add(TZOffsetHours, 'h').format(TooltipDateFormat);else if (cc == ValueColName && $.isNumeric(dd)) dd = Number(dd).toFixed(ValueDecimals);

									html += "<tr><td>" + cc + "</td><td>" + dd + "</td></tr>";
								}
								html += "</table>";
								tooltipDiv.html(html).style("left", d3.event.pageX + "px").style("top", d3.event.pageY - 28 + "px");
							};

							var tooltipHide = function tooltipHide(id) {
								var tooltipDiv = d3.selectAll(".michaeldmoore-multistat-panel-tooltip-" + id);
								tooltipDiv.transition().duration(500).style("opacity", 0);
							};

							var scaleAndClipValue = function scaleAndClipValue(d) {
								var val = d * ScaleFactor;
								if (val > maxLineValue) val = maxLineValue;
								if (val < minLineValue) val = minLineValue;

								return val;
							};

							if (horizontal) {
								var plotGroupHorizontal = function plotGroupHorizontal(panel, svg, data, numRows, groupName, groupNameOffset, left, w, hh, dh) {

									// draw border rectangle
									/*svg.append("rect")
         	.attr("width", w)
         	.attr("height", dh)
         	.attr("x", left)
         	.attr("y", hh)
         	.attr("stroke", "yellow");*/

									// Add Above-High Side Group Names
									if (groupName != '' && panel.ShowGroupLabels) {
										svg.append("text").text(groupName).attr("x", left + (labelMargin + w) / 2).attr("y", hh + groupNameOffset / 2).attr("font-family", "sans-serif").attr("font-size", panel.GroupLabelFontSize).attr("fill", panel.GroupLabelColor).attr("background", "blue").attr("text-anchor", "middle").attr("dominant-baseline", "central");
									}

									hh += groupNameOffset;
									dh -= groupNameOffset;
									w -= 10;

									// draw border rectangle
									/*svg.append("rect")
         	.attr("width", w)
         	.attr("height", dh)
         	.attr("x", left)
         	.attr("y", hh)
         	.attr("stroke", "white");*/

									var labels = data.map(function (d) {
										return d[labelCol];
									});
									while (labels.length < numRows) {
										labels = labels.concat('_' + Math.random().toString(36).substr(2, 9));
									}var labelScale = d3.scaleBand().domain(labels).rangeRound([hh + highSideMargin, hh + dh - lowSideMargin]).padding(barPadding / 100);

									var stripedata = data.concat(d3.range(data.length, numRows));

									var stripeScale = d3.scaleBand().domain(stripedata).rangeRound([hh + highSideMargin, hh + dh - lowSideMargin]).padding(barPadding / 100);

									// Draw background of alternating stripes 
									var oddeven = false;
									svg.append("g").selectAll("rect").data(stripedata).enter().append("rect").attr("class", "michaeldmoore-multistat-panel-row").attr("width", w).attr("height", labelScale.bandwidth()).attr("x", left).attr("y", function (d) {
										return stripeScale(d);
									}).attr("fill", function (d) {
										oddeven = !oddeven;
										return oddeven ? OddRowColor : EvenRowColor;
									}).on("mouseover", function (d, i) {
										if (showTooltips && i < data.length) tooltipShow(d, cols, id);
									}).on("mouseout", function () {
										tooltipHide(id);
									});

									var gg = svg.append("g").selectAll("text").data(data).enter().append("g");

									if (panel.ShowValues && panel.ValuePosition == "top") {
										var maxValueWidth = 0;
										gg.append("text").text(function (d) {
											return (Number(d[valueCol]) * ScaleFactor).toFixed(ValueDecimals);
										}).attr("x", left + w).attr("y", function (d, i) {
											return labelScale(d[labelCol]) + labelScale.bandwidth() / 2;
										}).attr("font-family", "sans-serif").attr("font-size", panel.ValueFontSize).attr("fill", panel.ValueColor).attr("text-anchor", "end").attr("dominant-baseline", "central").each(function (d, i) {
											var thisWidth = this.getComputedTextLength();
											maxValueWidth = d3.max([maxValueWidth, thisWidth]);
										});
										w -= maxValueWidth;
									}

									if (panel.ShowLabels) {
										var maxLabelWidth = 0;
										var labelAngle = panel.LableAngle;
										gg.append("text").text(function (d) {
											return d[labelCol];
										}).attr("font-family", "sans-serif").attr("font-size", panel.LabelFontSize).attr("fill", function (d, i) {
											return d[valueCol] * ScaleFactor > maxLineValue || d[valueCol] * ScaleFactor < minLineValue ? panel.OutOfRangeLabelColor : panel.LabelColor;
										}).attr("text-anchor", "middle")
										//.attr("text-anchor", "start")
										.attr("dominant-baseline", "central").attr("transform", function (d, i) {
											var bbox = this.getBBox();
											var s = Math.sin(labelAngle * Math.PI / 180);
											var c = Math.cos(labelAngle * Math.PI / 180);
											var b = Math.abs(bbox.width * s) + Math.abs(bbox.height * c);
											var a = Math.abs(bbox.width * c) + Math.abs(bbox.height * s);

											var y = labelScale(d[labelCol]) + labelScale.bandwidth() / 2;
											var x = left + a / 2;
											return "translate(" + x + "," + y + ") rotate(" + labelAngle + ")";
										}).on("mouseover", function (d) {
											if (showTooltips) tooltipShow(d, cols, id);
										}).on("mouseout", function () {
											tooltipHide(id);
										}).each(function (d, i) {
											var bbox = this.getBBox();
											var s = Math.sin(labelAngle * Math.PI / 180);
											var c = Math.cos(labelAngle * Math.PI / 180);
											var b = Math.abs(bbox.width * s) + Math.abs(bbox.height * c);
											var a = Math.abs(bbox.width * c) + Math.abs(bbox.height * s);

											var thisWidth = a;
											maxLabelWidth = d3.max([maxLabelWidth, thisWidth]);
										});

										if ($.isNumeric(labelMargin)) {
											left += labelMargin;
											w -= labelMargin;
										} else {
											left += maxLabelWidth;
											w -= maxLabelWidth;
										}
									}

									var valueScale = d3.scaleLinear().domain([minLineValue, maxLineValue]).range([left + labelMargin, left + w]).nice();

									function vLine(svg, value, color) {
										svg.append("line").style("stroke", color).attr("y1", hh + highSideMargin).attr("x1", valueScale(value)).attr("y2", hh + dh - lowSideMargin).attr("x2", valueScale(value));
									}

									if (panel.ShowBaseLine) vLine(svg, baseLineValue, panel.BaseLineColor);

									if (panel.ShowMaxLine) vLine(svg, maxLineValue, panel.MaxLineColor);

									if (panel.ShowMinLine) vLine(svg, minLineValue, panel.MinLineColor);

									if (panel.ShowHighLimitLine) vLine(svg, highLimitValue, panel.HighLimitLineColor);

									if (panel.ShowLowLimitLine) vLine(svg, lowLimitValue, panel.LowLimitLineColor);

									svg.append("g").selectAll("rect").data(data).enter().append("rect").attr("class", "michaeldmoore-multistat-panel-bar").attr("width", function (d) {
										var val = scaleAndClipValue(d[valueCol]);
										return Math.abs(valueScale(val) - valueScale(baseLineValue));
									}).attr("height", labelScale.bandwidth()).attr("x", function (d) {
										var val = scaleAndClipValue(d[valueCol]);
										return d3.min([valueScale(val), valueScale(baseLineValue)]);
									}).attr("y", function (d, i) {
										return labelScale(d[labelCol]);
									}).attr("fill", function (d) {
										if (recolorHighLimitBar && d[valueCol] * ScaleFactor > highLimitValue) return HighLimitBarColor;
										if (recolorLowLimitBar && d[valueCol] * ScaleFactor < lowLimitValue) return LowLimitBarColor;
										return d[valueCol] * ScaleFactor > baseLineValue ? highBarColor : lowBarColor;
									}).classed("highflash", function (d) {
										return recolorHighLimitBar && flashHighLimitBar && d[valueCol] * ScaleFactor > highLimitValue;
									}).classed("lowflash", function (d) {
										return recolorLowLimitBar && flashLowLimitBar && d[valueCol] * ScaleFactor < lowLimitValue;
									}).on("mouseover", function (d) {
										if (showTooltips) tooltipShow(d, cols, id);
									}).on("mouseout", function () {
										tooltipHide(id);
									});

									var g = svg.append("g").selectAll("text").data(data).enter().append("g");

									if (panel.ShowValues && panel.ValuePosition != "top") {
										g.append("text").text(function (d) {
											return (Number(d[valueCol]) * ScaleFactor).toFixed(ValueDecimals);
										}).attr("x", function (d) {
											if (panel.ValuePosition == "bar base") return valueScale(baseLineValue); // + 5;
											else {
													var val = scaleAndClipValue(d[valueCol]);
													return valueScale(val) + (val > baseLineValue); // ? - 5 : + 5)
												}
										}).attr("y", function (d, i) {
											return labelScale(d[labelCol]) + labelScale.bandwidth() / 2;
										}).attr("font-family", "sans-serif").attr("font-size", panel.ValueFontSize).attr("fill", panel.ValueColor).attr("text-anchor", function (d) {
											if (panel.ValuePosition == "bar base") return d[valueCol] * ScaleFactor > baseLineValue ? "start" : "end";
											//return "start";
											else return d[valueCol] * ScaleFactor > baseLineValue ? "end" : "start";
										}).attr("dominant-baseline", "central");
									}

									//Add High Side Value Axis (X)
									if (highSideMargin > 0) {
										var ggHighSide = svg.append("g").attr("transform", 'translate(1,' + (hh + highSideMargin) + ')').attr("class", "michaeldmoore-multistat-panel-valueaxis").call(d3.axisTop(valueScale));
										ggHighSide.selectAll('.tick text').attr('fill', panel.HighAxisColor);
										ggHighSide.selectAll('.tick line').attr('stroke', panel.HighAxisColor);
										ggHighSide.selectAll('path.domain').attr('stroke', panel.HighAxisColor);
									}

									//Add Low Side Value Axis (X)
									if (lowSideMargin > 0) {
										var ggLowSide = svg.append("g").attr("transform", 'translate(0,' + (hh + dh - lowSideMargin) + ')').attr("class", "michaeldmoore-multistat-panel-valueaxis").call(d3.axisBottom(valueScale));
										ggLowSide.selectAll('.tick text').attr('fill', panel.LowAxisColor);
										ggLowSide.selectAll('.tick line').attr('stroke', panel.LowAxisColor);
										ggLowSide.selectAll('path.domain').attr('stroke', panel.LowAxisColor);
									}
								};

								var groupNameOffset = 0;

								if (this.panel.ShowGroupLabels) groupNameOffset = Number(this.panel.GroupLabelFontSize.replace('%', '')) * 0.15;

								if (groupCol >= 0) {
									this.groupedRows = d3.nest().key(function (d) {
										return d[groupCol];
									}).entries(this.rows);

									if (GroupNameFilter.length > 0) {
										var regexGroupNameFilter = new RegExp(GroupNameFilter, "");
										var matchingGroups = [];
										for (var _i5 = 0; _i5 < this.groupedRows.length; _i5++) {
											var groupName = this.groupedRows[_i5].key;
											if (groupName.match(regexGroupNameFilter) != null) matchingGroups.push(this.groupedRows[_i5]);
										}
										this.groupedRows = matchingGroups;
									}

									this.groupedRows.sort(function (a, b) {
										var aPos = GroupSortString.search(a.key);
										var bPos = GroupSortString.search(b.key);

										if (aPos == bPos) return a.key.localeCompare(b.key);else if (aPos == -1) return 1;else if (bPos == -1) return -1;else return aPos - bPos;
									});

									var gap = 5;
									var gcols = GroupCols <= 0 || GroupCols > this.groupedRows.length ? this.groupedRows.length : GroupCols;
									var dw = (w + gap) / gcols;

									// figure out the max data points in each row of groups...
									var pointsPerRow = [];
									for (var _i6 = 0; _i6 < this.groupedRows.length / gcols; _i6++) {
										pointsPerRow.push(0);
									}for (var _i7 = 0; _i7 < this.groupedRows.length; _i7++) {
										var _rr = Math.floor(_i7 / gcols);
										var u = this.groupedRows[_i7].values.length;
										if (pointsPerRow[_rr] < u) pointsPerRow[_rr] = u;
									}

									var totalPoints = 0;
									for (var _i8 = 0; _i8 < pointsPerRow.length; _i8++) {
										totalPoints += pointsPerRow[_i8];
									}var rowOverheadHeight = groupNameOffset + this.panel.LowSideMargin + this.panel.HighSideMargin;
									var rowHeight = (h - pointsPerRow.length * rowOverheadHeight) / totalPoints;

									var numRows = Math.ceil(this.groupedRows.length / gcols);
									var hh = 0;
									for (var rr = 0; rr < numRows; rr++) {
										var nn = pointsPerRow[rr];
										var dh = rowOverheadHeight + nn * rowHeight;
										hh += dh;
										for (var cc = 0; cc < gcols; cc++) {
											var ii = cc + rr * gcols;
											if (ii < this.groupedRows.length) {
												plotGroupHorizontal(this.panel, this.svg, this.groupedRows[ii].values, nn, this.groupedRows[ii].key, groupNameOffset, cc * dw, dw - gap, hh - dh, dh);
											}
										}
									}
								} else {
									this.groupedRows = null;

									plotGroupHorizontal(this.panel, this.svg, this.rows, this.rows.length, '', 0, 0, w, 0, h);
								}
							} else {

								var plotGroupVertical = function plotGroupVertical(panel, svg, data, numRows, groupName, groupNameOffset, left, w, hh, dh) {

									// draw border rectangle
									/*svg.append("rect")
         	.attr("width", w)
         	.attr("height", dh)
         	.attr("x", left)
         	.attr("y", hh)
         	.attr("stroke", "yellow");*/

									// Add Above-High Side Group Names
									if (groupName != '' && panel.ShowGroupLabels) {
										svg.append("text").text(groupName).attr("x", left + (labelMargin + w) / 2).attr("y", hh + groupNameOffset / 2).attr("font-family", "sans-serif").attr("font-size", panel.GroupLabelFontSize).attr("fill", panel.GroupLabelColor).attr("background", "blue").attr("text-anchor", "middle").attr("dominant-baseline", "central");
									}

									hh += groupNameOffset;
									dh -= groupNameOffset;
									w -= 10;

									// draw border rectangle
									/*svg.append("rect")
         	.attr("width", w)
         	.attr("height", dh)
         	.attr("x", left)
         	.attr("y", hh)
         	.attr("stroke", "white");*/

									var labels = data.map(function (d) {
										return d[labelCol];
									});
									while (labels.length < numRows) {
										labels = labels.concat('_' + Math.random().toString(36).substr(2, 9));
									}var labelScale = d3.scaleBand().domain(labels).range([left + lowSideMargin, left + w - highSideMargin]).padding(barPadding / 100);

									var stripedata = data.concat(d3.range(data.length, numRows));

									var stripeScale = d3.scaleBand().domain(stripedata).range([left + lowSideMargin, left + w - highSideMargin]).padding(barPadding / 100);

									// Draw background of alternating stripes 
									var oddeven = false;
									svg.append("g").selectAll("rect").data(stripedata).enter().append("rect").attr("class", "michaeldmoore-multistat-panel-row").attr("width", labelScale.bandwidth()).attr("height", dh).attr("x", function (d, i) {
										return stripeScale(d);
									}).attr("y", hh).attr("fill", function (d) {
										oddeven = !oddeven;
										return oddeven ? OddRowColor : EvenRowColor;
									}).on("mouseover", function (d, i) {
										if (showTooltips && i < data.length) tooltipShow(d, cols, id);
									}).on("mouseout", function () {
										tooltipHide(id);
									});

									var gg = svg.append("g").selectAll("text").data(data).enter().append("g");

									if (panel.ShowValues && panel.ValuePosition == "top") {
										var maxValueHeight = 0;
										gg.append("text").text(function (d) {
											return (Number(d[valueCol]) * ScaleFactor).toFixed(ValueDecimals);
										}).attr("x", function (d, i) {
											return labelScale(d[labelCol]) + labelScale.bandwidth() / 2;
										}).attr("y", hh).attr("font-family", "sans-serif").attr("font-size", panel.ValueFontSize).attr("fill", panel.ValueColor).attr("text-anchor", "middle").attr("dominant-baseline", "text-before-edge").each(function (d, i) {
											var thisHeight = this.getBBox().height;
											maxValueHeight = d3.max([maxValueHeight, thisHeight]);
										});
										hh += maxValueHeight;
										dh -= maxValueHeight;
									}

									if (panel.ShowLabels) {
										var maxLabelHeight = 0;
										var labelAngle = panel.LableAngle;
										gg.append("text").text(function (d) {
											return d[labelCol];
										}).attr("font-family", "sans-serif").attr("font-size", panel.LabelFontSize).attr("fill", function (d, i) {
											return d[valueCol] * ScaleFactor > maxLineValue || d[valueCol] * ScaleFactor < minLineValue ? OutOfRangeLabelColor : LabelColor;
										}).attr("text-anchor", "middle").attr("dominant-baseline", "central").attr("transform", function (d, i) {
											var bbox = this.getBBox();
											var s = Math.sin(labelAngle * Math.PI / 180);
											var c = Math.cos(labelAngle * Math.PI / 180);
											var b = Math.abs(bbox.width * s) + Math.abs(bbox.height * c);
											var a = Math.abs(bbox.width * c) + Math.abs(bbox.height * s);

											var x = labelScale(d[labelCol]) + labelScale.bandwidth() / 2;
											var y = hh + dh - b / 2;
											return "translate(" + x + "," + y + ") rotate(" + labelAngle + ")";
										}).on("mouseover", function (d) {
											if (showTooltips) tooltipShow(d, cols, id);
										}).on("mouseout", function () {
											tooltipHide(id);
										}).each(function (d, i) {
											var bbox = this.getBBox();
											var s = Math.sin(labelAngle * Math.PI / 180);
											var c = Math.cos(labelAngle * Math.PI / 180);
											var b = Math.abs(bbox.width * s) + Math.abs(bbox.height * c);
											var a = Math.abs(bbox.width * c) + Math.abs(bbox.height * s);

											var thisHeight = b;
											maxLabelHeight = d3.max([maxLabelHeight, thisHeight]);
										});
										if ($.isNumeric(labelMargin)) {
											dh -= labelMargin;
										} else {
											dh -= maxLabelHeight;
										}
									}

									var valueScale = d3.scaleLinear().domain([maxLineValue, minLineValue]).range([hh, hh + dh]).nice();

									function hLine(svg, value, color) {
										svg.append("line").style("stroke", color).attr("x1", left + lowSideMargin).attr("y1", valueScale(value)).attr("x2", left + w - highSideMargin).attr("y2", valueScale(value));
									}

									if (panel.ShowBaseLine) hLine(svg, baseLineValue, panel.BaseLineColor);

									if (panel.ShowMaxLine) hLine(svg, maxLineValue, panel.MaxLineColor);

									if (panel.ShowMinLine) hLine(svg, minLineValue, panel.MinLineColor);

									if (panel.ShowHighLimitLine) hLine(svg, highLimitValue, panel.HighLimitLineColor);

									if (panel.ShowLowLimitLine) hLine(svg, lowLimitValue, panel.LowLimitLineColor);

									gg.append("rect").attr("class", "michaeldmoore-multistat-panel-bar").attr("height", function (d) {
										var val = scaleAndClipValue(d[valueCol]);
										return Math.abs(valueScale(baseLineValue) - valueScale(val));
									}).attr("width", labelScale.bandwidth()).attr("y", function (d) {
										var val = scaleAndClipValue(d[valueCol]);
										return d3.min([valueScale(val), valueScale(baseLineValue)]);
									}).attr("x", function (d, i) {
										return labelScale(d[labelCol]);
									}).attr("fill", function (d) {
										if (recolorHighLimitBar && d[valueCol] * ScaleFactor > highLimitValue) return HighLimitBarColor;
										if (recolorLowLimitBar && d[valueCol] * ScaleFactor < lowLimitValue) return LowLimitBarColor;
										return d[valueCol] * ScaleFactor > baseLineValue ? highBarColor : lowBarColor;
									}).classed("highflash", function (d) {
										return recolorHighLimitBar && flashHighLimitBar && d[valueCol] * ScaleFactor > highLimitValue;
									}).classed("lowflash", function (d) {
										return recolorLowLimitBar && flashLowLimitBar && d[valueCol] * ScaleFactor < lowLimitValue;
									}).on("mouseover", function (d) {
										if (showTooltips) tooltipShow(d, cols, id);
									}).on("mouseout", function () {
										tooltipHide(id);
									});

									if (panel.ShowValues && panel.ValuePosition != "top") {
										gg.append("text").text(function (d) {
											return (Number(d[valueCol]) * ScaleFactor).toFixed(ValueDecimals);
										}).attr("x", function (d, i) {
											return labelScale(d[labelCol]) + labelScale.bandwidth() / 2;
										}).attr("y", function (d) {
											if (ValuePosition == "bar base") return valueScale(baseLineValue);else {
												var val = scaleAndClipValue(d[valueCol]);
												return valueScale(val);
											}
										}).attr("font-family", "sans-serif").attr("font-size", panel.ValueFontSize).attr("fill", panel.ValueColor).attr("text-anchor", "middle").attr("dominant-baseline", function (d) {
											if (ValuePosition == "bar base") return d[valueCol] * ScaleFactor > baseLineValue ? "text-after-edge" : "text-before-edge";else return d[valueCol] * ScaleFactor > baseLineValue ? "text-before-edge" : "text-after-edge";
										});
									}

									if (lowSideMargin > 0) {
										var _gg = svg.append("g").attr('transform', 'translate(' + (left + lowSideMargin) + ', 0)').classed('michaeldmoore-multistat-panel-valueaxis', true).call(d3.axisLeft(valueScale).tickSizeInner(5).tickSizeOuter(10).ticks(5));
										_gg.selectAll('.tick text').attr('fill', panel.LowAxisColor);
										_gg.selectAll('.tick line').attr('stroke', panel.LowAxisColor);
										_gg.selectAll('path.domain').attr('stroke', panel.LowAxisColor);
									}

									if (highSideMargin > 0) {
										var _gg2 = svg.append("g").attr('transform', 'translate(' + (left + w - highSideMargin) + ', 0)').classed('michaeldmoore-multistat-panel-valueaxis', true).call(d3.axisRight(valueScale).tickSizeInner(5).tickSizeOuter(10).ticks(5));
										_gg2.selectAll('.tick text').attr('fill', panel.HighAxisColor);
										_gg2.selectAll('.tick line').attr('stroke', panel.HighAxisColor);
										_gg2.selectAll('path.domain').attr('stroke', panel.HighAxisColor);
									}
								};

								var _groupNameOffset = 0;

								if (this.panel.ShowGroupLabels) _groupNameOffset = Number(this.panel.GroupLabelFontSize.replace('%', '')) * 0.15;

								if (groupCol >= 0) {
									this.groupedRows = d3.nest().key(function (d) {
										return d[groupCol];
									}).entries(this.rows);

									if (GroupNameFilter.length > 0) {
										var regexGroupRows = new RegExp(GroupNameFilter, "");
										var _matchingGroups = [];
										for (var _i9 = 0; _i9 < this.groupedRows.length; _i9++) {
											var _groupName = this.groupedRows[_i9].key;
											if (_groupName.match(regexGroupRows) != null) _matchingGroups.push(this.groupedRows[_i9]);
										}
										this.groupedRows = _matchingGroups;
									}

									this.groupedRows.sort(function (a, b) {
										var aPos = GroupSortString.search(a.key);
										var bPos = GroupSortString.search(b.key);

										if (aPos == bPos) return a.key.localeCompare(b.key);else if (aPos == -1) return 1;else if (bPos == -1) return -1;else return aPos - bPos;
									});

									var _gap = 5;
									var _gcols = GroupCols <= 0 || GroupCols > this.groupedRows.length ? this.groupedRows.length : GroupCols;
									var _dw = (w + _gap) / _gcols;

									// figure out the max data points in each column of groups...
									var pointsPerCol = [];
									for (var _i10 = 0; _i10 < _gcols; _i10++) {
										pointsPerCol.push(0);
									}for (var _i11 = 0; _i11 < this.groupedRows.length; _i11++) {
										var _cc = _i11 % _gcols;
										var _u = this.groupedRows[_i11].values.length;
										if (pointsPerCol[_cc] < _u) pointsPerCol[_cc] = _u;
									}

									var _totalPoints = 0;
									for (var _i12 = 0; _i12 < pointsPerCol.length; _i12++) {
										_totalPoints += pointsPerCol[_i12];
									}var colOverheadWidth = this.panel.LowSideMargin + this.panel.HighSideMargin;
									var colWidth = (w - pointsPerCol.length * colOverheadWidth) / _totalPoints;

									var _numRows = Math.ceil(this.groupedRows.length / _gcols);
									var _dh = h / _numRows;
									var _hh = _dh;
									for (var _rr2 = 0; _rr2 < _numRows; _rr2++) {
										var ww = 0;
										for (var _cc2 = 0; _cc2 < _gcols; _cc2++) {
											var _nn = pointsPerCol[_cc2];
											var _dw2 = colOverheadWidth + _nn * colWidth;

											var _ii = _cc2 + _rr2 * _gcols;
											if (_ii < this.groupedRows.length) {
												plotGroupVertical(this.panel, this.svg, this.groupedRows[_ii].values, _nn, this.groupedRows[_ii].key, _groupNameOffset, ww, _dw2 - _gap, _hh - _dh, _dh);
												ww += _dw2;
											}
										}
										_hh += _dh;
									}
								} else {
									this.groupedRows = null;

									plotGroupVertical(this.panel, this.svg, this.rows, this.rows.length, '', 0, 0, w, 0, h);
								}
							}

							var pulseHigh = function pulseHigh(svg) {
								var highFlashRects = svg.selectAll("rect.michaeldmoore-multistat-panel-bar.highflash");

								if ($.isNumeric(HighLimitBarFlashTimeout) && highFlashRects._groups.length > 0 && highFlashRects._groups[0].length > 0) {
									highFlashRects.transition().on("start", function highRepeat() {
										d3.active(this).style("fill", HighLimitBarFlashColor).duration(HighLimitBarFlashTimeout).transition().style("fill", HighLimitBarColor).duration(HighLimitBarFlashTimeout).transition().on("start", highRepeat);
									});
								}
							};

							var pulseLow = function pulseLow(svg) {
								var lowFlashRects = svg.selectAll("rect.michaeldmoore-multistat-panel-bar.lowflash");
								if ($.isNumeric(LowLimitBarFlashTimeout) && lowFlashRects._groups.length > 0 && lowFlashRects._groups[0].length > 0) {
									lowFlashRects.transition().on("start", function lowRepeat() {
										d3.active(this).style("fill", LowLimitBarFlashColor).duration(LowLimitBarFlashTimeout).transition().style("fill", LowLimitBarColor).duration(LowLimitBarFlashTimeout).transition().on("start", lowRepeat);
									});
								}
							};

							pulseHigh(this.svg);
							pulseLow(this.svg);
						} else this.elem.html("<div style='position:absolute;top:50%;text-align:center;font-size:0.875rem;'>No data to show!!</div>");

						this.ctrl.renderingCompleted();
					}
				}, {
					key: 'onConfigChanged',
					value: function onConfigChanged() {
						this.refresh();
					}
				}, {
					key: 'link',
					value: function link(scope, elem, attrs, ctrl) {
						this.ctrl = ctrl;
						this.elem = elem.find('.panel-content');
					}
				}]);

				return MultistatPanelCtrl;
			}(MetricsPanelCtrl));

			MultistatPanelCtrl.templateUrl = 'module.html';

			_export('PanelCtrl', MultistatPanelCtrl);
		}
	};
});
//# sourceMappingURL=module.js.map
