import { Visual } from "../visual";
import { Selection } from "d3-selection";
import { BarType } from "../enum";
import { easeLinear, scaleLinear } from "d3";
import { IVisualCategoryData, IVisualSubCategoryData } from "../visual-data.model";
import { max as d3Max } from "d3-array";
type D3Selection<T extends d3.BaseType> = Selection<T, any, any, any>;

export const RenderStackedBarClip = (self: Visual, chartData: IVisualCategoryData[]): void => {
    let x: number = 0;
    let y: number = 0;
    if (self.isHorizontalChart) {
        y = 0;
        if (self.isLeftYAxis) {
            if (self.isLeftLabelImageWithinBar) {
                x = self.axisLabelImageHeight / 2;
            } else {
                x = 0;
            }
        } else {
            if (self.isLeftLabelImageWithinBar) {
                x = 0;
            } else {
                x = -self.axisLabelImageHeight / 2;
            }
        }
    }
    if (!self.isHorizontalChart) {
        x = 0;
        if (self.isBottomXAxis) {
            if (self.isBottomLabelImageWithinBar) {
                y = -self.axisLabelImageHeight / 2;
            } else {
                y = 0;
            }
        } else {
            if (self.isBottomLabelImageWithinBar) {
                y = self.axisLabelImageHeight / 2;
            } else {
                y = 0;
            }
        }
    }

    const clipId = (d) => {
        let id;
        if (self.chartSettings.barType === BarType.Grouped) {
            id = self.getTrimmedString(d?.category) + "-" + self.getTrimmedString(d?.subCategory);
        } else if (self.isGroupedStackedBar) {
            id = self.getTrimmedString(d?.category) + "-" + self.getTrimmedString(d?.groupedCategory);
        } else {
            id = self.getBarIdByCategory(d?.category);
        }
        return id + "Clip";
    };

    const stackedBarClipSelection = self.stackedBarClipG
        .selectAll(".stackedBarClip")
        .data(chartData, (d) => d?.category + d?.groupedCategory);
    stackedBarClipSelection.join(
        (enter) => {
            const clipPath = enter
                .append("clipPath")
                .attr("id", (d) => {
                    return clipId(d);
                })
                .attr("class", "stackedBarClip")
                .attr("refLineId", (d) => self.getBarIdByCategory(d.category));

            const clipInnerPath = clipPath.append("path");

            if (self.isHorizontalChart) {
                FormattingHorizontalClipBar(self, clipInnerPath);
            } else {
                FormattingVerticalClipBar(self, clipInnerPath);
            }
        },
        (update) => {
            update
                .attr("id", (d) => clipId(d))
                .attr("class", "stackedBarClip")
                .attr("refLineId", (d) => self.getBarIdByCategory(d.category));
            const clipInnerPath = update.select("path");

            if (self.isHorizontalChart) {
                FormattingHorizontalClipBar(self, clipInnerPath);
            } else {
                FormattingVerticalClipBar(self, clipInnerPath);
            }
        }
    );
}

export const FormattingHorizontalClipBar = (self: Visual, barSelection: D3Selection<SVGElement>): void => {
    const isNotStackedBarChart = self.isNormalBarChart || self.isGroupedBarChart;
    const barHeight =
        self.isGroupedStackedBar || self.isGroupedBarChart ? self.groupedBarScaleBandWidth : self.scaleBandWidth;
    const paddingScale = scaleLinear()
        .domain([0, 100])
        .range([0, barHeight / 2]);

    const getBarWidth = (d) => {
        if (isNotStackedBarChart) {
            if (self.isLeftYAxis) {
                return d.value >= 0 ? self.xScale(d.value) - self.xScale(0) : self.xScale(0) - self.xScale(d.value);
            } else {
                return d.value >= 0 ? self.xScale(0) - self.xScale(d.value) : self.xScale(d.value) - self.xScale(0);
            }
        } else {
            if (self.isLeftYAxis) {
                return Math.abs(self.xScale(d.negativeValueTotal) - self.xScale(d.positiveValueTotal) ?? 0);
            } else {
                return Math.abs((self.xScale(d.positiveValueTotal) ?? 0) - self.xScale(d.negativeValueTotal));
            }
        }
    };

    const getBarPadding = (d: IVisualCategoryData): number[] => {
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
        return [leftBarPadding, rightBarPadding, rightBarPadding, leftBarPadding];
    };

    const getBarHeightByPadding = (padding: number[], barWidth: number) => {
        const maxPadding = d3Max([padding[0], padding[2]])! * 2;
        if (barWidth <= maxPadding) {
            return maxPadding;
        }
        return barHeight;
    };

    const getBarY = (d: IVisualCategoryData) => {
        return (self.yScale(d.category) ?? 0);
    };

    barSelection
        .transition()
        .duration(self.tickDuration)
        .ease(easeLinear)
        .attr("d", (d) => {
            const barWidth = getBarWidth(d);
            const barPadding = getBarPadding(d);
            const barHeightByPadding = getBarHeightByPadding(barPadding, barWidth);
            let barBorderWidth = self.chartSettings.isShowBarBorder ? self.chartSettings.barBorderWidth : 0;
            if (self.patternSettings.showBorder) {
                barBorderWidth = self.patternSettings.borderWidth;
            }

            if (isNotStackedBarChart) {
                barBorderWidth = 0;
            }

            const x = isNotStackedBarChart
                ? (d.value >= 0
                    ? self.xScale(self.isLeftYAxis ? 0 : d.value)
                    : self.xScale(!self.isLeftYAxis ? 0 : d.value)) ?? 0
                : self.xScale(d.negativeValueTotal) ?? 0;
            const clipWidth =
                barWidth -
                (self.isLabelImageWithinBar && self.isRightImageRightYAxisPosition && self.isPercentageStackedBar
                    ? self.axisLabelImageWidth / 2
                    : 0);
            const clipY =
                (self.isGroupedStackedBar || self.isGroupedBarChart
                    ? self.groupedBarBandScale(self.isGroupedBarChart ? d.subCategory : d.groupedCategory) ?? 0
                    : 0) +
                (getBarY(d) +
                    (barHeight - barHeightByPadding) / 2);
            // (self.isGroupedBarChart
            //   ? self.groupedBarScaleBandWidth
            //   : self.isGroupedStackedBar
            //     ? self.groupedBarScaleBandWidth / 2
            //     : 0
            // );
            const minAxisRange = self.isGroupedStackedBar ? self.groupedStackedBarsLabelWidth : 0;

            if (self.isLeftYAxis) {
                return self.getRoundedBarPath(
                    x > minAxisRange ? x : minAxisRange,
                    clipY,
                    x + clipWidth < self.width ? clipWidth : self.width - x - (x > minAxisRange ? 0 : -x + minAxisRange),
                    barHeightByPadding,
                    barPadding
                );
            } else {
                const value = isNotStackedBarChart ? d.value : d.positiveValueTotal;
                const width = self.width - minAxisRange;
                const x1 = self.width - x + clipWidth < width ? self.xScale(d.positiveValueTotal) ?? 0 : 0;
                const w = self.width - x + clipWidth < width ? clipWidth : clipWidth + (self.xScale(value) ?? 0);
                return self.getRoundedBarPath(
                    self.width - x + clipWidth < width ? self.xScale(value) ?? 0 : 0,
                    clipY,
                    w - (x1 + w < width ? 0 : x1 + w - self.width + minAxisRange),
                    barHeightByPadding,
                    barPadding
                );
            }
        })
        .style("opacity", (d) => (self.yScale(d.category) >= 0 ? 1 : 0));
}

export const FormattingVerticalClipBar = (self: Visual, barSelection: D3Selection<SVGElement>): void => {
    const isNotStackedBarChart = self.isNormalBarChart || self.isGroupedBarChart;
    const barWidth =
        self.isGroupedStackedBar || self.isGroupedBarChart ? self.groupedBarScaleBandWidth : self.scaleBandWidth;
    const paddingScale = scaleLinear()
        .domain([0, 100])
        .range([0, barWidth / 2]);

    const getBarHeight = (d) => {
        if (isNotStackedBarChart) {
            if (self.isBottomXAxis) {
                return d.value >= 0 ? self.yScale(0) - self.yScale(d.value) : self.yScale(d.value) - self.yScale(0);
            } else {
                return d.value >= 0 ? self.yScale(d.value) - self.yScale(0) : self.yScale(0) - self.yScale(d.value);
            }
        } else {
            if (self.isBottomXAxis) {
                return Math.abs(self.yScale(d.negativeValueTotal) - self.yScale(d.positiveValueTotal) ?? 0);
            } else {
                return Math.abs((self.yScale(d.positiveValueTotal) ?? 0) - self.yScale(d.negativeValueTotal));
            }
        }
    };

    const getBarPadding = (d: IVisualSubCategoryData): number[] => {
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
        const padding = d3Max([topBarPadding, bottomBarPadding])! * 2;
        if (barHeight <= padding) {
        }
        return [topBarPadding, topBarPadding, bottomBarPadding, bottomBarPadding];
    };

    const getBarWidthByPadding = (padding: number[], barHeight: number): number => {
        let barBorderWidth = self.chartSettings.isShowBarBorder ? self.chartSettings.barBorderWidth : 0;
        const maxPadding = d3Max([padding[0], padding[2]])! * 2;
        if (barHeight <= maxPadding) {
            return maxPadding;
        }
        return barWidth - barBorderWidth;
    };

    const getBarX = (d: any) => {
        return (self.xScale(d.category) ?? 0);
    };

    barSelection
        .transition()
        .duration(self.tickDuration)
        .ease(easeLinear)
        .attr("d", (d) => {
            let barBorderWidth = self.chartSettings.isShowBarBorder ? self.chartSettings.barBorderWidth : 0;
            const barHeight = getBarHeight(d);
            const barPadding = getBarPadding(d);
            const barWidthByPadding = getBarWidthByPadding(barPadding, barHeight);
            if (self.patternSettings.showBorder) {
                barBorderWidth = self.patternSettings.borderWidth;
            }

            if (isNotStackedBarChart) {
                barBorderWidth = 0;
            }

            const clipX =
                (self.isGroupedStackedBar || self.isGroupedBarChart
                    ? self.groupedBarBandScale(isNotStackedBarChart ? d.subCategory : d.groupedCategory) ?? 0
                    : 0) +
                (getBarX(d) +
                    barBorderWidth / 2 +
                    (barWidth - barBorderWidth - barWidthByPadding) / 2
                );
            //  );
            // (self.isGroupedBarChart
            //   ? self.groupedBarScaleBandWidth
            //   : self.isGroupedStackedBar
            //     ? self.groupedBarScaleBandWidth / 2
            //     : 0
            // );
            const clipY =
                (isNotStackedBarChart
                    ? d.value >= 0
                        ? self.yScale(self.isBottomXAxis ? d.value : 0) ?? 0
                        : self.yScale(!self.isBottomXAxis ? d.value : 0) ?? 0
                    : self.yScale(self.isBottomXAxis ? d.positiveValueTotal : d.negativeValueTotal) ?? 0) +
                barBorderWidth / 2 -
                (self.isBottomLabelImageWithinBar && self.isBottomXAxis && self.isPercentageStackedBar
                    ? self.axisLabelImageHeight / 2
                    : 0);
            const clipHeight = barHeight + barBorderWidth;
            const minAxisRange = self.isGroupedStackedBar ? self.groupedStackedBarsLabelHeight : 0;

            if (self.isBottomXAxis) {
                return self.getRoundedBarPath(
                    clipX,
                    clipY > minAxisRange ? clipY : minAxisRange,
                    barWidthByPadding,
                    clipHeight + (clipY > minAxisRange ? clipY : minAxisRange) < self.height
                        ? clipHeight
                        : self.height - (clipY > 0 ? clipY : 0) - minAxisRange,
                    barPadding
                );
            } else {
                return self.getRoundedBarPath(
                    clipX,
                    clipY > 0 ? clipY : 0,
                    barWidthByPadding,
                    clipHeight + clipY < self.height ? clipHeight : self.height - clipY + (clipY > 0 ? 0 : clipY),
                    barPadding
                );
            }
        })
        .style("opacity", (d) => (self.xScale(d.category) >= 0 ? 1 : 0));
}
