import { useEffect, useState } from "react";
import * as cheerio from 'cheerio';
import DataCard from "./DataCard";
import SnowpackChart from "./SnowpackChart";
import { H3 } from "./typographies";
import axios from "axios";

async function fetchImage(imageUrl) {
    try {
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const blob = new Blob([response.data], { type: 'image/png' });
        const imageURL = URL.createObjectURL(blob);
        return imageURL;
    } catch (error) {
        if (error.response && error.response.status === 404) {
            console.error('Image not found (404):', imageUrl);
        } else if (error.response && error.response.status === 0) {
            console.error('CORS error:', imageUrl);
        } else {
            console.error('Unexpected error:', error);
        }
        return null; // Or handle the error differently
    }
}

function HydrologicConditionsPanel() {
    const [snowpackSource, _] = useState('https://www.cbrfc.noaa.gov/rmap/grid800/index_soil.php');

    const [imageUrl, setImageUrl] = useState(null);

    useEffect(() => {
        fetchImage('https://www.cbrfc.noaa.gov/rmap/grid800/asc/soilfall/soilfall.trima.15112023_cbrfc_.png')
            .then(url => setImageUrl(url))
            .catch(error => {
                console.error('Error fetching image:', error)
            });
    }, []);

    return (
        <div>
            <DataCard>
                <H3>Snow Accumulation</H3>
                <SnowpackChart title={"Snowpack - Upper Colorado"}
                    regionTitle="14_Upper_Colorado_Region" />
                <SnowpackChart title={"Snowpack - Lower Colorado"}
                    regionTitle="15_Lower_Colorado_Region" />
            </DataCard>
            <DataCard id="soil-moisture-map">
                <H3>Soil Moisture Map</H3>
                <div style={{ width: "100%", textAlign: "center" }}>
                    <img alt='Soil moisture map of the Colorado River basin' src="https://www.cbrfc.noaa.gov/rmap/grid800/asc/soilfall/soilfall.trima.15112023_cbrfc_.png" />
                </div>
                <div>
                    See CBRFC's <a href="https://www.cbrfc.noaa.gov/lmap/lmap.php?slat=37.6&slng=-110.5&zlevel=6&w=1085&rfc_ol=1&river_ol=1&basename=Topographic&imagegrid=sm&imagegridalpha=0.8&ts=1722880607311">interactive soil moisture map</a>
                </div>
                <div>Data source: <a target="_blank" href={snowpackSource}>{snowpackSource}</a></div>
            </DataCard>
        </div>
    )
}

export default HydrologicConditionsPanel;