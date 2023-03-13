import { Visual } from '../visual';
import VisualAnnotations from "../annotations/VisualAnnotations";
import { IVisualCategoryData } from "../visual-data.model";

export const RenderBarAnnotations = (self: Visual, cbGetDataPoint: Function): void => {
    self.visualAnnotations = new VisualAnnotations({
        rootElement: self.svg,
        nodeElements: self.svg.selectAll(`.${self.annotationBarClass} foreignObject`),
        arcMethod: null,
        shadow: self,
        annotationSettings: { object: "editor", key: "annotations" },
        getAnnotationData: (d) => {
            return cbGetDataPoint(d);
        },
        viewBoxWithCenterCoordinates: false,
        offsetValues: [0, 0],
        isNodeCentricAnnotation: true,
    });
    self.visualAnnotations.initializeAnnotations();
    self.behavior.setVisualAnnotations(self.visualAnnotations);
}

export const GetNormalBarAnnotationDataPoint = (d: IVisualCategoryData) => {
    let dataPoint = {
        name: d?.category,
        value: d?.value,
        width: d?.styles?.bar.width,
        height: d?.styles?.bar.height,
    };
    d.tooltipFields?.map((column) => {
        dataPoint[column.displayName] = column.value;
    });
    return dataPoint;
}

export const GetStackedBarAnnotationDataPoint = (self: Visual, d: any) => {
    let dataPoint = {
        name: d.key + "-" + d.data.category,
        value: d.tooltip.value,
        width: self.isLeftYAxis && self.isHorizontalChart ? d.width + (d.renderedWidth - d.width) * 2 : d.width,
        height: !self.isBottomXAxis && !self.isHorizontalChart ? d.height + (d.renderedHeight - d.height) * 2 : d.height,
    };
    d.tooltip.tooltipFields.map((column) => {
        dataPoint[column.displayName] = column.value;
    });
    return dataPoint;
}

export const GetGroupedBarAnnotationDataPoint = (d: any) => {
    let dataPoint = {
        name: d.key,
        value: d.value,
        width: d.width,
        height: d.height,
    };
    d.tooltip.tooltipFields.map((column) => {
        dataPoint[column.displayName] = column.value;
    });
    return dataPoint;
}