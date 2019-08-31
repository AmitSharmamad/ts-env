# ts-env
typescript support for .env files

# Usage

```
withoutQuotes=without quotes
DOUBLE_QUOTED_STRING="double quotes"
single_quoted_string='single quotes'

plain_bool=true
stringifiedBool=false

plain_number=9
stringifiedNumber=18
```

```
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

}

console.log(TestEnv.withoutQuotes);
console.log(TestEnv.doubelQuotedString);
console.log(TestEnv.singleQuotedString);

console.log(TestEnv.plainBool);
console.log(TestEnv.stringifiedBool);

console.log(TestEnv.plainNumber);
console.log(TestEnv.stringifiedNumber);
```






