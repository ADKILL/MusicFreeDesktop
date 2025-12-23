import React from "react";
import { useParams } from "react-router-dom";
import usePluginSheetMusicList from "./hooks/usePluginSheetMusicList";
import MusicSheetlikeView from "@/renderer/components/MusicSheetlikeView";
import { isSameMedia } from "@/common/media-util";
import { useState } from "react";

import MusicSheet from "@/renderer/core/music-sheet";
import { useTranslation } from "react-i18next";
import SvgAsset from "@/renderer/components/SvgAsset";

export default function RemoteSheet() {
    const { platform, id } = useParams() ?? {};

    const [state, sheetItem, musicList, getSheetDetail] = usePluginSheetMusicList(
        platform,
        id,
        history.state?.usr?.sheetItem,
    );
    return (
        <MusicSheetlikeView
            musicSheet={sheetItem}
            musicList={musicList}
            state={state}
            onLoadMore={() => {
                getSheetDetail();
            }}
            options={<RemoteSheetOptions sheetItem={sheetItem}></RemoteSheetOptions>}
        />
    );
}

interface IProps {
    sheetItem: IMusic.IMusicSheetItem;
}
function RemoteSheetOptions(props: IProps) {
    const { sheetItem } = props;
    const starredMusicSheets = MusicSheet.frontend.useAllStarredSheets();
    const { t } = useTranslation();

    const isStarred = starredMusicSheets.find((item) =>
        isSameMedia(sheetItem, item),
    );

    const [refreshing, setRefreshing] = useState(false);

    async function handleRefresh() {
    if (!sheetItem?.source || refreshing) return;

    setRefreshing(true);
    try {
        await MusicSheet.frontend.refreshSheetFromSource(sheetItem.id);
    } catch (e) {
        console.error("刷新歌单失败", e);
    } finally {
        setRefreshing(false);
    }
}


    return (
        <>
            {/* ⭐ 刷新按钮：只有“可刷新歌单”才显示 */}
            {sheetItem?.source && (
                <div
                    role="button"
                    className="option-button"
                    data-type="normalButton"
                    onClick={handleRefresh}
                >
                    <SvgAsset iconName="refresh"></SvgAsset>
                    <span>
                        {refreshing
                            ? t("common.refreshing", "刷新中")
                            : t("common.refresh", "刷新")}
                    </span>
                </div>
            )}

            {/* ❤️ 收藏按钮（原有功能） */}
            <div
                role="button"
                className="option-button"
                data-type="normalButton"
                onClick={() => {
                    if (isStarred) {
                        MusicSheet.frontend.unstarMusicSheet(sheetItem);
                    } else {
                        MusicSheet.frontend.starMusicSheet(sheetItem);
                    }
                }}
            >
                <SvgAsset
                    iconName={isStarred ? "heart" : "heart-outline"}
                    color={isStarred ? "red" : undefined}
                />
                <span>{t("music_sheet_like_view.star")}</span>
            </div>
        </>
    );
}
