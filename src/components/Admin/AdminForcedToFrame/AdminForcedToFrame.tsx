import { useAppDispatch, useAppSelector } from "@/hooks/common";
import { IForcedToFrameState, selectForcedToFrameState, setForcedToFrameState } from "@/reducers/appStateValueSlice";
import { setIsSaving } from "@/reducers/projectSlice";
import { postOrPatchAppStateValue } from "@/services/appStateValueServices";
import { Button, Fieldset, ToggleButton } from "hds-react";
import moment from "moment";
import { memo } from "react";
import { useTranslation } from "react-i18next";

const AdminForcedToFrame = () => {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const forcedToFrameState = useAppSelector(selectForcedToFrameState);
    const forcedToFrameUpdatedDate = moment(new Date(forcedToFrameState.lastModified)).format('D.M.YYYY HH:mm:ss');

    const handleForcedToFrameStatusChange = async () => {
        setIsSaving(true);
        const request = {
            name: "forcedToFrameStatus",
            value: !forcedToFrameState.isOpen,
            id: forcedToFrameState.id !== "" ? forcedToFrameState.id : undefined
        }
        const response = await postOrPatchAppStateValue(request);
        const newValues: IForcedToFrameState = {
            ...forcedToFrameState,
            id: response.id,
            isOpen: response.value,
            lastModified: response.updatedDate
        };
        dispatch(setForcedToFrameState(newValues));
        setIsSaving(false);
    }
    
    return (
        <div data-testid="admin-forcedtoframe">
            <Fieldset border heading={t(`adminFunctions.forcedtoframestate.viewState`) ?? ''} style={{ display: "flex", flexDirection: "row", gap: "60px"}}>
                <div>
                    <p style={{fontWeight: "bold"}}>{t(`status`)}</p>
                    <p>{forcedToFrameState.isOpen ? t(`adminFunctions.forcedtoframestate.open`): t(`adminFunctions.forcedtoframestate.locked`)}</p>
                </div>
                <div>
                    <p style={{fontWeight: "bold"}}>{t(`adminFunctions.forcedtoframestate.lastModified`)}</p>
                    <p>{forcedToFrameUpdatedDate}</p>
                </div>
                <div>
                    <p style={{fontWeight: "bold"}}>{t(`adminFunctions.forcedtoframestate.changeStatus`)}</p>
                    <ToggleButton id={""} label={undefined} checked={forcedToFrameState.isOpen} onChange={handleForcedToFrameStatusChange}></ToggleButton>
                </div>
            </Fieldset>
            <Fieldset border heading={t(`adminFunctions.forcedtoframestate.moveData`) ?? ''} style={{ display: "flex", flexDirection: "row", gap: "60px", marginTop: "30px"}}>
                <div>
                    <p style={{fontWeight: "bold"}}>{t(`adminFunctions.forcedtoframestate.dataLastUpdated`)}</p>
                    <p>18.10.2024 klo. 11:01</p>
                </div>
                <Button style={{height: "50%", marginTop: "14px"}}>{t(`adminFunctions.forcedtoframestate.updateData`)}</Button>
            </Fieldset>
        </div>
    );
}

export default memo(AdminForcedToFrame);