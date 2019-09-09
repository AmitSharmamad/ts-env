import 'reflect-metadata';

type SupportedTypes = 'String' | 'Number' | 'Boolean';
type ValueValidator = (value: any) => boolean;

interface Valuable {
    name: string;
    alias?: string;
    type: SupportedTypes;
    validation?: ValueValidator;
}

export function Value(options?: {
    /** Key in the env file */
    alias?: string;
    /** Callback to validate values such as urls, etc... */
    validate?: ValueValidator;
}): PropertyDecorator;

export function Env(options?: {
    /** Path to the .env file from the project's root directory */
    path?: string;
    /** If strict, throws an error and stops the process from proceeding further */
    strict?: boolean;
}): ClassDecorator;

type stringSupportedType = (value: string) => boolean;

// string supported functions

export function startsWith(value: string): stringSupportedType;
export function endsWith(value: string): stringSupportedType;
export function contains(value: string): stringSupportedType;

// number supported functions

type numberSupportedType = (value: number) => boolean;

export function greaterThan(value: number): numberSupportedType;
export function lessThan(value: number): numberSupportedType;
export function equals(value: number): numberSupportedType;
export function notEquals(value: number): numberSupportedType;

// url supported functions

export function isUrl(): boolean;
export function isUrlPath(value: string): stringSupportedType;

// combinator supported functions

type operatorFunctionUnion = (value: any) => boolean;

export function and(...functions: operatorFunctionUnion[]): boolean;
export function or(...functions: operatorFunctionUnion[]): boolean;
export function not(...functions: operatorFunctionUnion[]): boolean;





