import powerbi from "powerbi-visuals-api";
import { Visual } from '../visual';
import { select as d3Select } from "d3-selection";
import { scaleBand, scaleLinear, scaleSymlog } from "d3-scale";
import { min as d3Min, max as d3Max, range as d3Range } from "d3-array";
import { BarType, Position } from "../enum";
import { axisBottom, axisLeft, axisRight, axisTop, easeLinear } from "d3";
import { FormattingAxisNumber, GetAxisDomainMinMax } from "./Axis.methods";
import { SetXAxisTickStyle } from "./XAxis.methods";
import { GetFormattedNumber } from "./NumberFormat.methods";

export const getYAxisRange = (self: Visual, yScaleHeight: number): number[] => {
    let yAxisRange: [number, number] = [0, 0];
    const isShowSeriesLabel =
        (self.chartSettings.barType === BarType.Stacked || self.chartSettings.barType === BarType.GroupedStacked) &&
        self.chartSettings.isIBCSThemeEnabled &&
        self.seriesLabelSettings.isSeriesLabelEnabled;
    const seriesLabelWidth =
        self.scaleBandWidth / 2 > self.seriesLabelSettings.maximumWidth
            ? 0
            : Math.abs(self.seriesLabelSettings.maximumWidth - self.scaleBandWidth / 2);

    if (self.isHorizontalChart) {
        const isTopSeriesLabel = self.seriesLabelSettings.seriesPosition === Position.Top;
        let start = isShowSeriesLabel
            ? isTopSeriesLabel
                ? yScaleHeight
                : yScaleHeight - seriesLabelWidth
            : yScaleHeight;
        let end = isShowSeriesLabel ? (isTopSeriesLabel ? seriesLabelWidth : 0) : 0;

        if (self.dynamicDeviationSettings.isEnabled) {
            end += self.height * 0.075;
        }

        yAxisRange = self.xAxisSettings.position === Position.Bottom ? [start, end] : [end, start];
    } else {
        yAxisRange = self.xAxisSettings.position === Position.Bottom
            ? [yScaleHeight - self.groupedStackedBarsLabelHeight, 0]
            : [self.groupedStackedBarsLabelHeight, yScaleHeight]

        if (self.isShowLabelImage && self.isLabelImageWithinBar) {
            if (self.chartSettings.barType === BarType.Stacked && self.isPercentageStackedBar) {
                if (self.isBottomLabelImageWithinBar) {
                    yAxisRange = self.xAxisSettings.position === Position.Bottom
                        ? [yScaleHeight - self.axisLabelImageHeight / 2, 0]
                        : [self.isBottomXAxis ? 0 : self.axisLabelImageHeight / 2, yScaleHeight + self.axisLabelImageHeight / 2];
                } else {
                    yAxisRange = self.xAxisSettings.position === Position.Bottom
                        ? [yScaleHeight, self.axisLabelImageHeight / 2]
                        : [0, yScaleHeight];
                }
            }
        }
    }

    return yAxisRange;
}

export const SetYAxisRange = (self: Visual, yScaleHeight: number): void => {
    const yAxisRange = getYAxisRange(self, yScaleHeight);
    self.yScale.range(yAxisRange);
    // self.yLogScaleForView.range(yAxisRange);
}

export const CallYScaleOnAxisGroup = (self: Visual, width: number, height: number, yAxisG: SVGElement): void => {
    const isLogarithmScale: boolean = self.axisByBarOrientation.isLogarithmScale;
    // const yScale = isLogarithmScale ? self.yLogScaleForView : self.yScale;
    if (self.yAxisSettings.position === Position.Left) {
        d3Select(yAxisG).attr("transform", `translate(0, 0)`).call(axisLeft(self.yScale).ticks(height / 70));
    } else if (self.yAxisSettings.position === Position.Right) {
        d3Select(yAxisG)
            .attr("transform", `translate(${width}, 0)`)
            .call(axisRight(self.yScale).ticks(height / 70));
    }
}

export const CallYScaleOnAxisGroupWithTransition = (self: Visual, transitionDuration: number): void => {
    const THIS = this;
    const isLogarithmScale: boolean = self.axisByBarOrientation.isLogarithmScale;
    // const yScale = isLogarithmScale ? self.yLogScaleForView : self.yScale;
    if (self.yAxisSettings.position === Position.Left) {
        self.yAxisG
            .attr("transform", `translate(0, 0)`)
            .transition()
            .duration(transitionDuration)
            .ease(easeLinear)
            .call(axisLeft(self.yScale)
                .ticks(self.height / 70)
                .tickFormat((d) => {
                    let tick = d + "";
                    if (!self.isHorizontalChart && typeof d === "number") {
                        tick = GetFormattedNumber(self, d, false);
                    }
                    if (tick.length > self.yAxisSettings.labelCharLimit) {
                        const newText = tick.substr(0, self.yAxisSettings.labelCharLimit);
                        return newText + "..";
                    }
                    return tick + "";
                })
            )
            .on("end", () => {
                SetYAxisTickStyle(self, self.yAxisG.node());
            });
    } else if (self.yAxisSettings.position === Position.Right) {
        self.yAxisG
            .attr("transform", `translate(${self.width}, 0)`)
            .transition()
            .duration(transitionDuration)
            .ease(easeLinear)
            .call(axisRight(self.yScale)
                .ticks(self.height / 70)
                .tickFormat((d) => {
                    if (!self.isHorizontalChart && typeof d === "number") {
                        return GetFormattedNumber(self, d, false);
                    }
                    return d + "";
                })
            )
            .on("end", () => {
                SetYAxisTickStyle(self, self.yAxisG.node());
            });
    }
}

export const CallXScaleOnAxisGroupWithTransition = (self: Visual, transitionDuration: number): void => {
    if (self.xAxisSettings.position === Position.Bottom) {
        self.xAxisG
            .attr("transform", "translate(0," + self.height + ")")
            .transition()
            .duration(transitionDuration)
            .ease(easeLinear)
            .call(axisBottom(self.xScale)
                .ticks(self.width / 90)
                .tickFormat((d) => {
                    if (self.isHorizontalChart && typeof d === "number") {
                        return GetFormattedNumber(self, d, false);
                    }

                    return d + "";
                })
            )
            .on("end", () => {
                SetXAxisTickStyle(self, self.xAxisG.node(), self.xScaleWidth, self.yScaleHeight);
            });
    } else if (self.xAxisSettings.position === Position.Top) {
        self.xAxisG
            .attr("transform", "translate(0," + 0 + ")")
            .transition()
            .duration(transitionDuration)
            .ease(easeLinear)
            .call(axisTop(self.xScale)
                .ticks(self.width / 90)
                .tickFormat((d) => {
                    if (!self.isHorizontalChart && typeof d === "number") {
                        return GetFormattedNumber(self, d, false);
                    }
                    return d + "";
                })
            )
            .on("end", () => {
                SetXAxisTickStyle(self, self.xAxisG.node(), self.xScaleWidth, self.yScaleHeight);
            });
    }
}

// const getLogScaleTicks = (self: Visual, min: number, max: number, height: number): string[] => {
//     const mockScaleConsumer = self.svg.append("g");
//     const scale = scaleLog().base(10).domain([min > 0 ? min : 1, max]).range([0, height]).nice();
//     mockScaleConsumer.call(axisLeft(scale).tickArguments([height / 70, ".0s"]));
//     const ticks = mockScaleConsumer.selectAll(".tick>text")
//         .nodes()
//         .map(function (node) {
//             return node.innerHTML;
//         }).filter(text => text !== "");
//     mockScaleConsumer.remove();
//     return ticks;
// }

export const SetYAxisDomain = (self: Visual, isOnlySetDomain: boolean, categoricalData: powerbi.DataViewCategorical): void => {
    const isLinearScale: boolean = typeof self.chartData.map((d) => d.value)[0] === "number";
    const isLogarithmScale: boolean = self.axisByBarOrientation.isLogarithmScale;
    const isGroupedOrGroupedStackedBarChart = self.isGroupedBarChart || self.isGroupedStackedBar;

    const { min, max } = GetAxisDomainMinMax(self, categoricalData);

    const innerPadding = self.getXScaleInnerPadding();
    if (self.isHorizontalChart) {
        if (!isOnlySetDomain) {
            if (isGroupedOrGroupedStackedBarChart) {
                if (self.isYIsContinuousAxis) {
                    self.yScale = scaleLinear().nice();
                } else {
                    self.yScale = scaleBand().paddingOuter(self.xScalePaddingOuter).paddingInner(innerPadding);
                }
            } else {
                if (self.isYIsContinuousAxis) {
                    self.yScale = scaleLinear().nice();
                } else {
                    self.yScale = scaleBand().paddingOuter(self.xScalePaddingOuter).paddingInner(innerPadding);
                }
            }
        }

        if (self.isYIsContinuousAxis) {
            let yBand;
            if (self.chartSettings.barType === BarType.Normal) {
                // const min = d3.min(this.chartData.map((d) => parseFloat(d.category)));
                // const max = d3.max(this.chartData.map((d) => parseFloat(d.category)));
                // const range = d3.range(min, max + 1);
                // yBand = d3
                //   .scaleBand()
                //   .domain(range.map((d) => d.toString()))
                //   .rangeRound(this.xAxisSettings.position === Position.Bottom ? [this.height, 0] : [0, this.height]);

                // this.yScale.domain([min - 0.5, max + 0.5]);

                const min = d3Min(self.chartData.map((d) => parseFloat(d.category))) + (self.isBottomXAxis ? -1 : 0);
                const max = d3Max(self.chartData.map((d) => parseFloat(d.category))) + (self.isBottomXAxis ? 0 : 1);
                const range = d3Range(min, max);
                yBand = scaleBand()
                    .domain(range.map((d) => d.toString()))
                    .rangeRound(self.xAxisSettings.position === Position.Bottom ? [self.height, 0] : [0, self.height]);

                self.yScale.domain([min, max]);
            } else {
                const min = d3Min(self.chartData.map((d) => parseFloat(d.category))) + (self.isBottomXAxis ? -1 : 0);
                const max = d3Max(self.chartData.map((d) => parseFloat(d.category))) + (self.isBottomXAxis ? 0 : 1);
                const range = d3Range(min, max);
                yBand = scaleBand()
                    // .paddingOuter(0.5)
                    // .paddingInner(0.02)
                    .domain(range.map((d) => d.toString()))
                    .rangeRound(self.xAxisSettings.position === Position.Bottom ? [self.height, 0] : [0, self.height]);

                self.yScale.domain([min, max]);
            }

            self.numericCategoriesBandScale = yBand;
            self.clonedNumericCategoriesBandScale = yBand;
        } else {
            self.yScale.domain(self.chartData.map((d) => d.category));

            self.numericCategoriesBandScale = self.yScale;
            self.clonedNumericCategoriesBandScale = self.yScale;
        }
    } else {
        if (!isOnlySetDomain) {
            self.yScale = isLinearScale
                ? isLogarithmScale
                    // ? (min < 0 ? scaleSymlog().nice() : scaleLog().base(10).nice())
                    ? scaleSymlog().nice()
                    : scaleLinear().nice()
                : scaleBand().padding(1);

            // if (isLogarithmScale) {
            //     if (min < 0) {
            // const height = max * self.height / Math.abs(min - max);
            // const positiveScaleHeight = height;
            // const negativeScaleHeight = self.height - height;
            // const positiveScaleTicks = getLogScaleTicks(self, 1, max, positiveScaleHeight);
            // const negativeScaleTicks = getLogScaleTicks(self, 1, max, negativeScaleHeight).map(tick => '-' + tick).reverse();
            // const combinedTicks = ["-" + self.getAutoUnitFormattedNumber(parseInt(negativeScaleTicks[0]) * 10, false), ...negativeScaleTicks, ...positiveScaleTicks];
            // self.yLogScaleForView = scaleBand().domain(combinedTicks).paddingInner(0);
            // self.yLogScaleForView = scaleSymlog().nice().domain();
            // } else {
            //     const ticks = getLogScaleTicks(self, 1, max, self.height);
            //     self.yLogScaleForView = scaleBand().domain(ticks).paddingInner(0);
            // }
            // }
        }

        if (isLinearScale) {
            self.yScale.domain([isLogarithmScale ? min === 0 ? 1 : min : min, max]);
        } else {
            self.yScale.domain(self.chartData.map((d) => d.value));
        }
    }
}

export const SetYAxisTickStyle = (self: Visual, yAxisG: SVGElement): void => {
    const yAxisSettings = self.yAxisSettings;

    d3Select(yAxisG)
        .selectAll("text")
        .attr(
            "y",
            self.isYIsContinuousAxis ? self.scaleBandWidth / 2 : 0
        )
        .attr("fill", yAxisSettings.labelColor)
        .style("font-family", yAxisSettings.labelFontFamily)
        .attr("font-size", yAxisSettings.labelFontSize)
        .attr("display", yAxisSettings.isDisplayLabel ? "block" : "none")
        .style("text-anchor", yAxisSettings.position === Position.Left ? "end" : "start")
        .each(function (d) {
            if (!self.isHorizontalChart && typeof d === "number") {
                FormattingAxisNumber(self, this, d);
            }
        })
        .each(function () {
            TrimYAxisTick(self, this);
        });
}

export const TrimYAxisTick = (self: Visual, tickEle: any): void => {
    const ele = d3Select(tickEle);
    const textLength = ele.node().getComputedTextLength();
    const text = ele.text();
    if (text.length > self.yAxisSettings.labelCharLimit) {
        const newText = text.substr(0, self.yAxisSettings.labelCharLimit);
        ele.text(newText + "..");
    }
}

export const GetYScale = (self: Visual, value: number | string): number => {
    if (self.isCutAndClipAxisEnabled && !self.isHorizontalChart) {
        const beforeCutDomain = self.beforeCutLinearScale.domain();
        const afterCutDomain = self.afterCutLinearScale.domain();
        if (value >= beforeCutDomain[0] && value <= beforeCutDomain[1]) {
            return self.beforeCutLinearScale(value);
        } else if (value >= afterCutDomain[0] && value <= afterCutDomain[1]) {
            return self.afterCutLinearScale(value);
        } else if (value > beforeCutDomain[1] && value < afterCutDomain[0]) {
            let diff = 0;
            if (!self.isHorizontalChart) {
                diff = self.isBottomXAxis ? self.barCutAndClipMarkerLinesGap / 2 : -self.barCutAndClipMarkerLinesGap / 2;
            } else {
                // diff = this.isBottomXAxis ? this.barCutAndClipMarkerLinesGap / 2 : this.barCutAndClipMarkerLinesGap / 2;
            }
            return self.beforeCutLinearScale(beforeCutDomain[1]) - diff;
        }
    } else {
        return self.yScale(value);
    }
}