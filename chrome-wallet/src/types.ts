export interface Manifest {
  manifest_version: number;
  name: string;
  version: string;
  description: string;
  permissions: string[];
  host_permissions: string[];
  background: {
    service_worker: string;
    type: string;
  };
  action: {
    default_popup: string;
    default_icon: {
      16: string;
      48: string;
      128: string;
    };
  };
  content_scripts: Array<{
    matches: string[];
    js: string[];
    run_at: string;
    all_frames: boolean;
  }>;
  web_accessible_resources: Array<{
    resources: string[];
    matches: string[];
  }>;
  icons: {
    16: string;
    48: string;
    128: string;
  };
}

export interface RPCRequest {
  id: number;
  method: string;
  params: unknown[];
  jsonrpc?: string;
}

export interface RPCResponse {
  id: number;
  result?: unknown;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
  jsonrpc: string;
}

export interface TransactionRequest {
  from: string;
  to?: string;
  value?: string;
  data?: string;
  gas?: string;
  gasPrice?: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
  nonce?: string;
  chainId?: string;
}

export interface EIP712Domain {
  name?: string;
  version?: string;
  chainId?: number;
  verifyingContract?: string;
  salt?: string;
}

export interface EIP712TypedData {
  types: {
    EIP712Domain: Array<{ name: string; type: string }>;
    [key: string]: Array<{ name: string; type: string }>;
  };
  primaryType: string;
  domain: EIP712Domain;
  message: Record<string, unknown>;
}

export interface PendingRequest {
  id: number;
  method: string;
  params: unknown[];
  timestamp: number;
}

export interface WalletState {
  mnemonic?: string;
  accounts: string[];
  currentAccount: number;
  currentChainId: string;
  networks: Network[];
}

export interface Network {
  chainId: string;
  name: string;
  rpcUrl: string;
  blockExplorer?: string;
}

export interface MessagePayload {
  type: string;
  data?: unknown;
  requestId?: number;
  success?: boolean;
  error?: string;
}

