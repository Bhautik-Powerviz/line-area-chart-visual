import { Visual } from "../visual";
import { select as d3Select } from "d3-selection";
import { min as d3Min, max as d3Max, Primitive, group, maxIndex } from "d3-array";
import {
    DataRolesName,
    ESmallMultiplesAxisType,
    ESmallMultiplesDisplayType,
    ESmallMultiplesHeaderDisplayType,
    ESmallMultiplesHeaderPosition,
    ESmallMultiplesLayoutType,
    ESmallMultiplesViewType,
    ESmallMultiplesXAxisPosition,
    ESmallMultiplesYAxisPosition,
    EVisualConfig,
    EVisualSettings,
    FontStyle,
    Orientation,
} from "../enum";
import { IAxisConfig, IBrushConfig, ILayoutItemProps, ISmallMultiplesLayoutProps, ISmallMultiplesSettings } from "../visual-settings.model";
import { scaleLinear } from "d3";
import powerbi from "powerbi-visuals-api";
import React from "react";
import * as ReactDOM from "react-dom";
import SmallMultiplesLayout from "../small-multiples/smallMultiplesLayout";
import { RenderNormalBars } from "./NormalBar.methods";
import { DrawHorizontalBrush } from "./Brush.methods";
import { RenderXYAxis } from "./Axis.methods";
import { SMALL_MULTIPLES_SETTINGS } from "../constants";
import { GetFormattedNumber } from "./NumberFormat.methods";
import { RenderTooltipByChartType } from "./Tooltip.methods";
import { BehaviorOptions } from "./Behaviour.methods";

export const CreateSmallMultiples = (self: Visual): void => {
    const settings = self.smallMultiplesSettings;
    const isUniformXScale = settings.xAxisType === ESmallMultiplesAxisType.Uniform;
    const isUniformYScale = settings.yAxisType === ESmallMultiplesAxisType.Uniform;

    self.hyperListMainContainer.style.width = self.width + self.margin.left + self.margin.right + "px";
    self.hyperListMainContainer.style.transform = "translate(" + 0 + "px" + "," + 0 + "px" + ")";

    self.hyperListMainContainer.style.height = 0 + "px";

    if (!isUniformXScale) {
        self.hyperListMainContainer.style.height = self.height + self.margin.top + self.margin.bottom - self.SMPaginationPanelHeight + "px";
    } else {
        self.hyperListMainContainer.style.height = self.height - self.SMPaginationPanelHeight + "px";
    }

    RenderSmallMultiplesReactGridLayout(self, self.hyperListMainContainerId);
};

export const RenderSmallMultiplesReactGridLayout = (self: Visual, hostContainerId: string): void => {
    if (self.smallMultiplesCategoriesName?.length) {
        const settings = self.smallMultiplesSettings;
        const isUniformXScale = settings.xAxisType === ESmallMultiplesAxisType.Uniform;
        const isUniformYScale = settings.yAxisType === ESmallMultiplesAxisType.Uniform;

        const hostContainer = d3Select(`#${hostContainerId}`).node() as HTMLElement;

        const containerWidth = isUniformYScale ? hostContainer.clientWidth - self.margin.left : hostContainer.clientWidth;
        const containerHeight = hostContainer.clientHeight;

        const { rows, columns } = GetGridLayoutRowsColumnsCount(self, hostContainer.clientWidth, hostContainer.clientHeight);

        if (self.smallMultiplesSettings.viewType === ESmallMultiplesViewType.Pagination) {
            CreateSmallMultiplesPaginationPanel(self, rows, columns);
        } else {
            d3Select(self.SMPaginationPanel).selectAll("*").remove();
        }

        const totalRows = Math.ceil(self.smallMultiplesCategoriesName.length / columns);
        const itemWidth = (containerWidth - self.smallMultiplesSettings.outerSpacing * columns - self.smallMultiplesSettings.outerSpacing) / columns;
        let itemHeight = containerHeight / rows - self.smallMultiplesSettings.outerSpacing;

        const clonedCategoricalData: powerbi.DataViewCategorical = JSON.parse(JSON.stringify(self.categoricalData));
        const smallMultiplesDataPair = self.smallMultiplesDataPairs[0];
        const dataValuesIndexes = Object.keys(smallMultiplesDataPair).splice(2);

        clonedCategoricalData!.categories!.forEach((d) => {
            d.values = dataValuesIndexes.map((valueIndex) => {
                const id = +valueIndex.split("-")[1];
                return d.values[id];
            });
        });

        clonedCategoricalData!.values!.forEach((d) => {
            d.values = dataValuesIndexes.map((valueIndex) => {
                const id = +valueIndex.split("-")[1];
                return d.values[id];
            });
        });

        const initialChartDataByBrushScaleBand = self.setInitialChartDataByBrushScaleBand(
            clonedCategoricalData,
            JSON.parse(JSON.stringify(self.visualUpdateOptions.options.dataViews[0].categorical)),
            itemWidth,
            itemHeight
        );

        if (!self.isScrollBrushDisplayed) {
            self.setChartData(initialChartDataByBrushScaleBand, self.categoricalMetadata);
        }

        const axisConfig: IAxisConfig = {
            categoricalData: initialChartDataByBrushScaleBand,
            width: itemWidth,
            height: itemHeight,
            xAxisG: self.xAxisG.node(),
            yAxisG: self.yAxisG.node(),
            xAxisYPos: itemHeight,
            yAxisXPos: itemWidth,
        };

        RenderXYAxis(self, axisConfig);

        const layoutProps = GetSmallMultiplesLayoutProps(self, itemHeight - settings.outerSpacing / 2, rows, columns, totalRows);

        ReactDOM.render(React.createElement(SmallMultiplesLayout, layoutProps), self.hyperListMainContainer);

        d3Select("#hyperListMainContainerId")
            .selectAll(".react-grid-item")
            .each((node: any) => {
                const ele = d3Select(node);
                const isVisible = ele.select(".small-multiple-chart-wrapper").attr("data-visibility") === "true";
                if (isVisible) {
                    setTimeout(() => {
                        DrawSmallMultipleBarChart(self, { target: ele.select(".small-multiple-chart-wrapper") });
                    }, 100);
                }
            });

        const headerSettings = settings.header;
        const panelTitleSize = self.getTextHeight(headerSettings.fontSize, headerSettings.fontFamily, headerSettings.fontStyle, true);
        const { xAxisGNode, yAxisGNode } = GetRootXYAxisGNode(
            self,
            itemWidth - settings.innerSpacing * 2,
            itemHeight - panelTitleSize - settings.innerSpacing * 2
        );

        const { uniformBottomXAxis, uniformTopXAxis, uniformLeftYAxis, uniformRightYAxis } = CreateSmallMultiplesUniformAxis(
            self,
            self.uniformAxisContainer,
            self.hyperListMainContainer
        );

        if (self.isSMUniformXAxis) {
            setTimeout(() => {
                RenderSmallMultiplesUniformXAxis(self, columns, itemWidth, itemHeight, xAxisGNode, uniformBottomXAxis, uniformTopXAxis, isUniformXScale);
            }, 100);
        }

        RenderSmallMultiplesUniformYAxis(self, totalRows, itemHeight, yAxisGNode, uniformLeftYAxis, uniformRightYAxis, isUniformYScale);
    }
};

export const GetGridLayoutRowsColumnsCount = (
    self: Visual,
    containerWidth: number,
    containerHeight: number
): {
    rows: number;
    columns: number;
} => {
    const settings = self.smallMultiplesSettings;
    const isUniformXScale = settings.xAxisType === ESmallMultiplesAxisType.Uniform;
    const isUniformYScale = settings.yAxisType === ESmallMultiplesAxisType.Uniform;

    const minRows = 1;
    const minColumns = 1;
    const maxRows = 6;
    const maxColumns = 6;

    //  FLUID LAYOUT
    const minItemWidth = 200;
    const minItemHeight = 200;
    const fluidColumnsCount = Math.floor(containerWidth / minItemWidth) > 1 ? Math.floor(containerWidth / minItemWidth) : 2;
    const fluidRowsCount = Math.floor(containerHeight / minItemHeight) > 1 ? Math.floor(containerHeight / minItemHeight) : 2;

    let { rows: rowsCount, columns: columnsCount } = self.smallMultiplesSettings;

    if (self.smallMultiplesSettings.displayType === ESmallMultiplesDisplayType.Fluid) {
        rowsCount = fluidRowsCount;
        columnsCount = fluidColumnsCount;
    }

    const rows = rowsCount >= minRows && rowsCount <= maxRows ? rowsCount : rowsCount <= minRows ? minRows : maxRows;
    const columns = columnsCount >= minColumns && columnsCount <= maxColumns ? columnsCount : columnsCount <= minColumns ? minColumns : maxColumns;

    return { rows, columns };
};

export const CreateSmallMultiplesPaginationPanel = (self: Visual, rows: number, columns: number): void => {
    self.SMTotalItems = self.smallMultiplesCategoriesName.length;
    self.SMItemsPerPage = rows * columns;
    self.SMTotalPages = Math.ceil(self.SMTotalItems / self.SMItemsPerPage);
    self.SMFirstItemIndexOnCurrentPage = (self.SMCurrentPage - 1) * self.SMItemsPerPage + 1;

    self.SMPaginationPanel.innerHTML = "";

    const paginationPanelInnerHtml = `
      <div class="pagination-panel-content">
        <span class="pagination-items-count">
          ${self.SMFirstItemIndexOnCurrentPage} to ${self.SMFirstItemIndexOnCurrentPage + self.SMItemsPerPage - 1} 
          of
          ${self.SMTotalItems}</span>
        <button class="pagination-button goToFirstPageButton">
          <i class="fa fa-solid fa-angle-left"></i>
          <i class="fa fa-solid fa-angle-left"></i>
        </button>
        <button class="pagination-button goToPreviousPageButton">
          <i class="fa fa-solid fa-angle-left"></i>
        </button>
        <span class="pagination-page-count">
          Page ${self.SMCurrentPage} of ${self.SMTotalPages}
        </span>
        </span> 
        <button class="pagination-button goToNextPageButton"><i class="fa fa-solid fa-angle-right"></i></button>
        <button class="pagination-button goToLastPageButton">
          <i class="fa fa-solid fa-angle-right"></i>
          <i class="fa fa-solid fa-angle-right"></i>
        </button>
      </div>
    `;

    const setButtonDisabledProps = () => {
        document.querySelector(".goToPreviousPageButton")?.removeAttribute("disabled");
        document.querySelector(".goToFirstPageButton")?.removeAttribute("disabled");
        document.querySelector(".goToNextPageButton")?.removeAttribute("disabled");
        document.querySelector(".goToLastPageButton")?.removeAttribute("disabled");

        if (self.SMCurrentPage === 1) {
            document.querySelector(".goToPreviousPageButton")?.setAttribute("disabled", "true");
            document.querySelector(".goToFirstPageButton")?.setAttribute("disabled", "true");
        }

        if (self.SMCurrentPage === self.SMTotalPages) {
            document.querySelector(".goToNextPageButton")?.setAttribute("disabled", "true");
            document.querySelector(".goToLastPageButton")?.setAttribute("disabled", "true");
        }
    };

    d3Select(self.SMPaginationPanel)!.node()!.innerHTML = paginationPanelInnerHtml;
    setButtonDisabledProps();

    const onPageChange = (): void => {
        self.SMFirstItemIndexOnCurrentPage = (self.SMCurrentPage - 1) * self.SMItemsPerPage + 1;

        d3Select(self.SMPaginationPanel).select(".pagination-items-count").text(`${self.SMFirstItemIndexOnCurrentPage} to 
      ${self.SMFirstItemIndexOnCurrentPage + self.SMItemsPerPage - 1 < self.SMTotalItems
                ? self.SMFirstItemIndexOnCurrentPage + self.SMItemsPerPage - 1
                : self.SMTotalItems
            } 
      of ${self.SMTotalItems}`);

        d3Select(self.SMPaginationPanel).select(".pagination-page-count").text(`Page ${self.SMCurrentPage} of ${self.SMTotalPages}`);
        setButtonDisabledProps();
        renderSMBarChartsOnPageChange();
    };

    const renderSMBarChartsOnPageChange = (): void => {
        d3Select("#hyperListMainContainerId")
            .selectAll(".react-grid-item")
            .each((node: any, index) => {
                const ele = d3Select(node);
                const chartWrapper = ele.select(".small-multiple-chart-wrapper");
                const id = index + ((self.SMCurrentPage - 1) * self.SMItemsPerPage + 1) - 1;
                chartWrapper.attr("data-id", id + "");
                if (id >= 0 && id <= self.SMTotalItems - 1) {
                    DrawSmallMultipleBarChart(self, { target: chartWrapper });
                } else {
                    d3Select(node).select(".small-multiple-chart-wrapper").selectAll("*").remove();
                }
            });
    };

    onPageChange();

    // GO TO PREVIOUS PAGE
    d3Select(".goToPreviousPageButton").on("click", () => {
        if (self.SMCurrentPage > 1) {
            self.SMCurrentPage--;
            onPageChange();
        }
    });

    // GO TO NEXT PAGE
    d3Select(".goToNextPageButton").on("click", () => {
        if (self.SMCurrentPage < self.SMTotalPages) {
            self.SMCurrentPage++;
            onPageChange();
        }
    });

    // GO TO FIRST PAGE
    d3Select(".goToFirstPageButton").on("click", () => {
        self.SMCurrentPage = 1;
        onPageChange();
    });

    // GO TO LAST PAGE
    d3Select(".goToLastPageButton").on("click", () => {
        self.SMCurrentPage = self.SMTotalPages;
        onPageChange();
    });
};

export const GetSmallMultiplesLayoutProps = (
    self: Visual,
    itemHeight: number,
    rows: number,
    columns: number,
    totalRows: number
): ISmallMultiplesLayoutProps => {
    const layoutClassName = "small-multiples-layout";
    const layoutWidth = self.width - self.settingsPopupOptionsWidth;
    const layoutRowHeight = itemHeight;

    const measureBeforeMount = false;
    const orientation = Orientation.Vertical;
    const cellPadding = [10, 10];

    let height = 0;
    if (self.smallMultiplesSettings.layoutType === ESmallMultiplesLayoutType.Grid) {
        height = layoutRowHeight;
    } else if (self.smallMultiplesSettings.layoutType === ESmallMultiplesLayoutType.RankedPanels) {
        height = 50;
    } else if (self.smallMultiplesSettings.layoutType === ESmallMultiplesLayoutType.ScaledRows) {
        height = 50;
    }

    const layout = GetReactGridLayout(self, columns, self.smallMultiplesSettings.viewType === ESmallMultiplesViewType.Pagination ? rows : totalRows);

    const layoutProps: ISmallMultiplesLayoutProps = {
        className: layoutClassName,
        rowHeight: height,
        // rowHeight: 50,
        items: self.smallMultiplesCategoriesName.length,
        cols: columns,
        layouts: layout,
        width: layoutWidth,
        measureBeforeMount: measureBeforeMount,
        compactType: orientation,
        margin: [self.smallMultiplesSettings.outerSpacing, self.smallMultiplesSettings.outerSpacing],
        containerPadding: [self.smallMultiplesSettings.innerSpacing, self.smallMultiplesSettings.innerSpacing],
        onLayoutChange: () => { },
        onResize: () => { },
        smallMultiplesSettings: self.smallMultiplesSettings,
        onCellRendered: DrawSmallMultipleBarChart.bind(this),
    };

    return layoutProps;
};

export const DrawSmallMultipleBarChart = (self: Visual, entry: { target: any }) => {
    const settings = self.smallMultiplesSettings;
    const isUniformXScale = settings.xAxisType === ESmallMultiplesAxisType.Uniform;
    const isUniformYScale = settings.yAxisType === ESmallMultiplesAxisType.Uniform;

    const smallMultiplesDataPairs = GetSmallMultiplesDataPairsByItem(self);

    const ele = d3Select(entry.target);
    ele.selectAll("*").remove();
    const id = +ele.attr("data-id");
    const isChartNotLoaded = ele.attr("data-visibility") === "true";

    if (isChartNotLoaded) {
        const headerSettings = self.smallMultiplesSettings.header;

        const div = document.createElement("div");
        div.classList.add("panel-title");
        if (headerSettings.position === ESmallMultiplesHeaderPosition.Top) {
            div.style.alignSelf = "start";
        } else if (headerSettings.position === ESmallMultiplesHeaderPosition.Bottom) {
            div.style.alignSelf = "end";
        }

        const svgDiv = document.createElement("div");
        svgDiv.classList.add("svg-div");

        const panelTitleSize = self.getTextHeight(headerSettings.fontSize, headerSettings.fontFamily, headerSettings.fontStyle, true);
        svgDiv.style.height = `calc(${100}% - ${headerSettings.displayType !== ESmallMultiplesHeaderDisplayType.None ? panelTitleSize : 0}px)`;

        // if (headerSettings.displayType !== ESmallMultiplesHeaderDisplayType.None) {
        //   if (headerSettings.position === ESmallMultiplesHeaderPosition.Top) {
        //     svgDiv.style.marginBottom = "0px";
        //     svgDiv.style.marginTop = "10px";
        //   } else if (headerSettings.position === ESmallMultiplesHeaderPosition.Bottom) {
        //     svgDiv.style.marginTop = "0px";
        //     svgDiv.style.marginBottom = "10px";
        //   }
        // } else {
        //   svgDiv.style.marginTop = "0px";
        //   svgDiv.style.marginBottom = "0px";
        // }

        if (headerSettings.position === ESmallMultiplesHeaderPosition.Top) {
            entry.target.appendChild(div);
            entry.target.appendChild(svgDiv);
        } else if (headerSettings.position === ESmallMultiplesHeaderPosition.Bottom) {
            entry.target.appendChild(svgDiv);
            entry.target.appendChild(div);
        }

        const svgDivBBox = svgDiv.getBoundingClientRect();

        const newItemWidth = svgDivBBox.width;
        const newItemHeight = svgDivBBox.height - (self.isScrollBrushDisplayed ? self.brushHeight : 0);

        const smallMultipleIndex = id;
        self.currentSmallMultipleIndex = id;

        const clonedCategoricalData: powerbi.DataViewCategorical = JSON.parse(JSON.stringify(self.categoricalData));
        const smallMultiplesDataPair = smallMultiplesDataPairs.find((d) => d.category === self.smallMultiplesCategoriesName[smallMultipleIndex]);
        const dataValuesIndexes = Object.keys(smallMultiplesDataPair).splice(2);

        clonedCategoricalData.categories!.forEach((d) => {
            d.values = dataValuesIndexes.map((valueIndex) => {
                const id = +valueIndex.split("-")[1];
                return d.values[id];
            });
        });

        clonedCategoricalData.values!.forEach((d) => {
            d.values = dataValuesIndexes.map((valueIndex) => {
                const id = +valueIndex.split("-")[1];
                return d.values[id];
            });
        });

        // clonedCategoricalData.categories.forEach(d => {
        //   d.values = d.values.slice(startIndex, endIndex);0
        // });
        // clonedCategoricalData.values.forEach(d => {
        //   d.values = d.values.slice(startIndex, endIndex);
        // });

        const clonedCategoricalData2 = JSON.parse(JSON.stringify(self.categoricalData));
        const initialChartDataByBrushScaleBand = self.setInitialChartDataByBrushScaleBand(
            clonedCategoricalData,
            clonedCategoricalData2,
            newItemWidth,
            newItemHeight
        );

        if (!self.isScrollBrushDisplayed) {
            self.setChartData(clonedCategoricalData, self.categoricalMetadata);
        }

        //   this.setChartData(initialChartDataByBrushScaleBand, this.categoricalMetadata);
        self.setColorsByDataColorsSettings();

        const textEle = document.createElement("div");
        div.appendChild(textEle);

        textEle.style.fontFamily = headerSettings.fontFamily;
        textEle.style.fontSize = headerSettings.fontSize + "px";
        textEle.style.color = headerSettings.fontColor;
        textEle.style.fontWeight = headerSettings.fontStyle.includes(FontStyle.Bold) ? "bold" : "";
        textEle.style.fontStyle = headerSettings.fontStyle.includes(FontStyle.Italic) ? "italic" : "";
        textEle.style.textAlign = headerSettings.alignment;

        if (headerSettings.displayType !== ESmallMultiplesHeaderDisplayType.None) {
            textEle.style.display = "block";
        } else {
            textEle.style.display = "none";
        }

        if (self.smallMultiplesSettings.header.isTextWrapEnabled) {
            textEle.classList.add("text-ellipsis");
        } else {
            textEle.classList.remove("text-ellipsis");
        }

        const total = self.chartData.reduce((count, cur) => count + cur.value, 0);

        const categoryName = self.smallMultiplesCategoriesName[smallMultipleIndex];
        const categoryTotal = GetFormattedNumber(self, total, false);
        const categoryAvg = GetFormattedNumber(self, total / self.chartData.length, false);

        switch (headerSettings.displayType) {
            case ESmallMultiplesHeaderDisplayType.None:
                textEle.textContent = "";
                break;
            case ESmallMultiplesHeaderDisplayType.TitleAndTotalValue:
                textEle.textContent = categoryName + " : " + categoryTotal;
                break;
            case ESmallMultiplesHeaderDisplayType.TitleAndAverageValue:
                textEle.textContent = categoryName + " : " + categoryAvg;
                break;
            case ESmallMultiplesHeaderDisplayType.TitleOnly:
                textEle.textContent = categoryName;
                break;
        }

        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.classList.add("small-multiple-chart");
        const container = document.createElementNS("http://www.w3.org/2000/svg", "g");
        container.classList.add("container");

        if (!isUniformYScale) {
            container.setAttribute("transform", `translate(${self.margin.left}, ${0})`);
        }

        const xAxisG = document.createElementNS("http://www.w3.org/2000/svg", "g");
        xAxisG.classList.add("xAxisG");
        xAxisG.classList.add("small-multiple-axis");
        const yAxisG = document.createElementNS("http://www.w3.org/2000/svg", "g");
        yAxisG.classList.add("yAxisG");
        xAxisG.classList.add("small-multiple-axis");

        const brushG = document.createElementNS("http://www.w3.org/2000/svg", "g");
        brushG.classList.add("brush");

        self.smallMultiplesGridItemContent[self.smallMultiplesCategoriesName[smallMultipleIndex]] = {
            svg: svg,
            xScale: self.xScale,
            yScale: self.yScale,
            normalBarG: null,
            xAxisG: xAxisG,
            yAxisG: yAxisG,
            categoricalData: self.isSMUniformXAxis ? initialChartDataByBrushScaleBand : self.categoricalData,
            brush: null,
            brushG: null,
            categoricalDataPairs: self.categoricalDataPairs,
            chartData: self.chartData,
        };

        const barG = document.createElementNS("http://www.w3.org/2000/svg", "g");
        barG.classList.add("barG");
        svg.append(container);
        container.append(xAxisG);
        container.append(yAxisG);
        container.append(barG);
        svg.append(brushG);
        svgDiv.appendChild(svg);

        if (isUniformXScale) {
            xAxisG.style.display = "none";
        }

        if (isUniformYScale) {
            yAxisG.style.display = "none";
        }

        const axisConfig: IAxisConfig = {
            categoricalData: self.smallMultiplesSettings.layoutType === ESmallMultiplesLayoutType.Grid ? self.categoricalData : clonedCategoricalData,
            width: newItemWidth - (!isUniformYScale ? self.margin.left : 0),
            height: newItemHeight - (!isUniformXScale ? self.margin.bottom : 0),
            xAxisG: xAxisG,
            yAxisG: yAxisG,
            xAxisYPos: newItemHeight - (!isUniformXScale ? self.margin.bottom : 0),
            yAxisXPos: newItemWidth,
        };

        RenderXYAxis(self, axisConfig);

        RenderNormalBars(self, d3Select(barG), self.chartData);

        self.smallMultiplesGridItemContent[self.smallMultiplesCategoriesName[smallMultipleIndex]].normalBarG = barG;

        ele.attr("data-chart-loaded", true);

        RenderTooltipByChartType(self, d3Select(barG as any), self.stackedBarG, self.groupedBarG);

        let barNodeData = [];
        let barSelection = d3Select(self.smallMultiplesContainer).selectAll(".bar");
        barSelection.each(function () {
            barNodeData.push(d3Select(this).datum() as never);
        });

        const behaviorOptions: BehaviorOptions = {
            selection: barSelection,
            clearCatcher: self.svg,
            interactivityService: self.interactivityService,
            dataPoints: barNodeData,
            behavior: self.behavior,
            isLassoEnabled: false,
            isClearPreviousSelection: false,
            onBarClick: () => { },
        };
        self.interactivityService.bind(behaviorOptions);

        if (!self.isSMUniformXAxis) {
            const barDistance =
                Math.floor(self.brushScaleBandBandwidth) > self.minScaleBandWidth ? Math.floor(self.brushScaleBandBandwidth) : self.minScaleBandWidth;
            if (self.isScrollBrushDisplayed) {
                const brushXPos = !isUniformYScale ? self.margin.left : 0;
                const brushYPos = newItemHeight - self.brushHeight;
                const config: IBrushConfig = {
                    brushG: brushG,
                    brushXPos: brushXPos,
                    brushYPos: brushYPos,
                    barDistance: barDistance,
                    totalBarsCount: self.totalBarsCount,
                    isOnlySetScaleDomainByBrush: true,
                    scaleWidth: newItemWidth - (!isUniformYScale ? self.margin.left : 0),
                    scaleHeight: newItemHeight - self.margin.bottom,
                    smallMultiplesGridItemContent: self.smallMultiplesGridItemContent,
                    smallMultiplesGridItemId: self.smallMultiplesCategoriesName[smallMultipleIndex],
                    categoricalData: clonedCategoricalData,
                };

                if (self.isHorizontalBrushDisplayed) {
                    DrawHorizontalBrush(self, config);
                } else {
                    brushG.childNodes.forEach((node) => {
                        node.remove();
                    });
                }
            }
        }
    }
};

export const GetRootXYAxisGNode = (self: Visual, itemWidth: number, itemHeight: number): { xAxisGNode: HTMLElement; yAxisGNode: HTMLElement } => {
    const axisConfig: IAxisConfig = {
        categoricalData: self.categoricalData,
        width: itemWidth - self.margin.left,
        height: itemHeight - self.margin.bottom,
        xAxisG: self.xAxisG.node(),
        yAxisG: self.yAxisG.node(),
        xAxisYPos: itemWidth - self.margin.bottom,
        yAxisXPos: itemWidth,
    };

    RenderXYAxis(self, axisConfig);

    const xAxisGNode: any = self.hostContainer.querySelector(".xAxisG")!.cloneNode(true);
    const yAxisGNode: any = self.hostContainer.querySelector(".yAxisG")!.cloneNode(true);

    xAxisGNode.style.transform = "translate(0, 0)";
    xAxisGNode.querySelectorAll("text").forEach((node) => {
        node.setAttribute("y", 0);
    });
    xAxisGNode.querySelectorAll("tspan").forEach((node) => {
        node.setAttribute("y", 0);
    });

    return { xAxisGNode, yAxisGNode };
};

export const CreateSmallMultiplesUniformAxis = (
    self: Visual,
    container: HTMLElement,
    smallMultiplesWrapper: HTMLElement
): { uniformBottomXAxis: HTMLElement; uniformTopXAxis: HTMLElement; uniformLeftYAxis: HTMLElement; uniformRightYAxis: HTMLElement } => {
    const settings = self.smallMultiplesSettings;
    const isUniformXScale = settings.xAxisType === ESmallMultiplesAxisType.Uniform;
    const isUniformYScale = settings.yAxisType === ESmallMultiplesAxisType.Uniform;

    d3Select(container).select(".uniformBottomXAxis").remove();
    d3Select(container).select(".uniformTopXAxis").remove();
    d3Select(container).select(".uniformLeftYAxis").remove();
    d3Select(container).select(".uniformRightYAxis").remove();

    let bottomXAxis!: HTMLElement;
    let topXAxis!: HTMLElement;

    let leftYAxis!: HTMLElement;
    let rightYAxis!: HTMLElement;

    if (isUniformXScale) {
        switch (self.smallMultiplesSettings.xAxisPosition) {
            case ESmallMultiplesXAxisPosition.FrozenBottomColumn:
                bottomXAxis = GetSmallMultiplesUniformBottomXAxis(self, smallMultiplesWrapper);
                container.appendChild(bottomXAxis);
                break;
            case ESmallMultiplesXAxisPosition.FrozenTopColumn:
                topXAxis = GetSmallMultiplesUniformTopXAxis(self, smallMultiplesWrapper);
                container.appendChild(topXAxis);
                break;
            case ESmallMultiplesXAxisPosition.All:
                bottomXAxis = GetSmallMultiplesUniformBottomXAxis(self, smallMultiplesWrapper);
                container.appendChild(bottomXAxis);

                topXAxis = GetSmallMultiplesUniformTopXAxis(self, smallMultiplesWrapper);
                container.appendChild(topXAxis);
                break;
        }
    }

    if (isUniformYScale) {
        switch (self.smallMultiplesSettings.yAxisPosition) {
            case ESmallMultiplesYAxisPosition.FrozenLeftColumn:
                leftYAxis = GetSmallMultiplesUniformLeftYAxis(self, smallMultiplesWrapper);
                container.appendChild(leftYAxis);
                break;
            case ESmallMultiplesYAxisPosition.FrozenRightColumn:
                rightYAxis = GetSmallMultiplesUniformRightYAxis(self, smallMultiplesWrapper);
                container.appendChild(rightYAxis);
                break;
            case ESmallMultiplesYAxisPosition.All:
                leftYAxis = GetSmallMultiplesUniformLeftYAxis(self, smallMultiplesWrapper);
                container.appendChild(leftYAxis);

                rightYAxis = GetSmallMultiplesUniformRightYAxis(self, smallMultiplesWrapper);
                container.appendChild(rightYAxis);
                break;
        }
    }

    return { uniformBottomXAxis: bottomXAxis, uniformTopXAxis: topXAxis, uniformLeftYAxis: leftYAxis, uniformRightYAxis: rightYAxis };
};

export const RenderSmallMultiplesUniformXAxis = (
    self: Visual,
    columns: number,
    itemWidth: number,
    itemHeight: number,
    xAxisGNode: HTMLElement,
    uniformBottomXAxis: HTMLElement,
    uniformTopXAxis: HTMLElement,
    isUniformXScale: boolean
): void => {
    const settings = self.smallMultiplesSettings;

    if (isUniformXScale) {
        uniformBottomXAxis?.querySelectorAll(".x-axis-col-svg")?.forEach((node) => {
            node?.remove();
        });

        uniformTopXAxis?.querySelectorAll(".x-axis-col-svg")?.forEach((node) => {
            node?.remove();
        });

        for (let i = 0; i < columns; i++) {
            xAxisGNode.id = "uniformXAxis-" + i;

            const uniformAxisContainer = document.createElement("div");
            uniformAxisContainer.style.transform = `translate(${i * (itemWidth + settings.outerSpacing) + settings.outerSpacing + settings.innerSpacing
                }px, 0px)`;
            uniformAxisContainer.style.position = "absolute";

            const axisSVG = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            axisSVG.classList.add("x-axis-col-svg");
            axisSVG.style.width = itemWidth + "px";
            axisSVG.style.height = 18 + "px";

            const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
            g.style.transform = `translate(${self.margin.left}px, 0px)`;

            axisSVG.appendChild(g);

            g.appendChild(xAxisGNode.cloneNode(true));

            const uniformBrushSVG = RenderSmallMultiplesUniformXAxisBrush(self, i, itemWidth, itemHeight);

            uniformAxisContainer.appendChild(axisSVG);
            uniformAxisContainer.appendChild(uniformBrushSVG);

            if (uniformBottomXAxis) {
                uniformBottomXAxis.appendChild(uniformAxisContainer);
            }

            if (uniformTopXAxis) {
                uniformTopXAxis.appendChild(uniformAxisContainer);
            }
        }
    }
};

export const RenderSmallMultiplesUniformYAxis = (
    self: Visual,
    totalRows: number,
    itemHeight: number,
    yAxisGNode: HTMLElement,
    uniformLeftYAxis: HTMLElement,
    uniformRightYAxis: HTMLElement,
    isUniformYScale: boolean
): void => {
    const THIS = this;
    const settings = self.smallMultiplesSettings;
    const headerSettings = settings.header;

    if (isUniformYScale) {
        uniformLeftYAxis?.querySelectorAll(".y-axis-col-svg")?.forEach((node) => {
            node?.remove();
        });

        uniformRightYAxis?.querySelectorAll(".y-axis-col-svg")?.forEach((node) => {
            node?.remove();
        });

        if (settings.xAxisPosition !== ESmallMultiplesXAxisPosition.FrozenBottomColumn) {
            if (uniformLeftYAxis) {
                uniformLeftYAxis.style.marginTop = self.margin.bottom + "px";
            }

            if (uniformRightYAxis) {
                uniformRightYAxis.style.marginTop = self.margin.bottom + "px";
            }
        }

        if (settings.xAxisPosition !== ESmallMultiplesXAxisPosition.FrozenBottomColumn) {
        }

        self.hyperListMainContainer.onscroll = () => {
            if (uniformLeftYAxis) {
                uniformLeftYAxis.style.transform = `translate(${0}, ${-self.hyperListMainContainer.scrollTop}px)`;
            }

            if (uniformRightYAxis) {
                uniformRightYAxis.style.transform = `translate(${self.width + self.smallMultiplesLayoutScrollbarWidth}px, ${-self.hyperListMainContainer
                    .scrollTop}px)`;
            }
        };

        const panelTitleSize = self.getTextHeight(headerSettings.fontSize, headerSettings.fontFamily, headerSettings.fontStyle, true);

        // APPEND CLONED Y AXIS COPY
        for (let i = 0; i < totalRows; i++) {
            const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            svg.classList.add("y-axis-col-svg");
            svg.style.width = self.margin.left + "px";
            svg.style.height = itemHeight - panelTitleSize + "px";
            // svg.style.marginLeft = this.margin + "px";
            svg.style.transform = `translate(${0}px ,${i * (itemHeight + settings.outerSpacing) + settings.outerSpacing + panelTitleSize + settings.innerSpacing
                }px)`;

            const g = document.createElementNS("http://www.w3.org/2000/svg", "g");

            if (headerSettings.position === ESmallMultiplesHeaderPosition.Top) {
                g.style.transform = `translate(${self.margin.left}px, ${headerSettings.position === ESmallMultiplesHeaderPosition.Top ? 10 : 0}px)`;
            } else {
                g.style.transform = `translate(${self.margin.left}px, ${0}px)`;
            }

            svg.appendChild(g);

            g.appendChild(yAxisGNode.cloneNode(true));
            // this.uniformSmallMultiplesYAxisContainer.appendChild(svg);

            if (uniformLeftYAxis) {
                uniformLeftYAxis.appendChild(svg.cloneNode(true));
            }

            if (uniformRightYAxis) {
                uniformRightYAxis.appendChild(svg.cloneNode(true));
            }
        }
    }
};

export const GetReactGridLayout = (self: Visual, columns: number, totalRows: number): ILayoutItemProps[] => {
    // SCALED ROWS
    const getRankedScale = (value: number, min: number, max: number, minHeight: number, maxHeight: number) => {
        let rankedScale: any;
        if (max > 0) {
            if (value > 0) {
                const positiveRankedScale = scaleLinear().domain([max, min]).range([maxHeight, minHeight]);
                rankedScale = positiveRankedScale;
            } else {
                const negativeRankedScale = scaleLinear().domain([min, max]).range([maxHeight, minHeight]);
                rankedScale = negativeRankedScale;
            }
        } else {
            rankedScale = scaleLinear().domain([0, 0]).range([0, 0]);
        }
        return rankedScale(value);
    };

    const minScaledRowHeight = 1;
    const maxScaledRowHeight = 5;
    const totalValuesByRow: number[] = [];
    for (let i = 0; i < Math.floor(self.smallMultiplesCategoriesName.length / columns); i++) {
        let total = 0;
        for (let j = i * columns; j < i * columns + columns; j++) {
            total += self.smallMultiplesDataPairs[j]?.total;
        }
        totalValuesByRow.push(total);
    }

    const scaledRowsMin = Math.min.apply(Math, totalValuesByRow);
    const scaledRowsMax = Math.max.apply(Math, totalValuesByRow);

    // RANKED PANELS
    const minCellHeight = 2;
    const maxCellHeight = 5;
    const cellTotals = self.smallMultiplesDataPairs.map((d) => d.total);
    const rankedPanelsMin = d3Min(self.smallMultiplesDataPairs, (d) => d.total);
    const rankedPanelsMax = d3Max(self.smallMultiplesDataPairs, (d) => d.total);
    const rankedCellScale = scaleLinear().domain([rankedPanelsMin, rankedPanelsMax]).range([minCellHeight, maxCellHeight]);
    const cellsHeightByScale = cellTotals.map((d) => rankedCellScale(d));
    const clonedCellsHeightByScale = JSON.parse(JSON.stringify(cellsHeightByScale));
    const cellsHeightByRows: number[] = [];
    while (clonedCellsHeightByScale.length) cellsHeightByRows.push(clonedCellsHeightByScale.splice(0, columns));

    let iterator = 0;
    let layout: ILayoutItemProps[] = [];

    const isDraggable: boolean = false;
    const isResizable: boolean = false;

    if (self.smallMultiplesSettings.layoutType === ESmallMultiplesLayoutType.Grid) {
        for (let i = 0; i < totalRows; i++) {
            for (let j = 0; j < columns; j++) {
                const obj = { i: self.smallMultiplesCategoriesName[iterator], x: j, y: i, w: 1, h: 1, isDraggable: false, isResizable: true };
                layout.push(obj);
                iterator++;
            }
        }
    } else if (self.smallMultiplesSettings.layoutType === ESmallMultiplesLayoutType.RankedPanels) {
        for (let i = 0; i < totalRows; i++) {
            for (let j = 0; j < columns; j++) {
                const obj = {
                    i: self.smallMultiplesCategoriesName[iterator],
                    x: j,
                    y: i,
                    w: 1,
                    h: cellsHeightByScale[iterator],
                    isDraggable: false,
                    isResizable: false,
                };
                layout.push(obj);
                iterator++;
            }
        }
    } else if (self.smallMultiplesSettings.layoutType === ESmallMultiplesLayoutType.ScaledRows) {
        for (let i = 0; i < totalRows; i++) {
            const height = getRankedScale(totalValuesByRow[i], scaledRowsMin, scaledRowsMax, minScaledRowHeight, maxScaledRowHeight); // scaled rows
            for (let j = 0; j < columns; j++) {
                const obj = { i: self.smallMultiplesCategoriesName[iterator], x: j, y: i, w: 1, h: height, isDraggable: false, isResizable: false };
                layout.push(obj);
                iterator++;
            }
        }
    }

    return layout;
};

export const GetSmallMultiplesDataPairsByItem = (self: Visual): any => {
    const clonedCategoricalData: powerbi.DataViewCategorical = JSON.parse(JSON.stringify(self.categoricalData));
    const categoricalSmallMultiplesDataField = clonedCategoricalData.categories!.find((value: any) =>
        Object.keys(value.source.roles).includes(DataRolesName.SmallMultiples)
    );
    const categoricalDataPairsForGrouping = categoricalSmallMultiplesDataField!.values.reduce((arr: any, category: Primitive, index: number) => {
        const obj = { category: category, total: 0, [`index-${index}`]: index };
        return [...arr, obj];
    }, []);
    const categoricalSmallMultiplesValues = categoricalSmallMultiplesDataField?.values.filter((item, i, ar) => ar.indexOf(item) === i) ?? [];

    const categoricalDataPairsGroup = group(categoricalDataPairsForGrouping, (d: any) => d.category);
    const smallMultiplesDataPairs = categoricalSmallMultiplesValues.map((category) => Object.assign({}, ...categoricalDataPairsGroup.get(category)!));

    return smallMultiplesDataPairs;
};

export const RenderSmallMultiplesUniformXAxisBrush = (self: Visual, colIndex: number, scaleWidth: number, scaleHeight: number): SVGElement => {
    const categoricalDataPairsWithMaxCategories = Object.values(self.smallMultiplesGridItemContent)[
        maxIndex(Object.values(self.smallMultiplesGridItemContent), (d) => d.categoricalDataPairs.length)
    ]?.categoricalDataPairs;
    self.brushScaleBand.domain(categoricalDataPairsWithMaxCategories.map((d) => d.category));

    const brushSVG = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    brushSVG.classList.add("uniformXAxisBrush");
    brushSVG.style.width = scaleWidth + "px";
    brushSVG.style.height = 18 + "px";
    brushSVG.style.transform = `translate(${0}px, ${18}px)`;

    const brushG = document.createElementNS("http://www.w3.org/2000/svg", "g");
    brushG.classList.add("brush");

    brushSVG.appendChild(brushG);
    brushG.appendChild(brushG.cloneNode(true));

    const barDistance =
        Math.floor(self.brushScaleBandBandwidth) > self.minScaleBandWidth ? Math.floor(self.brushScaleBandBandwidth) : self.minScaleBandWidth;
    const config: IBrushConfig = {
        brushG: brushG,
        brushXPos: self.margin.left,
        brushYPos: 0,
        barDistance: barDistance,
        totalBarsCount: self.totalBarsCount,
        isOnlySetScaleDomainByBrush: false,
        scaleWidth: scaleWidth - self.margin.left,
        scaleHeight: scaleHeight,
        smallMultiplesGridItemContent: self.smallMultiplesGridItemContent,
        smallMultiplesGridItemId: self.smallMultiplesCategoriesName[0],
        categoricalData: self.categoricalData,
        XAxisG: null,
        brushNumber: colIndex,
    };

    if (self.isHorizontalBrushDisplayed) {
        DrawHorizontalBrush(self, config);
    } else {
        brushG.childNodes.forEach((node) => {
            node.remove();
        });
    }

    return brushSVG;
};

export const GetSmallMultiplesUniformBottomXAxis = (self: Visual, smallMultiplesWrapper: HTMLElement): HTMLElement => {
    const settings = self.smallMultiplesSettings;
    const isUniformYScale = settings.yAxisType === ESmallMultiplesAxisType.Uniform;
    const isUniformBottomXAxis = settings.xAxisPosition === ESmallMultiplesXAxisPosition.FrozenBottomColumn;

    const uniformXAxis = document.createElement("div");

    uniformXAxis.id = "uniformBottomXAxis";
    uniformXAxis.classList.add("uniformBottomXAxis");
    uniformXAxis.style.width = "100%";
    uniformXAxis.style.height = self.margin.bottom + "px";
    uniformXAxis.style.transform = "translate(" + 0 + "px" + "," + (self.height - self.SMPaginationPanelHeight) + "px" + ")";

    if (isUniformYScale) {
        // if (isUniformBottomXAxis) {
        //   uniformXAxis.style.transform = "translate(" + this.margin.left + "px" + "," + 0 + "px" + ")";
        // } else {
        //   uniformXAxis.style.transform = "translate(" + this.margin.left + "px" + "," + 0 + "px" + ")";
        // }

        uniformXAxis.style.transform = "translate(" + self.margin.left + "px" + "," + self.height + "px" + ")";
        uniformXAxis.style.width = `calc(100% - ${self.margin.left}px)`;
    }

    return uniformXAxis;
}

export const GetSmallMultiplesUniformTopXAxis = (self: Visual, smallMultiplesWrapper: HTMLElement): HTMLElement => {
    const settings = self.smallMultiplesSettings;
    const isUniformXScale = settings.xAxisType === ESmallMultiplesAxisType.Uniform;
    const isUniformBottomXAxis = settings.xAxisPosition !== ESmallMultiplesXAxisPosition.FrozenTopColumn;
    const isUniformYScale = settings.yAxisType === ESmallMultiplesAxisType.Uniform;

    const uniformXAxis = document.createElement("div");

    uniformXAxis.id = "uniformTopXAxis";
    uniformXAxis.classList.add("uniformTopXAxis");
    uniformXAxis.style.width = "100%";
    uniformXAxis.style.height = self.margin.bottom + "px";

    if (isUniformYScale) {
        uniformXAxis.style.transform = "translate(" + self.margin.left + "px" + "," + 0 + "px" + ")";
        uniformXAxis.style.width = `calc(100% - ${self.margin.left}px)`;
    }

    if (isUniformBottomXAxis) {
        smallMultiplesWrapper.style.height = (self.height - self.margin.bottom) + "px";
    }
    smallMultiplesWrapper.style.transform = "translate(" + 0 + "px" + "," + (self.margin.bottom) + "px" + ")";

    return uniformXAxis;
}

export const GetSmallMultiplesUniformLeftYAxis = (self: Visual, smallMultiplesWrapper: HTMLElement): HTMLElement => {
    const settings = self.smallMultiplesSettings;
    const isUniformXScale = settings.xAxisType === ESmallMultiplesAxisType.Uniform;
    const isUniformYScale = settings.yAxisType === ESmallMultiplesAxisType.Uniform;
    const isUniformTopXAxis = settings.xAxisPosition !== ESmallMultiplesXAxisPosition.FrozenBottomColumn;

    const uniformYAxis = document.createElement("div");

    uniformYAxis.id = "uniformLeftYAxis";
    uniformYAxis.classList.add("uniformLeftYAxis");
    uniformYAxis.style.width = self.margin.left + "px";
    uniformYAxis.style.height = self.height + "px";
    uniformYAxis.style.transform = "translate(" + 0 + "px" + "," + 0 + "px" + ")";

    smallMultiplesWrapper.style.width = self.width + self.margin.right + "px";
    smallMultiplesWrapper.style.transform = "translate(" + self.margin.left + "px" + "," + (isUniformXScale && isUniformTopXAxis ? self.margin.bottom : 0) + "px" + ")";

    return uniformYAxis;
}

export const GetSmallMultiplesUniformRightYAxis = (self: Visual, smallMultiplesWrapper: HTMLElement): HTMLElement => {
    const settings = self.smallMultiplesSettings;
    const isUniformXScale = settings.xAxisType === ESmallMultiplesAxisType.Uniform;
    const isUniformYScale = settings.yAxisType === ESmallMultiplesAxisType.Uniform;
    const isUniformRightYAxis = settings.yAxisPosition === ESmallMultiplesYAxisPosition.FrozenRightColumn;
    const isUniformTopXAxis = settings.xAxisPosition !== ESmallMultiplesXAxisPosition.FrozenBottomColumn;

    const uniformYAxis = document.createElement("div");

    uniformYAxis.id = "uniformRightYAxis";
    uniformYAxis.classList.add("uniformRightYAxis");
    uniformYAxis.style.width = self.margin.left + "px";
    uniformYAxis.style.height = self.height + "px";
    uniformYAxis.style.transform = "translate(" + (self.width + self.smallMultiplesLayoutScrollbarWidth) + "px" + "," + 0 + "px" + ")";

    if (isUniformRightYAxis) {
        smallMultiplesWrapper.style.width = self.width + self.margin.right + "px";
        smallMultiplesWrapper.style.transform = "translate(" + 0 + "px" + "," + (isUniformXScale && isUniformTopXAxis ? self.margin.bottom : 0) + "px" + ")";
    } else {
        smallMultiplesWrapper.style.width = self.width + self.margin.right - self.margin.left + "px";
        smallMultiplesWrapper.style.transform = "translate(" + self.margin.left + "px" + "," + (isUniformXScale && isUniformTopXAxis ? self.margin.bottom : 0) + "px" + ")";
    }

    return uniformYAxis;
}

export const SetSmallMultiplesSettings = (self: Visual): void => {
    const formatTab = self.visualUpdateOptions.formatTab;
    const smallMultiplesConfig = JSON.parse(
        formatTab[EVisualConfig.SmallMultiplesConfig][EVisualSettings.SmallMultiplesSettings]
    );

    const newSmallMultiplesSettings: ISmallMultiplesSettings = {
        ...SMALL_MULTIPLES_SETTINGS,
        ...smallMultiplesConfig,
    };

    if (self.smallMultiplesSettings) {
        if (self.smallMultiplesSettings.rows !== newSmallMultiplesSettings.rows || self.smallMultiplesSettings.columns !== newSmallMultiplesSettings.columns || self.smallMultiplesSettings.displayType === ESmallMultiplesDisplayType.Fluid) {
            self.SMCurrentPage = 1;
        }
    }

    self.smallMultiplesSettings = {
        ...SMALL_MULTIPLES_SETTINGS,
        ...smallMultiplesConfig,
    };

    self.isSmallMultiplesEnabled = self.smallMultiplesSettings.isSmallMultiplesEnabled;

    if (self.smallMultiplesSettings.layoutType !== ESmallMultiplesLayoutType.Grid) {
        self.smallMultiplesSettings.xAxisType = ESmallMultiplesAxisType.Individual;
        self.smallMultiplesSettings.yAxisType = ESmallMultiplesAxisType.Individual;
    }

    if (
        self.smallMultiplesSettings.layoutType !== ESmallMultiplesLayoutType.Grid &&
        self.smallMultiplesSettings.viewType === ESmallMultiplesViewType.Pagination
    ) {
        self.smallMultiplesSettings.viewType = ESmallMultiplesViewType.Scroll;
    }

    self.isSMUniformXAxis = self.isSmallMultiplesEnabled && self.isHasSmallMultiplesData && self.smallMultiplesSettings.xAxisType === ESmallMultiplesAxisType.Uniform;
}
