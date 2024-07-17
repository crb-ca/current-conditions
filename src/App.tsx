import axios from 'axios';
import {useEffect, useState} from 'react'
import {
    MapContainer,
    TileLayer,
    Tooltip,
    Polygon,
    // SVGOverlay,
    Popup,
    // useMap,
    FeatureGroup,
    Polyline
} from 'react-leaflet';

import moment from 'moment';

import './App.css';

import {Card, Typography} from "@mui/material";

import {Masonry} from "@mui/lab";
// import { SVG } from 'leaflet';

import {reservoirs} from "./objects";
import {toTitleCase} from './utils';
import ReservoirStorageTable from "./components/ReservoirStorageTable.tsx";
import Box from "@mui/material/Box";

const MAX_CAPACITY = 26.134000;

const BASE_BOTTOM_WIDTH = 0.25;
const BASE_HEIGHT = 0.5;
const BASE_TOP_WIDTH = 0.5;

const mead = reservoirs[0];

const reservoirNames = reservoirs.map(r => r.name);

const getReservoir = (res) => reservoirs.find(r => r.name === res);

const H1 = ({children}) => <Typography variant="h1">{children}</Typography>;
const H2 = ({children}) => <Typography variant="h2">{children}</Typography>;
const H3 = ({children}) => <Typography variant="h3">{children}</Typography>;
const H4 = ({children}) => <Typography variant="h4">{children}</Typography>;
const DataCard = ({children, ...props}) => <Card className="data-card" {...props}>{children}</Card>;

function App() {
    const [storageConditions, setStorageConditions] = useState({});
    const [system, setSystem] = useState({
        storage: 0,
        storage30: 0,
        storage365: 0,
    });

    useEffect(() => {
        let _systemStorage = 0;
        axios.get('https://www.usbr.gov/lc/region/g4000/riverops/webreports/accumweb.json')
            .then(({data}) => {
                const _storageConditions = data.Series.filter(s => s.DataTypeName === 'storage, end of period reading')
                    .reduce((obj, data) => {
                        const name = toTitleCase(data.SiteName);
                        if (!reservoirNames.includes(name)) {
                            return obj;
                        }
                        const series = data.Data.filter(d => !!d.v);
                        const d0 = series.slice(-1)[0];
                        const s0 = Number(d0.v);
                        const s30 = Number(series.slice(-31, -30)[0].v);
                        const s365 = Number(series[0].v);
                        _systemStorage += s0;
                        return {
                            ...obj,
                            [name]: {
                                time: d0.t,
                                storage: Math.round(s0 / 1e3) / 1000,
                                storage30: Math.round(s30 / 1e3) / 1000,
                                storage365: Math.round(s365 / 1e3) / 1000,
                            }
                        };
                    }, {});
                setSystem({
                    ...system,
                    storage:  Math.round(_systemStorage / 1e3) / 1e3,
                });
                setStorageConditions(_storageConditions);
            });


    }, []);

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

    const ReservoirCondition = ({name, position, capacity}) => {
        const conditions = storageConditions[name];
        return (
            <div>
                <H4>{name}</H4>
                {conditions && <div>
                    <p>Storage: {(conditions.storage)} MAF</p>
                </div>}
            </div>
        )
    }

    const Reach = ({reach}) => {
        const res1 = getReservoir(reach[0]);
        const res2 = getReservoir(reach[1]);
        const positions = [res1.position, res2.position];
        return (
            <Polyline positions={positions}/>
        )
    }

    return (
        <div>

            <H1>Colorado River conditions</H1>

            <Box>

                <H2>Reservoir Storage</H2>

                <Masonry columns={{xs: 1, md: 2}} spacing={2}>

                    <DataCard>
                        <H3>System Storage</H3>
                        <H4>{system.storage || "loading..."} MAF</H4>
                    </DataCard>

                    <DataCard sx={{height: 500}}>
                        <H3>System Map</H3>
                        <MapContainer className="leaflet-map" center={mead.position} zoom={6} scrollWheelZoom={true}>
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            {/* {reaches.map(reach => <Reach key={String(reach)} reach={reach} />)} */}
                            {reservoirs.map(res => <ReservoirMarker key={res.name} {...res} />)}
                        </MapContainer>
                        <div>
                            Data Source: <a
                            href="https://www.usbr.gov/lc/region/g4000/riverops/hourly7.html">https://www.usbr.gov/lc/region/g4000/riverops/hourly7.html</a>
                        </div>
                    </DataCard>

                    <DataCard>
                        <H3>Reservoirs</H3>
                        <div>Bluer = higher storage percent</div>
                        <div>* included in system storage calculation</div>
                        <ReservoirStorageTable reservoirs={reservoirs} conditions={storageConditions}/>
                    </DataCard>

                </Masonry>

            </Box>

        </div>
    )
}

export default App
