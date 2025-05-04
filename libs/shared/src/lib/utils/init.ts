import { config } from 'dotenv';

config({ path: './.env' });

const envVarsAndSecrets: Record<string, string> = {};

export enum SECRETS {
  EXAMPLE_SECRET = 'EXAMPLE_SECRET',
}

export enum VARS {
  PORT = 'PORT',
  NODE_ENV = 'NODE_ENV',
}

export const requiredEnvironmentVariables: string[] = [
  ...Object.values(VARS),
  ...Object.values(SECRETS),
];

export async function initConfig() {
  await setVarsAndSecrets();
  const envErrors = checkEnvironmentVariables(
    envVarsAndSecrets,
    requiredEnvironmentVariables
  );

  if (envErrors.length > 0) {
    throw new Error(envErrors.join('\n'));
  }
}

export function getEnvs(name: VARS | SECRETS): string {
  const envVar = envVarsAndSecrets[name];
  if (!envVar && process.env[name]) {
    return process.env[name];
  } else if (!envVar) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return envVar;
}

export function setEnv(name: string, value: string) {
  envVarsAndSecrets[name] = value;
}

export async function setVarsAndSecrets() {
  if (
    !process.env.NODE_ENV ||
    !['dev', 'prod'].includes(process.env.NODE_ENV)
  ) {
    config({ path: './.env' });
    config({ path: `./.env.${process.env.NODE_ENV}` });
    
    for (const name in VARS) {
      setEnv(name, process.env[name]);
    }
  } else {
   // NON local / test so normally add a secret manager implementation
  }
}

export function checkEnvironmentVariables(
  envs: Record<string, string>,
  requiredEnvironmentVariables: string[]
) {
  const errors: string[] = [];

  for (const name in requiredEnvironmentVariables) {
    if (!envs[name]) {
      errors.push(`${name} environment variable has not been set.`);
    }
  }

  return errors;
}
