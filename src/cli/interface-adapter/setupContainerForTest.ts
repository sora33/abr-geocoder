import path from 'node:path';
import fs from 'node:fs';
import { container } from 'tsyringe';
import {
  provideDatabase,
  provideProgressBar,
  provideLogger,
  provideMultiProgressBar,
} from './providers';
import { setupContainerParams } from './setupContainerParams';
import { PrefectureName } from '../usecase';

export const setupContainerForTest = async ({
  dataDir,
  ckanId,
}: setupContainerParams) => {
  container.register('USER_AGENT', {
    useValue: 'curl/7.81.0',
  });
  container.register('getDatasetUrl', {
    useValue: (ckanId: string) => {
      return `http://localhost:8080/${ckanId}.zip`;
    },
  });

  const existDataDir = fs.existsSync(dataDir);
  if (!existDataDir) {
    await fs.promises.mkdir(dataDir);
  }
  const sqliteFilePath = path.join(dataDir, `${ckanId}.sqlite`);
  const schemaFilePath = path.join(__dirname, 'schema.sql');

  const db = await provideDatabase({
    schemaFilePath,
    sqliteFilePath,
  });
  container.register('Database', {
    useValue: db,
  });

  const logger = provideLogger();
  container.registerInstance('Logger', logger);

  const progress = provideProgressBar();
  container.registerInstance('ProgressBar', progress);
  const progress2 = provideMultiProgressBar();
  container.registerInstance('MultiProgressBar', progress2);

  container.register<PrefectureName[]>('Prefectures', {
    useValue: [PrefectureName.HOKKAIDO, PrefectureName.AOMORI],
  });
};
