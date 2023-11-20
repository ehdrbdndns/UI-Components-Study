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
        this.padding = { x: 0, y: 0 };
        this.yAxisCount = 10;
        this.maxData = 0; // y축에서 표현되는 가장 큰 수
        this.minData = 0; // y축에서 표현되는 가장 작은 수
        this.setSVGPadding = function () {
            // 1. Y-Padding
            // find max y-label length
            // mix font-size and y-label length
            // 2. X-Padding
            _this.padding = __assign(__assign({}, _this.padding), { 
                // mix font-size and datas.length
                x: _this.fontSize + _this.datas.length * 30, y: _this.fontSize + Math.ceil(Math.log(_this.maxData + 1) / Math.LN10) * 10 });
        };
        this.setSVGElement = function () {
            // Make SVG Container
            _this.chart.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
            // Set ViewBox
            _this.chart.setAttribute('viewBox', "0 0 ".concat(_this.width, " ").concat(_this.hegiht));
        };
        this.setAxis = function () {
            // 1. Create G Tag
            var Axis = document.createElementNS(_this.svgNs, 'g');
            Axis.setAttribute('class', 'axis');
            Axis.setAttribute('stroke', '#fff');
            Axis.setAttribute('stroke-width', '5');
            // 2. Draw X Axis
            var xAxis = document.createElementNS(_this.svgNs, 'line');
            xAxis.setAttribute('x1', _this.padding.y + '');
            xAxis.setAttribute('x2', _this.width + '');
            xAxis.setAttribute('y1', _this.hegiht - _this.padding.x + '');
            xAxis.setAttribute('y2', _this.hegiht - _this.padding.x + '');
            xAxis.classList.add('axis__x');
            // 3. Draw Y Axis
            var yAxis = document.createElementNS(_this.svgNs, 'line');
            yAxis.setAttribute('x1', _this.padding.y + '');
            yAxis.setAttribute('x2', _this.padding.y + '');
            yAxis.setAttribute('y1', '0');
            yAxis.setAttribute('y2', _this.hegiht - _this.padding.x + '');
            yAxis.classList.add('axis__y');
            Axis.appendChild(xAxis);
            Axis.appendChild(yAxis);
            _this.chart.appendChild(Axis);
        };
        this.setContainer = function () {
            // 1. Make SVG Container
            _this.setSVGElement();
            // 2. Set Padding
            _this.setSVGPadding();
            // 3. Draw X and Y Axis
            _this.setAxis();
        };
        this.setPoints = function () {
            // set Color
            var defsTagOfColor = document.createElementNS(_this.svgNs, 'defs');
            var linearGradientTag = document.createElementNS(_this.svgNs, 'linearGradient');
            var stop1 = document.createElementNS(_this.svgNs, 'stop');
            var stop2 = document.createElementNS(_this.svgNs, 'stop');
            linearGradientTag.setAttribute('id', 'paint1');
            linearGradientTag.setAttribute('gradientTransform', 'rotate(90)');
            stop1.setAttribute('stop-color', '#FA00FF');
            stop2.setAttribute('offset', '1');
            stop2.setAttribute('stop-color', '#0085FF');
            linearGradientTag.appendChild(stop1);
            linearGradientTag.appendChild(stop2);
            defsTagOfColor.appendChild(linearGradientTag);
            _this.chart.appendChild(defsTagOfColor);
            // make g container
            var gTagOfPolyLine = document.createElementNS(_this.svgNs, 'g');
            gTagOfPolyLine.classList.add('datas');
            for (var i = 0; i < _this.datas.length; i++) {
                var points = _this.datas[i].data
                    .map(function (value, j) {
                    var x = (j / (_this.xAxisCount - 1)) * (_this.width - _this.padding.y) +
                        _this.padding.y;
                    var y = _this.hegiht -
                        _this.padding.x -
                        (_this.hegiht - _this.padding.x) * (value / _this.maxData);
                    return "".concat(x, ",").concat(y);
                })
                    .join(' ');
                // draw polylines
                var polyLine = document.createElementNS(_this.svgNs, 'polyline');
                polyLine.setAttribute('points', points);
                if (i === 0) {
                    polyLine.setAttribute('stroke', "url('#paint1')");
                }
                else {
                    polyLine.setAttribute('stroke', _this.datas[i].color);
                }
                polyLine.setAttribute('fill', 'none');
                polyLine.setAttribute('stroke-width', _this.datas[i].weight + '');
                polyLine.setAttribute('stroke-linecap', 'round');
                polyLine.setAttribute('stroke-linejoin', 'round');
                gTagOfPolyLine.appendChild(polyLine);
            }
            _this.chart.appendChild(gTagOfPolyLine);
        };
        this.setLabel = function () {
            var gTagOfText = document.createElementNS(_this.svgNs, 'g');
            var gTagOfXLabel = document.createElementNS(_this.svgNs, 'g');
            var gTagOfYLabel = document.createElementNS(_this.svgNs, 'g');
            gTagOfText.setAttribute('fill', '#fff');
            gTagOfText.setAttribute('font-size', _this.fontSize + 'px');
            gTagOfText.classList.add('labels');
            gTagOfXLabel.setAttribute('text-anchor', 'end');
            gTagOfYLabel.setAttribute('text-anchor', 'end');
            // xLabel
            _this.labels.map(function (label, i) {
                var x = (i / (_this.xAxisCount - 1)) * (_this.width - _this.padding.y) +
                    _this.padding.y;
                var y = _this.hegiht - _this.padding.x + _this.fontSize * 2;
                var text = document.createElementNS(_this.svgNs, 'text');
                text.setAttribute('x', x + '');
                text.setAttribute('y', y + '');
                text.append(label);
                gTagOfXLabel.appendChild(text);
            });
            gTagOfText.appendChild(gTagOfXLabel);
            // yLabel
            // 1. 10개의 y lable 데이터 생성
            // 2. x, y좌표 생성
            for (var i = 0; i <= _this.yAxisCount; i++) {
                var x = _this.padding.x - Math.ceil(Math.log(_this.maxData + 1) / Math.LN10);
                var y = (_this.hegiht - _this.padding.x) * (i / _this.yAxisCount);
                var label = ((_this.yAxisCount - i) / _this.yAxisCount) *
                    (_this.maxData - _this.minData) +
                    _this.minData;
                var text = document.createElementNS(_this.svgNs, 'text');
                text.setAttribute('x', x + '');
                text.setAttribute('y', y + '');
                text.append(label + '');
                gTagOfYLabel.appendChild(text);
            }
            gTagOfText.appendChild(gTagOfYLabel);
            _this.chart.appendChild(gTagOfText);
        };
        this.setGuideLine = function () {
            var gTagOfLine = document.createElementNS(_this.svgNs, 'g');
            gTagOfLine.setAttribute('stroke', '#fff');
            gTagOfLine.setAttribute('stroke-weight', '1');
            for (var i = 0; i <= _this.yAxisCount; i++) {
                var x1 = _this.padding.y;
                var x2 = _this.width;
                var y = (_this.hegiht - _this.padding.x) * (i / _this.yAxisCount);
                var line = document.createElementNS(_this.svgNs, 'line');
                line.setAttribute('x1', x1 + '');
                line.setAttribute('x2', x2 + '');
                line.setAttribute('y1', y + '');
                line.setAttribute('y2', y + '');
                gTagOfLine.appendChild(line);
            }
            _this.chart.appendChild(gTagOfLine);
        };
        // rendering for chart
        this.render = function () {
            var _a;
            // 컨테이너 크기 및 Axios 구축
            _this.setContainer();
            // 데이터 구축
            _this.setPoints();
            // 데이터 라벨링
            _this.setLabel();
            // 가이드 라인
            _this.setGuideLine();
            // 라벨 박스
            // last point
            (_a = document.getElementById(_this.targetId)) === null || _a === void 0 ? void 0 : _a.appendChild(_this.chart);
        };
        var datas = data.datas, size = data.size, targetId = data.targetId, labels = data.labels;
        this.chart = document.createElementNS(this.svgNs, 'svg');
        this.targetId = targetId;
        this.width = size.width;
        this.hegiht = size.height;
        this.fontSize = size.font;
        this.datas = datas;
        this.labels = labels;
        this.xAxisCount = labels.length;
        this.maxData = Math.max.apply(Math, datas.map(function (data) { return data.max; }));
        this.minData = Math.min.apply(Math, datas.map(function (data) { return data.min; }));
        console.log(datas);
    }
    return Chart;
}());
