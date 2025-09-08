import { ClientConfigInterface } from '@pictaccio/image-service/src/core/common/client_config_interface';

export interface ConfigSchema {
    env: {
        version: string,
        environment: string,
        production: boolean,
        debug: boolean,
        instanceId: string,
        dirs: {
            docsPages: string,
            locales: string,
            jobs: string,
            public: string,
            root: string,
            services: string[]
        }
    },

    app: {
        name: string,
        locale: string,
        contactUs: {
            to: string,
            from: string
        },
        db: {
            codeExpiryTimeInHour: number
        },
        dirs: {
            thumbnails: string,
        }
        logging: {
            httpHost: string,
            httpPort: number,
            httpToken: string
        },
        password: {
            policy: {
                symbols: number,
                lowercase: number,
                uppercase: number,
                numbers: number,
                minLength: number,
                maxLength: number
            }
        },

        images: {
            thumbnails: {
                profiles: {
                    [key: string]: {
                        portraitSize: number,
                        landscapeSize: number
                    }
                }
            }
        }
    },

    locales: {
        supported: string[],
        fallbacks: {
            lang: string
        },
    },

    server: {
        interface: string,
        listen: number,
        prefix: undefined | string,
        dirs: {
            controllers: string[],
            middlewares: string[],
            interceptors: string[],
            validators: string[],
            decorators: string[],
            templates: string[],
            helpers: string[],
            partials: string[],
            services: string[],
            public: {
                onDisk: string,
                css: string,
                img: string,
                script: string
            }
        },
        sessionSecret: string,
        sessionTTL: number
    },

    rpc: {
        imageServiceServer: {
            interface: string,
            listen: number
        }
    }

    db: {
        type: string,
        host: string,
        port: number,
        username: string,
        password: string,
        database: string,
        schema: string,
        synchronize: boolean,
        logging: boolean,
        entitiesDir: string[],
        migrationsDir: string[],
        subscribersDir: string[]
    },

    redis: {
        host: string,
        port: number,
        tls: boolean,
    },

    auth: {
        secret: string
    },

    scheduler: {
        concurrency: number,
        jobs: { name: string, timing: string, disabled?: boolean }[]
    },

    roles: {
        list: string[],
        capabilities: {
            [key: string]: {
                [key: string]: {
                    [key: string]: string[]
                }
            }
        }
    },
    sendgrid: {
        apikey: string
    },
    saml: {
        serviceProviderEntityId: string,
        serviceProviderPrivateKey: string,
        serviceProviderCertificate: string,
        serviceProviderAssertEndpoint: string,
        identityProviderLoginURL: string,
        identityProviderLogoutURL: string,
        identityProviderCertificates: string[]
    },
}
