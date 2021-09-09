import React, { CSSProperties, Props } from 'react';
import { Spinner } from '@fluentui/react';
import styled from 'styled-components';

const CardBase = styled.div`
  width: 600px;
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
    <>
      {loading ? (
        <Spinner label={loadingLabel} labelPosition="left" />
      ) : (
        <CardBase {...rest}>{children}</CardBase>
      )}
    </>
  );
};

export default Card;
