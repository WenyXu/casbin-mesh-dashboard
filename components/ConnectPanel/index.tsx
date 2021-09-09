import React from 'react';
import { PrimaryButton, TextField } from '@fluentui/react';
import styled from 'styled-components';
import Card from '../utils/Card';
import FieldWrap from '../utils/Field';
import { useForm, Controller } from 'react-hook-form';
export type ConnectPanelProps = {
  loading?: boolean;
  onFinish: (value: Record<'connection', string>) => void | Promise<void>;
};

const ActionWrap = styled(FieldWrap)`
  display: flex;
  justify-content: flex-end;
`;

const ConnectPanel = ({ loading, onFinish }: ConnectPanelProps) => {
  const { control, handleSubmit } = useForm();

  return (
    <Card loading={loading} loadingLabel="connecting">
      <form onSubmit={handleSubmit(onFinish)}>
        <Controller
          name="connection"
          control={control}
          defaultValue="mesh://root:root@localhost:4002"
          render={({ field }) => (
            <TextField
              placeholder="mesh://root:root@localhost:4002,localhost:4004,localhost:4006"
              label="Casbin Mesh Dashboard"
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
