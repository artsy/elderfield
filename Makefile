# Start the server
s:
	node server.js

# Build
build:
	npm install
	cd functions/artsy && npm install
	cd functions/artsy && node index.js

# Deploy to AWS Lambda
deploy: build
	apex deploy

# Test
test: build
	mocha

production-deploy: build
	apex deploy --env=production
