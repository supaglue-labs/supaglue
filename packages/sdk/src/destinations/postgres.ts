import { BaseDestination, BaseDestinationParams } from '../base';

type PostgresCredentialsParams = {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
};

export function postgresCredentials(params: PostgresCredentialsParams) {
  return new PostgresCredentials(params);
}

export class PostgresCredentials {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;

  constructor({ host, port, database, user, password }: PostgresCredentialsParams) {
    this.host = host;
    this.port = port;
    this.database = database;
    this.user = user;
    this.password = password;
  }

  toJSON() {
    return {
      host: this.host,
      port: this.port,
      database: this.database,
      user: this.user,
      password: this.password,
    };
  }
}

type PostgresDestinationConfig = {
  credentials: PostgresCredentials;
  table: string;
  upsertKey: string;
  customerIdColumn: string;
};

type PostgresDestinationParams = BaseDestinationParams & {
  config: PostgresDestinationConfig;
};

export function postgres(params: PostgresDestinationParams) {
  return new PostgresDestination(params);
}

export class PostgresDestination extends BaseDestination {
  config: PostgresDestinationConfig;

  constructor(params: PostgresDestinationParams) {
    super(params);
    const { config } = params;
    this.config = config;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      type: 'postgres',
      config: {
        ...this.config,
        credentials: this.config.credentials.toJSON(),
      },
    };
  }
}
