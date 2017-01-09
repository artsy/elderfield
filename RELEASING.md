# Releasing and Certifying the Artsy Alexa Skill

There are no hard rules about when to release a new version of the Artsy Alexa skill. Release bug fixes frequently, features not so frequently and breaking API changes rarely.

### Prepare for Release

Run tests, check that all tests succeed locally.

```
make test
```

Check that the last build succeeded in [Travis CI](https://travis-ci.org/artsy/elderfield) for all supported platforms.

### Deploy to AWS Lambda

Deploy to AWS Lambda, see [DEPLOYMENT](DEPLOYMENT.md).

### Certify with Amazon

Submit the skill for certification on [developer.amazon.com](https://developer.amazon.com).

### Skill is Live

Once certified, change the release date in [CHANGELOG.md](CHANGELOG.md) to the date the skill went live. Remove the line with "Your contribution here.", since there will be no more contributions to this release.

```
### 0.4.1 (01/02/2016)
```

Commit your changes.

```
git add CHANGELOG.md
git commit -m "Version 0.4.1 is live."
```

Tag the release.

```
git tag v0.4.1
```

#### Prepare for the Next Developer Iteration

Increment the skill's minor version, modify the [skill's package.json in functions/artsy](functions/artsy/package.json). During development you may choose to increment the major version when making major changes.

Add the next release to [CHANGELOG.md](CHANGELOG.md).

```
### 0.4.2 (Next)

* Your contribution here.
```

Commit your changes.

```
git add CHANGELOG.md functions/artsy/package.json
git commit -m "Preparing for next development iteration, 0.4.2."
```

Push everything.

```
git push --tags
```
