import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import useModal from '../utils/Modal';
import { TextField } from '@fluentui/react';
import { SubmitHandler } from 'react-hook-form/dist/types/form';
import ContentWrap from '../utils/Content';
const ModelModal = ({
  onFinish,
}: {
  onFinish: SubmitHandler<any>;
}): [React.ReactNode, Record<'hide' | 'show' | 'toggle', () => void>] => {
  const {
    control,
    formState: { errors },
    handleSubmit,
  } = useForm();
  const [modal, { toggle, hide, show }] = useModal(
    () => {
      return (
        <>
          <ContentWrap>
            <Controller
              rules={{
                required: 'required',
              }}
              name={`namespace`}
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Namespace"
                  errorMessage={
                    errors?.namespace?.value &&
                    errors?.namespace?.value?.message
                  }
                />
              )}
            />
          </ContentWrap>
          <ContentWrap>
            <Controller
              rules={{
                required: 'required',
              }}
              name={`model`}
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Model"
                  multiline
                  autoAdjustHeight
                  errorMessage={
                    errors?.model?.value && errors?.model?.value?.message
                  }
                />
              )}
            />
          </ContentWrap>
        </>
      );
    },
    {
      headerText: 'New Namespace',
      okButton: {
        label: 'Create',
        onClick: async () => {
          await handleSubmit(onFinish)();
          hide();
        },
      },
      cancelButton: {
        label: 'Close',
        onClick: ({ hide }) => hide(),
      },
      autoDismiss: false,
    }
  );

  return [modal, { toggle, hide, show }];
};
export default ModelModal;
