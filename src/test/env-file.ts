import { Env, Prop } from '../index';

@Env({
    path: '.env',
    strict: true,
    verbose: true
})
export class DevEnv {

    @Prop()
    static isProd: boolean;

    @Prop({
        name: 'CALLBACK_URL',
        validation: (value) => {
            return /.*\.com\/api/.test(value);
        },
        error: 'Invalid callback url'
    })
    static callbackUrl: string;

    @Prop({
        name: 'mda_url'
    })
    mdaUrl: string;

}

@Env({
    path: '.env'
})
export class TestEnv {

}