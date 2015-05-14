# Contributing Changes to regexes.yaml

Contributing to the project, especially `regexes.yaml`, is both welcomed and encouraged. To do so just do the following:

1. Fork the project

2. Create a branch for your changes

3. Modify `regexes.yaml` as appropriate

4. Create a text-file (e.g. ua.txt) which contains the User-Agent Strings (seperated by newline) you want to add to the testset in `./test_resources/tests.json`
   Please consider only real user-agents catched from your server logs for this file.

5. Run

        ./js/bin/add.js -u ua.txt -t check.json

   Check the results in `check.json`

6. If you are sure that all is ok, run
   `./js/bin/add.js -u ua.txt`

7. Run all tests with `npm test`

8. Push your branch to GitHub and submit a pull request

9. Monitor the pull request to make sure the Travis build succeeds. If it fails simply make the necessary changes to your branch and push it. Travis will re-test the changes.

That's it. If you don't feel comfortable forking the project or modifying the YAML you can also [submit an issue](https://github.com/commenthol/ua-parser2/issues) that includes the appropriate user-agent-string and the expected results of parsing.

Thanks!


## Advanced

The `regexes.yaml` does not claim to be perfect.
If you encounter that parsing results are too coarse or even wrong you will encounter a lot of test errors while running the tests.

1. To easily change the test-set contained in `./test_resources/tests.json` do the following.

        ./js/bin/regen.js -c

2. At this stage really check that you did not miss out something.

        diff test_resources/tests.js test_resources/new-tests.json

3. If you need to rerun tests and do not want to perform the full test-set, the previous tests for the bad-matching tests are stored in `./test_resources/bad-tests.json`.

        cp test_resources/bad-tests.json .
        ./js/bin/regen.js -i bad-tests.json -c

   When all is as you expect re-run Step 1. and Step 2.

        ./js/bin/regen.js -c
        diff test_resources/tests.js test_resources/new-tests.json

4. All is ok now, then replace the test-set

        cp  test_resources/new-tests.js test_resources/tests.json

   And rerun all tests

        npm test

## Find the right Regex-Matcher

The tool `./js/bin/debuginfo.js` adds for each regex in `regexes.yaml` a debug information which makes it easier together with `regen.js -c` to identify the matching regular-expression for a failed test.

Rerunning the tool removes the debuginfo again.

