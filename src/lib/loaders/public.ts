import express, { Express } from 'express'
import { Container } from 'typedi';
import { LoaderInterface } from '../../lib/bootstrap';
import { ConfigSchema } from '../../core/config_schema';

export const publicLoader: LoaderInterface = async (): Promise<any> => {
    const config = Container.get<ConfigSchema>('config');
    const app = Container.get<Express>('express.app');

    app.use(express.static(config.server.dirs.public.onDisk));
}
