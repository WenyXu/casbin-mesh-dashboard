import { DefaultButton, Panel, PrimaryButton } from '@fluentui/react';
import React from 'react';
import { useBoolean } from '@fluentui/react-hooks';

type onClickFn = ({
  hide,
  show,
  toggle,
}: Record<'hide' | 'show' | 'toggle', () => void>) => void | Promise<void>;

type ButtonProps = {
  onClick?: onClickFn;
  label?: string;
};

const useModal = (
  children: (
    props: Record<'hide' | 'show' | 'toggle', () => void>
  ) => React.ReactNode,
  {
    headerText,
    okButton = { onClick: ({ hide }) => hide() },
    cancelButton,
    autoDismiss = false,
  }: {
    headerText?: string;
    cancelButton?: ButtonProps;
    okButton?: ButtonProps;
    autoDismiss?: boolean;
  } = {}
): [React.ReactNode, Record<'hide' | 'show' | 'toggle', () => void>] => {
  const [isOpen, { toggle, setFalse: hide, setTrue: show }] = useBoolean(false);
  return [
    // eslint-disable-next-line react/jsx-key
    <Panel
      isOpen={isOpen}
      onDismiss={autoDismiss ? toggle : undefined}
      headerText={headerText}
      onRenderFooterContent={() => (
        <div>
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
        </div>
      )}
      isFooterAtBottom={true}
    >
      {children({ toggle, hide, show })}
    </Panel>,
    { toggle, hide, show },
  ];
};

export default useModal;
