import {
  DefaultButton,
  Dialog,
  DialogFooter,
  PrimaryButton,
} from '@fluentui/react';
import React from 'react';
import { useBoolean } from '@fluentui/react-hooks';
import { IDialogContentProps } from '@fluentui/react';

const dialogStyles = { main: { maxWidth: 450 } };

const modalProps = {
  titleAriaId: 'dialogLabel',
  subtitleAriaId: 'subTextLabel',
  isBlocking: false,
  styles: dialogStyles,
};

type onClickFn = ({
  hide,
  show,
  toggle,
}: Record<'hide' | 'show' | 'toggle', () => void>) => void | Promise<void>;

type ButtonProps = {
  onClick?: onClickFn;
  label?: string;
};

const useDialog = ({
  dialogContentProps,
  okButton = { onClick: ({ hide }) => hide() },
  cancelButton,
}: {
  dialogContentProps?: IDialogContentProps;
  cancelButton?: ButtonProps;
  okButton?: ButtonProps;
}): [React.ReactNode, Record<'hide' | 'show' | 'toggle', () => void>] => {
  const [hideDialog, { toggle, setFalse: hide, setTrue: show }] =
    useBoolean(true);

  return [
    // eslint-disable-next-line react/jsx-key
    <Dialog
      hidden={hideDialog}
      onDismiss={toggle}
      dialogContentProps={dialogContentProps}
      modalProps={modalProps}
    >
      <DialogFooter>
        {okButton && (
          <PrimaryButton
            onClick={() => okButton?.onClick?.({ toggle, hide, show })}
            text={okButton?.label ?? 'ok'}
          />
        )}
        {cancelButton && (
          <DefaultButton
            onClick={() => cancelButton?.onClick?.({ toggle, hide, show })}
            text={cancelButton?.label ?? 'cancel'}
          />
        )}
      </DialogFooter>
    </Dialog>,
    { toggle, hide, show },
  ];
};
