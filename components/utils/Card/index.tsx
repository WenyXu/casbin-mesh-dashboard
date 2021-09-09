import React, { CSSProperties, Props } from 'react';
import { Spinner } from '@fluentui/react';
import styled from 'styled-components';

const CardBase = styled.div`
  width: 600px;
  padding: 2em;
  background-color: #fdfdff;
  border-radius: 0.5em;
  box-shadow: 2px 3px 7px 2px rgba(0, 0, 0, 0.02);
`;

type CardProps = {
  loading?: boolean;
  loadingLabel?: string;
  style?: CSSProperties;
};

const Card: React.FunctionComponent<CardProps> = ({
  loading,
  loadingLabel = 'loading...',
  children,
  ...rest
}) => {
  return (
    <CardBase {...rest}>
      {loading ? (
        <Spinner label={loadingLabel} labelPosition="left" />
      ) : (
        children
      )}
    </CardBase>
  );
};

export default Card;
