import 'reflect-metadata';
import * as env from 'node-env-file';

type SupportedTypes = 'String' | 'Number' | 'Boolean';
type ValueValidator = (value: any) => boolean;

interface Valuable {
    name: string;
    alias?: string;
    type: SupportedTypes;
    validation: ValueValidator;
}

const store: {
    [name: string]: Valuable[]
} = {};

export function Value(options?: {
    /** Key in the env file */
    alias?: string;
    /** Callback to validate values such as urls, etc... */
    validate?: ValueValidator;
}): PropertyDecorator {
    return function (target: any, propertyKey: string) {
        // store all the properties in a store
        const name = target.name;
        if (!store[name]) {
            store[name] = [];
        }
        const type = Reflect.getOwnMetadata('design:type', target, propertyKey);
        let value: Valuable;
        const alias = options && options.alias;
        const validation = options && options.validate;
        switch (type.name) {
            case 'String': {
                value = {
                    name: propertyKey, type: 'String', alias,
                    validation
                };
                break;
            }
            case 'Number': {
                value = {
                    name: propertyKey, type: 'Number', alias,
                    validation
                };
                break;
            }
            case 'Boolean': {
                value = {
                    name: propertyKey, type: 'Boolean', alias,
                    validation
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
        const path = options && options.path;
        const strict = options && options.strict;
        try {
            const name = target.name;
            try {
                env(path || '.env');
            } catch (error) {
                throw `Couldn't find a .env file at ${path}`;
            }
            if (!store[name]) {
                throw `Couldn't find 'env' class`;
            }
            if (Object.keys(store).length > 1) {
                throw `Sorry, only one env file is supported for now`;
            }
            const $env = process.env;
            store[name].forEach(property => {
                const { name, type, alias, validation } = property;
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
                // If a validation function is provided
                if (validation) {
                    const result = validation.call(target, target[name]);
                    console.log(result);
                    if (!result) {
                        const message = `Validation failed for the key ${name}`;
                        if (strict) throw message;
                        else console.log(message);
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
