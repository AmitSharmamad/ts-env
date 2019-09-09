require('reflect-metadata');
const env = require('node-env-file');
const colors = require('colors');

const store = {};

exports.Value = function (options) {
    return function (target, propertyKey) {
        // store all the properties in a store
        const name = target.name;
        if (!store[name]) {
            store[name] = [];
        }
        const type = Reflect.getOwnMetadata('design:type', target, propertyKey);
        let value;
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

exports.Env = function (options) {
    return function (target) {
        const path = options && options.path;
        try {
            const name = target.name;
            try {
                env(path || '.env');
            } catch (error) {
                throw `Couldn't find a .env file at ${path}`;
            }
            if (store.hasOwnProperty(undefined)) {
                const nonStaticMembers = store[typeof undefined];
                if (nonStaticMembers.length) {
                    const message = `Non static members are allowed in env class.\n` +
                        '\nPlease fix the following non static members.'.red.bold +
                        `\n${nonStaticMembers.map(nonStaticMember => ` - ${nonStaticMember.name}`).join('\n')}`;
                    throw message;
                }
            }
            if (Object.keys(store).length > 1) {
                if (!store.hasOwnProperty(undefined)) {
                    throw `Only one Environment file is supported`;
                }
            }
            if (!store[name]) {
                throw `Couldn't find 'env' class`;
            }
            const $env = process.env;
            store[name].forEach(property => {
                const { name, type, alias, validation } = property;
                if ($env[alias || name] === undefined) {
                    throw `'${alias || name}' is not provided with a value in the ${path || '.env'} file`;
                }
                switch (type) {
                    case 'String': {
                        target[name] = $env[alias || name];
                        break;
                    }
                    case 'Number': {
                        target[name] = Number($env[alias || name]);
                        if (isNaN(target[name]))
                            throw `'${name}' is not a number`;
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
                    throw `Couldn't find a value for ${name}`;
                // If a validation function is provided
                if (validation) {
                    const result = !!validation.call(target, target[name]);
                    if (!result) {
                        throw `Validation failed for the key ${name}`;
                    }
                }
            });
        } catch (error) {
            console.log(`Stopped the Process because of the following error\n`.underline.red);
            console.log(`${error}\n`.bold.red);
            process.exit(0);
        }
    };
}

// string functions

exports.startsWith = function startsWith(str) {
    return function (value) {
        return !value.search(str);
    }
}

exports.endsWith = function endsWith(str) {
    return function (value) {
        return !!value.endsWith(str);
    }
}

exports.contains = function contains(str) {
    return function (value) {
        return value.includes(str);
    }
}

// number functions

exports.greaterThan = function greaterThan(num) {
    return function (value) {
        return value > num;
    }
}

exports.lessThan = function lessThan(num) {
    return function (value) {
        return value < num;
    }
}

exports.equals = function equals(any) {
    return function (value) {
        return any === value;
    }
}

exports.notEquals = function notEquals(any) {
    return function (value) {
        return any !== value;
    }
}

// exports.is = equals;
// export const isNot = notEquals;

// URL operators

exports.isUrl = function isUrl(value) {
    try {
        new URL(value); return true;
    } catch (e) { return false };
}

exports.isPath = function isPath(pathname) {
    return function (value) {
        try {
            return new URL(value).pathname == pathname;
        } catch (e) {
            return false;
        }
    }
}

// Combinator Operators

exports.and = function and(...functions) {
    return function (value) {
        for (const f of functions) {
            if (!f(value)) return false;
        }
        return true;
    }
}

exports.or = function or(...functions) {
    return function (value) {
        for (const f of functions) {
            if (f(value)) return true;
        }
        return false;
    }
}