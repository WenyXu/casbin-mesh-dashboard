import React, { useEffect, useMemo, useState } from 'react';
import { useClient } from '../../context/client';
import styled from 'styled-components';
import { Stats } from '../../services/client/type/stats';
import {
  Text,
  Pivot,
  PivotItem,
  Label,
  ShimmeredDetailsList,
} from '@fluentui/react';
import { useAsyncRetry } from 'react-use';
import { isSuccess } from '../../services/client/interface';
import { IColumn } from '@fluentui/react';
import { useRouter } from 'next/router';

const Root = styled.div``;

const Block = styled.div`
  max-width: 1024px;
  margin: 24px auto;
`;
const Card = styled.div`
  max-width: 1024px;
  margin: 48px auto;
  padding: 2em;
  background-color: #fdfdff;
  border-radius: 0.5em;
  transition: 0.3s;
  transition-property: all;
  transition-duration: 0.3s;
  transition-timing-function: ease;
  transition-delay: 0s;
  box-shadow: 0 14px 80px rgb(34 35 58 / 20%);
  &:hover {
    transform: translateY(2px);
    box-shadow: rgba(0, 0, 0, 0.12) 0px 4px 20px 0px;
  }
`;

type Row<T> = {
  dataIndex: string[] | string;
  title: string;
  type?: 'text';
  value?: string;
  render?: (entity: T) => React.ReactNode;
};

const getFieldByPath = (data: any, path: string[]) => {
  let tmp = data;
  path.forEach((p) => {
    if (tmp) {
      tmp = tmp[p];
    }
  });
  return tmp;
};

const Description = <T,>({ rows, data }: { rows: Row<T>[]; data: T }) => {
  return (
    <>
      {rows.map(({ render, title, value, dataIndex }) => {
        return render ? (
          render(data)
        ) : (
          <>
            <Label key={dataIndex.toString()}>
              {title}:{' '}
              <Text variant="medium">
                {value
                  ? value
                  : getFieldByPath(
                      data,
                      Array.isArray(dataIndex) ? dataIndex : [dataIndex]
                    )}
              </Text>
            </Label>
          </>
        );
      })}
    </>
  );
};

const BasicRows = (): Row<Stats>[] => {
  return [
    { dataIndex: ['leader', 'addr'], title: 'Leader' },
    { dataIndex: 'dir', title: 'Dir path' },
    { dataIndex: 'dir_size', title: 'Dir size' },
    { dataIndex: 'apply_timeout', title: 'Apply timeout' },
    { dataIndex: 'election_timeout', title: 'Election timeout' },
    { dataIndex: 'heartbeat_timeout', title: 'Heartbeat timeout' },
  ];
};

const RaftRows = (): Row<Stats>[] => {
  return [
    { dataIndex: ['raft', 'applied_index'], title: 'Applied index' },
    { dataIndex: ['raft', 'commit_index'], title: 'Commit index' },
    { dataIndex: ['raft', 'fsm_pending'], title: 'FSM pending' },
    { dataIndex: ['raft', 'last_log_term'], title: 'Last log term' },
    {
      dataIndex: ['raft', 'last_snapshot_index'],
      title: 'Last snapshot index',
    },
    { dataIndex: ['raft', 'last_snapshot_term'], title: 'Last snapshot term' },
    {
      dataIndex: ['raft', 'latest_configuration'],
      title: 'Latest configuration',
    },
    {
      dataIndex: ['raft', 'latest_configuration_index'],
      title: 'Latest configuration_index',
    },
    { dataIndex: ['raft', 'log_size'], title: 'Log size' },
    { dataIndex: ['raft', 'term'], title: 'Term' },
  ];
};

const onRenderItemColumn = (
  item?: any,
  index?: number,
  column?: IColumn
): React.ReactNode => {
  return item[column?.key ?? ''];
};
const PoliciesList = <T,>({
  items,
  loading,
}: {
  items?: T[];
  loading: boolean;
}) => {
  return (
    <ShimmeredDetailsList
      setKey="hoverSet"
      items={items ?? []}
      enableShimmer={loading}
      columns={[
        {
          key: 'key',
          name: 'Key',
          minWidth: 100,
          maxWidth: 200,
          isResizable: true,
        },
        {
          key: 'value',
          name: 'Value',
          minWidth: 100,
          maxWidth: 200,
          isResizable: true,
        },
      ]}
      onRenderItemColumn={onRenderItemColumn}
    />
  );
};

const Dashboard: React.FunctionComponent = () => {
  const client = useClient();
  const [stats, setStats] = useState<Stats | undefined>();
  const router = useRouter();
  useEffect(() => {
    if (client.clusterStats) {
      setStats(client.clusterStats);
    } else {
      router.replace('/');
    }
  }, [client, router]);
  const basicRows = useMemo(() => BasicRows(), []);
  const raftRows = useMemo(() => RaftRows(), []);
  const nodesRows = useMemo(() => {
    return stats?.nodes?.map((n) => ({
      dataIndex: ['nodes', n.id, 'addr'],
      value: n.addr,
      title: n.id,
    }));
  }, [stats]);
  const namespaces = useAsyncRetry(async () => {
    if (!client) {
      console.log('empty client');
      return;
    }
    const result = await client.namespaces();
    if (isSuccess(result)) {
      if (result?.[0]) setNamespace(result?.[0]);
    }
    return result;
  }, [client]);
  const [namespace, setNamespace] = useState<string>();

  const policies = useAsyncRetry(async () => {
    if (!client || !namespace) {
      console.log('empty client or namespace', namespace);
      return;
    }
    return await client.policies(namespace);
  }, [namespace]);
  const model = useAsyncRetry(async () => {
    if (!client || !namespace) {
      console.log('empty client or namespace', namespace);
      return;
    }
    return await client.model(namespace);
  }, [namespace]);

  if (!stats) return <></>;
  return (
    <Root>
      {namespaces.loading ? (
        <></>
      ) : (
        <Block>
          <Pivot
            overflowBehavior="menu"
            headersOnly
            onLinkClick={(item) => {
              setNamespace(item?.props?.itemKey);
            }}
          >
            {isSuccess(namespaces?.value) &&
              namespaces.value?.map((ns) => (
                <PivotItem headerText={ns} key={ns} itemKey={ns} />
              ))}
          </Pivot>
        </Block>
      )}
      <Card style={{ padding: '5px' }}>
        {isSuccess(policies.value) && (
          <PoliciesList<Record<'key' | 'value', string>>
            loading={policies.loading}
            items={
              policies.value?.map((p) => ({
                key: p[0],
                value: p[1],
              })) ?? []
            }
          />
        )}
      </Card>
      {model.loading ? (
        <></>
      ) : (
        <>
          <Card>
            <Text variant="xLarge">Model</Text>
            {isSuccess(model.value) &&
              model?.value?.split('\n').map((text, index) => (
                <Text key={index} block variant="small">
                  {text}
                </Text>
              ))}
          </Card>
        </>
      )}

      <Block>
        <Pivot>
          <PivotItem
            headerText="Basic"
            headerButtonProps={{
              'data-order': 1,
              'data-title': 'My Files Title',
            }}
          >
            <Card>
              <Text block variant="xLarge">
                Basic
              </Text>
              {stats && <Description<Stats> rows={basicRows} data={stats} />}
            </Card>
          </PivotItem>
          <PivotItem headerText="Raft">
            <Card>
              <Text block variant="xLarge">
                Raft
              </Text>
              {stats && <Description<Stats> rows={raftRows} data={stats} />}
            </Card>
          </PivotItem>
          <PivotItem headerText="Nodes">
            <Card>
              <Text block variant="xLarge">
                Nodes
              </Text>
              {stats && nodesRows && (
                <Description<Stats> rows={nodesRows} data={stats} />
              )}
            </Card>
          </PivotItem>
        </Pivot>
      </Block>
    </Root>
  );
};

export default Dashboard;
