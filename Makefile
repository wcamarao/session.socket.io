spec:
	@./node_modules/mocha/bin/mocha \
		--reporter spec \
		$(p) \
		spec/*.spec.js

.PHONY: spec
