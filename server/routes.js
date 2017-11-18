/**
 * Main application routes
 */

import path from 'path';

import errors from './components/errors';
import oauth from './components/oauth/auth';

import user from './api/user';
import sms from './api/sms';
import senderId from './api/senderId';
import company from './api/company';
import contact from './api/contact';
import group from './api/group';
import groupContact from './api/group/contact';
import template from './api/template';
import campaign from './api/campaign';
import upstream from './api/upstream';
import upstreamPlan from './api/upstream/plan';
import route from './api/route';
import message from './api/message';
import loginIdentifier from './api/loginIdentifier';
import messageFly from './api/messageFly';
import messageFlyMessage from './api/messageFly/message';
import priorityNumber from './api/priorityNumber';
import transaction from './api/transaction';
import role from './api/role';
import credit from './api/selling';
import sending from './api/sending';
import session from './api/session';
import domain from './api/domain';
import { ROLES } from './config/constants';

const { ADMIN, RESELLER } = ROLES;

const only = (roleIds) => (req, res, next) => (roleIds.includes(req.user.roleId)
      ? next()
      : res.status(400).end());
import auth from './components/auth';

export default function (app) {
  // Insert routes below
  app.use('/api/auth', auth);
  app.use('/api/users', user);
  app.use('/api/roles', role);
  app.use('/api/messages', message);
  app.use('/api/sms', sms);
  app.use('/api/senderId', senderId);
  app.use('/api/senderIds', senderId);
  app.use('/api/company', company);
  app.use('/api/contacts', contact);
  app.use('/api/routes', route);
  app.use('/api/groups', group, groupContact);
  app.use('/api/templates', template);
  app.use('/api/campaigns', campaign);
  app.use('/api/upstreams', oauth, only([ADMIN, RESELLER]), upstream, upstreamPlan);
  app.use('/api/messageFly', messageFly);
  app.use('/api/messageFlies', messageFly, messageFlyMessage);
  app.use('/api/transactions', oauth, only([ADMIN, RESELLER]), transaction);
  app.use('/api/loginIdentifiers', loginIdentifier);
  app.use('/api/priorityNumbers', oauth, only([ADMIN, RESELLER]), priorityNumber);

  app.use('/api/sending', oauth, only([ADMIN, RESELLER]), sending);
  app.use('/api/credits', oauth, only([ADMIN, RESELLER]), credit);
  app.use('/api/sessions', oauth, only([ADMIN, RESELLER]), session);
  app.use('/api/domains', domain);

  // All undefined asset or api routes should return a 404
  app.route('/:url(api|auth|components|app|bower_components|assets)/*')
    .get(errors[404]);

  // All other routes should redirect to the index.html
  app.route('/*')
    .get((req, res) => {
      res.sendFile(path.resolve(`${app.get('appPath')}/index.html`));
    });
}
