// https://medium.com/@tarsusi/make-your-own-custom-bar-chart-race-with-d3-js-b7d6cfc4d0bd

const NamePosition = {
    InnerOfBar: 0,
    OutOfBar: 1,
};

const chartSettings = {
    width: 540,
    height: 960,
    padding: 100, // グラフのパディング
    titlePadding: 5,
    columnPadding: 0.2, // バー毎のパディング
    ticksInXAxis: 5,
    duration: 500,
    namePosition: NamePosition.OutOfBar,
    autoBarOffset: false,
    barOffset: 20,
    MaxItemCount: 30,
};

class BarChartRace {
    constructor(chartId) {

        this.chartId = chartId;

        chartSettings.innerWidth = chartSettings.width - chartSettings.padding * 1.5;
        chartSettings.innerHeight = chartSettings.height - chartSettings.padding * 2;

        this.chartDataSets = [];
        this.chartTransition = null;
        this.timerStart = 0;
        this.timerEnd = 0;
        this.currentDataSetIndex = 0;
        this.elapsedTime = chartSettings.duration;

        this.chartContainer = d3.select(`#${chartId} .chart-container`);
        this.xAxisContainer = d3.select(`#${chartId} .x-axis`);
        this.yAxisContainer = d3.select(`#${chartId} .y-axis`);

        this.xAxisScale = d3.scaleLinear().range([0, chartSettings.innerWidth]);

        this.yAxisScale = d3
            .scaleBand()
            .range([0, chartSettings.innerHeight])
            .padding(chartSettings.columnPadding);

        d3.select(`#${chartId}`)
            .attr("width", chartSettings.width)
            .attr("height", chartSettings.height);

        this.chartContainer.attr(
            "transform",
            `translate(${chartSettings.padding} ${chartSettings.padding})`
        );

        this.chartContainer
            .select(".current-date")
            .attr(
                "transform",
                // `translate(${chartSettings.innerWidth} ${chartSettings.innerHeight})`
                `translate(${chartSettings.innerWidth + 30} -40)`
            );
    }

    draw({ dataSet, date: currentDate }, transition) {
        let self = this;
        const { innerHeight, ticksInXAxis, titlePadding } = chartSettings;
        const dataSetDescendingOrder = Array.from(dataSet.sort(
            ({ value: firstValue }, { value: secondValue }) =>
                secondValue - firstValue
        ));
        // .slice(0, chartSettings.MaxItemCount);

        let beginDate = "";
        if (this.chartDataSets.length > 0) {
            beginDate = this.chartDataSets[0].date;
        }

        this.chartContainer.select(".current-date").text(`${beginDate}～${currentDate}`);

        if (dataSetDescendingOrder.length > 0) {
            this.xAxisScale.domain([0, dataSetDescendingOrder[0].value]);
        }
        this.yAxisScale.domain(dataSetDescendingOrder.map(({ name }) => name));

        const offsetValues = {};
        dataSetDescendingOrder.forEach((item, index) => {
            offsetValues[item.name] = (index + 1) * chartSettings.barOffset;
        });

        this.xAxisContainer.transition(transition).call(
            d3
                .axisTop(this.xAxisScale)
                .ticks(ticksInXAxis)
                .tickSize(-innerHeight)
        );

        this.yAxisContainer
            .transition(transition)
            .call(d3.axisLeft(this.yAxisScale).tickSize(0));

        // The general update Pattern in d3.js

        // Data Binding
        const barGroups = this.chartContainer
            .select(".columns")
            .selectAll("g.column-container")
            .data(dataSetDescendingOrder, ({ name }) => name);

        // 古い要素を削除する
        barGroups.exit().remove();

        // Enter selection
        const barGroupsEnter = barGroups
            .enter()
            .append("g")
            .attr("class", "column-container")
            .attr("transform", `translate(0,${innerHeight})`);

        const colorScale = d3.scaleOrdinal(d3.schemeTableau10.concat(d3.schemeSet3));
        const barHeight = (!chartSettings.autoBarOffset ? chartSettings.barOffset :
            this.yAxisScale.step()) * (1 - chartSettings.columnPadding);

        barGroupsEnter
            .append("rect")
            .attr("fill", d => d.color != null ? d.color : colorScale(d.name))
            .attr("stroke", "#444")
            .attr("class", "column-rect")
            .attr("width", 0)
            .attr("height", barHeight);

        const textOffsetX = -0;
        barGroupsEnter
            .append("text")
            .attr("class", "column-title")
            .attr("y", barHeight / 2)
            .attr("x", -titlePadding + textOffsetX)
            .text(x => x.displayName);

        const iconSize = 20;
        barGroupsEnter
            .append('image')
            .attr("class", "column-title")
            .attr('xlink:href', data => data.imageUrl1)
            // .attr("width", iconSize)
            .attr("height", iconSize)
            .attr("y", -1)
            .attr("x", -titlePadding - iconSize + textOffsetX);

        barGroupsEnter
            .append('image')
            .attr("class", "column-title")
            .attr('xlink:href', data => data.imageUrl2)
            // .attr("width", iconSize)
            .attr("height", iconSize)
            .attr("y", -1)
            .attr("x", -titlePadding - iconSize * 2 + textOffsetX);

        barGroupsEnter
            .append("text")
            .attr("class", "column-value")
            .attr("y", barHeight / 2)
            .attr("x", titlePadding)
            .text(0);

        // Update selection
        const barUpdate = barGroupsEnter.merge(barGroups);

        barUpdate
            .transition(transition)
            .attr("transform", ({ name }) => `translate(0,${!chartSettings.autoBarOffset ? offsetValues[name] : self.yAxisScale(name)})`)
            .attr("fill", "normal");

        barUpdate
            .select(".column-rect")
            .transition(transition)
            .attr("width", ({ value }) => self.xAxisScale(value));

        barUpdate
            .select(".column-title")
            .transition(transition)
            .attr("x", ({ value }) => {
                switch (chartSettings.namePosition) {
                    case NamePosition.InnerOfBar: return self.xAxisScale(value) - titlePadding;
                    case NamePosition.OutOfBar:
                    default:
                        return -titlePadding;
                }
            });


        barUpdate
            .select(".column-value")
            .transition(transition)
            .attr("x", ({ value }) => self.xAxisScale(value) + titlePadding)
            .tween("text", function ({ value }) {
                const startValue = +d3.select(this).text() || 0;
                if (startValue === value) {
                    // 値が同じなら何もしない
                    return function () { };
                }

                const interpolate = d3.interpolate(startValue, value);
                return function (t) {
                    d3.select(this).text(Math.ceil(interpolate(t)));
                };
            });

        // Exit selection
        const bodyExit = barGroups.exit();

        bodyExit
            .transition(transition)
            .attr("transform", `translate(0,${innerHeight})`)
            .on("end", function () {
                d3.select(self).attr("fill", "none");
            });

        bodyExit
            .select(".column-title")
            .transition(transition)
            .attr("x", 0);

        bodyExit
            .select(".column-rect")
            .transition(transition)
            .attr("width", 0);

        bodyExit
            .select(".column-value")
            .transition(transition)
            .attr("x", titlePadding)
            .tween("text", function () {
                // 現在表示されている値を取得
                const startValue = +d3.select(this).text() || 0;
                const interpolate = d3.interpolate(startValue, 0);

                return function (t) {
                    d3.select(this).text(Math.ceil(interpolate(t)));
                };
            });

        return this;
    }

    addDataset(dataSet) {
        this.chartDataSets.push(dataSet);

        return this;
    }

    addDatasets(dataSets) {
        this.chartDataSets.push.apply(this.chartDataSets, dataSets);

        return this;
    }

    clearDatasets() {
        this.chartDataSets = [];
        return this;
    }

    setTitle(title, subtitle = null) {
        const xOffset = -90;
        d3.select(".chart-title")
            .attr("x", xOffset)
            .attr("y", -chartSettings.padding / 2)
            .text(title);
        if (subtitle != null) {
            d3.select(".chart-subtitle")
                .attr("x", xOffset)
                .attr("y", -chartSettings.padding / 2 - 30)
                .text(subtitle);
        }
        return this;
    }

    async renderUnit(index = 0, onRenderCallback = null) {
        this.elapsedTime = chartSettings.duration;
        if (onRenderCallback != null) {
            onRenderCallback(index);
        }

        this.currentDataSetIndex = index;
        this.chartTransition = this.chartContainer
            .transition()
            .duration(this.elapsedTime)
            .ease(d3.easeLinear);
        if (index < this.chartDataSets.length) {
            this.draw(this.chartDataSets[index], this.chartTransition);
        }

        return this;
    }

    async render(index = 0, onRenderCallback = null) {
        if (onRenderCallback != null) {
            onRenderCallback(index);
        }

        this.currentDataSetIndex = index;
        this.timerStart = d3.now();

        let self = this;
        this.chartTransition = this.chartContainer
            .transition()
            .duration(this.elapsedTime)
            .ease(d3.easeLinear)
            .on("end", () => {
                if (index < this.chartDataSets.length) {
                    self.elapsedTime = chartSettings.duration;
                    self.render(index + 1, onRenderCallback);
                } else {
                    d3.select("button").text("Play");
                }
            })
            .on("interrupt", () => {
                self.timerEnd = d3.now();
            });

        if (index < this.chartDataSets.length) {
            this.draw(this.chartDataSets[index], this.chartTransition);
        }

        return this;
    }

    stop() {
        d3.select(`#${this.chartId}`)
            .selectAll("*")
            .interrupt();

        return this;
    }

    start(onRenderCallback) {
        this.elapsedTime -= this.timerEnd - this.timerStart;

        render(this.currentDataSetIndex, onRenderCallback);

        return this;
    }
}
