import axios from 'axios';
import { useEffect, useState } from 'react'

import { MapContainer, TileLayer, Tooltip, Polygon, SVGOverlay, Popup, useMap, FeatureGroup, Polyline } from 'react-leaflet';

import './App.css'
// import { SVG } from 'leaflet';

const reservoirs = [
  {
    name: 'Lake Mead',
    position: [36.0163, -114.7374], // [lat, lon]
    capacity: 26.134000, // maf
    region: 'lb',
  },
  {
    name: 'Lake Powell',
    position: [36.93649, -111.48396],
    capacity: 24.322000
  },
  {
    name: 'Navajo Reservoir',
    position: [36.80063, -107.61203],
    capacity: 1.708600
  },
  {
    name: 'Lake Mohave',
    position: [35.1979, -114.5694],
    capacity: 1.995,
  },
  {
    name: 'Lake Havasu',
    position: [34.2964, -114.1385],
    capacity: 0.800
  },
  {
    name: 'Flaming Gorge Reservoir',
    position: [40.91474, -109.42185],
    capacity: 3.7889
  }
]

const reaches = [
  ['Lake Powell', 'Lake Mead'],
  ['Lake Mead', 'Lake Mohave'],
  ['Lake Mohave', 'Lake Havasu']
]

const MAX_CAPACITY = 26.134000;

const BASE_BOTTOM_WIDTH = 0.25;
const BASE_HEIGHT = 0.5;
const BASE_TOP_WIDTH = 0.5;

const mead = reservoirs[0];

const getReservoir = res => reservoirs.find(r => r.name === res);

function App() {
  const [storageConditions, setStorageConditions] = useState({});

  useEffect(() => {
    // Lower Basin conditions
    const newStorageConditions = {};
    axios.get('https://www.usbr.gov/lc/region/g4000/riverops/webreports/accumweb.json')
      .then(({data}) => {
        reservoirs.forEach(res => {
          const resData = data.Series.find(d => d.SiteName.toUpperCase() === res.name.toUpperCase() && d.DataTypeName === 'storage, end of period reading');
          const datum = resData.Data.toReversed().find(d => !!d.v);
          newStorageConditions[res.name] = {
            time: datum.t,
            storage: Math.round(Number(datum.v) / 1e3) / 1000,
          };
        });
        setStorageConditions(newStorageConditions);
      });


  }, []);

  const ReservoirMarker = ({ name, position, capacity }) => {
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
            Storage: {conditions.storage}<br />
            As of {conditions.time}
          </div> : null}
        </Popup>}
        {conditions && <Polygon pathOptions={{ fillColor: 'blue', fillOpacity: 0.75, stroke: null }} positions={actualShape}>
          <Tooltip direction="bottom" offset={[0, 0]} opacity={1} permanent>
            <b>{name}</b>
            <div style={{ textAlign: 'left' }}>
              {`${conditions.storage} MAF (${Math.round(conditions.storage / capacity * 100)}%)`}<br />
            </div>
          </Tooltip>
        </Polygon>}
        <Polygon pathOptions={{ fillColor: 'blue', color: 'blue', fillOpacity: 0.1 }} positions={baseShape}>
        </Polygon>

      </FeatureGroup>
    )
  }

  const Reach = ({reach}) => {
    const res1 = getReservoir(reach[0]);
    const res2 = getReservoir(reach[1]);
    const positions = [res1.position, res2.position];
    return (
      <Polyline positions={positions} />
    )
  }

  return (
    <>
      <h1>Colorado River Conditions</h1>
      <MapContainer id="map" center={mead.position} zoom={6} scrollWheelZoom={true}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {/* {reaches.map(reach => <Reach key={String(reach)} reach={reach} />)} */}
        {reservoirs.map(res => <ReservoirMarker key={res.name} {...res} />)}
      </MapContainer>
    </>
  )
}

export default App
