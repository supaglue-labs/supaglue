export type PostgresCredentials = {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
};

export function credentials(params: PostgresCredentials): PostgresCredentials {
  return params;
}
