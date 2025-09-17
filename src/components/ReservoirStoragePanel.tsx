import moment from 'moment';
import DataCard from "./DataCard";
import ReservoirStorageTable from "./ReservoirStorageTable";
import SystemMap from "./SystemMap";
import {reservoirs} from '../objects';

import {MAX_SYSTEM_CAPACITY} from '../constants.js';

// const reservoirNames = reservoirs.map(r => r.name);

// const getReservoir = (res) => reservoirs.find(r => r.name === res);

// import {toTitleCase} from '../utils';

import {H3, H4} from "./typographies";

const round = (v, d) => Math.round(v * 10 ** d) / (10 ** d)

const ReservoirStoragePanel = ({systemConditions, storageConditions, storageError}) => {

    const checkedTime = storageConditions && storageConditions['Lake Mead'].time;
    const checkedTimeFormatted = checkedTime ? moment(checkedTime).format('MMMM D, YYYY') : 'Loading...';

    return (
        <div>
            <div>Storage values as of: <b>{checkedTimeFormatted}</b></div>
            <div style={{paddingBottom: 10}}>
                Data source: <a href="https://data.usbr.gov">https://data.usbr.gov</a>
            </div>
            <DataCard>
                <H3>System Storage</H3>
                {systemConditions ? <div>
                    <H4>{`${round(systemConditions.storage, 3)} MAF (${round(systemConditions.storagePercent, 1)}%)`}</H4>
                </div> : <div>Loading...</div>}
                <H3>Reservoir Storage</H3>
                <div>
                    <div>Bluer = higher storage percent</div>
                    <div>* included in system storage calculation</div>
                    <ReservoirStorageTable reservoirs={reservoirs} conditions={storageConditions}/>
                </div>
            </DataCard>

            <DataCard>
                <H3>System Map</H3>
                <SystemMap reservoirs={reservoirs} storageConditions={storageConditions}/>
            </DataCard>
        </div>
    )
}

export default ReservoirStoragePanel;