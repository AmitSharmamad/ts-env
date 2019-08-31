import * as env from 'node-env-file';
import 'reflect-metadata';

interface EnvProperty {
    key: string;
    name?: string;
    validation: (value: any) => boolean;
    error?: string;
}

const props: EnvProperty[] = [];
const targets = {};

export function Env(options: {
    /** Path of the env from root directory. The default path is set to .env */
    path?: string;
    /** If strict, throws and error and stops the process if there is any error in the properties in the .env file */
    strict?: boolean;
    /** Prints error to the console, if any value in the env file is not parsable */
    verbose?: boolean;
}): ClassDecorator {
    return function (target: any) {
        const { path, strict, verbose } = options;
        let count = 0;
        for (const t in targets) {
            console.log(t);
            count++;
        }
        if (count > 1) {
            console.log('Only one env is supported for now');
            process.exit(1);
        }
        env(path || '.env');
        props.forEach(prop => {
            let name = (prop && prop.name) || prop.key;
            let value = process.env[name];
            try {
                value = JSON.parse(value);
            } catch (error) {
                if (verbose) {
                    console.log(`Couldn't parse ${prop.key}'s value`);
                }
            }
            if (prop.validation) {
                if (!prop.validation(value)) {
                    if (strict) {
                        if (prop.error) {
                            console.log(`${prop.error}`);
                        } else {
                            console.log(`Validation failed for ${name}`);
                        }
                        process.exit(0);
                    }
                }
            }
            target[prop.key] = value;
        });
    };
}

export function Prop(options?: {
    name?: string;
    validation?: (value: any) => boolean;
    error?: string;
}): PropertyDecorator {
    return function (target: any, propertyKey: string) {
        targets[target.name] = target;
        console.log(target.constructor.name);
        props.push({
            validation: options && options.validation,
            key: propertyKey,
            name: options && options.name,
            error: options && options.error
        });
    };
}