import type { NextPage } from 'next';
import styled from 'styled-components';
import ConnectPanel from '../components/ConnectPanel';
import { useClient } from '../context/client';
import { parseConnectString } from '../services/client/utils/url';
import { isError } from '../services/client/interface';
import { useAsyncFn } from 'react-use';
import { useRouter } from 'next/router';

const Root = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const Home: NextPage = () => {
  const client = useClient();
  const router = useRouter();
  const [state, onFinish] = useAsyncFn(
    async ({ connection }: { connection: string }) => {
      const conn = parseConnectString(connection);
      if (isError(conn)) {
        console.log(conn);
        return;
      }
      client.init(conn);
      await client.stats();
      await router.push('/dashboard');
    },
    [client, router]
  );

  return (
    <Root>
      <ConnectPanel loading={state.loading} onFinish={onFinish} />
    </Root>
  );
};

export default Home;
