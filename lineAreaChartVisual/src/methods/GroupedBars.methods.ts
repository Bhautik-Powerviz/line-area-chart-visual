import { Visual } from "../visual";
import { select as d3Select, Selection } from "d3-selection";
import { IVisualCategoryData, IVisualSubCategoryData } from "../visual-data.model";
import { easeLinear, scaleLinear } from "d3";
import { IPatternProps } from "../visual-settings.model";
import { SetHorizontalBarDivVariationWidth, SetVerticalBarDivVariationWidth } from "./NormalBar.methods";
import { generatePattern } from "../methods";
import { GetGroupedBarAnnotationDataPoint, RenderBarAnnotations } from "../methods/Annotations.methods";
type D3Selection<T extends d3.BaseType> = Selection<T, any, any, any>;

export const GetGroupedBarWidth = (self: Visual, barData: IVisualCategoryData): number => {
    if (self.isHorizontalChart) {
        const getBarWidth = (d: IVisualCategoryData) => {
            if (self.isLeftYAxis) {
                return d.value >= 0 ? self.xScale(d.value) - self.xScale(0) : self.xScale(0) - self.xScale(d.value);
            } else {
                return d.value >= 0 ? self.xScale(0) - self.xScale(d.value) : self.xScale(d.value) - self.xScale(0);
            }
        };
        return getBarWidth(barData);
    } else {
        const barWidth = self.groupedBarBandScale.bandwidth();
        return barWidth;
    }
}

export const GetGroupedBarHeight = (self: Visual, barData: IVisualCategoryData): number => {
    if (self.isHorizontalChart) {
        const barHeight = self.groupedBarBandScale.bandwidth();
        return barHeight;
    } else {
        const getBarHeight = (d: IVisualCategoryData) => {
            if (self.isBottomXAxis) {
                return d.value >= 0 ? self.yScale(0) - self.yScale(d.value) : self.yScale(d.value) - self.yScale(0);
            } else {
                return d.value >= 0 ? self.yScale(d.value) - self.yScale(0) : self.yScale(0) - self.yScale(d.value);
            }
        };
        return getBarHeight(barData);
    }
}

export const FormattingHorizontalGroupedBar = (self: Visual, foreignObjectSelection: D3Selection<SVGElement>, divSelection: D3Selection<HTMLDivElement>, isUpdateMode: boolean): void => {
    const THIS = self;
    const barHeight = self.groupedBarScaleBandWidth;
    const paddingScale = scaleLinear()
        .domain([0, 100])
        .range([0, barHeight / 2]);

    const min = self.minScaleRangeFromSettings;
    const max = self.maxScaleRangeFromSettings;

    const getBarMinValue = (currentVal: number): number => {
        return self.xScale(currentVal < min && min > 0 ? min : currentVal);
    }

    const getBarCurrentValue = (currentVal: number): number => {
        return self.xScale(currentVal > max && max > 0 ? max : currentVal);
    }

    const getBarWidth = (d: IVisualCategoryData): number => {
        if (self.isLeftYAxis) {
            return d.value >= 0 ? getBarCurrentValue(d.value) - getBarMinValue(0) : getBarMinValue(0) - getBarCurrentValue(d.value);
        } else {
            return d.value >= 0 ? getBarMinValue(0) - getBarCurrentValue(d.value) : getBarCurrentValue(d.value) - getBarMinValue(0);
        }
    };

    const getBarYByAxisMaxRange = (barValue: number): number => {
        if (barValue > max && max > 0) {
            return max;
        } else {
            return barValue;
        }
    }

    const getBarX = (d: IVisualCategoryData): number => {
        return (d.value >= 0 ? self.xScale(self.isLeftYAxis ? min : getBarYByAxisMaxRange(d.value)) : self.xScale(!self.isLeftYAxis ? min : getBarYByAxisMaxRange(d.value))) ?? 0;
    };

    const getBarPadding = (d: IVisualCategoryData): { leftBarPadding: number; rightBarPadding: number } => {
        let leftBarPadding = paddingScale(self.chartSettings.barXPadding);
        let rightBarPadding = paddingScale(self.chartSettings.barYPadding);

        const barWidth = getBarWidth(d);
        if (barWidth / 2 < leftBarPadding) {
            const diff = leftBarPadding - barWidth / 2;
            leftBarPadding -= diff;
        }
        if (barWidth / 2 < rightBarPadding) {
            const diff = rightBarPadding - barWidth / 2;
            rightBarPadding -= diff;
        }
        return { leftBarPadding, rightBarPadding };
    };

    if (!isUpdateMode) {
        foreignObjectSelection
            .each(function (d) {
                d3Select(this).classed(`legend-item-${THIS.getTrimmedString(d.key)}`, true);
            })
            .attr("width", 0)
            .attr("height", barHeight)
            .attr("x", (d) => getBarX(d))
            .attr("y", (d) =>
                self.groupedBarBandScale(d.bandScaleKey)
            )
            .transition()
            .duration(self.tickDuration)
            .ease(easeLinear)
            .attr("width", (d) => getBarWidth(d))
            .on("end", () => {
                RenderBarAnnotations(self, GetGroupedBarAnnotationDataPoint);
            });
    } else {
        foreignObjectSelection
            .transition()
            .duration(self.tickDuration)
            .ease(easeLinear)
            .attr("width", (d) => getBarWidth(d))
            .attr("height", barHeight)
            .attr("x", (d) => getBarX(d))
            .attr("y", (d) =>
                self.groupedBarBandScale(d.bandScaleKey)
            )
            .on("end", () => {
                RenderBarAnnotations(self, GetGroupedBarAnnotationDataPoint);
            });
    }

    divSelection
        .style("width", "100%")
        .style("height", "100%")
        // .each((d, i, nodes) => {
        //     const bar = d3.select(nodes[i]);
        //     this.setBarBackground(bar, d.pattern, d.color, d.isOther);
        // })
        .each((d, i, nodes) => {
            const bar = d3Select(nodes[i]);
            const { leftBarPadding, rightBarPadding } = getBarPadding(d);
            self.setBarBackground(bar, d.pattern, d.color, d.isOther);
            bar
                .style("border-top-left-radius", leftBarPadding + "px")
                .style("border-top-right-radius", rightBarPadding + "px")
                .style("border-bottom-left-radius", leftBarPadding + "px")
                .style("border-bottom-right-radius", rightBarPadding + "px");
        })
        .style("background-size", (d) => {
            const pattern: IPatternProps = d.pattern;
            return self.getBarBackgroundSize(pattern, getBarWidth(d));
        })
        .style("background-position", "left")
        .style("background-repeat", "repeat")
        .style("border-style", "solid")
        .style("border-color", (d) => self.getBarBorderColor(d.color, d.pattern))
        .style("border-width", (d) => self.getBarBorderWidth(d.pattern) + "px");

    // if (!isUpdateMode) {
    //     divSelection
    //         .transition()
    //         .duration(this.tickDuration)
    //         .ease(d3.easeLinear)
    //         .style("height", function () {
    //             const bar = d3.select(this).node() as SVGSVGElement;
    //             const barBBox = bar.getBoundingClientRect();
    //             const leftBarPadding = parseFloat(bar.style.borderTopLeftRadius);
    //             const rightBarPadding = parseFloat(bar.style.borderBottomLeftRadius);
    //             const padding = d3.max([leftBarPadding, rightBarPadding]) * 2;
    //             if (barBBox.width <= padding) {
    //                 d3.select(this).style("top", `calc(50% - ${padding / 2}px)`);
    //                 return (padding * 100) / barBBox.height + "%";
    //             }
    //             return "100%";
    //         })
    // }

    SetHorizontalBarDivVariationWidth(this, divSelection, barHeight, paddingScale, getBarWidth);
}

export const GetGroupedBarFill = (self: Visual, d: any): string => {
    if (self.patternSettings.enable) {
        if (d.isOther) {
            const othersPattern = self.patternSettings.othersPattern;
            if (othersPattern?.patternIdentifier && othersPattern?.patternIdentifier !== "") {
                return `url('#${generatePattern(self.svg, othersPattern, d.color)}')`;
            }
        }
        if (d?.pattern?.patternIdentifier && d?.pattern?.patternIdentifier != "") {
            return `url('#${generatePattern(self.svg, d.pattern, d.color, false)}')`;
        }
    }
    return d.color;
}

export const FormattingVerticalGroupedBar = (self: Visual, foreignObjectSelection: D3Selection<SVGElement>, divSelection: D3Selection<HTMLDivElement>, isUpdateMode: boolean): void => {
    const THIS = self;
    const barWidth = self.groupedBarScaleBandWidth;
    const paddingScale =
        scaleLinear()
            .domain([0, 100])
            .range([0, barWidth / 2]);

    const min = self.minScaleRangeFromSettings;
    const max = self.maxScaleRangeFromSettings;

    const getBarMinValue = (currentVal: number): number => {
        return self.yScale(currentVal < min && min > 0 ? min : currentVal);
    }

    const getBarCurrentValue = (currentVal: number): number => {
        return self.yScale(currentVal > max && max > 0 ? max : currentVal);
    }

    const getBarHeight = (d: IVisualCategoryData) => {
        let height: number = 0;
        if (self.isBottomXAxis) {
            height = d.value >= 0 ? getBarMinValue(0) - getBarCurrentValue(d.value) : getBarCurrentValue(d.value) - getBarMinValue(0);
        } else {
            height = d.value >= 0 ? getBarCurrentValue(d.value) - getBarMinValue(0) : getBarMinValue(0) - getBarCurrentValue(d.value);
        }
        return height > 0 ? height : 0;
    };

    const getBarYByAxisMaxRange = (barValue: number): number => {
        if (barValue > max && max > 0) {
            return max;
        } else {
            return barValue;
        }
    }

    const getBarY = (d: IVisualSubCategoryData): number => {
        return d.value >= 0 ? self.yScale(self.isBottomXAxis ? getBarYByAxisMaxRange(d.value) : min) ?? 0 : self.yScale(!self.isBottomXAxis ? getBarYByAxisMaxRange(d.value) : 0) ?? 0;
    }

    const getBarPadding = (d: IVisualCategoryData): { topBarPadding: number; bottomBarPadding: number } => {
        let topBarPadding = paddingScale(self.chartSettings.barXPadding);
        let bottomBarPadding = paddingScale(self.chartSettings.barYPadding);
        const barHeight = getBarHeight(d);
        if (barHeight / 2 < topBarPadding) {
            const diff = topBarPadding - barHeight / 2;
            topBarPadding -= diff;
        }
        if (barHeight / 2 < bottomBarPadding) {
            const diff = bottomBarPadding - barHeight / 2;
            bottomBarPadding -= diff;
        }
        return { topBarPadding, bottomBarPadding };
    };

    if (!isUpdateMode) {
        foreignObjectSelection
            .each(function (d) {
                d3Select(this).classed(`legend-item-${THIS.getTrimmedString(d.key)}`, true);
            })
            .attr("width", barWidth)
            .attr("height", 0)
            .attr("x", (d) => {
                return self.groupedBarBandScale(d.bandScaleKey);
            }
            )
            .attr("y", self.height)
            .transition()
            .duration(self.tickDuration)
            .ease(easeLinear)
            .attr("height", (d) => getBarHeight(d))
            .attr("y", (d) => getBarY(d))
            .on("end", () => {
                RenderBarAnnotations(self, GetGroupedBarAnnotationDataPoint);
            });
    } else {
        foreignObjectSelection
            .attr("width", barWidth)
            .transition()
            .duration(self.tickDuration)
            .ease(easeLinear)
            .attr("height", (d) => getBarHeight(d))
            .attr("x", (d) => {
                return self.groupedBarBandScale(d.bandScaleKey);
            }
            )
            .attr("y", (d) => getBarY(d))
            .on("end", () => {
                RenderBarAnnotations(self, GetGroupedBarAnnotationDataPoint);
            });
    }

    divSelection
        .style("width", "100%")
        .style("height", "100%")
        // .each((d, i, nodes) => {
        //     const bar = d3.select(nodes[i]);
        //     this.setBarBackground(bar, d.pattern, d.color, d.isOther);
        // })
        .each((d, i, nodes) => {
            const bar = d3Select(nodes[i]);
            const { topBarPadding, bottomBarPadding } = getBarPadding(d);
            self.setBarBackground(bar, d.pattern, d.color, d.isOther);
            bar
                .style("border-top-left-radius", topBarPadding + "px")
                .style("border-top-right-radius", topBarPadding + "px")
                .style("border-bottom-left-radius", bottomBarPadding + "px")
                .style("border-bottom-right-radius", bottomBarPadding + "px");
        })
        .style("background-size", (d) => {
            const pattern: IPatternProps = d.pattern;
            return self.getBarBackgroundSize(pattern, barWidth);
        })
        .style("background-position", "bottom")
        .style("background-repeat", "repeat")
        .style("border-style", "solid")
        .style("border-color", (d) => self.getBarBorderColor(d.color, d.pattern))
        .style("border-width", (d) => self.getBarBorderWidth(d.pattern) + "px");

    SetVerticalBarDivVariationWidth(self, divSelection, barWidth, paddingScale, getBarHeight);
}

export const RenderGroupedBars = (self: Visual, groupedBarData: IVisualCategoryData[]): void => {
    const groupedBarSelection = self.groupedBarG.selectAll(".groupedBarG").data(groupedBarData, (d) => d.category);

    const getProcessedGroupedBarData = (keys: string[], d: IVisualSubCategoryData): any[] => {
        const data = keys.map((category, i) => ({
            key: category,
            parentCategory: d.category,
            bandScaleKey: i + "",
            value: d[category].value,
            isHighlight: d[category]?.isHighlight,
            color: d[category].color,
            pattern: d[category].pattern,
            isOther: d[category].isOther,
            width: GetGroupedBarWidth(self, d[category]),
            height: GetGroupedBarHeight(self, d[category]),
            tooltip: {
                category: category,
                parentCategory: d.category,
                pattern: d[category].pattern,
                isOther: d[category].isOther,
                value: d[category].value,
                styles: { bar: { fillColor: d[category].color } },
                selectionId: d[category].selectionId,
                tooltipFields: d[category].tooltipFields,
                tooltipLowerBoundValue: d[category].tooltipLowerBoundValue,
                tooltipUpperBoundValue: d[category].tooltipUpperBoundValue,
            },
            selectionId: d[category]?.selectionId,
            identity: d[category]?.selectionId,
        }));

        data.forEach((d, i) => (d.bandScaleKey = i + ""));
        return data;
    };

    groupedBarSelection.join(
        (enter) => {
            const groupedBarG = enter
                .append("g")
                .attr("class", "groupedBarG")
                .classed(self.annotationBarClass, true)
                .attr("refLineId", (d) => self.getBarIdByCategory(d.category));

            groupedBarG.attr("transform", (d) => {
                if (self.isHorizontalChart) {
                    return `translate(${0}, ${self.yScale(d.category)})`;
                } else {
                    return `translate(${self.xScale(d.category)}, ${0})`;
                }
            });

            const groupedBarSelection = groupedBarG.selectAll("foreignObject").data(
                (d) => {
                    const keys = Object.keys(d).slice(4);
                    return getProcessedGroupedBarData(keys, d);
                },
                (d) => d.key
            );

            groupedBarSelection.join(
                (enter) => {
                    const foreignObjectSelection = enter.append("foreignObject");
                    const divSelection = foreignObjectSelection
                        .append("xhtml:div")
                        .attr("class", "groupedBar")
                        .attr("id", (d) => `${self.getTrimmedString(d.key)}-${self.getTrimmedString(d.parentCategory)}`);
                    if (self.isHorizontalChart) {
                        FormattingHorizontalGroupedBar(self, foreignObjectSelection, divSelection, false);
                    } else {
                        FormattingVerticalGroupedBar(self, foreignObjectSelection, divSelection, false);
                    }
                },
                (update) => {
                    const divSelection = update.select(".groupedBar");
                    if (self.isHorizontalChart) {
                        FormattingHorizontalGroupedBar(self, update, divSelection, true);
                    } else {
                        FormattingVerticalGroupedBar(self, update, divSelection, true);
                    }
                }
            );
        },
        (update) => {
            update
                .attr("refLineId", (d) => self.getBarIdByCategory(d.category))
                .transition()
                .duration(self.tickDuration)
                .ease(easeLinear)
                .attr("transform", (d) => {
                    if (self.isHorizontalChart) {
                        return `translate(${0}, ${self.yScale(d.category)})`;
                    } else {
                        return `translate(${self.xScale(d.category)}, ${0})`;
                    }
                });

            const groupedBarSelection = update.selectAll("foreignObject").data(
                (d) => {
                    const keys = Object.keys(d).slice(4);
                    return getProcessedGroupedBarData(keys, d);
                },
                (d) => d.key
            );

            groupedBarSelection.join(
                (enter) => {
                    const foreignObjectSelection = enter.append("foreignObject");
                    const divSelection = foreignObjectSelection
                        .append("xhtml:div")
                        .attr("class", "groupedBar")
                        .attr("id", (d) => `${self.getTrimmedString(d.key)}-${self.getTrimmedString(d.parentCategory)}`);
                    if (self.isHorizontalChart) {
                        FormattingHorizontalGroupedBar(self, foreignObjectSelection, divSelection, false);
                    } else {
                        FormattingVerticalGroupedBar(self, foreignObjectSelection, divSelection, false);
                    }
                },
                (update) => {
                    const divSelection = update.select(".groupedBar");
                    if (self.isHorizontalChart) {
                        FormattingHorizontalGroupedBar(self, update, divSelection, true);
                    } else {
                        FormattingVerticalGroupedBar(self, update, divSelection, true);
                    }
                }
            );
        }
    );
}