import React, { useEffect } from 'react';
import {
  Dropdown,
  PrimaryButton,
  Text,
  TextField,
  Toggle,
} from '@fluentui/react';
import styled from 'styled-components';
import Card from '../utils/Card';
import FieldWrap from '../utils/Field';
import { useForm, Controller } from 'react-hook-form';
import { parseConnectString } from '../../services/client/utils/url';
import { isError } from '../../services/client/interface';
import * as querystring from 'querystring';
export type ConnectPanelProps = {
  loading?: boolean;
  onFinish: (value: Record<'connection', string>) => void | Promise<void>;
};

const ActionWrap = styled(FieldWrap)`
  display: flex;
  justify-content: flex-end;
`;

const prefix = 'mesh://';
const ConnectPanel = ({ loading, onFinish }: ConnectPanelProps) => {
  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm();
  const watchAuth = watch('auth');
  const watchAllFields = watch(['auth', 'host', 'username', 'password', 'ssl']);

  useEffect(() => {
    const { ssl, auth, host, username, password } = getValues();
    let cred: string | undefined;
    let conn = prefix;
    if (auth === 'basic' && username && password) {
      cred = `${username}:${password}`;
      conn += cred + '@';
    }
    if (host && host !== '') {
      conn += host;
    } else {
      return;
    }
    conn = conn + '?' + querystring.encode({ ssl: !!ssl, auth });
    setValue('connection', conn);
  }, [watchAllFields, setValue]);

  return (
    <Card loading={loading} loadingLabel="connecting">
      <Text variant="xLarge">Casbin Mesh</Text>
      <form onSubmit={handleSubmit(onFinish)}>
        <Controller
          name="connection"
          control={control}
          defaultValue="mesh://root:root@localhost:4002"
          rules={{
            required: true,
            validate: (value: string) => {
              const result = parseConnectString(value);
              if (isError(result)) {
                console.error(result.message);
                return result.message;
              }
              return true;
            },
          }}
          render={({ field }) => (
            <TextField
              placeholder="mesh://root:root@localhost:4002,localhost:4004,localhost:4006"
              label="Connection string"
              errorMessage={errors?.connection && errors?.connection?.message}
              {...field}
            />
          )}
        />
        <Controller
          name="host"
          control={control}
          defaultValue="localhost:4002"
          rules={{
            required: true,
          }}
          render={({ field }) => (
            <TextField
              placeholder="root@localhost:4002,localhost:4004,localhost:4006"
              label="Host"
              errorMessage={errors?.host && errors?.host?.message}
              {...field}
            />
          )}
        />
        <Controller
          name="auth"
          control={control}
          defaultValue="noop"
          render={({ field: { value, onChange, ...rest } }) => (
            <Dropdown
              label="Authentication"
              placeholder="Select an option"
              options={dropdownControlledExampleOptions}
              selectedKey={value}
              onChange={(_, item) => item && onChange(item.key)}
              {...rest}
            />
          )}
        />
        {watchAuth === 'basic' && (
          <>
            <Controller
              name="username"
              control={control}
              rules={{
                required: true,
              }}
              defaultValue="root"
              render={({ field }) => (
                <TextField
                  label="Username"
                  errorMessage={errors?.username && errors?.username?.message}
                  {...field}
                />
              )}
            />
            <Controller
              name="password"
              control={control}
              rules={{
                required: true,
              }}
              render={({ field }) => (
                <TextField
                  label="Password"
                  type="password"
                  canRevealPassword
                  errorMessage={errors?.password && errors?.password?.message}
                  {...field}
                />
              )}
            />
          </>
        )}
        <Controller
          name="ssl"
          control={control}
          defaultValue={false}
          render={({ field: { value, onChange, ...rest } }) => (
            <Toggle
              label="SSL"
              onText="On"
              offText="Off"
              checked={value}
              onChanged={onChange}
              {...rest}
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
const dropdownControlledExampleOptions = [
  {
    key: 'noop',
    text: 'Noop',
  },
  { key: 'basic', text: 'Basic' },
];
export default ConnectPanel;
