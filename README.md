# Deno nasa
This is a dummy project based on Udemy tutorial on Deno.

## prerequisite 
* You should have Deno installed on your computer
* You should have Docker up and running on your computer

## How to run
The following command will start the server at port 8000. This server serves both front end static files and backend APIs.
```bash
> deno run --allow-net --allow-read mod.ts
```

The following command will run all test files.
```bash
> deno test -A
# or 
# you can run test on specific function
> deno test src/model/planets.test.ts 
```

The following are the filters that can be use with den test 
--failfast : Stop on first error
```bash
> deno test -A --failfast
```

--filter <filter> : A pattern to filter the tests to run by
```bash
# All the test cases name containing "leak" will execute.
> deno test -A --filter leak

```

--inspect-brk=<HOST:PORT> : activate inspector on host:port and break at start of user script
```bash
# All the test cases name containing "leak" will execute.
> deno test -A --inspect-brk=127.0.0.1:8001
# configur 127.0.0.1:8001 in "chrome://inspect"
```