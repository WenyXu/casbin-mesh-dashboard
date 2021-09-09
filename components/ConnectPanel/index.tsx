import React from 'react';
import { PrimaryButton, TextField } from '@fluentui/react';
import styled from 'styled-components';
import Card from '../utils/Card';
import FieldWrap from '../utils/Field';
import { useForm, Controller } from 'react-hook-form';
import { parseConnectString } from '../../services/client/utils/url';
import { isError } from '../../services/client/interface';
export type ConnectPanelProps = {
  loading?: boolean;
  onFinish: (value: Record<'connection', string>) => void | Promise<void>;
};

const ActionWrap = styled(FieldWrap)`
  display: flex;
  justify-content: flex-end;
`;

const ConnectPanel = ({ loading, onFinish }: ConnectPanelProps) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm();

  return (
    <Card loading={loading} loadingLabel="connecting">
      <form onSubmit={handleSubmit(onFinish)}>
        <Controller
          name="connection"
          control={control}
          defaultValue="mesh://root:root@localhost:4002"
          rules={{
            required: true,
            validate: (value: string) => {
              console.log('get', value);
              const result = parseConnectString(value);
              if (isError(result)) {
                console.error(result.message);
                return result.message;
              }
              console.log('pass');
              return true;
            },
          }}
          render={({ field }) => (
            <TextField
              placeholder="mesh://root:root@localhost:4002,localhost:4004,localhost:4006"
              label="Casbin Mesh Dashboard"
              errorMessage={errors?.connection && errors?.connection?.message}
              {...field}
            />
          )}
        />
        <ActionWrap>
          <PrimaryButton type="submit">connect</PrimaryButton>
        </ActionWrap>
      </form>
    </Card>
  );
};
export default ConnectPanel;
