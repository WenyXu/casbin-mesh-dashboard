import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import useModal from '../utils/Modal';
import { TextField } from '@fluentui/react';
import {
  SubmitHandler,
  UseFormSetValue,
} from 'react-hook-form/dist/types/form';
import ContentWrap from '../utils/Content';
const UpdateModelModal = ({
  onFinish,
}: {
  onFinish: SubmitHandler<any>;
}): [
  React.ReactNode,
  Record<'hide' | 'show' | 'toggle', () => void> & {
    setValue: UseFormSetValue<any>;
  }
] => {
  const {
    control,
    formState: { errors },
    handleSubmit,
    setValue,
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
      headerText: 'Update Model',
      okButton: {
        label: 'Update',
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

  return [modal, { toggle, hide, show, setValue }];
};
export default UpdateModelModal;
