/**
 * Copyright © 2017 DOU Networks. All Rights Reserved.
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Khang Dong <khang.dong@dounets.com> on May 16, 2018
 */

const ENV = {
  DEV: 'development',
  PROD: 'production',
  TEST: 'test',
};

const PORT = 8082;
const TEST_PORT = 8002;

const ROUTES = {
  ROOT: '/',
  DASHBOARD: '/dashboard',
  SIGN_IN: '/auth/signin',
  SIGN_UP: '/auth/signup',
  SIGN_OUT: '/signout',
  FORGOT: '/forgot',
  ACCOUNT: '/account'
};

const FORMAT = {
  TIMERSTAMP: 'yyyy-MM-dd hh24:mi:ss'
};

const TIME_UNIT = {
  HOUR: 'hour',
  DAY: 'day',
  WEEK: 'week',
  MONTH: 'month',
  WEEK_DAY: 'week_day',
  MONTH_DAY: 'month_day'
};

const PASSWORD = '1111';

const CRUD_FLAG = {
  CREATE: 'C',
  RETRIEVE: 'R',
  UPDATE: 'U',
  DELETE: 'D'
}

module.exports = {
  ENV,
  PORT,
  TEST_PORT,
  ROUTES,
  FORMAT,
  PASSWORD,
  TIME_UNIT,
  CRUD_FLAG
}
