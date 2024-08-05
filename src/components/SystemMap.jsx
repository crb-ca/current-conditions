import {FeatureGroup, GeoJSON, MapContainer, Polygon, Popup, TileLayer, Tooltip} from "react-leaflet";
import {MAX_SYSTEM_CAPACITY} from "../constants.js";

// import basinBoundary from '../assets/Colorado_River_Basin_Rivers.geojson'

const BASE_BOTTOM_WIDTH = 0.25;
const BASE_HEIGHT = 0.5;
const BASE_TOP_WIDTH = 0.5;

function SystemMap({reservoirs, storageConditions}) {

    const ReservoirMarker = ({name, position, capacity}) => {
        const [lat, lon] = position;

        const resScale = capacity > 5 ? 1.0 : 3.0;

        const scale = capacity / MAX_SYSTEM_CAPACITY;

        const baseBottomOffset = BASE_BOTTOM_WIDTH / 2 * scale;
        const baseTopOffset = BASE_TOP_WIDTH / 2 * scale;

        const bottomLeft = lon - baseBottomOffset;
        const bottomRight = lon + baseBottomOffset;
        const topRight = lon + baseTopOffset;
        const topLeft = lon - baseTopOffset;
        const offset = Math.abs(topLeft - bottomLeft);
        const baseTop = lat + BASE_HEIGHT * scale;
        const baseShape = [
            [baseTop, topRight],
            [baseTop, topLeft],
            [lat, bottomLeft],
            [lat, bottomRight],
        ];
        const conditions = storageConditions && storageConditions[name];
        let actualShape;
        if (conditions) {
            const actualTop = lat + BASE_HEIGHT * (conditions?.storage || 0) / MAX_SYSTEM_CAPACITY;
            const actualScale = (conditions?.storage || 0) / capacity;
            actualShape = [
                [actualTop, bottomRight + offset * actualScale],
                [actualTop, bottomLeft - offset * actualScale],
                [lat, bottomLeft],
                [lat, bottomRight],
            ]
        }

        return (
            <FeatureGroup>
                {conditions && <Popup>
                    <b>{name}</b>
                    {conditions ? <div>
                        Storage: {conditions.storage}<br/>
                        As of {conditions.time}
                    </div> : null}
                </Popup>}
                {conditions && <Polygon pathOptions={{fillColor: 'blue', fillOpacity: 0.75, stroke: null}}
                                        positions={actualShape}/>}
                <Polygon pathOptions={{fillColor: 'blue', color: 'blue', fillOpacity: 0.1}} positions={baseShape}>
                    <Tooltip direction="bottom" offset={[0, 0]} opacity={1} permanent>
                        <b>{name}</b>
                        {conditions && <div style={{textAlign: 'left'}}>
                            {`${conditions?.storage || 0} MAF (${Math.round((conditions?.storage || 0) / capacity * 100)}%)`}<br/>
                        </div>}
                    </Tooltip>
                </Polygon>

            </FeatureGroup>
        )

    }

    // const Reach = ({reach}) => {
    //     const res1 = getReservoir(reach[0]);
    //     const res2 = getReservoir(reach[1]);
    //     const positions = [res1.position, res2.position];
    //     return (
    //         <Polyline positions={positions}/>
    //     )
    // }

    return (
        <div className="map-wrapper">
            <MapContainer center={[36.0163, -114.7374]} zoom={6}
                          scrollWheelZoom={false}
                          {...{
                              doubleClickZoom: false,
                              closePopupOnClick: false,
                              dragging: false,
                              zoomSnap: false,
                              zoomDelta: false,
                              trackResize: false,
                              touchZoom: false,
                              scrollWheelZoom: false
                          }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {/*<GeoJSON data={basinBoundary}/>*/}
                {/* {reaches.map(reach => <Reach key={String(reach)} reach={reach} />)} */}
                {reservoirs.map(res => <ReservoirMarker key={res.name} {...res} />)}
            </MapContainer>
        </div>

    )
}

export default SystemMap;