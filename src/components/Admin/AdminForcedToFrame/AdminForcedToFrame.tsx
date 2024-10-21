import { useAppDispatch, useAppSelector } from "@/hooks/common";
import { IForcedToFrameState, selectForcedToFrameState, setForcedToFrameState } from "@/reducers/appStateValueSlice";
import { postOrPatchAppStateValue } from "@/services/appStateValueServices";
import { Button, Fieldset, ToggleButton } from "hds-react";
import { memo } from "react";
import { useTranslation } from "react-i18next";

const AdminForcedToFrame = () => {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const forcedToFrameState = useAppSelector(selectForcedToFrameState);
    
    return (
        <div data-testid="admin-forcedtoframe">
            <Fieldset border heading={t(`adminFunctions.forcedtoframestate.viewState`) ?? ''} style={{ display: "flex", flexDirection: "row", gap: "60px"}}>
                <div>
                    <p style={{fontWeight: "bold"}}>Tila</p>
                    <p>Lukittu</p>
                </div>
                <div>
                    <p style={{fontWeight: "bold"}}>Tilaa viimeksi muokattu</p>
                    <p>18.10.2024 klo. 11:01</p>
                </div>
                <div>
                    <p style={{fontWeight: "bold"}}>Avaa sovitettu budjetti -näkymä</p>
                    <ToggleButton id={""} label={undefined} checked={forcedToFrameState.isOpen} onChange={function (isOn: boolean): void {
                        const request = {
                            name: "forcedToFrameStatus",
                            value: !forcedToFrameState.isOpen,
                            id: forcedToFrameState.id !== "" ? forcedToFrameState.id : undefined
                        }
                        postOrPatchAppStateValue(request);
                        const newValues: IForcedToFrameState = {
                            ...forcedToFrameState,
                            isOpen: !forcedToFrameState.isOpen
                        };
                        dispatch(setForcedToFrameState(newValues))
                    }}></ToggleButton>
                </div>
            </Fieldset>
            <Fieldset border heading={t(`adminFunctions.forcedtoframestate.moveData`) ?? ''} style={{ display: "flex", flexDirection: "row", gap: "60px", marginTop: "30px"}}>
                <div>
                    <p style={{fontWeight: "bold"}}>Tiedot viimeksi siirretty</p>
                    <p>18.10.2024 klo. 11:01</p>
                </div>
                <Button style={{height: "50%", marginTop: "14px"}}>Siirrä tiedot</Button>
            </Fieldset>
        </div>
    );
}

export default memo(AdminForcedToFrame);