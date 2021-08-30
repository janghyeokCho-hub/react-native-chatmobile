import React from 'react';
import { View } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

export default function NoteViewSkeleton() {
    return (
        <View>
            <SkeletonPlaceholder>
                <SkeletonPlaceholder.Item marginLeft={30} marginTop={30} width="80%" height={36}borderRadius={4} />
                <SkeletonPlaceholder.Item marginLeft={30} marginTop={10} width='50%' height={16} borderRadius={4} />

                <SkeletonPlaceholder.Item marginLeft={30} marginTop={30} width="80%" height={20} borderRadius={4} />
                <SkeletonPlaceholder.Item marginLeft={30} marginTop={10} width="80%" height={20} borderRadius={4} />
                <SkeletonPlaceholder.Item marginLeft={30} marginTop={10} width="80%" height={20} borderRadius={4} />
                <SkeletonPlaceholder.Item marginLeft={30} marginTop={10} width="40%" height={20} borderRadius={4} />

                <SkeletonPlaceholder.Item marginLeft={30} marginTop={30} width="80%" height={20} borderRadius={4} />
                <SkeletonPlaceholder.Item marginLeft={30} marginTop={10} width="80%" height={20} borderRadius={4} />
                <SkeletonPlaceholder.Item marginLeft={30} marginTop={10} width="40%" height={20} borderRadius={4} />
            </SkeletonPlaceholder>
        </View>
    );
}