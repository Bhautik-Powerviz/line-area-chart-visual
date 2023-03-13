import { Visual } from "../visual";
import { select as d3Select, Selection } from "d3-selection";
import { ascending, descending } from "d3-array";
import { IVisualCategoryData } from "../visual-data.model";
import { easeLinear, scaleLinear } from "d3";
import { GetStackedBarAnnotationDataPoint, RenderBarAnnotations } from "./Annotations.methods";
type D3Selection<T extends d3.BaseType> = Selection<T, any, any, any>;

export const RenderStackedBars = (self: Visual, stackedBarData: IVisualCategoryData[]): void => {
    const { x, y } = self.getBarXYTranslateVal();
    if (!self.isPercentageStackedBar) {
        self.stackedBarG.attr("transform", `translate(${x}, ${y})`);
    }

    stackedBarData.forEach((d: any) => {
        d.components.sort((x, y) => {
            if (y.data[y.key] - x.data[x.key] >= 0) {
                return ascending(x.data[x.key], y.data[y.key]);
            } else {
                return descending(x.data[x.key], y.data[y.key]);
            }
        });
    });

    const data = stackedBarData.reduce((arr: any, d: any) => {
        d.components.forEach((item: any, i) => {
            const { width, height, renderedWidth, renderedHeight } = GetStackedBarWidthHeight(self, item);
            item.width = width;
            item.height = height;
            item.renderedWidth = renderedWidth;
            item.renderedHeight = renderedHeight;
            arr = [...arr, item];
        });
        return arr;
    }, []);

    const stackedBarSelection = self.stackedBarG.selectAll(".stackedBarG").data(data, (d) => d.id);

    stackedBarSelection.join(
        (enter) => {
            const barGSelection = enter.append("g").attr("class", "stackedBarG").classed(self.annotationBarClass, true);
            const foreignObjectSelection = barGSelection
                .append("foreignObject")
                .attr("refLineId", (d) => self.getTrimmedString(d?.tooltip?.parentCategory));
            const barSelection = foreignObjectSelection
                .append("xhtml:div")
                .attr("class", "bar")
                .classed("stackedBar", true)
                .attr("id", (d) => self.getTrimmedString(d.key + "-" + d.data.category + "-" + d.data.groupedCategory));

            if (self.isHorizontalChart) {
                FormattingHorizontalStackedBar(self, foreignObjectSelection, barSelection, false);
            } else {
                FormattingVerticalStackedBar(self, foreignObjectSelection, barSelection, false);
            }
        },
        (update) => {
            const foreignObjectSelection = update.select("foreignObject");
            const stackedBar = update.selectAll(".stackedBar");

            if (self.isHorizontalChart) {
                FormattingHorizontalStackedBar(this, foreignObjectSelection, stackedBar, true);
            } else {
                FormattingVerticalStackedBar(self, foreignObjectSelection, stackedBar, true);
            }
        }
    );

    self.stackedBarG.selectAll(".stackedBarG").attr("clip-path", (d) => {
        return self.isGroupedStackedBar
            ? `url(#${self.getTrimmedString(d.data?.category)}-${self.getTrimmedString(d.data?.groupedCategory)}Clip)`
            : `url(#${self.getBarIdByCategory(d.data?.category)}Clip)`;
    });
}

export const FormattingHorizontalStackedBar = (self: Visual, foreignObjectSelection: D3Selection<SVGElement>, divSelection: D3Selection<HTMLDivElement>, isUpdateMode: boolean): void => {
    const barHeight = self.isGroupedStackedBar ? self.groupedBarScaleBandWidth : self.scaleBandWidth;
    const paddingScale = scaleLinear()
        .domain([0, 100])
        .range([0, barHeight / 2]);
    let leftBarPadding = paddingScale(self.chartSettings.barXPadding);
    let rightBarPadding = paddingScale(self.chartSettings.barYPadding);

    const getBarWidth = (d: any): number => {
        if (self.isLeftYAxis) {
            const calcWidth = Math.abs((self.xScale(d[0]) ?? 0) - (self.xScale(d[1]) ?? 0));
            return calcWidth > 0 ? calcWidth : 0;
        } else {
            const calcWidth = Math.abs((self.xScale(d[1]) ?? 0) - (self.xScale(d[0]) ?? 0));
            return calcWidth > 0 ? calcWidth : 0;
        }
    };

    const getBarPadding = (): { leftBarPadding; rightBarPadding } => {
        if (self.isLeftYAxis) {
            return { leftBarPadding: 0, rightBarPadding };
        } else {
            return { leftBarPadding, rightBarPadding: 0 };
        }
    };

    const getBarY = (d: any): number => {
        return (self.isGroupedStackedBar ? (self.groupedBarBandScale(d.data?.groupedCategory) + self.yScale(d.data?.category)) : self.yScale(d.data?.category)) ?? 0;
    };

    const firstStackCategories: string[] = [];
    self.chartData.forEach((d, i) => {
        firstStackCategories.push(d.subCategories[0].category);
    });

    if (!isUpdateMode) {
        foreignObjectSelection
            .attr("class", (d) => {
                return `grouped-category-${d.data.groupedCategory} foreignObject-${self.getTrimmedString(
                    d.data?.category
                )} legend-item-${self.getTrimmedString(d.category)}`;
            })
            .attr("width", (d) => 0)
            .attr("height", barHeight)
            .attr("x", (d) => {
                const barWidth = getBarWidth(d);
                return self.isLeftYAxis
                    ? self.xScale(d[1]) - ((barWidth > barHeight * 2 ? barWidth : barHeight * 2) + barHeight * 2 - barWidth)
                    : self.xScale(d[0]);
            })
            .attr("y", (d) => getBarY(d))
            .attr("annotationWidth", (d) => getBarWidth(d))
            .attr("annotationHeight", barHeight)
            .transition()
            .duration(self.tickDuration)
            .ease(easeLinear)
            .attr("width", (d) => {
                const barWidth = getBarWidth(d);
                return (barWidth > barHeight * 2 ? barWidth : barHeight * 2) + barHeight * 2;
            })
            .on("end", () => {
                RenderBarAnnotations(self, GetStackedBarAnnotationDataPoint.bind(this));
            });
    } else {
        foreignObjectSelection
            .attr("annotationWidth", (d) => getBarWidth(d))
            .attr("annotationHeight", barHeight)
            .transition()
            .duration(self.tickDuration)
            .ease(easeLinear)
            .attr("width", (d) => {
                const barWidth = getBarWidth(d);
                return (barWidth > barHeight * 2 ? barWidth : barHeight * 2) + barHeight * 2;
            })
            .attr("height", barHeight)
            .attr("x", (d) => {
                const barWidth = getBarWidth(d);
                return self.isLeftYAxis
                    ? self.xScale(d[1]) - ((barWidth > barHeight * 2 ? barWidth : barHeight * 2) + barHeight * 2 - barWidth)
                    : self.xScale(d[0]);
            })
            .attr("y", (d) => getBarY(d))
            .on("end", () => {
                RenderBarAnnotations(self, GetStackedBarAnnotationDataPoint.bind(this));
            });
    }

    divSelection
        .style("width", "100%")
        .style("height", "100%")
        .each((d, i, nodes) => {
            const barColor = self.getSubCategoryColorByCategoryName(
                d?.key,
                d?.data?.category,
                d?.data?.groupedCategory,
                false
            );
            const pattern = self.subCategoriesMap[d?.key]?.pattern;
            const isOther = self.getSubCategoryByCategoryName(d?.key).isOther;
            const bar = d3Select(nodes[i]);
            self.setBarBackground(bar, pattern, barColor, isOther);
            const { leftBarPadding, rightBarPadding } = getBarPadding();
            bar
                .style("border-top-left-radius", leftBarPadding + "px")
                .style("border-top-right-radius", rightBarPadding + "px")
                .style("border-bottom-left-radius", leftBarPadding + "px")
                .style("border-bottom-right-radius", rightBarPadding + "px")
                .style("border-color", (d) => self.getBarBorderColor(barColor, pattern))
                .style("border-width", (d) => self.getBarBorderWidth(pattern) + "px")
                .style("background-color", (d) => {
                    if (pattern?.patternIdentifier && self.patternSettings.enable === true) {
                        return "#ffffff";
                    } else {
                        return "none";
                    }
                })
                .style("background-size", (d) => {
                    return self.getBarBackgroundSize(pattern, getBarWidth(d));
                });
        })
        .style("background-repeat", "repeat")
        .style("border-style", "solid")
        .style("opacity", (d) => (self.yScale(d.data?.category) >= 0 ? 1 : 0));
}

export const FormattingVerticalStackedBar = (self: Visual, foreignObjectSelection: D3Selection<SVGElement>, divSelection: D3Selection<HTMLDivElement>, isUpdateMode: boolean): void => {
    const barWidth = self.isGroupedStackedBar ? self.groupedBarScaleBandWidth : self.scaleBandWidth;
    const paddingScale = scaleLinear()
        .domain([0, 100])
        .range([0, barWidth / 2]);
    let topBarPadding = paddingScale(self.chartSettings.barXPadding);
    let bottomBarPadding = paddingScale(self.chartSettings.barYPadding);

    const getBarHeight = (d) => {
        if (self.isBottomXAxis) {
            return Math.abs(self.yScale(d[0] ?? 0) - self.yScale(d[1]) ?? 0);
        } else {
            const calcHeight = Math.abs(self.yScale(d[1] ?? 0) - self.yScale(d[0]) ?? 0);
            return calcHeight > 0 ? calcHeight : 0;
        }
    };

    const getBarPadding = (d): { topBarPadding: number; bottomBarPadding: number } => {
        if (self.isBottomXAxis) {
            return { topBarPadding, bottomBarPadding };
        } else {
            return { topBarPadding: 0, bottomBarPadding };
        }
    };

    const getBarX = (d: any) => {
        return (self.isGroupedStackedBar ? (self.groupedBarBandScale(d.data?.groupedCategory) + self.xScale(d.data?.category)) : self.xScale(d.data?.category)) ?? 0;
    };

    const firstStackCategories: { [category: string]: { firstStack: string } } = {};
    self.chartData.forEach((d, i) => {
        firstStackCategories[d.category] = { firstStack: d.subCategories[0].category };
    });

    if (!isUpdateMode) {
        foreignObjectSelection
            .attr("class", (d) => {
                return `grouped-category-${d.data.groupedCategory} foreignObject-${self.getTrimmedString(
                    d.data?.category
                )} legend-item-${self.getTrimmedString(d.category)}`;
            })
            .attr("width", barWidth)
            .attr("height", 0)
            .attr("x", (d) => getBarX(d))
            .attr("y", self.height)
            .attr("annotationWidth", barWidth)
            .attr("annotationHeight", (d) => getBarHeight(d))
            .transition()
            .duration(self.tickDuration)
            .ease(easeLinear)
            .attr("height", (d) => (getBarHeight(d) > barWidth * 2 ? getBarHeight(d) : barWidth * 2) + barWidth)
            .attr("y", (d) => {
                const barHeight = getBarHeight(d);
                return self.isBottomXAxis
                    ? self.yScale(d[0] ?? 0) ??
                    0 +
                    (self.isBottomLabelImageWithinBar && self.isPercentageStackedBar ? self.axisLabelImageHeight / 2 : 0)
                    : (self.yScale(d[1]) ?? 0) -
                    ((barHeight > barWidth * 2 ? barHeight : barWidth * 2) + barWidth - barHeight) +
                    2;
            })
            .on("end", () => {
                RenderBarAnnotations(self, GetStackedBarAnnotationDataPoint.bind(this));
            });
    } else {
        foreignObjectSelection
            .attr("class", (d) => {
                return `grouped-category-${d.data.groupedCategory} foreignObject-${self.getTrimmedString(
                    d.data?.category
                )} legend-item-${self.getTrimmedString(d.category)}`;
            })
            .attr("annotationWidth", barWidth)
            .attr("annotationHeight", (d) => getBarHeight(d))
            .transition()
            .duration(self.tickDuration)
            .ease(easeLinear)
            .attr("width", barWidth)
            .attr("height", (d) => (getBarHeight(d) > barWidth * 2 ? getBarHeight(d) : barWidth * 2) + barWidth)
            .attr("x", (d) => getBarX(d))
            .attr("y", (d) => {
                const barHeight = getBarHeight(d);
                return self.isBottomXAxis
                    ? self.yScale(d[0] ?? 0) ??
                    0 +
                    (self.isBottomLabelImageWithinBar && self.isPercentageStackedBar ? self.axisLabelImageHeight / 2 : 0)
                    : (self.yScale(d[1]) ?? 0) -
                    ((barHeight > barWidth * 2 ? barHeight : barWidth * 2) + barWidth - barHeight) +
                    2;
            })
            .on("end", () => {
                RenderBarAnnotations(self, GetStackedBarAnnotationDataPoint.bind(this));
            });
    }

    divSelection
        .style("width", "100%")
        .style("height", "100%")
        .each((d, i, nodes) => {
            const barColor = self.getSubCategoryColorByCategoryName(
                d?.key,
                d?.data?.category,
                d?.data?.groupedCategory,
                false
            );
            const pattern = self.subCategoriesMap[d?.key]?.pattern;
            const isOther = self.getSubCategoryByCategoryName(d?.key)?.isOther;
            const bar = d3Select(nodes[i]);
            const { topBarPadding, bottomBarPadding } = getBarPadding(d);

            self.setBarBackground(bar, pattern, barColor, isOther);
            bar
                .style("border-top-left-radius", topBarPadding + "px")
                .style("border-top-right-radius", topBarPadding + "px")
                .style("border-bottom-left-radius", bottomBarPadding + "px")
                .style("border-bottom-right-radius", bottomBarPadding + "px")
                .style("background-color", (d) => {
                    if (pattern?.patternIdentifier && self.patternSettings.enable === true) {
                        return "#ffffff";
                    } else {
                        return "none";
                    }
                })
                .style("border-color", self.getBarBorderColor(barColor, pattern))
                .style("border-width", self.getBarBorderWidth(pattern) + "px")
                .style("background-size", (d) => {
                    return self.getBarBackgroundSize(pattern, barWidth);
                });
        })
        .style("background-repeat", "repeat")
        .style("border-style", "solid")
        .style("opacity", (d) => (self.xScale(d.data?.category) >= 0 ? 1 : 0))
        .style("display", (d) => (self.xScale(d.value) > self.width ? "none" : "flex"));
}

export const GetStackedBarWidthHeight = (self: Visual, barData: IVisualCategoryData): {
    width: number;
    height: number;
    renderedWidth: number;
    renderedHeight: number;
} => {
    if (self.isHorizontalChart) {
        const barHeight = self.scaleBandWidth / 2;
        const getBarWidth = (d) => {
            if (self.isLeftYAxis) {
                const calcWidth = Math.abs((self.xScale(d[0]) ?? 0) - (self.xScale(d[1]) ?? 0));
                return calcWidth > 0 ? calcWidth : 0;
            } else {
                const calcWidth = Math.abs((self.xScale(d[1]) ?? 0) - (self.xScale(d[0]) ?? 0));
                return calcWidth > 0 ? calcWidth : 0;
            }
        };
        const barWidth = getBarWidth(barData);
        const renderedWidth = (barWidth > barHeight * 2 ? barWidth : barHeight * 2) + barHeight * 2;
        return { width: barWidth, height: barHeight, renderedWidth: renderedWidth, renderedHeight: barHeight };
    } else {
        const barWidth = self.isGroupedStackedBar ? self.groupedBarScaleBandWidth : self.scaleBandWidth / 2;
        const getBarHeight = (d) => {
            if (self.isBottomXAxis) {
                return Math.abs(self.yScale(d[0] ?? 0) - self.yScale(d[1]) ?? 0);
            } else {
                const calcHeight = Math.abs(self.yScale(d[1] ?? 0) - self.yScale(d[0]) ?? 0);
                return calcHeight > 0 ? calcHeight : 0;
            }
        };
        const barHeight = getBarHeight(barData);
        const renderedHeight = (barHeight > barWidth * 2 ? barHeight : barWidth * 2) + barWidth;
        return {
            width: barWidth,
            height: getBarHeight(barData),
            renderedWidth: barWidth,
            renderedHeight: renderedHeight,
        };
    }
}

export const GetStackedBarWidth = (self: Visual, d: IVisualCategoryData): number => {
    if (self.isHorizontalChart) {
        if (self.isLeftYAxis) {
            const calcWidth = Math.abs((self.xScale(d[0]) ?? 0) - (self.xScale(d[1]) ?? 0));
            return calcWidth > 0 ? calcWidth : 0;
        } else {
            const calcWidth = Math.abs((self.xScale(d[1]) ?? 0) - (self.xScale(d[0]) ?? 0));
            return calcWidth > 0 ? calcWidth : 0;
        }
    } else {
        return self.isGroupedStackedBar ? self.groupedBarScaleBandWidth : self.scaleBandWidth / 2;
    }
};

export const GetStackedBarHeight = (self: Visual, d: IVisualCategoryData): number => {
    if (self.isHorizontalChart) {
        if (self.isBottomXAxis) {
            return Math.abs(self.yScale(d[0] ?? 0) - self.yScale(d[1]) ?? 0);
        } else {
            const calcHeight = Math.abs(self.yScale(d[1] ?? 0) - self.yScale(d[0]) ?? 0);
            return calcHeight > 0 ? calcHeight : 0;
        }
    } else {
        return self.scaleBandWidth / 2;
    }
};

// checkIsStackedBarAlreadySelected(barElement: any): string {
//     return barElement.attr("already-active-bar");
// }

// setActiveStackedBarClass(barElement: any): void {
//     barElement.attr("active-bar", true).attr("fade-off-bar", false).attr("already-active-bar", true);
// }

// setActiveStackedBarsClass(selection: any): void {
//     selection.attr("active-bar", true).attr("fade-off-bar", false).attr("already-active-bar", false);
// }

// setFadeOffStackedBarsClass(selection: any): void {
//     selection.attr("fade-off-bar", true).attr("active-bar", false).attr("already-active-bar", false);
// }

// setActiveStackedBarBackground(selection: any): void {
//     const THIS = this;
//     selection.selectAll(".stackedBar").each((d, i, nodes) => {
//         const bar = d3.select(nodes[i]);
//         const isActiveBar = bar.attr("active-bar");
//         const isFadeOffBar = bar.attr("fade-off-bar");

//         if (isActiveBar === "true") {
//             THIS.setBarBackground(bar, d.pattern, d.barColor, d.isOther);
//         }

//         if (isFadeOffBar === "true") {
//             THIS.setBarBackground(bar, d.pattern, pSBC(0.4, d.barColor), d.isOther);
//         }
//     });
// }

// highlightActiveStackedBars(foreignObjectSelection: any): void {
//     const THIS = this;
//     foreignObjectSelection.on("click", function () {
//         const data: any = d3.select(this).datum();
//         let activeBarSelection: any;
//         if (THIS.isGroupedStackedBar) {
//             activeBarSelection = THIS.stackedBarG
//                 .selectAll(
//                     `.grouped-category-${data.data.groupedCategory}.foreignObject-${THIS.getTrimmedString(data.data?.category)}`
//                 )
//                 .selectAll(".stackedBar");
//         } else {
//             activeBarSelection = THIS.stackedBarG
//                 .selectAll(`.foreignObject-${THIS.getTrimmedString(data.data?.category)}`)
//                 .selectAll(".stackedBar");
//         }

//         const barsSelection = foreignObjectSelection.selectAll(".stackedBar");
//         const isAlreadyActiveBar = THIS.checkIsStackedBarAlreadySelected(activeBarSelection);
//         if (isAlreadyActiveBar === "true") {
//             THIS.setActiveStackedBarsClass(barsSelection);
//         } else {
//             THIS.setFadeOffStackedBarsClass(barsSelection);
//             THIS.setActiveStackedBarClass(activeBarSelection);
//         }

//         THIS.setActiveStackedBarBackground(foreignObjectSelection);
//     });
// }

// removeActiveBarStyleOnOutsideClick(): void {
//     this.rectForOutsideClick.on("click", () => {
//         this.normalBarG
//             .selectAll("foreignObject")
//             .classed("active-bar", true)
//             .classed("fade-off-bar", false)
//             .classed("already-active-bar", false);

//         this.stackedBarG
//             .selectAll("foreignObject")
//             .selectAll(".stackedBar")
//             .attr("active-bar", true)
//             .attr("fade-off-bar", false)
//             .attr("already-active-bar", false);

//         this.setActiveStackedBarBackground(this.stackedBarG.selectAll("foreignObject"));

//         this.groupedBarG
//             .selectAll("foreignObject")
//             .classed("active-bar", true)
//             .classed("fade-off-bar", false)
//             .classed("already-active-bar", false);
//     });
// } 