import { ProcessedPolicy } from '../../../interface';

// rule[0]: pType
type RemoveRulesPayload = {
  sec: string;
  pType: string;
  rules: string[][];
};

export const ProcessRemoveRules = (rawRules: string[][]) => {
  const outSet = new Map<string, RemoveRulesPayload>();
  rawRules.forEach((rule) => {
    const sec = rule[0].slice(0, 1);
    const pType = rule[0];
    const hit = outSet.get(pType);
    const [_, ...rest] = rule;
    if (hit) {
      hit.rules.push(rest);
    } else {
      outSet.set(pType, {
        sec,
        pType,
        rules: [rest],
      });
    }
  });
  return outSet;
};

type UpdateRulesPayload = {
  sec: string;
  pType: string;
  newRules: string[][];
  oldRules: string[][];
};

// ProcessUpdateRules
export const ProcessUpdateRules = (processedRules: ProcessedPolicy[]) => {
  const outSet = new Map<string, UpdateRulesPayload>();
  processedRules.forEach(({ rawKey, value }) => {
    const [pType, ...OldRuleRest] = rawKey.split('::');
    const sec = pType.slice(0, 1);
    const hit = outSet.get(pType);
    const [_, ...newRuleRest] = value;
    if (hit) {
      hit.oldRules.push(OldRuleRest);
      hit.newRules.push(newRuleRest);
    } else {
      outSet.set(pType, {
        sec,
        pType,
        newRules: [newRuleRest],
        oldRules: [OldRuleRest],
      });
    }
  });
  return outSet;
};
