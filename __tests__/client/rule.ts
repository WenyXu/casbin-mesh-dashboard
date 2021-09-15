import {
  ProcessRemoveRules,
  ProcessUpdateRules,
} from '../../services/client/utils/rule';
import { isError, Result } from '../../services/client/interface';
import { ProcessedPolicy } from '../../interface';

const rawRule = [
  ['p', 'weny', 'data1', 'read'],
  ['p', 'weny', 'data2', 'read'],
  ['p2', 'weny', 'data3', 'read'],
  ['p2', 'weny', 'data4', 'read'],
  ['g', 'weny', 'data1', 'read'],
  ['g', 'weny', 'data2', 'write'],
  ['g2', 'weny', 'data3', 'read'],
  ['g2', 'weny', 'data4', 'write'],
];

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

describe('rule utils', () => {
  test('remove rules process', () => {
    const outSet = ProcessRemoveRules(rawRule);
    // @ts-ignore
    for (const [k, v] of outSet.entries()) {
      console.log('Inside map', k, v);
    }
  });
  test('update rules process', () => {
    const rule = rawRule.map((rule) => [rule.join('::'), JSON.stringify(rule)]);

    const processRules = processPolicies(rule);
    if (isError(processRules)) {
      console.log('process rules error');
      return;
    }
    processRules.map((process) => {
      process.value[3] = 'modify';
      return process;
    });
    const outSet = ProcessUpdateRules(processRules);
    // @ts-ignore
    for (const [k, v] of outSet.entries()) {
      console.log('Inside map', k, v);
    }
  });
});
