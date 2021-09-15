import React from 'react';
import useModal from '../utils/Modal';
import styled from 'styled-components';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { DefaultButton, Link, TextField } from '@fluentui/react';

type onClickFn = ({
  hide,
  show,
  toggle,
}: Record<'hide' | 'show' | 'toggle', () => void>) => void | Promise<void>;

type ButtonProps = {
  onClick?: onClickFn;
  label?: string;
};

const ContentWrap = styled.div`
  margin-top: 8px;
`;

const PolicyMutationModal = ({
  onFinish,
}: {
  onFinish?: (value: Record<'value', string>[]) => Promise<void> | void;
}): [React.ReactNode, Record<'hide' | 'show' | 'toggle', () => void>] => {
  const {
    control,
    getValues,
    formState: { errors },
    trigger,
  } = useForm();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'policies',
  });
  const [modal, { toggle, hide, show }] = useModal(
    () => {
      return (
        <>
          {fields.map((item, index) => {
            return (
              <ContentWrap key={index}>
                <Controller
                  rules={{
                    required: 'required',
                    validate: (value: string) => {
                      if (index) {
                        const firstValue =
                          getValues('policies.0.value')?.split?.(',');
                        if (!firstValue?.length) {
                          return 'The first field is required';
                        }
                        const values = value.split(',');
                        if (!values.length) {
                          return 'required';
                        }
                        if (values[0] !== firstValue[0]) {
                          return `All policies must have the same pType: ${firstValue[0]}`;
                        }
                      } else {
                        if (!value || value === '') {
                          return 'The field is required';
                        } else if (
                          !value.startsWith('g') &&
                          !value.startsWith('p')
                        ) {
                          return 'Invalid pType';
                        }
                      }
                      return true;
                    },
                  }}
                  name={`policies.${index}.value`}
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      errorMessage={
                        errors?.policies?.[index]?.value &&
                        errors?.policies?.[index]?.value?.message
                      }
                    />
                  )}
                />
                <Link onClick={() => remove(index)}>remove</Link>
              </ContentWrap>
            );
          })}
          <ContentWrap>
            <DefaultButton
              onClick={() => {
                append({ value: '' });
              }}
            >
              Append Policy
            </DefaultButton>
          </ContentWrap>
        </>
      );
    },
    {
      headerText: 'New Policies',
      okButton: {
        label: 'Add Policies',
        onClick: async () => {
          const pass = await trigger();
          console.log('validation:', pass, errors);
          const value = getValues();
          await onFinish?.(value.policies);
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

export default PolicyMutationModal;
