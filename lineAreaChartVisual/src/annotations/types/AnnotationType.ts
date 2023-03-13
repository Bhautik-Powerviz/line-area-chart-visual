import { Shadow } from "@truviz/shadow/dist/Shadow";

export interface AnnotationData {
  uniqueIndex: string;
  connectorType: string;
  connectorStyle: string;
  markerType: string;
  badgeStyle: string;
  badgeSize: number;
  content: string;
  color: string;
  badgeColor: string;
  backgroundColor: string;
  coordinates: {
    xPosition: number;
    yPosition: number;
  };
  dy?: number;
  dx?: number;
  lastModified?: boolean;
  dataPoint;
}

export interface AnnotationInstanceType {
  rootElement;
  nodeElements;
  shadow: Shadow;
  annotationSettings: { object: string; key: string };
  getAnnotationData;
  arcMethod?;
  viewBoxWithCenterCoordinates?;
  offsetValues?: number[];
  isNodeCentricAnnotation?: boolean;
}
