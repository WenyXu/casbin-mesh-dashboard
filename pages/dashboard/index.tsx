import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useClient } from '../../context/client';
import styled from 'styled-components';
import { Stats } from '../../services/client/type/stats';
import {
  Text,
  Pivot,
  PivotItem,
  Label,
  ShimmeredDetailsList,
  Link,
  TextField,
  IDetailsListProps,
  IDetailsRowStyles,
  DetailsRow,
  Selection,
  PrimaryButton,
  DefaultButton,
  CommandBarButton,
  Button,
} from '@fluentui/react';
import { useAsyncFn, useAsyncRetry } from 'react-use';
import { isSuccess, isError, Result } from '../../services/client/interface';
import { IColumn } from '@fluentui/react';
import { useRouter } from 'next/router';
import useModal from '../../components/utils/Modal';
import PolicyMutationModal from '../../components/PolicyModal';
import { ProcessedPolicy } from '../../interface';
import {
  ProcessRemoveRules,
  ProcessUpdateRules,
} from '../../services/client/utils/rule';

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

const ModelLabel: Record<string, string> = {
  '[request_definition]': '[request_definition]',
  '[policy_definition]': '[policy_definition]',
  '[role_definition]': '[role_definition]',
  '[policy_effect]': '[policy_effect]',
  '[matchers]': '[matchers]',
};

const _onRenderRow: IDetailsListProps['onRenderRow'] = (props) => {
  const customStyles: Partial<IDetailsRowStyles> = { cell: { height: 50 } };
  if (props) {
    return <DetailsRow {...props} styles={customStyles} />;
  }
  return null;
};

const Space = styled.div`
  display: flex;
  flex-direction: column;
`;

const onRenderItemColumn = (
  item?: ProcessedPolicy,
  index?: number,
  column?: IColumn
): React.ReactNode => {
  switch (column?.key) {
    case 'type':
      return item?.type ?? 'unknown type';
    case 'value':
      return item?.value.join(',') ?? 'unknown type';
    case 'modified':
      return !!item?.modified ? 'draft' : 'latest';
    case 'operation':
      return (
        <>
          <Link onClick={() => item?.onEdit?.()}>Edit</Link>
        </>
      );
    default:
      // @ts-ignore
      return item?.[column?.key ?? ''] ?? 'unknown';
  }
};

const processPolicies = (policies: string[][]): Result<ProcessedPolicy[]> => {
  return policies.map(([rawKey, rawValue]) => {
    const value = rawKey.split('::');
    return {
      rawKey: rawKey,
      rawValue: rawValue,
      modified: false,
      value: value,
      type: value[0] === 'p' ? 'Policy' : 'Group',
      editing: false,
    };
  });
};

const ActionWrap = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1em;
`;

const ContentWrap = styled.div`
  margin-top: 8px;
`;

const PoliciesList = <T,>({
  items,
  loading,
  newPolicies,
  onUpdate,
  onUpdating,
  onDelete,
  onDeleting,
}: {
  items?: ProcessedPolicy[];
  loading: boolean;
  newPolicies: () => void;
  onUpdating?: boolean;
  onUpdate?: () => Promise<void> | void;
  onDeleting?: boolean;
  onDelete?: (rawKey: string[][]) => Promise<void> | void;
}) => {
  const [prefix, setPrefix] = useState<string | undefined>();
  const [count, setCount] = useState(0);
  const updatable = useMemo(
    () => !!items && items.find((item) => item?.modified),
    [items]
  );
  const [selected, setSelected] = useState<string[][]>([]);
  const onSelectionChange = () => {
    setSelected(selection.getSelection().map((r) => r?.rawKey?.split('::')));
    setCount(selection.getSelection().length);
  };
  const selection = useMemo(
    () =>
      new Selection<any>({
        onSelectionChanged: () => onSelectionChange(),
      }),
    []
  );

  return (
    <>
      <ActionWrap
        style={{
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Text variant="xLarge">Policies</Text>
        <ActionWrap>
          {!!count && (
            <DefaultButton onClick={() => onDelete?.(selected)}>
              Delete selected {count} policies
            </DefaultButton>
          )}
          {updatable && (
            <DefaultButton onClick={onUpdate}>Update policies</DefaultButton>
          )}
          <PrimaryButton onClick={newPolicies}>New policies</PrimaryButton>
        </ActionWrap>
      </ActionWrap>

      <TextField
        label="Filter by key:"
        onChange={(ev, value) => setPrefix(value)}
      />
      <ShimmeredDetailsList
        setKey="hoverSet"
        selectionPreservedOnEmptyClick
        selection={selection}
        items={
          (items &&
            (prefix
              ? items.filter((item) => item.rawKey.indexOf(prefix) > -1)
              : items)) ??
          []
        }
        enableShimmer={loading}
        columns={[
          {
            key: 'rawKey',
            name: 'key',
            minWidth: 50,
            maxWidth: 200,
            isResizable: true,
          },
          {
            key: 'type',
            name: 'type',
            minWidth: 50,
            maxWidth: 200,
            isResizable: true,
          },
          {
            key: 'value',
            name: 'value',
            minWidth: 50,
            maxWidth: 200,
            isResizable: true,
          },
          {
            key: 'operation',
            name: 'operation',
            minWidth: 50,
            maxWidth: 200,
            isResizable: true,
          },
          {
            key: 'modified',
            name: 'state',
            minWidth: 50,
            maxWidth: 200,
            isResizable: true,
          },
        ]}
        onRenderItemColumn={onRenderItemColumn}
      />
    </>
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

  const [policiesState, setPolicies] = useState<ProcessedPolicy[]>([]);

  const policies = useAsyncRetry(async () => {
    if (!client || !namespace) {
      console.log('empty client or namespace', namespace);
      return;
    }
    const rawPolicies = await client.policies(namespace);
    if (isError(rawPolicies)) {
      throw rawPolicies;
    } else {
      const processPoliciesData = processPolicies(rawPolicies);
      if (isSuccess(processPoliciesData)) {
        setPolicies(processPoliciesData);
      }
      return processPolicies(rawPolicies);
    }
  }, [namespace]);

  const [editingPolicy, setEditingPolicy] = useState<ProcessedPolicy>();

  const [editPolicyDialog, { toggle: editPolicyDialogToggle }] = useModal(
    () => {
      return (
        <ContentWrap>
          <TextField
            value={editingPolicy?.value.join(',')}
            onChange={(ev, value) => {
              value &&
                editingPolicy &&
                setEditingPolicy({ ...editingPolicy, value: value.split(',') });
            }}
          />
        </ContentWrap>
      );
    },
    {
      headerText: 'Edit Policy',
      okButton: {
        label: 'Save as DRAFT',
        onClick: ({ toggle }) => {
          toggle();
          if (!editingPolicy) return;
          setPolicies((prev) => {
            const hit = prev.find((p) => p.rawKey === editingPolicy?.rawKey);
            if (hit) {
              const raw =
                editingPolicy.value.join('::') === editingPolicy.rawKey;
              hit.value = editingPolicy.value;
              hit.modified = !raw;
            }
            return [...prev];
          });
        },
      },
      cancelButton: {
        label: 'Close',
        onClick: ({ toggle }) => toggle(),
      },
    }
  );

  const model = useAsyncRetry(async () => {
    if (!client || !namespace) {
      console.log('empty client or namespace', namespace);
      return;
    }
    return await client.model(namespace);
  }, [namespace]);

  const [newPolicyModal, { toggle: newPolicyModalToggle }] =
    PolicyMutationModal({
      onFinish: async (value) => {
        if (!namespace) {
          return;
        }
        if (!value[0]) {
          return;
        }
        const sec = value[0].value.slice(0, 1);
        const ptype = value[0].value.split(',')[0];
        const rules = value.map((v) => {
          const [_, ...rest] = v.value.split(',');
          return rest;
        });
        const result = await client.addPolicies(namespace, sec, ptype, rules);
        if (isSuccess(result)) {
          const { effected_rules } = result;
          const newRule = effected_rules?.map((rule) => [ptype, ...rule]) ?? [];
          console.log('newRule:', newRule);
          const processed = processPolicies(
            newRule.map((rule) => [rule.join('::'), JSON.stringify(rule)])
          );
          console.log('processed:', processed);

          if (isError(processed)) {
            return;
          }
          setPolicies((prev) => [...prev, ...processed]);
          newPolicyModalToggle();
        }
      },
    });

  const [updatePoliciesState, updatePolicies] = useAsyncFn(
    async (namespace: string, p: ProcessedPolicy[]) => {
      const updateData = ProcessUpdateRules(p);
      console.log('before update', p);
      updateData.forEach(({ sec, pType, newRules, oldRules }) => {
        console.log('updating', sec, pType, newRules, oldRules);
        client.updatePolicies(namespace, sec, pType, newRules, oldRules);
      });
    },
    [client]
  );

  const updatePoliciesFn = useCallback(async () => {
    const needUpdate = policiesState.filter((p) => p.modified);
    if (!namespace) return;
    await updatePolicies(namespace, needUpdate);
    setPolicies(policiesState.map((r) => ({ ...r, modified: false })));
  }, [namespace, policiesState, setPolicies]);

  const [deletePoliciesState, deletePolicies] = useAsyncFn(
    async (namespace: string, rawRules: string[][]) => {
      const deleteData = ProcessRemoveRules(rawRules);
      deleteData.forEach(({ sec, pType, rules }) => {
        client.removePolicies(namespace, sec, pType, rules);
      });
    },
    [client]
  );

  const deletePoliciesFn = useCallback(
    async (rawRules: string[][]) => {
      if (!namespace) return;
      await deletePolicies(namespace, rawRules);
      const rawKey = rawRules.map((r) => r.join('::'));
      setPolicies((pp) => pp.filter((p) => !(rawKey.indexOf(p.rawKey) > -1)));
    },
    [namespace, setPolicies]
  );

  if (!stats) return <></>;
  return (
    <Root>
      {newPolicyModal}
      {editPolicyDialog}
      {namespaces.loading ? (
        <></>
      ) : (
        <Block>
          <ActionWrap
            style={{
              justifyContent: 'space-between',
              alignItems: 'end',
            }}
          >
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
            <PrimaryButton>New</PrimaryButton>
          </ActionWrap>
        </Block>
      )}
      <Card>
        {isSuccess(policies.value) && (
          <PoliciesList<ProcessedPolicy>
            newPolicies={newPolicyModalToggle}
            loading={policies.loading}
            onUpdate={updatePoliciesFn}
            onUpdating={updatePoliciesState.loading}
            onDelete={deletePoliciesFn}
            items={policiesState?.map((v) => ({
              ...v,
              onEdit: () => {
                setEditingPolicy(v);
                editPolicyDialogToggle();
              },
            }))}
          />
        )}
      </Card>
      {model.loading ? (
        <></>
      ) : (
        <>
          <Card>
            <ActionWrap
              style={{
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text variant="xLarge">Model</Text>
              <DefaultButton>Edit model</DefaultButton>
            </ActionWrap>
            {isSuccess(model.value) &&
              model?.value?.split('\n').map((text, index) =>
                !!ModelLabel[text] ? (
                  <Label key={index}>{text}</Label>
                ) : (
                  <Text key={index} block variant="medium">
                    {text}
                  </Text>
                )
              )}
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
