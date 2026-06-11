// Stub for react-native-maps on web/SSR — provides no-op components
import React from 'react';
import { View } from 'react-native';

const Noop = () => null;

const MapView = React.forwardRef((_props, _ref) => React.createElement(View, _props));
MapView.displayName = 'MapView';

export default MapView;
export const Marker = Noop;
export const Polyline = Noop;
export const UrlTile = Noop;
export const Circle = Noop;
export const Callout = Noop;
export const Overlay = Noop;
export const Heatmap = Noop;
export const Geojson = Noop;
