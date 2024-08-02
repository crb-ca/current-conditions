import { useEffect, useState } from "react";

import { FeatureGroup, MapContainer, Polygon, Polyline, Popup, TileLayer, Tooltip, SVGOverlay } from "react-leaflet";

const MAX_CAPACITY = 26.134000;

const BASE_BOTTOM_WIDTH = 0.25;
const BASE_HEIGHT = 0.5;
const BASE_TOP_WIDTH = 0.5;

const fillColor = "#669cc8";

const ReservoirMarker = ({ name, position, capacity, storageConditions }) => {
    const [lat, lon] = position;

    const resScale = capacity > 5 ? 1.0 : 3.0;

    const scale = capacity / MAX_CAPACITY;

    const baseBottomOffset = BASE_BOTTOM_WIDTH / 2 * scale;
    const baseTopOffset = BASE_TOP_WIDTH / 2 * scale;

    const bottomLeft = lon - baseBottomOffset;
    const bottomRight = lon + baseBottomOffset;
    const topRight = lon + baseTopOffset;
    const topLeft = lon - baseTopOffset;
    const offset = Math.abs(topLeft - bottomLeft);
    const baseTop = lat + BASE_HEIGHT * scale;
    
    const bounds = [
        [lat, topLeft],
        [baseTop, topRight]
    ]
    const conditions = storageConditions[name];
    let actualShape;
    if (conditions) {
        const actualTop = lat + BASE_HEIGHT * conditions.storage / MAX_CAPACITY;
        const actualScale = conditions.storage / capacity;
        actualShape = [
            [actualTop, bottomRight + offset * actualScale],
            [actualTop, bottomLeft - offset * actualScale],
            [lat, bottomLeft],
            [lat, bottomRight],
        ]
    }

    let actualPoints = "";
    const bottom = 75;
    const emptyPoints = `30,${bottom} 70,${bottom} 95,0 5,0`;
    if (conditions) {
        const scale = conditions.storage / capacity;
        const offset = Math.abs(95 - 70);
        const topLeft = 30 - offset * scale;
        const topRight = 70 + offset * scale;
        const top = bottom - scale * bottom;
        actualPoints = `30,${bottom} 70,${bottom} ${topRight},${top} ${topLeft},${top}`;
    }

    return (
        <SVGOverlay bounds={bounds}>
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                {actualPoints && <polygon points={actualPoints} fill={fillColor} fillOpacity={.751} stroke="none" strokeWidth="2" />}
                <polygon points={emptyPoints} fill="white" fillOpacity={.25} stroke="blue" strokeWidth="2" />
                <text x="50%" y="90%" textAnchor="middle" dominantBaseline="middle" fontSize="20" stroke="none">
                    {name}
                </text>
            </svg>
        </SVGOverlay>
    )

}

export default ReservoirMarker;