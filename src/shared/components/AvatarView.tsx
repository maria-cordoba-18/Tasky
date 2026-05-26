import React from 'react';
import { requireNativeComponent, ViewStyle, StyleProp } from 'react-native';

interface AvatarViewProps {
  name: string;
  style?: StyleProp<ViewStyle>;
}

const NativeAvatarView = requireNativeComponent<AvatarViewProps>('AvatarView');

const AvatarView: React.FC<AvatarViewProps> = ({ name, style }) => {
  return (
    <NativeAvatarView
      name={name}
      style={[
        // Por defecto usamos esquinas redondeadas para un aspecto de "square rounded"
        { borderRadius: 10, overflow: 'hidden' },
        style,
      ]}
    />
  );
};

export default AvatarView;
