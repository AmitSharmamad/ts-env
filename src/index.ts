import 'reflect-metadata';
import * as env from 'node-env-file';

type SupportedTypes = 'String' | 'Number' | 'Boolean';

interface Valuable {
    name: string;
    alias?: string;
    type: SupportedTypes;
}

const store: {
    [name: string]: Valuable[]
} = {};

export function Value(options?: {
    /** Key in the env file */
    alias: string;
}): PropertyDecorator {
    return function (target: any, propertyKey: string) {
        // store all the properties in a store
        const name = target.constructor.name;
        if (!store[name]) {
            store[name] = [];
        }
        const type = Reflect.getOwnMetadata('design:type', target, propertyKey);
        let value: Valuable;
        const alias = options && options.alias;
        switch (type.name) {
            case 'String': {
                value = {
                    name: propertyKey, type: 'String', alias
                };
                break;
            }
            case 'Number': {
                value = {
                    name: propertyKey, type: 'Number', alias
                };
                break;
            }
            case 'Boolean': {
                value = {
                    name: propertyKey, type: 'Boolean', alias
                };
                break;
            }
            default: {
                throw `The value of type ${type.name} is not supported to be serialized`;
            };
        }
        store[name].push(value);
    }
}

export function Env(options?: {
    /** Path to the .env file from the project's root directory */
    path?: string;
    /** If strict, throws an error and stops the process from proceeding further */
    strict?: boolean;
}): ClassDecorator {
    return function (target: any) {
        const { path, strict } = options;
        try {
            const name = target.constructor.name;
            env(path || '.env');
            if (!store[name]) {
                throw `Couldn't find 'env' class`;
            }
            if (Object.keys(store).length > 1) {
                throw `Sorry, only one env file is supported for now`;
            }
            const $env = process.env;
            store[name].forEach(property => {
                const { name, type, alias } = property;
                switch (type) {
                    case 'String': {
                        target[name] = $env[alias || name];
                        break;
                    }
                    case 'Number': {
                        target[name] = Number($env[alias || name]);
                        break;
                    }
                    case 'Boolean': {
                        target[name] = Boolean($env[alias || name]);
                        break;
                    }
                    default: {
                        throw `Unsupported type`;
                    }
                }
                if (target[name] == undefined)
                    if (strict)
                        throw `Couldn't find a value for ${name}`;
                    else
                        console.log(`Couldn't find a value for ${name}`);
            });
        } catch (error) {
            console.log(error);
            if (strict) process.exit(0);
        }
    };
}
