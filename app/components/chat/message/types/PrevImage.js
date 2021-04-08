import React, { useState, useEffect, useCallback } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { reqThumbnail } from '@API/api';

import ScaledImage from '@C/chat/message/types/ScaledImage';
import ImageModal from '@COMMON/layout/ImageModal';

const PrevImage = ({ id, type, item, isTemp, children, index, len }) => {
  const [thumbnailURL, setThumbnailURL] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (item.thumbnail) {
      setThumbnailURL({ uri: reqThumbnail(item.token) });
    } else if (item.image && isTemp) {
      setThumbnailURL({ uri: item.thumbDataURL });
    }
  }, []);

  const handlePreview = useCallback(() => {
    setShowModal(true);
  }, []);

  const handleHiddenModal = useCallback(() => {
    setShowModal(false);
  }, []);

  return (
    <>
      {(type == 'list' && (
        <TouchableOpacity
          onPress={() => {
            if (!isTemp) {
              handlePreview();
            }
          }}
        >
          {children}
        </TouchableOpacity>
      )) ||
        (type == 'thumblist' && (
          <TouchableOpacity
            style={{ borderWidth: 1, borderColor: 'rgba(0,0,0,0)' }}
            onPress={() => {
              if (!isTemp) {
                handlePreview();
              }
            }}
          >
            <ScaledImage
              source={thumbnailURL}
              scaledWidth={100}
              scaledHeight={100}
              index={index}
              len={len}
            />
          </TouchableOpacity>
        )) || (
          <>
            <View id={id || ''}>
              <TouchableOpacity
                onPress={() => {
                  if (!isTemp) {
                    handlePreview();
                  }
                }}
              >
                <ScaledImage
                  source={thumbnailURL}
                  scaledWidth={250}
                  scaledHeight={250}
                />
              </TouchableOpacity>
            </View>
          </>
        )}
      {showModal && (
        <ImageModal
          type="ROOM"
          show={showModal}
          image={item.token}
          hasDownload={true}
          onClose={handleHiddenModal}
        />
      )}
    </>
  );
};

export default PrevImage;
