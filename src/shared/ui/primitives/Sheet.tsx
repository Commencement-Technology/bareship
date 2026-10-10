import {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { type ReactNode, type Ref, useCallback } from 'react';
import { useUnistyles } from 'react-native-unistyles';

export type SheetRef = BottomSheetModal;

export type SheetProps = {
  ref?: Ref<BottomSheetModal>;
  children: ReactNode;
  onDismiss?: () => void;
};

/** Modal bottom sheet sized to its content. Open with `ref.current?.present()`. */
export function Sheet({ ref, children, onDismiss }: SheetProps) {
  const { theme, rt } = useUnistyles();
  const backdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close"
      />
    ),
    [],
  );
  return (
    <BottomSheetModal
      ref={ref}
      enableDynamicSizing
      onDismiss={onDismiss}
      backdropComponent={backdrop}
      backgroundStyle={{ backgroundColor: theme.colors.surface }}
      handleIndicatorStyle={{ backgroundColor: theme.colors.border }}
      accessibilityLabel={undefined}
    >
      <BottomSheetView
        style={{
          padding: theme.spacing.xl,
          paddingBottom: rt.insets.bottom + theme.spacing.xl,
          gap: theme.spacing.lg,
        }}
      >
        {children}
      </BottomSheetView>
    </BottomSheetModal>
  );
}
