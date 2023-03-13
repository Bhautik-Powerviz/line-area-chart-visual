import { Visual } from '../visual';
import { IAxisConfig } from '../visual-settings.model';
import { select as d3Select } from "d3-selection";
import { scaleBand } from "d3-scale";
import { BarType, DataRolesName, Position } from "../enum";
import { easeLinear } from "d3";
import { CallXScaleOnAxisGroupWithTransition, CallYScaleOnAxisGroup, CallYScaleOnAxisGroupWithTransition, SetYAxisDomain, SetYAxisRange, SetYAxisTickStyle } from './YAxis.methods';
import { RenderXGridLines, RenderYGridLines } from './GridLines.methods';
import { CallXScaleOnAxisGroup, SetXAxisDomain, SetXAxisRange, SetXAxisTickStyle } from "./XAxis.methods";
import { RemoveXYAxisImagesLabel, RenderXAxisImagesLabel, RenderYAxisImagesLabel, SetAxisLabeImageSize, SetXYAxisTickPositionForImageLabel } from "./AxisImageLabel.methods";
import { min as d3Min, max as d3Max, sum as d3Sum } from "d3-array";
import powerbi from 'powerbi-visuals-api';
import { CallLinearCutScaleOnAxisGroup, SetLinearCutAxisRange } from './CutAndClip.methods';
import { GetFormattedNumber } from './NumberFormat.methods';

export const RenderXYAxis = (self: Visual, axisConfig: IAxisConfig): void => {
    const categoricalData = axisConfig.categoricalData;

    let width = axisConfig.width;
    let height = axisConfig.height;
    const xAxisG = axisConfig.xAxisG;
    const yAxisG = axisConfig.yAxisG;
    let xAxisYPos = axisConfig.xAxisYPos;
    let yAxisXPos = axisConfig.yAxisXPos;

    if (self.isShowRegularXAxis) {
        SetXAxisDomain(self, false, categoricalData);
        SetXAxisRange(self, width);
        CallXScaleOnAxisGroup(self, width, xAxisYPos, xAxisG);
    }

    if (self.isShowRegularYAxis) {
        SetYAxisDomain(self, false, categoricalData);
        SetYAxisRange(self, height);
        CallYScaleOnAxisGroup(self, yAxisXPos, height, yAxisG);
    }

    self.setScaleBandWidth();

    d3Select(xAxisG)
        .selectAll(".tick")
        .selectAll("text")
        .style("display", self.xAxisSettings.isDisplayLabel ? "block" : "none");

    d3Select(yAxisG)
        .selectAll(".tick")
        .selectAll("text")
        .style("display", self.yAxisSettings.isDisplayLabel ? "block" : "none");

    if (self.isHasImagesData && self.isLabelImageWithinAxis) {
        SetAxisLabeImageSize(self);
        if (self.isHorizontalChart) {
            RenderYAxisImagesLabel(self);
        } else {
            RenderXAxisImagesLabel(self);
        }
    }
    RemoveXYAxisImagesLabel(self);

    SetXAxisTickStyle(self, xAxisG, self.xScaleWidth, self.yScaleHeight);
    SetYAxisTickStyle(self, yAxisG);

    // self.svg.select(".yAxisG").each(function () {
    //     self.yScaleGWidth = self.getBBox().width;
    //     self.yAxisTickHeight = (d3.select(self).select("text").node() as SVGSVGElement).getBBox().height;
    //     self.setMargins();
    // });

    // self.svg.select(".xAxisG").each(function () {
    //     self.xScaleGHeight = self.getBBox().height - (self.isLabelImageWithinAxis ? self.axisLabelImageHeight : 0);
    //     self.xAxisTickHeight = (d3.select(self).select("text").node() as SVGSVGElement).getBBox().height;
    //     self.setMargins();
    // });

    self.yScaleGWidth = (d3Select(yAxisG))!.node()!.getBoundingClientRect().width
    self.yAxisTickHeight = (d3Select(yAxisG).select("text").node() as any).getBBox().height;

    self.xScaleGHeight =
        d3Select(xAxisG)!.node()!.getBoundingClientRect()?.height -
        (self.isLabelImageWithinAxis ? self.axisLabelImageHeight : 0);

    self.xAxisTickHeight = (d3Select(xAxisG).select("text").node() as any).getBBox().height;

    self.setMargins();

    if (!self.isSmallMultiplesEnabled || !self.isHasSmallMultiplesData) {
        width = self.width;
        height = self.height;
        xAxisYPos = self.height;
        yAxisXPos = self.width;
    }

    // self.callXYScaleOnAxisGroup();
    // self.setXAxisTickStyle();
    // self.setYAxisTickStyle();

    self.xScaleWidth = (self.scaleBandWidth * width) / self.scaleBandWidth;

    self.yScaleHeight = (self.scaleBandWidth * height) / self.scaleBandWidth;

    if (self.isHorizontalChart) {
        SetYAxisRange(self, self.yScaleHeight);
        if (!self.isCutAndClipAxisEnabled) {
            SetXAxisRange(self, width);
        } else {
            SetLinearCutAxisRange(self, width, self.yScaleHeight);
        }
    } else {
        SetXAxisRange(self, self.xScaleWidth);
        if (!self.isCutAndClipAxisEnabled) {
            SetYAxisRange(self, height);
        } else {
            SetLinearCutAxisRange(self, self.xScaleWidth, height);
        }
    }

    self.setScaleBandWidth();

    // self.xScaleWidth = (self.chartSettings.barDistance * self.width) / self.scaleBandWidth;
    // self.yScaleHeight = (self.chartSettings.barDistance * self.height) / self.scaleBandWidth;

    // if (self.chartSettings.barDistanceType === BarDistanceType.Custom) {
    //     if (self.width > self.xScaleWidth && self.height > self.yScaleHeight) {
    //         if (self.isHorizontalChart) {
    //             self.setXYAxisRange(self.width, self.yScaleHeight);
    //             self.setScaleBandWidth();
    //         } else {
    //             self.setXYAxisRange(self.xScaleWidth, self.height);
    //             self.setScaleBandWidth();
    //         }
    //     }
    // }

    const innerPadding = self.getGroupedScaleInnerPadding();
    self.groupedBarBandScale = scaleBand()
        .domain(self.subCategoriesName.map((d, i) => (self.isGroupedStackedBar ? d : i + "")))
        .range([0, self.scaleBandWidth])
        .paddingInner(innerPadding);

    self.groupedBarScaleBandWidth = self.groupedBarBandScale.bandwidth();

    self.container.attr("transform", "translate(" + self.margin.left + "," + self.margin.top + ")");

    if (self.isChartIsRaceBarChart) {
        // self.callXYScaleOnAxisGroupWithTransition(self.isBarRacePlaying ? self.tickDuration : 0);

        if (self.isShowRegularXAxis) {
            CallXScaleOnAxisGroupWithTransition(self, self.isBarRacePlaying ? self.tickDuration : 0);
        }

        if (self.isShowRegularYAxis) {
            CallYScaleOnAxisGroupWithTransition(self, self.isBarRacePlaying ? self.tickDuration : 0);
        }
    } else {
        if (self.isShowRegularXAxis) {
            CallXScaleOnAxisGroup(self, width, xAxisYPos, xAxisG);
        }

        if (self.isShowRegularYAxis) {
            CallYScaleOnAxisGroup(self, yAxisXPos, height, yAxisG);
        }

        if (self.isCutAndClipAxisEnabled) {
            CallLinearCutScaleOnAxisGroup(self);
        }

        SetXAxisTickStyle(self, xAxisG, self.xScaleWidth, self.yScaleHeight);
        SetYAxisTickStyle(self, yAxisG);
    }

    RenderXGridLines(self);
    RenderYGridLines(self);

    if (self.isLabelImageWithinAxis && !self.isHorizontalChart) {
        SetAxisLabeImageSize(self);
        if (self.isHasImagesData && self.isLabelImageWithinAxis) {
            if (self.isHorizontalChart) {
                RenderYAxisImagesLabel(self);
            } else {
                RenderXAxisImagesLabel(self);
            }
        }

        SetXYAxisTickPositionForImageLabel(self);
    }
}

export const RenderXYAxisTitle = (self: Visual): void => {
    const xAxisSettings = self.xAxisSettings;
    const yAxisSettings = self.yAxisSettings;

    self.xAxisTitleText
        .attr("fill", xAxisSettings.titleColor)
        .attr("font-size", xAxisSettings.titleFontSize)
        .style("font-family", xAxisSettings.titleFontFamily)
        .style("display", xAxisSettings.isDisplayTitle ? "block" : "none");

    self.yAxisTitleText
        .attr("fill", yAxisSettings.titleColor)
        .attr("font-size", yAxisSettings.titleFontSize)
        .style("font-family", self.yAxisSettings.titleFontFamily)
        .style("display", yAxisSettings.isDisplayTitle ? "block" : "none");

    const xAxisTitle = self.isHorizontalChart ? self.valuesTitle : self.categoryTitle;
    if (!xAxisSettings.titleName) {
        xAxisSettings.titleName = xAxisTitle;
        xAxisSettings.titleName = xAxisTitle;
    }
    self.xAxisTitleText.text(xAxisSettings.titleName ?? xAxisTitle);

    const yAxisTitle = self.isHorizontalChart ? self.categoryTitle : self.valuesTitle;
    if (!yAxisSettings.titleName) {
        yAxisSettings.titleName = yAxisTitle;
        yAxisSettings.titleName = yAxisTitle;
    }
    self.yAxisTitleText.text(yAxisSettings.titleName ?? yAxisTitle);

    if (xAxisSettings.position === Position.Bottom) {
        self.xAxisTitleG
            .attr(
                "transform",
                `translate(${0}, ${self.height + self.margin.bottom - self.brushHeight / 2 - self.axisTitleMargin})`
            )
            .transition()
            .duration(self.tickDuration)
            .ease(easeLinear)
            .attr(
                "transform",
                `translate(${self.width / 2}, ${self.height + self.margin.bottom - self.brushHeight / 2 - self.axisTitleMargin
                })`
            );
    } else if (xAxisSettings.position === Position.Top) {
        self.xAxisTitleG.attr(
            "transform",
            `translate(${self.width / 2}, ${-self.margin.top + 2 * self.axisTitleMargin})`
        );
    }

    if (yAxisSettings.position === Position.Left) {
        self.yAxisTitleG.attr(
            "transform",
            `translate(${-self.margin.left + self.axisTitleMargin + self.axisTitleMargin}, ${self.height / 2})`
        );
    } else if (yAxisSettings.position === Position.Right) {
        self.yAxisTitleG.attr(
            "transform",
            `translate(${self.width + self.margin.right - self.brushWidth / 2 - self.axisTitleMargin}, ${self.height / 2})`
        );
    }
}

export const FormattingAxisNumber = (self: Visual, tickEle: any, number: number): void => {
    const ele = d3Select(tickEle);
    ele.text(GetFormattedNumber(self, number, false));
}

export const GetAxisDomainMinMax = (self: Visual, categoricalData: powerbi.DataViewCategorical): { min: number; max: number } => {
    const categoricalMeasureValues = categoricalData.values.filter((v) =>
        Object.keys(v.source.roles).includes(DataRolesName.Value)
    ).map(d => d.values);

    const othersValues = self.chartData.map(d => d.subCategories.find(d => d.category === self.othersBarText)?.value);
    if (othersValues?.length) {
        categoricalMeasureValues.push(othersValues);
    }

    const barType = self.chartSettings.barType;
    let max = 0;
    let minVal = 0;

    if (self.isChartIsRaceBarChart) {
        // max = d3.max(this.chartData, (d) => <number>d.value);
        // minVal = d3.min(this.chartData, (d) => <number>d.value);

        max = +d3Max(categoricalMeasureValues, (d: any) => d3Max(d, (s: any) => s));
        minVal = +d3Min(categoricalMeasureValues, (d: any) => d3Min(d, (s: any) => s));

        const categoricalUpperBoundValues = categoricalData.values.filter((value) => value.source.roles.upperBound);
        // const maxValByUpperBounds = d3.max(this.chartData.map((d) => d.upperBoundValue));
        const maxValByUpperBounds = +d3Max(categoricalUpperBoundValues, (d: any) => d3Max(d, (s: any) => s));

        max = maxValByUpperBounds > max ? maxValByUpperBounds : max;

        // if (barType === BarType.Grouped) {
        //   max = d3.max(this.chartData, (d) => d3.max(d.subCategories, (s) => s.value));
        //   minVal = d3.min(this.chartData, (d) => d3.min(d.subCategories, (s) => s.value));
        // }

        // if (barType === BarType.Stacked || barType === BarType.GroupedStacked) {
        //   max = d3.max(this.chartData, (d) => d.value);
        //   minVal = d3.min(this.chartData, (d) => d.value);
        // }
    } else {
        max = +d3Max(categoricalMeasureValues, (d: any) => d3Max(d, (s: any) => s));
        minVal = +d3Min(categoricalMeasureValues, (d: any) => d3Min(d, (s: any) => s));

        const maxValByUpperBounds = d3Max(self.chartData.map((d) => d.upperBoundValue));
        max = maxValByUpperBounds > max ? maxValByUpperBounds : max;

        if (barType === BarType.Grouped) {
            // if (this.categoricalLegendsData) {
            max = d3Max(categoricalMeasureValues, (d: any) => d3Max(d, (d) => <number>d));
            minVal = d3Min(categoricalMeasureValues, (d: any) => d3Min(d, (d) => <number>d));
            // } else {
            //     max = d3.max(categoricalMeasureValues, (d: any) => <number>d.maxLocal);
            //     minVal = d3.min(categoricalMeasureValues, (d: any) => <number>d.minLocal);
            // }
        }

        if (barType === BarType.Stacked || barType === BarType.GroupedStacked) {
            // if (this.categoricalLegendsData) {
            max = d3Max(categoricalMeasureValues, (p: any, i) =>
                d3Max(p, (q, j) => d3Sum(categoricalMeasureValues, (r: any, k) => <number>r[j]))
            );
            minVal = d3Min(categoricalMeasureValues, (d: any) => d3Min(d, (d) => <number>d));
            // } else {
            //     max = d3.max(categoricalMeasureValues, (d: any) => <number>d.maxLocal);
            //     minVal = d3.min(categoricalMeasureValues, (d: any) => <number>d.minLocal);
            // }
        }
    }

    let min = minVal < 0 ? minVal : 0;
    if (min < 0) {
        min += min * 0.15;
    }

    max += max * 0.15;

    if (self.axisByBarOrientation.minimumRange) {
        minVal = self.axisByBarOrientation.minimumRange;
        min = minVal;

        if (min < 0) {
            min += min * 0.05;
        }
    }

    if (self.axisByBarOrientation.maximumRange) {
        max = self.axisByBarOrientation.maximumRange;

        max += max * 0.05;
    }

    if (self.chartSettings.isPercentageStackedBar) {
        const minPercentageValue = d3Min(self.chartData, d => d.minValue);
        min = minPercentageValue > 0 ? 0 : minPercentageValue - 5;
        max = 105;
    }
    return { min: min, max: max > 0 ? max : 0 };
}

export const SetXYAxisRange = (self: Visual, xScaleWidth: number, yScaleHeight: number): void => {
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

        self.yScale.range(self.xAxisSettings.position === Position.Bottom ? [start, end] : [end, start]);

        // self.yScale.range(self.xAxisSettings.position === Position.Bottom ? [yScaleHeight, 0] : [0, yScaleHeight]);

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

        // self.xScale.range(self.yAxisSettings.position === Position.Left ? [0, xScaleWidth] : [xScaleWidth, 0]);
        // self.xScale2.range(self.yAxisSettings.position === Position.Left ? [0, xScaleWidth] : [xScaleWidth, 0]);

        self.yScale.range(
            self.xAxisSettings.position === Position.Bottom
                ? [yScaleHeight - self.groupedStackedBarsLabelHeight, 0]
                : [self.groupedStackedBarsLabelHeight, yScaleHeight]
        );

        if (self.isShowLabelImage && self.isLabelImageWithinBar) {
            if (self.chartSettings.barType === BarType.Stacked && self.isPercentageStackedBar) {
                if (self.isBottomLabelImageWithinBar) {
                    self.yScale.range(
                        self.xAxisSettings.position === Position.Bottom
                            ? [yScaleHeight - self.axisLabelImageHeight / 2, 0]
                            : [self.isBottomXAxis ? 0 : self.axisLabelImageHeight / 2, yScaleHeight + self.axisLabelImageHeight / 2]
                    );
                } else {
                    self.yScale.range(
                        self.xAxisSettings.position === Position.Bottom
                            ? [yScaleHeight, self.axisLabelImageHeight / 2]
                            : [0, yScaleHeight]
                    );
                }
            }
        }
    }
}
