import {DataCard} from "./DataCard";
import {H3} from "./typographies";

const OperationsPanel = () => {
    return (
        <div>
            <DataCard id="study">
                <H3>24-Month Study</H3>
                <div style={{textAlign: "center"}}>
                    <img
                        src="https://www.usbr.gov/lc/region/g4000/riverops/WebReports/crmmsCloud_powell.png"/>
                    <img
                        src="https://www.usbr.gov/lc/region/g4000/riverops/WebReports/crmmsCloud_mead.png"/>
                </div>

            </DataCard>
        </div>
    )
}

export default OperationsPanel;