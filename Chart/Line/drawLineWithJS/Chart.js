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
        this.maxData = 0; // y축에서 표현되는 가장 큰 수
        this.setSVGPadding = function () {
            // 1. Y-Padding
            // find max y-label length
            // mix font-size and y-label length
            _this.padding = __assign(__assign({}, _this.padding), { y: _this.fontSize + Math.ceil(Math.log(_this.maxData + 1) / Math.LN10) * 10 });
            // 2. X-Padding
            // mix font-size and datas.length
            _this.padding = __assign(__assign({}, _this.padding), { x: _this.fontSize + _this.datas.length * 30 });
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
            var pointList = [];
            // for each label
            for (var i = 0; i < _this.datas.length; i++) {
                var newPoints = '';
                for (var j = 0; j < _this.datas[i].data.length; j++) {
                    // x label position
                    var x = _this.padding.y + (j + 1) / _this.xAxisCount;
                    // y label position
                    var y = (_this.hegiht - _this.padding.x) *
                        (_this.datas[i].data[j] / _this.maxData);
                    newPoints += "".concat(x, " ").concat(y, " ");
                }
                pointList.push(newPoints);
            }
            // make g container
            var points = document.createElementNS(_this.svgNs, 'g');
            // draw polylines
            for (var i = 0; i < pointList.length; i++) { }
        };
        this.setLabel = function () { };
        // rendering for chart
        this.render = function () {
            var _a;
            // 컨테이너 크기 및 Axios 구축
            _this.setContainer();
            // 데이터 구축
            _this.setPoints();
            // 데이터 라벨링
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
    }
    return Chart;
}());
