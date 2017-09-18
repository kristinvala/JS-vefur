import React, { Component } from 'react';
import Helmet from 'react-helmet';
import config from 'utils/config';

import Segment from 'components/segment';
import Heading from 'components/heading';
import Button from 'components/button';
import s from './Home.scss';

export default class Home extends Component {
  render() {
    return (
      <div>
        <Helmet title="Home" />

        <Segment>
          <Heading>{config('welcomeMessage')}</Heading>

          <div className={`${s.js} ${s.jsOnly}`}>
            <p>Javascript is <b>✓</b></p>
          </div>

          <div className={`${s.js} ${s.jsDisabled}`}>
            <p>Javascript is <b>✗</b></p>
          </div>
        </Segment>

        <Segment>
          <Button>Button</Button>
          <Button href="http://ueno.co">Ueno.co</Button>
          <Button to="/about">About</Button>
        </Segment>
      </div>
    );
  }
}
