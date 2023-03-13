import powerbi from "powerbi-visuals-api";
import { Visual } from '../visual';
import { select as d3Select } from "d3-selection";
import { scaleBand, scaleLinear, scaleSymlog } from "d3-scale";
import { min as d3Min, max as d3Max, range as d3Range } from "d3-array";
import { BarType, Position } from "../enum";
import { axisBottom, axisTop, easeLinear } from "d3";
import { FormattingAxisNumber, GetAxisDomainMinMax } from './Axis.methods';
import { GetFormattedNumber } from "./NumberFormat.methods";

export const SetXAxisRange = (self: Visual, xScaleWidth: number): void => {
    const isShowSeriesLabel =
        (self.chartSettings.barType === BarType.Stacked || self.chartSettings.barType === BarType.GroupedStacked) &&
        // this.chartSettings.isIBCSThemeEnabled &&
        self.seriesLabelSettings.isSeriesLabelEnabled;
    // const seriesLabelWidth =
    //   this.scaleBandWidth / 2 > this.seriesLabelSettings.maximumWidth
    //     ? 0
    //     : Math.abs(this.seriesLabelSettings.maximumWidth - this.scaleBandWidth / 2);
    const seriesLabelWidth = self.seriesLabelSettings.maximumWidth;

    if (self.isHorizontalChart) {
        self.xScale.range(
            self.yAxisSettings.position === Position.Left
                ? [self.groupedStackedBarsLabelWidth, xScaleWidth]
                : [xScaleWidth - self.groupedStackedBarsLabelWidth, 0]
        );

        if (self.isShowLabelImage && self.isLabelImageWithinBar) {
            if (self.chartSettings.barType === BarType.Stacked && self.isPercentageStackedBar) {
                if (self.isLeftLabelImageWithinBar) {
                    self.xScale.range(
                        self.yAxisSettings.position === Position.Left
                            ? [self.axisLabelImageHeight / 2, xScaleWidth]
                            : [xScaleWidth, 0]
                    );
                } else {
                    self.xScale.range(
                        self.yAxisSettings.position === Position.Left
                            ? [0, xScaleWidth - self.axisLabelImageHeight / 2]
                            : [xScaleWidth - (self.isRightImageRightYAxisPosition ? self.axisLabelImageWidth / 2 : 0), 0]
                    );
                }
            }
        }
    } else {
        const isLeftSeriesLabel = self.seriesLabelSettings.seriesPosition === Position.Left;
        let start = isShowSeriesLabel ? (isLeftSeriesLabel ? seriesLabelWidth : 0) : 0;
        let end = isShowSeriesLabel ? (isLeftSeriesLabel ? xScaleWidth : xScaleWidth - seriesLabelWidth) : xScaleWidth;

        if (self.dynamicDeviationSettings.isEnabled) {
            end -= self.width * 0.05;
        }

        self.xScale.range(self.yAxisSettings.position === Position.Left ? [start, end] : [end, start]);
        self.xScale2.range(self.yAxisSettings.position === Position.Left ? [start, end] : [end, start]);
    }
}

export const CallXScaleOnAxisGroup = (self: Visual, width: number, height: number, xAxisG: SVGElement): void => {
    if (self.xAxisSettings.position === Position.Bottom) {
        d3Select(xAxisG)
            .attr("transform", "translate(0," + height + ")")
            .call(axisBottom(self.xScale).ticks(width / 90));
    } else if (self.xAxisSettings.position === Position.Top) {
        d3Select(xAxisG).attr("transform", "translate(0," + 0 + ")").call(axisTop(self.xScale).ticks(width / 90));
    }
}

export const callXScaleOnAxisGroupWithTransition = (self: Visual, transitionDuration: number): void => {
    if (self.xAxisSettings.position === Position.Bottom) {
        self.xAxisG
            .attr("transform", "translate(0," + self.height + ")")
            .transition()
            .duration(transitionDuration)
            .ease(easeLinear)
            .call(
                axisBottom(self.xScale)
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

export const SetXAxisDomain = (self: Visual, isOnlySetDomain: boolean, categoricalData: powerbi.DataViewCategorical): void => {
    const isLinearScale = typeof self.chartData.map((d) => d.value)[0] === "number";
    const isLogarithmScale = self.axisByBarOrientation.isLogarithmScale;
    const isGroupedOrGroupedStackedBarChart = self.isGroupedBarChart || self.isGroupedStackedBar;

    const { min, max } = GetAxisDomainMinMax(self, categoricalData);

    const innerPadding = self.getXScaleInnerPadding();
    if (self.isHorizontalChart) {
        if (!isOnlySetDomain) {
            self.xScale = isLinearScale
                ? isLogarithmScale
                    ? scaleSymlog().nice()
                    : scaleLinear().nice()
                : scaleBand().padding(1);
        }

        if (isLinearScale) {
            self.xScale.domain([min, max]);
        } else {
            self.xScale.domain(self.chartData.map((d) => d.value));
        }
    } else {
        if (!isOnlySetDomain) {
            if (isGroupedOrGroupedStackedBarChart) {
                if (self.isXIsContinuousAxis) {
                    self.xScale = scaleLinear().nice();
                    self.xScale2 = scaleLinear().nice();
                } else {
                    self.xScale = scaleBand().paddingOuter(self.xScalePaddingOuter).paddingInner(innerPadding);
                    self.xScale2 = scaleBand().paddingOuter(self.xScalePaddingOuter).paddingInner(innerPadding);
                }
            } else {
                if (self.isXIsContinuousAxis) {
                    self.xScale = scaleLinear().nice();
                    self.xScale2 = scaleLinear().nice();
                } else {
                    self.xScale = scaleBand().paddingOuter(self.xScalePaddingOuter).paddingInner(innerPadding);
                    self.xScale2 = scaleBand().paddingOuter(self.xScalePaddingOuter).paddingInner(innerPadding);
                }
            }
        }

        if (self.isXIsContinuousAxis) {
            let xBand;
            if (self.chartSettings.barType === BarType.Normal) {
                // const min = d3.min(self.chartData.map((d) => parseFloat(d.category)));
                // const max = d3.max(self.chartData.map((d) => parseFloat(d.category)));
                // const range = d3.range(min, max);
                // xBand = d3
                //   .scaleBand()
                //   .domain(range.map((d) => d.toString()))
                //   .range(self.yAxisSettings.position === Position.Left ? [0, self.width] : [self.width, 0]);
                // self.xScale.domain([min, max]);
                // self.xScale2.domain([min, max]);

                const min = d3Min(self.chartData.map((d) => parseFloat(d.category)))! + (self.isLeftYAxis ? 0 : -1);
                const max = d3Max(self.chartData.map((d) => parseFloat(d.category)))! + (self.isLeftYAxis ? 1 : 0);
                const range = d3Range(min, max);

                xBand = scaleBand()
                    .domain(range.map((d) => d.toString()))
                    .range(self.yAxisSettings.position === Position.Left ? [0, self.width] : [self.width, 0]);

                self.xScale.domain([min, max]);
                self.xScale2.domain([min, max]);
            } else {
                const min = d3Min(self.chartData.map((d) => parseFloat(d.category)))! + (self.isLeftYAxis ? 0 : -1);
                const max = d3Max(self.chartData.map((d) => parseFloat(d.category)))! + (self.isLeftYAxis ? 1 : 0);
                const range = d3Range(min, max);

                xBand = scaleBand()
                    // .paddingOuter(self.xScalePaddingOuter)
                    // .paddingInner(0.02)
                    .domain(range.map((d) => d.toString()))
                    .range(self.yAxisSettings.position === Position.Left ? [0, self.width] : [self.width, 0]);

                self.xScale.domain([min, max]);
                self.xScale2.domain([min, max]);
            }

            self.numericCategoriesBandScale = xBand;
            self.clonedNumericCategoriesBandScale = xBand;
        } else {
            self.xScale.domain(self.chartData.map((d) => d.category));
            self.xScale2.domain(self.chartData.map((d) => d.category));

            self.numericCategoriesBandScale = self.xScale;
            self.clonedNumericCategoriesBandScale = self.xScale;
        }
    }
}

export const SetXAxisTickStyle = (self: Visual, xAxisG: SVGElement, scaleWidth: number, scaleHeight: number): void => {
    const THIS = self;
    const xAxisSettings = self.xAxisSettings;
    const labelsTextLength = [];

    d3Select(xAxisG).selectAll("text").each(function () {
        const text = d3Select(this).text();
        labelsTextLength.push(text.length);
    });

    d3Select(xAxisG)
        .selectAll("text")
        .attr("dy", self.isBottomXAxis ? "0.35em" : 0)
        .attr(
            "dx",
            self.isXIsContinuousAxis ? self.scaleBandWidth / 2 : 0
        )
        .attr("fill", xAxisSettings.labelColor)
        .style("font-family", xAxisSettings.labelFontFamily)
        .attr("font-size", xAxisSettings.labelFontSize)
        .attr("display", xAxisSettings.isDisplayLabel ? "block" : "none")
        .attr("text-anchor", () => {
            if (xAxisSettings.isLabelAutoTilt) {
                return self.isBottomXAxis ? "middle" : "end";
            } else {
                return xAxisSettings.labelTilt > 20 ? "end" : "middle";
            }
        })
        .attr("transform", () => {
            if (!xAxisSettings.isLabelAutoTilt) {
                if (xAxisSettings.position === Position.Bottom) {
                    return `translate(${xAxisSettings.labelTilt > 20 ? -10 : 0}, 8)rotate(-${xAxisSettings.labelTilt ?? 0})`;
                } else if (xAxisSettings.position === Position.Top) {
                    return `translate(${xAxisSettings.labelTilt > 20 ? -10 : 0}, -8)rotate(${xAxisSettings.labelTilt ?? 0})`;
                }
            }
        })
        .each((d, i, nodes: any) => {
            if (self.isHorizontalChart && typeof d === "number") {
                FormattingAxisNumber(self, nodes[i], d);
            }
        })
        .each((d, i, nodes) => {
            if (scaleWidth <= self.xAxisLabelTrimMinWidth
                || (scaleHeight <= self.xAxisLabelTrimMinHeight && self.scaleBandWidth <= 60)
                || self.isHorizontalBrushDisplayed) {
                THIS.trimXAxisTick(nodes[i], scaleHeight);
            }
        })
        .each((d, i, nodes) => {
            if (xAxisSettings.isLabelAutoTilt && typeof d === "string") {
                self.autoTiltXAxisLabel(xAxisG, nodes[i], scaleWidth);
            }
        })
        .each((d, i, nodes) => {
            if (scaleWidth > self.xAxisLabelTrimMinWidth
                && scaleHeight > self.xAxisLabelTrimMinHeight
                && !self.isHorizontalBrushDisplayed) {
                if (xAxisSettings.isLabelAutoTilt && typeof d === "string") {
                    self.wrapAxisLabel(nodes[i], scaleWidth);
                }
            }
        });
}

export const GetXScale = (self: Visual, value: number | string): number => {
    if (self.isCutAndClipAxisEnabled && self.isHorizontalChart) {
        const beforeCutDomain = self.beforeCutLinearScale.domain();
        const afterCutDomain = self.afterCutLinearScale.domain();
        if (value >= beforeCutDomain[0] && value <= beforeCutDomain[1]) {
            return self.beforeCutLinearScale(value);
        } else if (value >= afterCutDomain[0] && value <= afterCutDomain[1]) {
            return self.afterCutLinearScale(value);
        } else if (value > beforeCutDomain[1] && value < afterCutDomain[0]) {
            let diff = 0;
            if (self.isHorizontalChart) {
                diff = self.isLeftYAxis ? -self.barCutAndClipMarkerLinesGap / 2 : self.barCutAndClipMarkerLinesGap / 2;
            } else {
                // diff = self.isBottomXAxis ? self.barCutAndClipMarkerLinesGap / 2 : -self.barCutAndClipMarkerLinesGap / 2;
            }
            return self.beforeCutLinearScale(beforeCutDomain[1]) - diff;
        }
    } else {
        return self.xScale(value);
    }
}