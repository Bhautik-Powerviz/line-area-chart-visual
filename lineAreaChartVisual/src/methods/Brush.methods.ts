import { Visual } from "../visual";
import { select as d3Select } from "d3-selection";
import { min as d3Min, max as d3Max, range as d3Range } from "d3-array";
import { BarType, EDynamicDeviationDisplayTypes, Position } from "../enum";
import { IBrushConfig, ISmallMultiplesGridItemContent } from "../visual-settings.model";
import { axisBottom, axisLeft, axisRight, axisTop, brushSelection, brushX, brushY } from "d3";
import { RenderDynamicDeviation } from "./DynamicDeviation.methods";
import { CallXScaleOnAxisGroup, SetXAxisRange, SetXAxisTickStyle } from "./XAxis.methods";
import { CallXScaleOnAxisGroupWithTransition, CallYScaleOnAxisGroup, CallYScaleOnAxisGroupWithTransition, SetYAxisRange, SetYAxisTickStyle } from "./YAxis.methods";
import { CallLinearCutScaleOnAxisGroup, SetLinearCutAxisRange } from "./CutAndClip.methods";
import { RenderTooltipByChartType } from "./Tooltip.methods";

export const RenderBrush = (self: Visual, isTest: boolean): void => {
    if (self.isHorizontalChart) {
        const newHeight = (self.scaleBandWidth * self.height) / self.brushScaleBandBandwidth;
        if (self.height < newHeight) {
            self.isScrollBrushDisplayed = true;
            self.isVerticalBrushDisplayed = true;
            DrawVerticalBrush(self, self.scaleBandWidth, self.totalBarsCount, isTest);
        } else {
            self.isScrollBrushDisplayed = false;
            self.isVerticalBrushDisplayed = false;
            self.brushG.selectAll("*").remove();
        }
    } else {
        const newWidth = (self.scaleBandWidth * self.xScaleWidth) / self.brushScaleBandBandwidth;
        if (self.width < newWidth) {
            self.isScrollBrushDisplayed = true;
            self.isHorizontalBrushDisplayed = true;

            const brushXPos = self?.margin?.left ?? 0;
            const brushYPos = self.viewPortHeight - self.brushHeight - self.settingsBtnHeight - self.legendViewPort.height;

            const config: IBrushConfig = {
                brushG: self.brushG.node(),
                brushXPos: brushXPos,
                brushYPos: brushYPos,
                barDistance: self.scaleBandWidth,
                totalBarsCount: self.totalBarsCount,
                isOnlySetScaleDomainByBrush: isTest,
                scaleWidth: self.width,
                scaleHeight: self.height,
                smallMultiplesGridItemId: null,
                categoricalData: self.categoricalData
            }

            DrawHorizontalBrush(this, config);
        } else {
            self.isScrollBrushDisplayed = false;
            self.isHorizontalBrushDisplayed = false;
            self.brushG.selectAll("*").remove();
        }
    }
}

export const DrawHorizontalBrush = (self: Visual, config: IBrushConfig): void => {
    const smallMultiplesGridItemId = config.smallMultiplesGridItemId;
    const brushG: SVGElement = config.brushG;
    const brushXPos: number = config.brushXPos;
    const brushYPos: number = config.brushYPos;
    const barDistance: number = config.barDistance;
    const totalBarsCount: number = config.totalBarsCount;
    const isOnlySetScaleDomainByBrush: boolean = config.isOnlySetScaleDomainByBrush;
    const scaleWidth: number = config.scaleWidth;
    const scaleHeight: number = config.scaleHeight;
    let categoricalData: any = JSON.parse(JSON.stringify(config.categoricalData));

    let smallMultiplesGridItemContent1 = self.smallMultiplesGridItemContent[smallMultiplesGridItemId];

    const xScaleDomain = self.brushScaleBandClone.domain();
    const brushed = (selection, isOnlySetScaleDomainByBrush, smallMultiplesGridItemContent: ISmallMultiplesGridItemContent) => {
        var newXScaleDomain: string[] = [];
        const newGroupedBarBandScaleDomain = [];
        let brushArea = selection;
        if (brushArea === null) brushArea = self.xScale.range();

        xScaleDomain.forEach((d: any) => {
            var pos = self.brushScaleBandClone(d);
            if (pos >= brushArea[0] && pos <= brushArea[1]) {
                newXScaleDomain.push(d);
            }
        });

        self.newScaleDomainByBrush = newXScaleDomain;
        const newXScaleDomainInString = newXScaleDomain.map((d: any) => d.toString());

        if (isOnlySetScaleDomainByBrush) {
            if (self.isSMUniformXAxis) {
                categoricalData = JSON.parse(JSON.stringify(smallMultiplesGridItemContent.categoricalData))
            }

            const startIndex = categoricalData.categories[self.categoricalCategoriesLastIndex].values.indexOf(self.newScaleDomainByBrush[0]);
            const endIndex = categoricalData.categories[self.categoricalCategoriesLastIndex].values.lastIndexOf(
                self.newScaleDomainByBrush[self.newScaleDomainByBrush.length - 1]
            );

            const clonedCategoricalData = JSON.parse(JSON.stringify(categoricalData));
            clonedCategoricalData.categories.forEach((d, i) => {
                d.values = categoricalData.categories[i].values.slice(startIndex, endIndex + 1);
            });

            clonedCategoricalData.values.forEach((d, i) => {
                d.values = categoricalData.values[i].values.slice(startIndex, endIndex + 1);
            });

            const [x, y] = self.xScale.range();
            self.brushScaleBand.range([x, y]);

            self.initChartConfigByChartSettings(clonedCategoricalData);

            if (self.isXIsContinuousAxis) {
                if (self.chartSettings.barType === BarType.Normal) {
                    const min: number = d3Min(newXScaleDomain, (d) => parseInt(d)) as number;
                    const max: number = d3Max(newXScaleDomain, (d) => parseInt(d)) as number;
                    self.xScale.domain([min, max]);
                    const range = d3Range(min, max);
                    self.numericCategoriesBandScale.domain(range.map((d) => d.toString()));

                    // const min = d3.min(newXScaleDomain, (d) => parseInt(d) - 0.5);
                    // const max = d3.max(newXScaleDomain, (d) => parseInt(d) + 0.5);
                    // this.xScale.domain([min, max]);
                    // const range = d3.range(min, max);
                    // this.numericCategoriesBandScale.domain(range.map((d) => d.toString()));
                } else {
                    const min: number = d3Min(newXScaleDomain, (d) => parseInt(d)) as number;
                    const max: number = d3Max(newXScaleDomain, (d) => parseInt(d)) as number;
                    self.xScale.domain([min, max]);
                    const range = d3Range(min, max + 1);
                    self.numericCategoriesBandScale.domain(range.map((d) => d.toString()));
                }
            } else {
                self.xScale.domain(newXScaleDomain);
            }

            // if (this.chartSettings.barType === BarType.Grouped || this.chartSettings.barType === BarType.GroupedStacked)
            //     this.chartData.forEach((d) => {
            //         if (newXScaleDomain.includes(d.category)) {
            //             d.subCategories.forEach((s) => {
            //                 newGroupedBarBandScaleDomain.push(s.category);
            //             });
            //         }
            //     });

            // if (this.isBarChartDrawn)
            if (true) {
                if (self.gridSettings.xGridLines.show) {
                    self.xGridLinesSelection.attr("x1", (d) => self.xScale(d)).attr("x2", (d) => self.xScale(d));
                }

                if (self.isShowRegularXAxis) {
                    SetXAxisRange(self, scaleWidth);
                }

                if (self.isShowRegularYAxis) {
                    // this.setYAxisRange(scaleWidth, scaleHeight);
                }

                if (self.isCutAndClipAxisEnabled) {
                    SetLinearCutAxisRange(self, scaleWidth, scaleHeight);
                }

                if (smallMultiplesGridItemContent) {
                    let xAxisGNode2: any = smallMultiplesGridItemContent.xAxisG;

                    if (self.isSMUniformXAxis) {
                        xAxisGNode2 = document.getElementById(`uniformXAxis-${config.brushNumber}`);
                    }

                    const svg = d3Select(smallMultiplesGridItemContent.svg);
                    const xAxisG = d3Select(xAxisGNode2);

                    const yAxisG = d3Select(smallMultiplesGridItemContent.yAxisG);

                    if (self.xAxisSettings.position === Position.Bottom) {
                        xAxisG
                            .attr("transform", "translate(0," + scaleHeight + ")")
                            .call(axisBottom(self.xScale).ticks(scaleWidth / 90));
                    } else if (self.xAxisSettings.position === Position.Top) {
                        yAxisG
                            .attr("transform", "translate(0," + 0 + ")")
                            .call(axisTop(self.xScale).ticks(scaleWidth / 90) as any);
                    }

                    const THIS = self;
                    SetXAxisTickStyle(self, xAxisG.node(), self.xScaleWidth, self.yScaleHeight);
                    svg.select(".xAxisG").each(function () {
                        // THIS.xScaleGHeight = this.getBBox().height;
                        THIS.xAxisTickHeight = (d3Select(this).select("text").node() as SVGSVGElement).getBBox().height;
                        THIS.setMargins();
                    });

                    if (self.isShowRegularXAxis) {
                        SetXAxisRange(self, scaleWidth);

                        if (self.isChartIsRaceBarChart) {
                            CallXScaleOnAxisGroupWithTransition(self, self.isBarRacePlaying ? self.tickDuration : 0);
                        } else {
                            CallXScaleOnAxisGroup(self, scaleWidth, scaleHeight, smallMultiplesGridItemContent.xAxisG);
                        }
                    }

                    if (self.isShowRegularYAxis) {
                        // this.setYAxisRange(scaleWidth, scaleHeight);

                        if (self.isChartIsRaceBarChart) {
                            CallYScaleOnAxisGroupWithTransition(self, self.isBarRacePlaying ? self.tickDuration : 0);
                        } else {
                            CallYScaleOnAxisGroup(self, scaleWidth, scaleHeight, smallMultiplesGridItemContent.yAxisG);
                        }
                    }

                    self.setScaleBandWidth();

                    if (self.isCutAndClipAxisEnabled) {
                        SetLinearCutAxisRange(self, scaleWidth, scaleHeight);
                        CallLinearCutScaleOnAxisGroup(self);
                    }

                    SetXAxisTickStyle(self, xAxisG.node(), self.xScaleWidth, self.yScaleHeight);
                    SetYAxisTickStyle(self, yAxisG.node() as any);

                    if (self.chartSettings.barType === BarType.Grouped || self.chartSettings.barType === BarType.GroupedStacked) {
                        const clonedScale = self.numericCategoriesBandScale;
                        const scaleBandWidth = clonedScale.bandwidth();
                        self.groupedBarBandScale
                            .domain(self.subCategories.map((d, i) => (self.isGroupedStackedBar ? d.name : i + "")))
                            .range([0, scaleBandWidth])
                            .paddingInner(self.getGroupedScaleInnerPadding());

                        self.groupedBarScaleBandWidth = self.groupedBarBandScale.bandwidth();
                    }

                    const filteredChartData = self.chartData.filter((d) => newXScaleDomainInString.includes(d.category));

                    const filteredStackedBarChartData = self.stackedBarChartData.filter((d) =>
                        newXScaleDomainInString.includes(d.category)
                    );
                    const clonedGroupedBarChartData = JSON.parse(JSON.stringify(self.groupedBarChartData));
                    const newGroupedBarChartData = clonedGroupedBarChartData.filter((d) => {
                        return newXScaleDomainInString.includes(d.category);
                    });

                    self.normalBarG = d3Select(smallMultiplesGridItemContent.normalBarG);

                    self.drawBarChart(
                        filteredChartData,
                        newGroupedBarChartData,
                        filteredStackedBarChartData,
                        self.getGroupedBarsDataLabelsData(newGroupedBarChartData)
                    );
                }

                if (!smallMultiplesGridItemContent) {
                    if (self.xAxisSettings.position === Position.Bottom) {
                        self.xAxisG
                            .attr("transform", "translate(0," + self.height + ")")
                            .call(axisBottom(self.xScale).ticks(self.width / 90));
                    } else if (self.xAxisSettings.position === Position.Top) {
                        self.xAxisG
                            .attr("transform", "translate(0," + 0 + ")")
                            .call(axisTop(self.xScale).ticks(self.width / 90));
                    }

                    const THIS = self;
                    SetXAxisTickStyle(self, self.xAxisG.node(), self.xScaleWidth, self.yScaleHeight);
                    self.svg.select(".xAxisG").each(function () {
                        THIS.xScaleGHeight = this.getBBox().height;
                        THIS.xAxisTickHeight = (d3Select(this).select("text").node() as SVGSVGElement).getBBox().height;
                        THIS.setMargins();
                    });

                    if (self.isShowRegularXAxis) {
                        SetXAxisRange(self, self.width);

                        if (self.isChartIsRaceBarChart) {
                            CallXScaleOnAxisGroupWithTransition(self, self.isBarRacePlaying ? self.tickDuration : 0);
                        } else {
                            CallXScaleOnAxisGroup(self, scaleWidth, self.height, self.xAxisG.node());
                        }
                    }

                    if (self.isShowRegularYAxis) {
                        SetYAxisRange(self, self.height);

                        if (self.isChartIsRaceBarChart) {
                            CallYScaleOnAxisGroupWithTransition(self, self.isBarRacePlaying ? self.tickDuration : 0);
                        } else {
                            CallYScaleOnAxisGroup(self, self.width, self.height, self.yAxisG.node());
                        }
                    }

                    self.setScaleBandWidth();

                    if (self.isCutAndClipAxisEnabled) {
                        SetLinearCutAxisRange(self, self.width, self.height);
                        CallLinearCutScaleOnAxisGroup(self);
                    }

                    SetXAxisTickStyle(self, self.xAxisG.node(), self.xScaleWidth, self.yScaleHeight);
                    SetYAxisTickStyle(self, self.yAxisG.node());

                    if (self.chartSettings.barType === BarType.Grouped || self.chartSettings.barType === BarType.GroupedStacked) {
                        const clonedScale = self.numericCategoriesBandScale;
                        const scaleBandWidth = clonedScale.bandwidth();
                        self.groupedBarBandScale
                            .domain(self.subCategories.map((d, i) => (self.isGroupedStackedBar ? d.name : i + "")))
                            .range([0, scaleBandWidth])
                            .paddingInner(self.getGroupedScaleInnerPadding());

                        self.groupedBarScaleBandWidth = self.groupedBarBandScale.bandwidth();
                    }

                    const filteredChartData = self.chartData.filter((d) => newXScaleDomainInString.includes(d.category));
                    const filteredStackedBarChartData = self.stackedBarChartData.filter((d) =>
                        newXScaleDomainInString.includes(d.category)
                    );
                    const clonedGroupedBarChartData = JSON.parse(JSON.stringify(self.groupedBarChartData));
                    const newGroupedBarChartData = clonedGroupedBarChartData.filter((d) => {
                        return newXScaleDomainInString.includes(d.category);
                    });

                    self.drawBarChart(
                        filteredChartData,
                        newGroupedBarChartData,
                        filteredStackedBarChartData,
                        self.getGroupedBarsDataLabelsData(newGroupedBarChartData)
                    );

                    if (self.dynamicDeviationSettings.isEnabled && self.chartSettings.barType === BarType.Normal) {
                        if (
                            self.dynamicDeviationSettings.isEnabled &&
                            self.fromCategoryValueDataPair &&
                            self.toCategoryValueDataPair
                        ) {
                            if (self.dynamicDeviationSettings.displayType === EDynamicDeviationDisplayTypes.FirstToLast) {
                                const from = self.chartData[0];
                                const to = self.chartData[self.chartData.length - 1];
                                RenderDynamicDeviation(
                                    self,
                                    { category: from.category, value: from.value },
                                    { category: to.category, value: to.value }
                                );
                            } else if (self.dynamicDeviationSettings.displayType === EDynamicDeviationDisplayTypes.LastToFirst) {
                                const from = self.chartData[self.chartData.length - 1];
                                const to = self.chartData[0];
                                RenderDynamicDeviation(
                                    self,
                                    { category: from.category, value: from.value },
                                    { category: to.category, value: to.value }
                                );
                            } else {
                                RenderDynamicDeviation(self, self.fromCategoryValueDataPair, self.toCategoryValueDataPair);
                            }
                        }
                    }
                }

                RenderTooltipByChartType(self, self.normalBarG, self.stackedBarG, self.groupedBarG);
            }
        }
    };

    const brush = brushX()
        .extent([
            [0, 0],
            [scaleWidth - (self.dynamicDeviationSettings.isEnabled ? scaleWidth * 0.05 : 0), self.brushHeight - 2],
        ])
        .on("brush", (event, d) => {
            if (!self.isSMUniformXAxis) {
                brushed(event.selection, isOnlySetScaleDomainByBrush, smallMultiplesGridItemContent1);
            } else {
                const cols = self.smallMultiplesSettings.columns;
                let divider = config.brushNumber! + 1;

                for (let index = 1; index <= self.smallMultiplesCategoriesName.length; index++) {
                    if (index % divider === 0) {
                        const name = self.smallMultiplesCategoriesName[index - 1];
                        const smallMultiplesGridItemContent2 = self.smallMultiplesGridItemContent[name];
                        brushed(event.selection, true, smallMultiplesGridItemContent2);
                        divider += cols;
                    }
                }
            }
        });

    let scrolled = false;
    (self.isSmallMultiplesEnabled && self.isHasSmallMultiplesData ? d3Select(smallMultiplesGridItemContent1?.svg) : self.svg)?.on("wheel", (event, d) => {
        if (!scrolled) {
            scrolled = true;
            const prevExtent = brushSelection(brushG as any);
            const direction = event.wheelDelta < 0 ? 'down' : 'up';
            const isRightDirection = direction === "up";
            if (!self.isHorizontalChart) {
                if (isRightDirection) {
                    if (prevExtent![1] < scaleWidth) {
                        d3Select(brushG)
                            .call(brush.move as any, [+prevExtent![0] + self.brushScaleBandBandwidth, +prevExtent![1] + self.brushScaleBandBandwidth]);
                    }
                } else {
                    if (prevExtent![0] >= 0) {
                        d3Select(brushG)
                            .call(brush.move as any, [+prevExtent![0] - self.brushScaleBandBandwidth, +prevExtent![1] - self.brushScaleBandBandwidth]);
                    }
                }
            }
            setTimeout(() => { scrolled = false; });
        }
    });

    if (self.smallMultiplesGridItemContent && smallMultiplesGridItemId) {
        self.smallMultiplesGridItemContent[smallMultiplesGridItemId] = {
            ...self.smallMultiplesGridItemContent[smallMultiplesGridItemId],
            brush: brush,
            brushG: d3Select(brushG)
        }
    }

    const expectedBar = Math.ceil(scaleWidth / barDistance);
    const totalBar = totalBarsCount;
    const widthByExpectedBar = (expectedBar * scaleWidth) / totalBar;

    d3Select(brushG)
        .attr(
            "transform",
            `translate(${brushXPos}, ${brushYPos})`
        )
        .call(brush as any)
        .call(brush.move as any, [0, widthByExpectedBar]);
    // .call(brush.move, [[0, 0], [widthByExpectedBar, 2]]);

    d3Select(brushG)
        .selectAll("rect")
        .attr("height", self.brushHeight - 2)
        .attr("rx", 4)
        .attr("ry", 4)
        .attr("cursor", "default");
    d3Select(brushG).selectAll(".handle")?.remove();
}

export const DrawVerticalBrush = (self: Visual, barDistance: number, totalBarsCount: number, isOnlySetScaleDomainByBrush: boolean): void => {
    const yScaleDomain = self.brushScaleBandClone.domain();

    const brushed = ({ selection }) => {
        var newYScaleDomain = [];
        const newGroupedBarBandScaleDomain = [];
        var brushArea = selection;
        if (brushArea === null) brushArea = self.yScale.range();

        yScaleDomain.forEach((d) => {
            const pos = self.brushScaleBand(d);
            if (pos >= brushArea[0] && pos <= brushArea[1]) {
                newYScaleDomain.push(d);
            }
        });

        self.newScaleDomainByBrush = newYScaleDomain;

        if (isOnlySetScaleDomainByBrush) {
            const startIndex = self.categoricalData.categories[self.categoricalCategoriesLastIndex].values.findIndex(
                (a) => a === self.newScaleDomainByBrush[0]
            );
            const endIndex = self.categoricalData.categories[self.categoricalCategoriesLastIndex].values.findIndex(
                (a) => a === self.newScaleDomainByBrush[self.newScaleDomainByBrush.length - 1]
            );

            const clonedCategoricalData = JSON.parse(JSON.stringify(self.categoricalData));
            clonedCategoricalData.categories.forEach((d, i) => {
                d.values = self.categoricalData.categories[i].values.slice(startIndex, endIndex + 1);
            });

            clonedCategoricalData.values.forEach((d, i) => {
                d.values = self.categoricalData.values[i].values.slice(startIndex, endIndex + 1);
            });

            const [x, y] = self.yScale.range();
            self.brushScaleBand.range([x, y]);

            self.initChartConfigByChartSettings(clonedCategoricalData);

            if (self.isYIsContinuousAxis) {
                if (self.chartSettings.barType === BarType.Normal) {
                    const min = d3Min(newYScaleDomain, (d) => parseInt(d) - 0.5);
                    const max = d3Max(newYScaleDomain, (d) => parseInt(d) + 0.5);
                    self.yScale.domain([min, max]);
                    const range = d3Range(min, max + 1);
                    self.numericCategoriesBandScale.domain(range.map((d) => d.toString()));
                } else {
                    const min = d3Min(newYScaleDomain, (d) => parseInt(d));
                    const max = d3Max(newYScaleDomain, (d) => parseInt(d));
                    self.yScale.domain([min, max]);
                    const range = d3Range(min - 1, max + 1);
                    self.numericCategoriesBandScale.domain(range.map((d) => d.toString()));
                }
            } else {
                self.yScale.domain(newYScaleDomain);
            }

            // this.chartData.forEach((d) => {
            //     if (newYScaleDomain.includes(d.category)) {
            //         d.subCategories.forEach((s) => {
            //             newGroupedBarBandScaleDomain.push(s.category);
            //         });
            //     }
            // });

            // if (this.isBarChartDrawn)
            if (true) {
                if (self.gridSettings.yGridLines.show) {
                    self.yGridLinesSelection.attr("y1", (d) => self.yScale(d)).attr("y2", (d) => self.yScale(d));
                }

                let height = self.height;

                if (self.isCutAndClipAxisEnabled) {
                    SetLinearCutAxisRange(self, self.width, height);
                }

                if (self.isShowRegularXAxis) {
                    SetXAxisRange(self, self.width);
                }

                if (self.isShowRegularYAxis) {
                    SetYAxisRange(self, height);
                }

                if (self.yAxisSettings.position === Position.Left) {
                    self.yAxisG.attr("transform", `translate(0, 0)`).call(axisLeft(self.yScale).ticks(self.height / 70));
                } else if (self.yAxisSettings.position === Position.Right) {
                    self.yAxisG
                        .attr("transform", `translate(${self.width}, 0)`)
                        .call(axisRight(self.yScale).ticks(self.height / 70));
                }

                if (self.chartSettings.barType === BarType.Grouped || self.chartSettings.barType === BarType.GroupedStacked) {
                    const clonedScale = self.numericCategoriesBandScale;
                    const scaleBandWidth = clonedScale.bandwidth();
                    self.groupedBarBandScale
                        .domain(self.subCategories.reverse().map((d, i) => (self.isGroupedStackedBar ? d.name : i + "")))
                        .range([0, scaleBandWidth])
                        .paddingInner(self.getGroupedScaleInnerPadding())
                }

                self.groupedBarScaleBandWidth = self.groupedBarBandScale.bandwidth();

                const clonedGroupedBarChartData = JSON.parse(JSON.stringify(self.groupedBarChartData));
                const newGroupedBarChartData = clonedGroupedBarChartData.filter((d) => {
                    return newYScaleDomain.includes(d.category);
                });

                self.setScaleBandWidth();
                SetXAxisTickStyle(self, self.xAxisG.node(), self.xScaleWidth, self.yScaleHeight);
                SetYAxisTickStyle(self, self.yAxisG.node());

                const filteredChartData = self.chartData.filter((d) => newYScaleDomain.includes(d.category));
                const filteredStackedBarChartData = self.stackedBarChartData.filter((d) =>
                    newYScaleDomain.includes(d.category)
                );

                self.drawBarChart(
                    filteredChartData,
                    newGroupedBarChartData,
                    filteredStackedBarChartData,
                    self.getGroupedBarsDataLabelsData(newGroupedBarChartData)
                );

                if (self.dynamicDeviationSettings.isEnabled && self.chartSettings.barType === BarType.Normal) {
                    if (
                        self.dynamicDeviationSettings.isEnabled &&
                        self.fromCategoryValueDataPair &&
                        self.toCategoryValueDataPair
                    ) {
                        if (self.dynamicDeviationSettings.displayType === EDynamicDeviationDisplayTypes.FirstToLast) {
                            const from = self.chartData[0];
                            const to = self.chartData[self.chartData.length - 1];
                            RenderDynamicDeviation(
                                this,
                                { category: from.category, value: from.value },
                                { category: to.category, value: to.value }
                            );
                        } else if (self.dynamicDeviationSettings.displayType === EDynamicDeviationDisplayTypes.LastToFirst) {
                            const from = self.chartData[self.chartData.length - 1];
                            const to = self.chartData[0];
                            RenderDynamicDeviation(
                                this,
                                { category: from.category, value: from.value },
                                { category: to.category, value: to.value }
                            );
                        } else {
                            RenderDynamicDeviation(this, self.fromCategoryValueDataPair, self.toCategoryValueDataPair);
                        }
                    }
                }

                RenderTooltipByChartType(self, self.normalBarG, self.stackedBarG, self.groupedBarG);
            }
        }
    };

    const brush = brushY()
        .extent([
            [0, self.dynamicDeviationSettings.isEnabled ? self.height * 0.075 : 0],
            [self.brushWidth - 2, self.height],
        ])
        .on("brush", brushed);

    const expectedBar = Math.ceil(self.height / barDistance);
    const totalBar = totalBarsCount;
    const heightByExpectedBar = (expectedBar * self.height) / totalBar;

    self.brushG
        .attr(
            "transform",
            `translate(${self.viewPortWidth - self.brushWidth - self.settingsPopupOptionsWidth - self.legendViewPort.width
            }, ${self.margin?.top ?? 0})`
        )
        .call(brush)
        .call(brush.move, [0, heightByExpectedBar]);

    self.brushG
        .selectAll("rect")
        .attr("width", self.brushWidth - 2)
        .attr("rx", 4)
        .attr("ry", 4)
        .attr("cursor", "default");
    self.brushG.selectAll(".handle").remove();

    let scrolled = false;
    d3Select(self.hostContainer).on("wheel", (event, d) => {
        if (!scrolled) {
            // scrolled = true;
            const prevExtent = brushSelection(self.brushG.node() as any);
            const direction = event.wheelDelta < 0 ? 'down' : 'up';
            const isBottomDirection = direction === "down";
            if (self.isHorizontalChart) {
                if (isBottomDirection) {
                    if (prevExtent[1] <= self.height) {
                        self.brushG
                            .call(brush.move, [+prevExtent[0] + self.brushScaleBandBandwidth, +prevExtent[1] + self.brushScaleBandBandwidth]);
                    }
                } else {
                    if (prevExtent[0] >= 0) {
                        self.brushG
                            .call(brush.move, [+prevExtent[0] - self.brushScaleBandBandwidth, +prevExtent[1] - self.brushScaleBandBandwidth]);
                    }
                }
            }
            // setTimeout(() => { scrolled = false; });
        }
    });
}