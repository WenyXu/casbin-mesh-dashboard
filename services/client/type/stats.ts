export interface Stats {
  addr: string;
  apply_timeout: string;
  dir: string;
  dir_size: number;
  election_timeout: string;
  heartbeat_timeout: string;
  leader: Leader;
  metadata: Metadata;
  node_id: string;
  nodes: Node[];
  raft: Raft;
  snapshot_interval: number;
  snapshot_threshold: number;
  trailing_logs: number;
}

export interface Leader {
  addr: string;
  node_id: string;
}

export type Metadata = Record<string, NodeMetadata>;

export interface NodeMetadata {
  api_addr?: string;
  api_proto?: string;
}

export interface Node {
  id: string;
  addr: string;
}

export interface Raft {
  applied_index: number;
  commit_index: number;
  fsm_pending: number;
  last_contact: number;
  last_log_index: number;
  last_log_term: number;
  last_snapshot_index: number;
  last_snapshot_term: number;
  latest_configuration: string;
  latest_configuration_index: number;
  log_size: number;
  num_peers: number;
  protocol_version: number;
  protocol_version_max: number;
  protocol_version_min: number;
  snapshot_version_max: number;
  snapshot_version_min: number;
  state: string;
  term: number;
}
