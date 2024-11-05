import { useAppDispatch, useAppSelector } from "@/hooks/common";
import {
    IForcedToFrameDataUpdated,
    IForcedToFrameState,
    selectForcedToFrameDataUpdtaed,
    selectForcedToFrameState,
    setForcedToFrameState,
    setForcedToFrameValuesUpdated
} from "@/reducers/appStateValueSlice";
import { clearLoading, setLoading } from "@/reducers/loaderSlice";
import { notifyError, notifySuccess } from "@/reducers/notificationSlice";
import { postOrPatchAppStateValue } from "@/services/appStateValueServices";
import { patchForcedToFrameProjects } from "@/services/projectServices";
import { Button, Fieldset, ToggleButton } from "hds-react";
import moment from "moment";
import { memo } from "react";
import { useTranslation } from "react-i18next";

const AdminForcedToFrame = () => {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const forcedToFrameState = useAppSelector(selectForcedToFrameState);
    const forcedToFrameDataUpdated = useAppSelector(selectForcedToFrameDataUpdtaed);
    const forcedToFrameUpdatedDate = moment(new Date(forcedToFrameState.lastModified)).format('D.M.YYYY HH:mm:ss');
    const forcedToFrameDataUpdatedDate = moment(new Date(forcedToFrameDataUpdated.lastModified)).format('D.M.YYYY HH:mm:ss');

    const handleForcedToFrameStatusChange = async () => {
        dispatch(setLoading({ text: 'Change forced to frame status', id: "change-forced-to-frame-status" }));
        try {
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
        } catch (e) {
            dispatch(notifyError({ message: 'forcedToFrameStatusUpdateError', type: 'notification', title: 'undefined' }));
        }
        dispatch(clearLoading("change-forced-to-frame-status"));
    }

    const handleForcedToFrameDataUpdate = async () => {
        dispatch(setLoading({ text: 'Update all forced to frame data', id: "update-forced-to-frame-data" }));
        try {
            const res = await patchForcedToFrameProjects();
            const newValues: IForcedToFrameDataUpdated = {
                ...forcedToFrameState,
                id: res.id,
                hasBeenMoved: res.value,
                lastModified: res.updatedDate
            };
            dispatch(setForcedToFrameValuesUpdated(newValues));
            dispatch(
                notifySuccess({
                message: 'forcedToFrameUpdated',
                title: 'updateSuccessful',
                type: 'toast',
                duration: 5000,
                }),
            );
        } catch (e) {
            dispatch(notifyError({ message: 'forcedToFrameDataUpdateError', type: 'notification', title: 'patchError' }));
        }
        dispatch(clearLoading("update-forced-to-frame-data"));
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
                    <p>{forcedToFrameDataUpdatedDate}</p>
                </div>
                <Button style={{height: "50%", marginTop: "14px"}} onClick={handleForcedToFrameDataUpdate}>{t(`adminFunctions.forcedtoframestate.updateData`)}</Button>
            </Fieldset>
        </div>
    );
}

export default memo(AdminForcedToFrame);