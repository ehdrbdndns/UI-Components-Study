var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var Chart = /** @class */ (function () {
    function Chart(data) {
        var _this = this;
        this.svgNs = 'http://www.w3.org/2000/svg';
        this.padding = { bottom: 0, left: 0, top: 0, right: 0 };
        this.yAxisCount = 10;
        this.maxData = 0; // y축에서 표현되는 가장 큰 수
        this.minData = 0; // y축에서 표현되는 가장 작은 수
        this.defaultColor = '#fff';
        this.setSVGPadding = function () {
            // 1. Y-Padding
            // find max y-label length
            // mix font-size and y-label length
            // 2. X-Padding
            _this.padding = __assign(__assign({}, _this.padding), { 
                // mix font-size and datas.length
                bottom: _this.fontSize + _this.datas.length * 30, top: _this.fontSize + _this.datas.length * 30, left: (_this.fontSize +
                    Math.ceil(Math.log(_this.maxData + 1) / Math.LN10) * 10) *
                    2, right: _this.fontSize + Math.ceil(Math.log(_this.maxData + 1) / Math.LN10) * 10 });
        };
        this.setSVGElement = function () {
            // Make SVG Container
            _this.chart.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
            // Set ViewBox
            _this.chart.setAttribute('viewBox', "0 0 ".concat(_this.width, " ").concat(_this.hegiht));
        };
        this.setAxis = function () {
            // 1. Create G Tag
            var Axis = _this.createElement('g', [
                { property: 'class', value: 'axis' },
                { property: 'stroke', value: '#fff' },
                { property: 'stroke-width', value: '5' },
            ]);
            // 2. Draw X Axis
            var xAxis = _this.createElement('line', [
                { property: 'x1', value: _this.padding.left + '' },
                { property: 'x2', value: _this.width - _this.padding.right + '' },
                { property: 'y1', value: _this.hegiht - _this.padding.bottom + '' },
                { property: 'y2', value: _this.hegiht - _this.padding.bottom + '' },
                { property: 'class', value: 'axis__x' },
            ]);
            // 3. Draw Y Axis
            var yAxis = _this.createElement('line', [
                { property: 'x1', value: _this.padding.left + '' },
                { property: 'x2', value: _this.padding.left + '' },
                { property: 'y1', value: _this.padding.top + '' },
                { property: 'y2', value: _this.hegiht - _this.padding.bottom + '' },
                { property: 'class', value: 'axis__y' },
            ]);
            // insert To C
            _this.appendToChart(_this.appendChilds(Axis, [xAxis, yAxis]));
        };
        this.setLabel = function () {
            var gTagOfText = _this.createElement('g', [
                { property: 'fill', value: '#fff' },
                { property: 'font-size', value: _this.fontSize + 'px' },
                { property: 'class', value: 'labels' },
                { property: 'text-anchor', value: 'end' },
            ]);
            var gTagOfXLabel = _this.createElement('g');
            var gTagOfYLabel = _this.createElement('g');
            // xLabel
            _this.labels.map(function (label, i) {
                var x = (i / (_this.xAxisCount - 1)) *
                    (_this.width - _this.padding.left - _this.padding.right) +
                    _this.padding.left;
                var y = _this.hegiht - _this.padding.bottom + _this.fontSize * 2;
                var text = _this.createElement('text', [
                    { property: 'x', value: x + '' },
                    { property: 'y', value: y + '' },
                ]);
                text.append(label);
                gTagOfXLabel.appendChild(text);
            });
            // yLabel
            for (var i = 0; i <= _this.yAxisCount; i++) {
                var x = _this.padding.left -
                    Math.ceil(Math.log(_this.maxData + 1) / Math.LN10) * 3;
                var y = (_this.hegiht - _this.padding.bottom - _this.padding.top) *
                    (i / _this.yAxisCount) +
                    _this.padding.top;
                var label = ((_this.yAxisCount - i) / _this.yAxisCount) *
                    (_this.maxData - _this.minData) +
                    _this.minData;
                var text = _this.createElement('text', [
                    { property: 'x', value: x + '' },
                    { property: 'y', value: y + '' },
                ]);
                text.append(label + '');
                gTagOfYLabel.appendChild(text);
            }
            // label box
            _this.appendToChart(_this.appendChilds(gTagOfText, [gTagOfXLabel, gTagOfYLabel]));
        };
        this.setGuideLine = function () {
            var gTagOfLine = _this.createElement('g', [
                { property: 'stroke', value: '#fff' },
                { property: 'stroke-wight', value: '1' },
            ]);
            for (var i = 0; i <= _this.yAxisCount; i++) {
                var x1 = _this.padding.left;
                var x2 = _this.width - _this.padding.right;
                var y = (_this.hegiht - _this.padding.bottom - _this.padding.top) *
                    (i / _this.yAxisCount) +
                    _this.padding.top;
                var line = _this.createElement('line', [
                    { property: 'x1', value: x1 + '' },
                    { property: 'x2', value: x2 + '' },
                    { property: 'y1', value: y + '' },
                    { property: 'y2', value: y + '' },
                ]);
                gTagOfLine.appendChild(line);
            }
            _this.appendToChart(gTagOfLine);
        };
        this.setPoints = function () {
            var _a;
            // make g container
            var gTagOfPolyLine = _this.createElement('g');
            gTagOfPolyLine.classList.add('datas');
            var _loop_1 = function (i) {
                var data = _this.datas[i];
                var pointList = data.data.map(function (value, j) {
                    var x = (j / (_this.xAxisCount - 1)) *
                        (_this.width - _this.padding.left - _this.padding.right) +
                        _this.padding.left;
                    var y = _this.hegiht -
                        _this.padding.top -
                        _this.padding.bottom -
                        (_this.hegiht - _this.padding.bottom - _this.padding.top) *
                            ((value - _this.minData) / (_this.maxData - _this.minData)) +
                        _this.padding.top;
                    return "".concat(x, ",").concat(y);
                });
                // set color
                var customColor = (_a = data.customColor) === null || _a === void 0 ? void 0 : _a.call(data, _this.chart, _this.svgNs);
                // draw polylines
                var polyLine = _this.createElement('polyline', [
                    { property: 'points', value: pointList.join(' ') },
                    {
                        property: 'stroke',
                        value: (function () {
                            var color;
                            if (customColor) {
                                color = "url('#".concat(customColor.line, "')");
                            }
                            else {
                                color = data.color;
                            }
                            return color === undefined ? _this.defaultColor : color;
                        })(),
                    },
                    { property: 'fill', value: 'none' },
                    { property: 'stroke-width', value: data.width + '' },
                    { property: 'stroke-linecap', value: 'round' },
                    { property: 'stroke-linejoin', value: 'round' },
                ]);
                // draw last point circle
                // lase Circle에 사용될 좌표 값
                var lastPoint = pointList
                    .slice(-1)[0]
                    .split(',')
                    .map(function (point) { return Number(point); });
                var gradient = _this.createElement('circle', [
                    { property: 'cx', value: lastPoint[0] + '' },
                    { property: 'cy', value: lastPoint[1] + '' },
                    { property: 'r', value: '30' },
                    {
                        property: 'fill',
                        value: (function () {
                            var color;
                            if (customColor && customColor.circle) {
                                color = "url('#".concat(customColor.circle.gradientId, "')");
                            }
                            else {
                                var circleId = Math.random().toString(16).slice(2) + '-lastpoint';
                                var defTag = _this.createElement('defs');
                                var radialGradientTag = _this.createElement('radialGradient', [
                                    {
                                        property: 'id',
                                        value: circleId,
                                    },
                                ]);
                                var radialStop1 = _this.createElement('stop', [
                                    {
                                        property: 'stop-color',
                                        value: data.color === undefined ? _this.defaultColor : data.color,
                                    },
                                ]);
                                var radialStop2 = _this.createElement('stop', [
                                    { property: 'offset', value: '1' },
                                    { property: 'stop-opacity', value: '0' },
                                    {
                                        property: 'stop-color',
                                        value: data.color === undefined ? _this.defaultColor : data.color,
                                    },
                                ]);
                                radialGradientTag.appendChild(radialStop1);
                                radialGradientTag.appendChild(radialStop2);
                                _this.appendChilds(defTag, [radialGradientTag]);
                                _this.appendToChart(defTag);
                                color = "url('#".concat(circleId, "')");
                            }
                            return color;
                        })(),
                    },
                ]);
                _this.appendChilds(gTagOfPolyLine, [gradient]);
                var circle = _this.createElement('circle', [
                    { property: 'cx', value: lastPoint[0] + '' },
                    { property: 'cy', value: lastPoint[1] + '' },
                    { property: 'r', value: '10' },
                    {
                        property: 'fill',
                        value: (function () {
                            var color;
                            if (customColor && customColor.circle) {
                                color = customColor.circle.circleColor;
                            }
                            else {
                                color = data.color;
                            }
                            return color === undefined ? _this.defaultColor : color;
                        })(),
                    },
                ]);
                _this.appendChilds(gTagOfPolyLine, [polyLine, circle]);
            };
            // set line
            for (var i = 0; i < _this.datas.length; i++) {
                _loop_1(i);
            }
            _this.appendToChart(gTagOfPolyLine);
        };
        // rendering for chart
        this.render = function () {
            var _a;
            // 컨테이너 크기 및 Axios 구축
            // Make SVG Container
            _this.setSVGElement();
            // 1. Set Padding
            _this.setSVGPadding();
            // Draw GuideLine
            _this.setGuideLine();
            // 데이터 구축
            _this.setPoints();
            // Draw X and Y Axis
            _this.setAxis();
            // Draw Label
            _this.setLabel();
            (_a = document.getElementById(_this.targetId)) === null || _a === void 0 ? void 0 : _a.appendChild(_this.chart);
        };
        var datas = data.datas, size = data.size, targetId = data.targetId, labels = data.labels;
        this.chart = this.createElement('svg');
        this.targetId = targetId;
        this.width = size.width;
        this.hegiht = size.height;
        this.fontSize = size.font;
        this.datas = datas;
        this.labels = labels;
        this.xAxisCount = labels.length;
        this.maxData = Math.max.apply(Math, datas.map(function (data) { return data.max; }));
        this.minData = Math.min.apply(Math, datas.map(function (data) { return data.min; }));
    }
    Chart.prototype.setAttributes = function (element, attributes) {
        attributes.forEach(function (attribute) {
            element.setAttribute(attribute.property, attribute.value);
        });
    };
    Chart.prototype.createElement = function (tag, attributes) {
        var newTag = document.createElementNS(this.svgNs, tag);
        if (attributes !== undefined) {
            this.setAttributes(newTag, attributes);
        }
        return newTag;
    };
    Chart.prototype.appendChilds = function (element, childs) {
        childs.forEach(function (child) { return element.appendChild(child); });
        return element;
    };
    Chart.prototype.appendToChart = function (child) {
        this.chart.appendChild(child);
    };
    return Chart;
}());
