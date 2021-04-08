import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { getProfileInfo } from '@API/profile';

export default function useMemberInfo(currentType) {
    const { members } = useSelector(({ room, channel }) => {
        switch (currentType) {
            case 'room':
                return room.currentRoom;
            case 'channel':
                return channel.currentChannel;
            default:
                return [];
        }
    });

    const findMemberInfo = async (mentionInfo, targetId) => {
        if(!mentionInfo || !targetId || !Array.isArray(mentionInfo)) {
            // type checking
            return null;
        }
        // Step 1 - memberInfo 탐색
        let memberInfo = mentionInfo.find(m => m.id === targetId);
        if (!memberInfo || !memberInfo.name) {
            // Step 2 - memberInfo.name이 없을 경우, redux state 탐색
            memberInfo = members.find(m => m.id === targetId);
        }
        if (!memberInfo || !memberInfo.name) {
            // Step 3 - redux store에 memberInfo.name이 없을 경우, 서버로 ajax 요청
            try {
                memberInfo = (await getProfileInfo(targetId)).result;
            }
            catch (err) {
                // 통신 오류가 발생하면 meberInfo를 반환하지 않음
                return null;
            }
        }
        return memberInfo;
    }

    return {
        findMemberInfo
    }
} 