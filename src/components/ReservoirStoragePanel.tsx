import {useEffect, useState} from "react";
import {DataCard} from "./DataCard";
import ReservoirStorageTable from "./ReservoirStorageTable";
import {FeatureGroup, MapContainer, Polygon, Polyline, Popup, TileLayer, Tooltip} from "react-leaflet";
import moment from 'moment';

import {reservoirs} from '../objects';

const mead = reservoirs[0];

// const reservoirNames = reservoirs.map(r => r.name);

// const getReservoir = (res) => reservoirs.find(r => r.name === res);

// import {toTitleCase} from '../utils';

import {H3, H4} from "./typographies";

const USBRError = () => <div
    style={{color: 'red'}}>{"Uh-oh! There's something wrong with USBR's server. Please refresh or try again tomorrow."}</div>


const round = (v, d) => Math.round(v * 10 ** d) / (10 ** d)

const MAX_CAPACITY = 26.134000;

const BASE_BOTTOM_WIDTH = 0.25;
const BASE_HEIGHT = 0.5;
const BASE_TOP_WIDTH = 0.5;

const ReservoirStoragePanel = ({systemConditions, storageConditions, storageError}) => {

    const ReservoirMarker = ({name, position, capacity}) => {
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
        const baseShape = [
            [baseTop, topRight],
            [baseTop, topLeft],
            [lat, bottomLeft],
            [lat, bottomRight],
        ];
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

        // @ts-ignore
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
                            {`${conditions.storage} MAF (${Math.round(conditions.storage / capacity * 100)}%)`}<br/>
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

    const checkedTime = storageConditions['Lake Mead']?.time;
    const checkedTimeFormatted = moment(checkedTime).format('YYYY-MM-DD');

    return (
        <div>
            <div style={{paddingBottom: 10}}>{`Storage values as of: ${checkedTimeFormatted}`}</div>
            <DataCard>
                <H3>System Storage</H3>
                {systemConditions ? <div>
                    <H4>{round(systemConditions.storage, 3)} MAF</H4>
                </div> : <div>Loading...</div>}
            </DataCard>

            <DataCard>
                <H3>Reservoir Storage</H3>
                <div>
                    <div>Bluer = higher storage percent</div>
                    <div>* included in system storage calculation</div>
                    <ReservoirStorageTable reservoirs={reservoirs} conditions={storageConditions}/>
                </div>
            </DataCard>

            <DataCard>
                <H3>System Map</H3>
                <div className="map-wrapper">
                    <MapContainer center={mead.position} zoom={5}
                                  scrollWheelZoom={true}>
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        {/* {reaches.map(reach => <Reach key={String(reach)} reach={reach} />)} */}
                        {reservoirs.map(res => <ReservoirMarker key={res.name} {...res} />)}
                    </MapContainer>
                </div>
                <div>
                    Data source: <a
                    href="https://www.usbr.gov/lc/region/g4000/riverops/hourly7.html">https://www.usbr.gov/lc/region/g4000/riverops/hourly7.html</a>
                </div>
            </DataCard>
        </div>
    )
}

export default ReservoirStoragePanel;