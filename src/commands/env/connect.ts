/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as os from 'os';
import * as open from 'open';

import { Command, Flags } from '@oclif/core';
import { AuthFields, AuthInfo, AuthRemover, OAuth2Options, SfdxError, WebOAuthServer } from '@salesforce/core';
import { getString } from '@salesforce/ts-types';

// TODO: add back once md messages are supported
// Messages.importMessagesDirectory(__dirname);
// const messages = Messages.loadMessages('@salesforce/plugin-env', 'connect');

// eslint-disable-next-line no-shadow
enum ConnectMethod {
  ORG_WEB = 'org_web',
  ORG_JWT = 'org_jwt',
}

export default class EnvConnect extends Command {
  // public static readonly description = messages.getMessage('description');
  // public static readonly examples = messages.getMessage('examples').split(os.EOL);
  public static readonly description = 'connect to a Salesforce account or environment';
  public static readonly examples = ''.split(os.EOL);
  public static flags = {
    'instance-url': Flags.string({
      char: 'r',
      description: 'the login URL',
      default: 'https://login.salesforce.com',
    }),
    'jwt-key-file': Flags.string({
      char: 'f',
      description: 'path to a file containing the private key',
      dependsOn: ['username', 'clientid'],
    }),
    username: Flags.string({
      char: 'u',
      description: 'authentication username',
      dependsOn: ['jwt-key-file', 'clientid'],
    }),
    clientid: Flags.string({
      char: 'i',
      description: 'OAuth client ID (sometimes called the consumer key)',
      dependsOn: ['username', 'jwt-key-file'],
    }),
  };

  public flags: {
    'instance-url': string;
    'jwt-key-file': string;
    username: string;
    clientid: string;
  };

  public async run(): Promise<AuthFields> {
    this.flags = (await this.parse(EnvConnect)).flags;

    const method = this.determineConnectMethod();
    let result: AuthFields = {};
    switch (method) {
      case ConnectMethod.ORG_JWT:
        result = await this.executeJwtOrgFlow();
        break;
      case ConnectMethod.ORG_WEB:
        result = await this.executeWebLoginOrgFlow();
        break;
      default:
        break;
    }
    return result;
  }

  private determineConnectMethod(): ConnectMethod {
    if (this.flags['jwt-key-file'] && this.flags.username && this.flags.clientid) return ConnectMethod.ORG_JWT;
    else return ConnectMethod.ORG_WEB;
  }

  private async executeJwtOrgFlow(): Promise<AuthFields> {
    this.log('Executing salesforce org JWT auth flow...');
    let result: AuthFields = {};

    try {
      const oauth2OptionsBase = {
        clientId: this.flags.clientid,
        privateKeyFile: this.flags['jwt-key-file'],
      };

      const loginUrl = this.flags['instance-url'];

      const oauth2Options = loginUrl ? Object.assign(oauth2OptionsBase, { loginUrl }) : oauth2OptionsBase;

      let authInfo: AuthInfo;
      try {
        authInfo = await AuthInfo.create({ username: this.flags.username, oauth2Options });
      } catch (error) {
        const err = error as SfdxError;
        if (err.name === 'AuthInfoOverwriteError') {
          this.debug('Auth file already exists. Removing and starting fresh.');
          const remover = await AuthRemover.create();
          await remover.removeAuth(this.flags.username);
          authInfo = await AuthInfo.create({
            username: this.flags.username,
            oauth2Options,
          });
        } else {
          throw err;
        }
      }
      await authInfo.save();
      result = authInfo.getFields(true);
    } catch (err) {
      const msg = getString(err, 'message');
      const error = `We encountered a JSON web token error, which is likely not an issue with Salesforce CLI. Here’s the error: ${msg}`;
      throw new SfdxError('JwtGrantError', error);
    }
    const successMsg = `Successfully authorized ${result.username} with ID ${result.orgId}`;
    this.log(successMsg);
    return result;
  }

  private async executeWebLoginOrgFlow(): Promise<AuthFields> {
    this.log('Executing salesforce org web auth flow...');
    try {
      const oauthConfig: OAuth2Options = this.flags['instance-url'] ? { loginUrl: this.flags['instance-url'] } : {};
      const oauthServer = await WebOAuthServer.create({ oauthConfig });
      await oauthServer.start();
      await open(oauthServer.getAuthorizationUrl(), { wait: false });
      const authInfo = await oauthServer.authorizeAndSave();
      const fields = authInfo.getFields(true);
      const successMsg = `Successfully authorized ${fields.username} with ID ${fields.orgId}`;
      this.log(successMsg);
      return fields;
    } catch (err) {
      const error = err as Error;
      this.debug(error);
      if (error.name === 'AuthCodeExchangeError') {
        const errMsg = `Invalid client credentials. Verify the OAuth client secret and ID. ${error.message}`;
        throw new SfdxError(errMsg);
      }
      throw error;
    }
  }
}
