# ts-env
typescript support for .env files

# Usage

*.env file*
```
withoutQuotes=without quotes
DOUBLE_QUOTED_STRING="double quotes"
single_quoted_string='single quotes'

plain_bool=true
stringifiedBool=false

plain_number=9
stringifiedNumber=18

URL=https://www.google.com
```

```
Works only on static properties
Any non-static members in the env file are not allowed

It is recommended to set `strict: true`,
with which the actual purpose of the library is achieved

Any non-static members, declared in the class,
are not set into the Custom Env class that is decorated
with `Env`

```

*app.ts*
```
import { Env, Value } from 'ts-env';

@Env({
    strict: true,
    path: '.env'
})
class TestEnv {

    @Value()
    static withoutQuotes: string;

    @Value({
        alias: 'DOUBLE_QUOTED_STRING'
    })
    static doubelQuotedString: string;

    @Value({
        alias: 'single_quoted_string'
    })
    static singleQuotedString: string;

    @Value({
        alias: 'plain_bool'
    })
    static plainBool: boolean;

    @Value()
    static stringifiedBool: boolean;

    @Value({
        alias: 'plain_number'
    })
    static plainNumber: number;

    @Value()
    static stringifiedNumber: number;

    @Value({
        alias: 'URL',
        validate: (url) => {
            return /https:\/\/www\.google\.com/.test(url);
        }
    })
    static validatedUrl: string;

}

console.log(TestEnv.withoutQuotes);
console.log(TestEnv.doubelQuotedString);
console.log(TestEnv.singleQuotedString);

console.log(TestEnv.plainBool);
console.log(TestEnv.stringifiedBool);

console.log(TestEnv.plainNumber);
console.log(TestEnv.stringifiedNumber);

console.log(TestEnv.validatedUrl);
```






