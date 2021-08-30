import React, { useMemo } from 'react';
import { View } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

export default function NoteListSkeleton({ ...rest }) {
    return (
        <View {...rest }>
            <SkeletonPlaceholder>
                <SkeletonPlaceholder.Item flexDirection="row" alignItems="center">
                    <SkeletonPlaceholder.Item width={50} height={50} borderRadius={15} />
                    <SkeletonPlaceholder.Item marginLeft={20} width="50%">
                        <SkeletonPlaceholder.Item width="100%" height={20} borderRadius={4} />
                        <SkeletonPlaceholder.Item
                            marginTop={6}
                            width="50%"
                            height={20}
                            borderRadius={4}
                        />
                    </SkeletonPlaceholder.Item>
                    
                </SkeletonPlaceholder.Item>

                <SkeletonPlaceholder.Item flexDirection="row" alignItems="center" marginTop={15} paddingBottom={15}>
                    <SkeletonPlaceholder.Item width={50} height={50} borderRadius={15} />
                    <SkeletonPlaceholder.Item marginLeft={20} width="50%">
                        <SkeletonPlaceholder.Item width="100%" height={20} borderRadius={4} />
                        <SkeletonPlaceholder.Item
                            marginTop={6}
                            width="50%"
                            height={20}
                            borderRadius={4}
                        />
                    </SkeletonPlaceholder.Item>                    
                </SkeletonPlaceholder.Item>
            </SkeletonPlaceholder>
        </View>
    );
}