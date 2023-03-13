import { Visual } from "../visual";
import { Selection } from "d3-selection";
import { easeLinear, scaleLinear } from "d3";
import { max as d3Max } from 'd3-array';
import { IVisualCategoryData } from "../visual-data.model";
type D3Selection<T extends d3.BaseType> = Selection<T, any, any, any>;

export const RenderBorderBar = (self: Visual, barData: IVisualCategoryData[]): void => {
    const { x, y } = self.getBarXYTranslateVal();
    if (!self.isPercentageStackedBar) {
        self.borderBarG.attr("transform", `translate(${x}, ${y})`);
    }
    const borderBarSelection = self.borderBarG
        .selectAll(".borderBar")
        .data(barData, (d) => d?.category + d?.groupedCategory);

    borderBarSelection.join(
        (enter) => {
            const path = enter.append("path").attr("class", "borderBar").style("pointer-events", "none");
            if (self.isHorizontalChart) {
                FormattingHorizontalBorderBar(self, path);
            } else {
                FormattingVerticalBorderBar(self, path);
            }
        },
        (update) => {
            if (self.isHorizontalChart) {
                FormattingHorizontalBorderBar(self, update);
            } else {
                FormattingVerticalBorderBar(self, update);
            }
        }
    );
}

export const FormattingHorizontalBorderBar = (self: Visual, barSelection: D3Selection<SVGElement>): void => {
    const barHeight = self.isGroupedStackedBar ? self.groupedBarScaleBandWidth : self.scaleBandWidth;
    const paddingScale = scaleLinear()
        .domain([0, 100])
        .range([0, barHeight / 2]);

    const getBarWidth = (d) => {
        if (self.isLeftYAxis) {
            return Math.abs(self.xScale(d.negativeValueTotal) - self.xScale(d.positiveValueTotal) ?? 0);
        } else {
            return Math.abs((self.xScale(d.positiveValueTotal) ?? 0) - self.xScale(d.negativeValueTotal));
        }
    };

    const getBarPadding = (d): number[] => {
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

    const isWhiteBorder = self.patternSettings.showBorder && !self.chartSettings.isShowBarBorder;

    barSelection
        .attr("fill", "transparent")
        .attr("stroke", (d) => {
            return isWhiteBorder ? "#ffffff" : self.chartSettings.barBorderColor;
        })
        .attr("stroke-width", (d) => {
            return isWhiteBorder ? self.patternSettings.borderWidth : self.chartSettings.barBorderWidth;
        })
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

            const x = self.xScale(d.negativeValueTotal) ?? 0;
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
            // (this.isGroupedBarChart
            //   ? this.groupedBarScaleBandWidth
            //   : this.isGroupedStackedBar
            //     ? this.groupedBarScaleBandWidth / 2
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
                const width = self.width - minAxisRange;
                const x1 = self.width - x + clipWidth < width ? self.xScale(d.positiveValueTotal) ?? 0 : 0;
                const w =
                    self.width - x + clipWidth < width ? clipWidth : clipWidth + (self.xScale(d.positiveValueTotal) ?? 0);
                return self.getRoundedBarPath(
                    self.width - x + clipWidth < width ? self.xScale(d.positiveValueTotal) ?? 0 : 0,
                    clipY,
                    w - (x1 + w < width ? 0 : x1 + w - self.width + minAxisRange),
                    barHeightByPadding,
                    barPadding
                );
            }
        })
        .style("opacity", (d) => (self.yScale(d.category) >= 0 ? 1 : 0));
}

export const FormattingVerticalBorderBar = (self: Visual, barSelection: D3Selection<SVGElement>): void => {
    const barWidth = self.isGroupedStackedBar ? self.groupedBarScaleBandWidth : self.scaleBandWidth;
    const paddingScale =
        scaleLinear()
            .domain([0, 100])
            .range([0, barWidth / 2]);

    const getBarWidthByPadding = (padding: number[], barHeight: number) => {
        let barBorderWidth = self.chartSettings.isShowBarBorder ? self.chartSettings.barBorderWidth : 0;
        const maxPadding = d3Max([padding[0], padding[2]]) * 2;
        if (barHeight <= maxPadding) {
            return maxPadding;
        }
        return barWidth - barBorderWidth;
    };

    const getBarHeight = (d) => {
        if (self.isBottomXAxis) {
            return Math.abs(self.yScale(d.negativeValueTotal) - self.yScale(d.positiveValueTotal) ?? 0);
        } else {
            return Math.abs((self.yScale(d.positiveValueTotal) ?? 0) - self.yScale(d.negativeValueTotal));
        }
    };

    const getBarPadding = (d): number[] => {
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
        const padding = d3Max([topBarPadding, bottomBarPadding]) * 2;
        if (barHeight <= padding) {
        }
        return [topBarPadding, topBarPadding, bottomBarPadding, bottomBarPadding];
    };

    const isWhiteBorder = self.patternSettings.showBorder && !self.chartSettings.isShowBarBorder;

    const getBarX = (d: any) => {
        return (self.xScale(d.category) ?? 0);
    };

    barSelection
        .attr("fill", "transparent")
        .attr("stroke", (d) => {
            return isWhiteBorder ? "#ffffff" : self.chartSettings.barBorderColor;
        })
        .attr("stroke-width", (d) => {
            return isWhiteBorder ? self.patternSettings.borderWidth : self.chartSettings.barBorderWidth;
        })
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

            const clipX =
                (self.isGroupedStackedBar ? self.groupedBarBandScale(d.groupedCategory) ?? 0 : 0) +
                (getBarX(d) +
                    barBorderWidth / 2 +
                    (barWidth - barBorderWidth - barWidthByPadding) / 2
                );
            // (this.isStackedBarChart ? 0 : this.groupedBarScaleBandWidth / 2
            // );
            const clipY =
                (self.yScale(self.isBottomXAxis ? d.positiveValueTotal : d.negativeValueTotal) ?? 0) +
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